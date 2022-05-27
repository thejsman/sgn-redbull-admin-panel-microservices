import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetOccasionsRedis(event, context) {
  //first read from redis
  var lambda = new AWS.Lambda({
    region: "eu-central-1", //change to your region
  });

  let occasions = await lambda
    .invoke({
      FunctionName: "redis-service-dev-getRedisItem",
      Payload: JSON.stringify({ key: "occasionsList" }, null, 2), // pass params
    })
    .promise();
  console.log("occasions----", occasions);
  if (occasions.Payload !== "null") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "AccessToken",
        preflightContinue: false,
      },
      body: JSON.parse(occasions.Payload),
    };
  } else {
    let next = false;
    let ExclusiveStartKey = event.queryStringParameters.startKey;
    let Limit = event.queryStringParameters.limit;
    let startKey = "";
    try {
      const params = {
        TableName: "OccasionIconTable-dev",
        ExclusiveStartKey: !ExclusiveStartKey
          ? null
          : { occasionName: ExclusiveStartKey },
        Limit,
      };

      let result = await dynamoDb.scan(params).promise();
      //check whether there is any next record after last evaluation key
      if (result.LastEvaluatedKey) {
        startKey = result.LastEvaluatedKey.occasionName;
        params.Limit = 1;
        params.ExclusiveStartKey = result.LastEvaluatedKey;
        let nextResult = await dynamoDb.scan(params).promise();
        if (nextResult.Items.length > 0) {
          next = true;
        }
      }
      if (result.Items.length > 0) {
        await lambda
          .invoke({
            FunctionName: "redis-service-dev-setRedisItem",
            Payload: JSON.stringify(
              { key: "occasionsList", value: { occasionList: result.Items } },
              null,
              2
            ), // pass params
          })
          .promise();
        return response(200, {
          occasionList: result.Items,
          next,
          startKey,
          from: "dynamo",
        });
      } else {
        return response(404, { occasionList: [] });
      }
    } catch (error) {
      throw new createError.InternalServerError(error);
    }
  }
}

export const handler = commonMiddleware(GetOccasionsRedis);
