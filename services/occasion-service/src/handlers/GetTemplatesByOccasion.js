import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { response } from "../lib/utils";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetTemplatesByOccasion(event, context) {
  try {
    const data = event.queryStringParameters;
    const occasionName = event.pathParameters.templateName.toLowerCase();
    let params = {
      TableName: process.env.OCCASION_TEMPLATES_TABLE,
      Limit: +data.limit,
      IndexName: "template_order-Index",
      ScanIndexForward: true,
      KeyConditionExpression: "#occasionName = :occasionName",
      ExpressionAttributeNames: {
        "#occasionName": "occasionName",
      },
      ExpressionAttributeValues: {
        ":occasionName": occasionName,
      },
    };

    if (data.displayOrder && +data.displayOrder > 0) {
      params = {
        ...params,
        ExclusiveStartKey: {
          occasionName: occasionName,
          displayOrder: +data.displayOrder,
          templateName: data.templateName,
        },
      };
    }
    let result = await dynamoDb.query(params).promise();
    let startKey = {};
    let next = false;
    //check if next value exists after evaluation key
    if (result.LastEvaluatedKey) {
      let { displayOrder, occasionName, templateName } =
        result.LastEvaluatedKey;
      startKey = { displayOrder, occasionName, templateName };
      params.Limit = 1;
      params.ExclusiveStartKey = result.LastEvaluatedKey;
      let nextResult = await dynamoDb.query(params).promise();
      if (nextResult.Items.length > 0) {
        next = true;
      }
    }
    if (result.Items.length > 0) {
      return response(200, {
        templateList: result.Items,
        next,
        startKey,
      });
    } else {
      return response(404, { templateList: [] });
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetTemplatesByOccasion);
