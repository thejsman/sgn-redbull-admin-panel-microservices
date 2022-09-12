import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const stickerQuery = async (event, context) => {
  try {
    const data = event.queryStringParameters;
    let params = {
      TableName: process.env.STICKERS_TABLE_NAME,
      Limit: +data.limit,
      IndexName: "sticker_order-Index",
      ScanIndexForward: data.ScanIndexForward,
      KeyConditionExpression: "#stickerIdentifier = :stickerIdentifier",
      ExpressionAttributeNames: {
        "#stickerIdentifier": "stickerIdentifier",
        // "#displayOrder": "displayOrder"
      },
      ExpressionAttributeValues: {
        ":stickerIdentifier": data.stickerIdentifier,
        // ":sOrder": +data.sOrder,
        // ":eOrder": +data.eOrder
      },
    };

    if (data.displayOrder && +data.displayOrder > 0) {
      params = {
        ...params,
        ExclusiveStartKey: {
          stickerIdentifier: "sticker",
          displayOrder: +data.displayOrder,
          stickerName: data.stickerName,
        },
      };
    }
    try {
      let getData = await dynamoDb.query(params).promise();
      let responseData = responseHandler({
        statusCode: 200,
        message: "Sticker List",
        data: getData,
      });
      return responseData;
    } catch (error) {
      console.log("error", error);
      let responseData = responseHandler({
        statusCode: 502,
        message: "Error in query Data",
        data: {},
      });
      console.log("responseData", responseData);
      return responseData;
    }
  } catch (error) {
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = stickerQuery;
