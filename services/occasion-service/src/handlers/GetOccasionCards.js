import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetOccasionCards(event, context) {
  let cardIdentifier = event.pathParameters.occasionName; // latter occasionName => cardIdentifier

  try {
    const params = {
      TableName: process.env.OCCASION_CARD_TABLE,
      KeyConditionExpression: "#cardIdentifier = :cardIdentifier",
      ExpressionAttributeNames: {
        "#cardIdentifier": "cardIdentifier",
      },
      ExpressionAttributeValues: {
        ":cardIdentifier": cardIdentifier,
      },
    };
    let result = await dynamoDb.query(params).promise();
    if (result.Items.length > 0) {
      return response(200, { cardList: result.Items });
    } else {
      return response(404, { cardList: [] });
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetOccasionCards);
