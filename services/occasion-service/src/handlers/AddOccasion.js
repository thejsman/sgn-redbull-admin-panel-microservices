import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";
import { v4 as uuid } from "uuid";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

async function AddOccasion(event, context) {
  try {
    console.log("event.body", event);
    let { occasionIdentifier, data, occasionName } = event.body;
    occasionIdentifier = occasionIdentifier.toLowerCase().trim();
    occasionName = occasionName.toLowerCase().trim();
    let fileName = data.fileName;
    fileName = fileName.split(".");
    //first upload image in s3
    if (data.occasionIcon && data.occasionIcon.includes("image/")) {
      const type = data.occasionIcon.split(";")[0].split("/")[1];
      const base64Data = Buffer.from(
        data.occasionIcon.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      var s3Params = {
        Bucket: process.env.OCCASION_ICON_FOLDER,
        Key: `${fileName[0]}-${uuid()}.${fileName[1]}`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: type,
      };
      let s3data = await s3.upload(s3Params).promise();
      console.log("s3data ---", s3data);
      if (process.env.CDN_BUCKET_URL) {
        data.occasionIcon = process.env.CDN_BUCKET_URL + s3data.Key;
      } else {
        data.occasionIcon = s3data.Location;
      }
    }
    //Uploading userOccasionsLottiBackground also
    if (
      data.userLottiBackgroundIcon &&
      data.userLottiBackgroundIcon.includes("application/json")
    ) {
      let type = data.userLottiBackgroundIcon.split(";")[0].split("/")[1];
      let base64Data = Buffer.from(
        data.userLottiBackgroundIcon.replace(
          /^data:application\/\w+;base64,/,
          ""
        ),
        "base64"
      );
      let s3Params = {
        Bucket: process.env.LOTTIE_BACKGROUND_IMAGE_FOLDER,
        Key: `${occasionName.toLowerCase()}.${type}`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: type,
      };
      let s3data = await s3.upload(s3Params).promise();
      console.log("s3data ---", s3data);
      if (process.env.CDN_BUCKET_URL) {
        data.userLottiBackgroundIcon = process.env.CDN_BUCKET_URL + s3data.Key;
      } else {
        data.userLottiBackgroundIcon = s3data.Location;
      }
    }

    let UpdateExpression = [];
    let ExpressionAttributeValues = {};
    let ExpressionAttributeNames = {};
    //add a GSI value occasionCumStatus extra
    data = data.occasionStatus ? { ...data, occasionCumStatus: `${occasionIdentifier}#true` } : { ...data, occasionCumStatus: `${occasionIdentifier}#false` };
    for (let key in data) {
      UpdateExpression.push(`#${key} = :${key}`);
      ExpressionAttributeValues[`:${key}`] = data[key];
      ExpressionAttributeNames[`#${key}`] = key;
    }
    console.log("ExpressionAttributeValues", ExpressionAttributeValues);
    console.log("ExpressionAttributeNames", ExpressionAttributeNames);
    console.log("keu", {
      occasionIdentifier: occasionIdentifier,
      occasionName: occasionName,
    });
    await dynamoDb
      .update({
        TableName: process.env.OCCASION_ICON_TABLE,
        Key: {
          occasionIdentifier: occasionIdentifier,
          occasionName: occasionName,
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

export const handler = commonMiddleware(AddOccasion);
