import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function DeleteOccasion(event, context) {
  try {
    const occasionName = event.pathParameters.occasionName;
    await dynamoDb
      .delete({
        TableName: process.env.OCCASION_ICON_TABLE,
        Key: {
          occasionIdentifier: "occasion",
          occasionName,
        },
      })
      .promise();

    return response(200, { message: "success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(DeleteOccasion);
