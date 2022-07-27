/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";

import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const fetchWaitlistedUsers = async (event, context) => {
  try {
    const { mobile, date } = JSON.parse(event.body);
    const params = {
      TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
      ProjectionExpression:
        "deviceType, countryCode, createdAt, countryName, pk, phone, dialCode",
    };
    if (mobile) {
      params.KeyConditionExpression = "pk = :pk";
      params.ExpressionAttributeValues = { ":pk": mobile };
    } else if (date) {
      params.IndexName = "waitlisted_created_date";
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
    let result = await Promise.all(
      mobile
        ? [dynamoDb.query(params).promise()]
        : date.map((dateItem) => {
            return dynamoDb
              .query({
                ...params,
                ExpressionAttributeValues: { ":date": dateItem },
              })
              .promise();
          })
    );
    console.log("results", result);
    if (result.length > 0) {
      //now club all, the data into one data source
      let clubedData = result.reduce((finalObj, dateItems) => {
        finalObj = [...finalObj, ...dateItems.Items];
        return finalObj;
      }, []);
      return responseHandler({
        statusCode: 200,
        message: "Data found",
        data: clubedData,
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
