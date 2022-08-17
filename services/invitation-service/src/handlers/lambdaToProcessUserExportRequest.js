import { parse } from "json2csv";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
const lambdaToProcessUserExportRequest = async (event, context) => {
  //date range from, it will be downloaded
  let { startDate, endDate } = JSON.parse(event.Records[0].body);
  let currentDate = startDate;
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
      return await dynamoDb.query(params).promise();
    })
  );
  //merge all data into single one objects Array
  usersFound = usersFound.reduce((finalObj, objArray) => {
    finalObj = [...finalObj, ...objArray.Items];
    return finalObj;
  }, []);
  const csvPayload = parse(usersFound, { header: true, defaultValue: "-----" });
  //Now upload data on S3
  const s3Params = {
    Bucket: "sagoon-2022-dev",
    Key: `userReport/${startDate}.csv`,
    Body: csvPayload,
    ContentType: "application/octet-stream",
  };
  try {
    let s3Result = await s3.upload(s3Params).promise();
    let csvFileUrl = s3Result.Location;
    console.log("re----", re);
  } catch (e) {
    console.log("e-----", e);
  }
};

export const handler = lambdaToProcessUserExportRequest;
