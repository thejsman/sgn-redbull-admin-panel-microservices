import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function DeleteOccasionCard(event, context) {
  try {
    const data = event.body;
    const { cardIdentifier, cardName } = data;
    await dynamoDb
      .delete({
        TableName: process.env.OCCASION_CARD_TABLE,
        Key: {
          cardIdentifier,
          cardName,
        },
      })
      .promise();

    return response(200, { message: "success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(DeleteOccasionCard);
