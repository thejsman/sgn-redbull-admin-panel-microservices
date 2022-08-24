import AWS from "aws-sdk";
import commonMiddleware from "common-middleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const dynamoDBProd = new AWS.DynamoDB.DocumentClient({
  region: process.env.PROD_REGION,
});

async function CopyRozyToProd(event, context) {
  try {
    let { sectionName } = event.body;
    if (sectionName == undefined) {
      return response(400, { message: "Bad Parameters" });
    }
    sectionName = sectionName.toLowerCase().trim();
    if (sectionName == "") {
      return response(406, { message: "Not Acceptable" });
    }
    //read this sectionName from staging dynamodb and paste it into prod
    const params = {
      TableName: process.env.SECTION_NAME_TABLE,
      KeyConditionExpression: "sectionName = :sectionName",
      ExpressionAttributeValues: {
        ":sectionName": sectionName,
      },
    };
    //
    let rozyDataToCopy = await dynamoDb.query(params).promise();
    if (rozyDataToCopy.Items.length > 0) {
      //copy this data to prod environment
      let result = await Promise.all(
        rozyDataToCopy.Items.map(async (item) => {
          //insert this item into dynamoDB on prod environment
          return await dynamoDBProd
            .put({
              TableName: process.env.PROD_SECTION_NAME_TABLE,
              Item: item,
            })
            .promise();
        })
      );
    }

    return response(200, { message: "Success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(CopyRozyToProd);
