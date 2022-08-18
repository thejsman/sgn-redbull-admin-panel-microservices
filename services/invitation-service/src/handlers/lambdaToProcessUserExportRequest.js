import { parse } from "json2csv";
import AWS from "aws-sdk";
import { sendEmailToAdmin } from "../lib/sendEmail";
import { deleteMessageFromQueue } from "../lib/userExportRequestHelper";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
const lambdaToProcessUserExportRequest = async (event, context) => {
  //date range from, it will be downloaded
  let { startDate, endDate, email } = JSON.parse(event.Records[0].body);
  let { receiptHandle } = event.Records[0];
  let fileName = !endDate ? `${startDate}.csv` : `${startDate}:${endDate}.csv`;
  let csvFileUrl = "";
  let currentDate = startDate;
  let emailSubject = `for date ${
    !endDate ? startDate : `range from ${startDate} to ${endDate}`
  } `;
  endDate = !endDate ? startDate : endDate;
  let allDates = [];
  do {
    allDates = [...allDates, currentDate];
    //now extract next date what it is
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate = currentDate.toISOString().slice(0, 10);
  } while (currentDate <= endDate);
  //Now pull all records from waitlistedUser table
  const params = {
    TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
    ProjectionExpression:
      "deviceType, countryCode, createdAt, countryName, pk, phone, dialCode,codeSentInfo",
    IndexName: "waitlisteduser_created_date",
    KeyConditionExpression: "#date = :date",
    ExpressionAttributeValues: { ":date": currentDate },
    ExpressionAttributeNames: { "#date": "date" },
  };
  let usersFound = await Promise.all(
    allDates.map(async (curDate) => {
      params.ExpressionAttributeValues = { ":date": curDate };
      return await fetchAllUsersForDate(params);
    })
  );
  //merge all data into single one objects Array
  usersFound = usersFound.reduce((finalObj, objArray) => {
    finalObj = [...finalObj, ...objArray];
    return finalObj;
  }, []);

  try {
    //check whether users list is there to donwload or not otherwise send email saying no user found
    if (usersFound.length) {
      const csvPayload = parse(usersFound, {
        header: true,
        defaultValue: "-----",
      });
      //Now upload data on S3
      const s3Params = {
        Bucket: process.env.BUCKET_FOR_WAITLISTED_USER_REPORT,
        Key: `user-report/${fileName}`,
        Body: csvPayload,
        ContentType: "application/octet-stream",
      };
      let s3Result = await s3.upload(s3Params).promise();
      csvFileUrl = `${process.env.CDN_URL_FOR_BUCKET}${s3Result.Key}`;
    }
    //send Email to admin person with this file url
    await sendEmailToAdmin(
      usersFound.length
        ? `Waitlisted users ${fileName} download as requested`
        : `No waitlisted users found ${emailSubject} as requested`,
      usersFound.length ? csvFileUrl : "No data found",
      email
    );
    //now delete SQS message ID so that it will not process again
    await deleteMessageFromQueue(receiptHandle);
  } catch (e) {
    console.log("e-----", e);
  }
};

const fetchAllUsersForDate = async (params, users = []) => {
  let paramObj = Object.assign({}, params);
  paramObj.Limit = 1;
  let result = await dynamoDb.query(params).promise();
  users = [...users, ...result.Items];
  if (result.LastEvaluatedKey) {
    paramObj.ExclusiveStartKey = result.LastEvaluatedKey;
    await fetchAllUsersForDate(paramObj, users);
  }
  return users;
};

export const handler = lambdaToProcessUserExportRequest;
