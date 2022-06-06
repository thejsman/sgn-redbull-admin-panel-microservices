import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";
import { v4 as uuid } from "uuid";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
async function CreateOccasionCard(event, context) {
  try {
    const data = event.body;
    const { cardIdentifier, cardName, status, ...rest } = data;
    let type = "";
    let base64Data = "";
    let s3Params = "";
    let s3data = "";
    const cardData = {
      cardIdentifier,
      cardName,
      status,
      ...rest,
    };
    console.log("cardData", cardData);
    console.log("data", data);
    //check if there id lottie json the stoe this json on s3
    if (
      data.lottie.lottieBackground &&
      data.lottie.lottieBackground.includes("application/json")
    ) {
      //now store it on s3
      type = data.lottie.lottieBackground.split(";")[0].split("/")[1];
      base64Data = Buffer.from(
        data.lottie.lottieBackground.replace(
          /^data:application\/\w+;base64,/,
          ""
        ),
        "base64"
      );
      s3Params = {
        Bucket: process.env.OCCASION_ICON_FOLDER,
        Key: `${uuid()}.json`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: type,
      };
      s3data = await s3.upload(s3Params).promise();

      if (process.env.CDN_BUCKET_URL) {
        data.lottie.lottieBackground = process.env.CDN_BUCKET_URL + s3data.Key;
        data.lottie.lottieBackgroundFileName =
          process.env.CDN_BUCKET_URL + s3data.Key;
      } else {
        data.lottie.lottieBackground = s3data.Location;
        data.lottie.lottieBackgroundFileName = s3data.Location;
      }
    }
    if (
      data.lottie.lottieGraphic &&
      data.lottie.lottieGraphic.includes("application/json")
    ) {
      //now store it on s3
      type = data.lottie.lottieGraphic.split(";")[0].split("/")[1];
      base64Data = Buffer.from(
        data.lottie.lottieGraphic.replace(/^data:application\/\w+;base64,/, ""),
        "base64"
      );
      s3Params = {
        Bucket: process.env.OCCASION_ICON_FOLDER,
        Key: `${uuid()}.json`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: type,
      };
      s3data = await s3.upload(s3Params).promise();
      if (process.env.CDN_BUCKET_URL) {
        data.lottie.lottieGraphic = process.env.CDN_BUCKET_URL + s3data.Key;
        data.lottie.lottieGraphicFileName =
          process.env.CDN_BUCKET_URL + s3data.Key;
      } else {
        data.lottie.lottieGraphic = s3data.Location;
        data.lottie.lottieGraphicFileName = s3data.Location;
      }
    }

    await dynamoDb
      .put({
        TableName: process.env.OCCASION_CARD_TABLE,
        Item: cardData,
      })
      .promise();

    return response(200, { message: "success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(CreateOccasionCard);
