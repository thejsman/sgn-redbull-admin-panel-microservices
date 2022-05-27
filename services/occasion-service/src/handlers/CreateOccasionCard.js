import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function CreateOccasionCard(event, context) {
  try {
    const data = event.body;
    const { cardName, cta, content, lottie, occasionName, subCardName } = data;
    const cardData = {
      cardName,
      subCardName,
      occasionName,
      cta,
      content,
      lottie,
      status: true,
    };
    console.log("cardData", cardData);
    console.log("data", data);

    await dynamoDb
      .put({
        TableName: process.env.OCCASION_CARD_TABLE,
        Item: cardData,
      })
      .promise();

    return response(200, { message: "success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(CreateOccasionCard);
