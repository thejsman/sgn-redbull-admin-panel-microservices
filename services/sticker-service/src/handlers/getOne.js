import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getOneSticker = async (event, context) => {
  const data = event.queryStringParameters;
  let params = {
    TableName: process.env.STICKERS_TABLE_NAME,
    KeyConditionExpression:
      "#stickerIdentifier = :stickerIdentifier AND stickerName =:stickerName",
    ExpressionAttributeNames: {
      "#stickerIdentifier": "stickerIdentifier",
    },
    ExpressionAttributeValues: {
      ":stickerIdentifier": "sticker",
      ":stickerName": data.stickerName,
    },
  };
  try {
    let getData = await dynamoDb.query(params).promise();
    let responseData = responseHandler({
      statusCode: 200,
      message: "Sticker Info",
      data: getData,
    });
    console.log("responseData", responseData);
    return responseData;
  } catch (error) {
    console.log("error", error);
    let responseData = responseHandler({
      statusCode: 502,
      message: "Error in Getting Sticker Info",
      data: {},
    });
    console.log("responseData", responseData);
    return responseData;
  }
};

export const handler = getOneSticker;
