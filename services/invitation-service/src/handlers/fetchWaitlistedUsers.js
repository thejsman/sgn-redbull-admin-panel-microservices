/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";

import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const fetchWaitlistedUsers = async (event, context) => {
  try {
    let { mobile, date, key } = JSON.parse(event.body);
    const params = {
      TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
      ProjectionExpression:
        "deviceType, countryCode, createdAt, countryName, pk, phone, dialCode",
    };
    if (mobile) {
      params.KeyConditionExpression = "pk = :pk";
      params.ExpressionAttributeValues = { ":pk": mobile };
    } else if (date) {
      params.ExclusiveStartKey = key
        ? JSON.parse(Buffer.from(key, "base64").toString("ascii"))
        : undefined;
      params.Limit = 1;
      params.ScanIndexForward = false;
      params.IndexName = "waitlisteduser_created_date";
      params.KeyConditionExpression = "#date = :date";
      params.ExpressionAttributeValues = { ":date": date };
      params.ExpressionAttributeNames = { "#date": "date" };
    } else {
      return responseHandler({
        statusCode: 401,
        message: "No Data found. please select date",
        data: {},
      });
    }
    console.log("params--", params);
    let result = await dynamoDb.query(params).promise();
    console.log("results", JSON.stringify(result), result.LastEvaluatedKey);
    //check if last evaluation key exists
    if (result.LastEvaluatedKey) {
      key = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64"
      );
    } else {
      key = "";
    }
    console.log("result.LastEvaluatedKey ---", key);
    if (result.Items.length > 0) {
      return responseHandler({
        statusCode: 200,
        message: "Data found",
        data: { items: result.Items, key },
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
