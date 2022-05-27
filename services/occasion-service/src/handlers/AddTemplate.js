import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";
import { v4 as uuid } from "uuid";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3({
  region: "eu-central-1",
});
async function AddTemplate(event, context) {
  try {
    let { data, templateName, occasionName } = event.body;
    data.templateIdentifier = "occasionTemplate";
    occasionName = occasionName.toLowerCase().trim();
    templateName = templateName.toLowerCase().trim();
    let fileName = data.fileName;
    fileName = fileName.split(".");
    if (data.templateImage && data.templateImage.includes("image/")) {
      const type = data.templateImage.split(";")[0].split("/")[1];
      const base64Data = Buffer.from(
        data.templateImage.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      var s3Params = {
        Bucket: "sagoon-2022-dev/occasion-icons",
        Key: `${fileName[0]}-${uuid()}.${fileName[1]}`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: type,
      };
      let s3data = await s3.upload(s3Params).promise();
      data.templateImage = s3data.Location;
    }
    let UpdateExpression = [];
    let ExpressionAttributeValues = {};
    let ExpressionAttributeNames = {};
    for (let key in data) {
      UpdateExpression.push(`#${key} = :${key}`);
      ExpressionAttributeValues[`:${key}`] = data[key];
      ExpressionAttributeNames[`#${key}`] = key;
    }
    await dynamoDb
      .update({
        TableName: process.env.OCCASION_TEMPLATES_TABLE,
        Key: {
          occasionName,
          templateName,
        },
        UpdateExpression: `SET ${UpdateExpression.join(",")}`,
        ExpressionAttributeValues: ExpressionAttributeValues,
        ExpressionAttributeNames,
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
    return response(200, { message: "Success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(AddTemplate);
