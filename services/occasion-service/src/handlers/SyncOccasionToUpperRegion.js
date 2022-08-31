import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";
import { v4 as uuid } from "uuid";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3({
  region: process.env.REGION_IN_WHICH_TO_BE_COPIED,
});

async function SyncOccasionToUpperRegion(event, context) {
  try {
    //first get the card identifier and card namr from body
    const { cardGroup, cardName } = event.body;
    let fileKey = "";
    let cardDetails = await dynamoDb
      .get({
        TableName: process.env.OCCASION_CARD_TABLE,
        Key: {
          cardIdentifier: cardGroup,
          cardName,
        },
      })
      .promise();
    //check if there is the detail for lottie then start to copy the data
    if (cardDetails.Item) {
      //check if lottieBackground and lottieGraphic is there then copy them to upper stage
      if (cardDetails.Item.lottie.lottieBackground) {
        //if lottie background is there then copy create a new file to upper stage
        fileKey = `${process.env.OCCASION_ICONS_CLONED_FOLDER}/${uuid()}.json`;
        await s3
          .copyObject({
            Bucket: process.env.BUCKET_TO_BE_IN_CLONE_UPPER_STAGE,
            CopySource: cardDetails.Item.lottie.lottieBackground,
            Key: fileKey,
          })
          .promise();
        //now it has been copied to upper stage folder,make full path of this copied file
        cardDetails.Item.lottie.lottieBackground = `${process.env.CDN_BUCKET_URL_UPPER_STAGE}${fileKey}`;
        cardDetails.Item.lottie.lottieBackgroundFileName = `${process.env.CDN_BUCKET_URL_UPPER_STAGE}${fileKey}`;
      }
      //check if lotti graphics is also set, then copy it also
      if (cardDetails.Item.lottie.lottieGraphic) {
        //if lottie background is there then copy create a new file to upper stage
        fileKey = `${process.env.OCCASION_ICONS_CLONED_FOLDER}/${uuid()}.json`;
        await s3
          .copyObject({
            Bucket: process.env.BUCKET_TO_BE_IN_CLONE_UPPER_STAGE,
            CopySource: cardDetails.Item.lottie.lottieGraphic,
            Key: fileKey,
          })
          .promise();
        //now it has been copied to upper stage folder,make full path of this copied file
        cardDetails.Item.lottie.lottieGraphic = `${process.env.CDN_BUCKET_URL_UPPER_STAGE}${fileKey}`;
        cardDetails.Item.lottie.lottieGraphicFileName = `${process.env.CDN_BUCKET_URL_UPPER_STAGE}${fileKey}`;
      }
    }
    //Now we have the complete card detail to be copied
    console.log("cardDetails ----", cardDetails);
    //Now save this data to upper stage database
    await dynamoDb
      .put({
        TableName: process.env.UPPER_STAGE_OCCASION_CARD_TABLE,
        Item: cardDetails,
      })
      .promise();
    return response(200, { message: "Success" });
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(SyncOccasionToUpperRegion);
