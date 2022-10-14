import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetPredefinedOccasionByName(event, context) {
  console.log("event body", event);
  let occasionName = event.pathParameters.occasionName;
  try {
    const params = {
      TableName: process.env.OCCASION_ICON_TABLE,
      Key: {
        occasionIdentifier: "predefinedOccasion",
        occasionName: occasionName,
      },
    };
    console.log(params);
    let result = await dynamoDb.get(params).promise();
    console.log("result ------", result);
    //check whether there is any next record after last evaluation key

    if (result.Item) {
      return response(200, result.Item);
    } else {
      return response(404, {});
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetPredefinedOccasionByName);
