/*eslint new-cap: ["error", { "newIsCap": false }]*/
import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const stickerList = async (event, context) => {
  try {
    let params = {
      TableName: process.env.STICKERS_TABLE_NAME,
      ScanIndexForward: true,
      IndexName: "sticker_order-Index",
      KeyConditionExpression: "#stickerIdentifier = :stickerIdentifier",
      ExpressionAttributeNames: {
        "#stickerIdentifier": "stickerIdentifier",
        // "#displayOrder": "displayOrder"
      },
      ExpressionAttributeValues: {
        ":stickerIdentifier": "sticker",
        // ":sOrder": +data.sOrder,
        // ":eOrder": +data.eOrder
      },
    };
    try {
      let getData = await dynamoDb.query(params).promise();

      //now put limit while returning data from cache

      if (getData.Items.length > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            stickerList: getData.Items,
          }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            stickerList: [],
          }),
        };
      }
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

export const handler = stickerList;
