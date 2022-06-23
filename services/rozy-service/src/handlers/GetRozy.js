import {
  setRedisItem,
  getRedisItem,
} from "./../../../../packages/redis-middleware";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetRozy(event, context) {
  try {
    let { sectionName, sectionLanguage } = event.queryStringParameters;

    if (sectionName == undefined || sectionLanguage == undefined) {
      return response(400, { message: "Bad Request" });
    }
    sectionName = sectionName.toLowerCase().trim();
    sectionLanguage = sectionLanguage.toLowerCase().trim();
    if (sectionName == "" || sectionLanguage == "") {
      return response(400, { message: "Bad Request" });
    }
    //redisKey is
    let redisKey = `ROZY:${sectionName.toUpperCase()}:${sectionLanguage.toUpperCase()}`;
    //geting from cache if exists in cache
    let content = await getRedisItem(redisKey);

    content = JSON.parse(JSON.parse(content.Payload));
    console.log("cache content", content);

    if (!content) {
      const params = {
        TableName: process.env.SECTION_NAME_TABLE,
        KeyConditionExpression:
          "sectionName = :sectionName and sectionLanguage = :sectionLanguage",
        FilterExpression: "active = :active",
        ExpressionAttributeValues: {
          ":sectionName": sectionName,
          ":sectionLanguage": sectionLanguage,
          ":active": true,
        },
      };

      let result = await dynamoDb.query(params).promise();
      if (result.Items.length > 0) {
        content = result.Items[0].content;
        await setRedisItem(redisKey, 3600, result.Items[0].content);
        console.log("from db");
      }
    }
    if (content) {
      return response(200, {
        sectionName,
        sectionLanguage,
        content,
      });
    } else {
      return response(404, { message: "Not Found" });
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetRozy);
