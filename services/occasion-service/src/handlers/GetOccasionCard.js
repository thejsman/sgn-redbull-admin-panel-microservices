import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetOccasionCard(event, context) {
  try {
    const { cardGroup, cardName } = event.pathParameters;
    let result = await dynamoDb
      .get({
        TableName: process.env.OCCASION_CARD_TABLE,
        Key: {
          cardName: cardGroup,
          subCardName: cardName,
        },
      })
      .promise();

    return response(200, result.Item);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetOccasionCard);
