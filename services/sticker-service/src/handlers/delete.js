import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const deleteSticker = async (event, context) => {
  try {
    let data = event.queryStringParameters;
    const params = {
      TableName: process.env.STICKERS_TABLE_NAME,
      Key: {
        stickerIdentifier: "sticker",
        stickerName: data.stickerName,
      },
    };

    try {
      let deleteTemplate = await dynamoDb.delete(params).promise();
      return responseHandler({
        statusCode: 200,
        message: "Sticker has been deleted successfully",
        data: deleteTemplate,
      });
    } catch (error) {
      return responseHandler({
        statusCode: 502,
        message: "Error occur in deleting Sticker",
        data: {},
      });
    }
  } catch (error) {
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = deleteSticker;
