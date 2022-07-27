/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";

import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const fetchWaitlistedUsers = async (event, context) => {
  try {
    let { mobile, date, key } = JSON.parse(event.body);
    let isNextRecordExists = false;
    const params = {
      TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
      ProjectionExpression:
        "deviceType, countryCode, createdAt, countryName, pk, phone, dialCode",
    };
    if (mobile) {
      //if there is a mobile number in query then give first priority to mibile number
      params.KeyConditionExpression = "pk = :pk";
      params.ExpressionAttributeValues = { ":pk": mobile };
    } else {
      //second to date if any given then fetch on the date basis
      params.ExclusiveStartKey = key
        ? JSON.parse(Buffer.from(key, "base64").toString("ascii"))
        : undefined;
      params.Limit = 1;
      params.ScanIndexForward = false;
      if (date) {
        params.IndexName = "waitlisteduser_created_date";
        params.KeyConditionExpression = "#date = :date";
        params.ExpressionAttributeValues = { ":date": date };
        params.ExpressionAttributeNames = { "#date": "date" };
      } else {
        params.IndexName = "userType";
        params.KeyConditionExpression = "userType = :userType";
        params.ExpressionAttributeValues = {
          ":userType": "waitListed",
        };
      }
    }
    console.log("params--", params);
    let result = await dynamoDb.query(params).promise();
    console.log("results", JSON.stringify(result), result.LastEvaluatedKey);

    //check if there is next record into database
    params.ExclusiveStartKey = result.LastEvaluatedKey;
    params.Limit = 1;
    isNextRecordExists = await dynamoDb.query(params).promise();
    console.log("isNextRecordExists---", isNextRecordExists);
    isNextRecordExists = isNextRecordExists.Items.length > 0;
    //check if last evaluation key exists
    if (result.LastEvaluatedKey) {
      key = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64"
      );
    } else {
      key = "";
    }
    console.log("result.LastEvaluatedKey ---", key);
    if (result.Items) {
      return responseHandler({
        statusCode: 200,
        message: "Data found",
        data: {
          items: result.Items,
          key: key && isNextRecordExists ? key : "",
        },
      });
    }
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = fetchWaitlistedUsers;
