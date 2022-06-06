import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetTemplateByName(event, context) {
  console.log("event body", event);
  let occasionName = event.pathParameters.occasionName;
  let templateName = event.pathParameters.templateName;
  try {
    const params = {
      TableName: process.env.OCCASION_TEMPLATES_TABLE,
      Key: {
        occasionName,
        templateName,
      },
    };
    console.log(params);
    let result = await dynamoDb.get(params).promise();
    console.log("result ------", result);
    //check whether there is any next record after last evaluation key

    if (result.Item) {
      return response(200, result.Item);
    } else {
      return response(404, {});
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetTemplateByName);
