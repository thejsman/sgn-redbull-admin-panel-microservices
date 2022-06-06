/*eslint new-cap: ["error", { "newIsCap": false }]*/

import AWS from 'aws-sdk';
import { responseHandler } from "../lib/response";

 var s3 = new AWS.S3({
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });
// var s3 = new AWS.S3({});


const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateRelationship = async (event, context) => {
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    let params = {};
    if (data.base64) {
      let uploadImage;
      const type = data.base64.split(';')[0].split('/')[1];
      const base64Data = new Buffer.from(
        data.base64.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );

      var s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: data.fileName,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: type,
        ACL: "public-read"
      };
      try {
        uploadImage = await s3.upload(s3Params).promise();
        console.log(params, 'ffffff', data);
      } catch (error) {
        console.log('erorr', error);
        return responseHandler({
          statusCode: 500,
          message: 'Error in Image Uploading',
          data: {}
        });
      }

      params = {
        TableName: process.env.RELATIONSHIP_TABLE_NAME,
        // IndexName: 'relationshipName-Index',
        Key: {
          relationshipIdentifier: "relationship",
          relationshipName: data.relationshipName
        },
        ExpressionAttributeNames: {
          '#displayName': 'displayName'
        },
        ExpressionAttributeValues: {
          ':displayName': data.displayName,
          ':icon': uploadImage.Location,
          ':displayOrder': +data.displayOrder,
          ':updatedAt': timestamp,

        },
        UpdateExpression:
          'SET #displayName = :displayName, displayOrder = :displayOrder,icon = :icon,updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW'
      };
    } else {
      params = {
        TableName: process.env.RELATIONSHIP_TABLE_NAME,
        // IndexName: 'relationshipName-Index',
        Key: {
          relationshipIdentifier: "relationship",
          relationshipName: data.relationshipName
        },
        ExpressionAttributeNames: {
          '#displayName': 'displayName'
        },
        ExpressionAttributeValues: {
          ':displayName': data.displayName,
          ':updatedAt': timestamp,
          ':displayOrder': +data.displayOrder,

        },
        UpdateExpression:
          'SET #displayName = :displayName, displayOrder = :displayOrder,updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW'
      };
    }

    try {
      let updateData = await dynamoDb.update(params).promise();
      return responseHandler({
        statusCode: 200,
        message: 'Relationship Updated',
        data: updateData
      });
    } catch (error) {
      console.log("errorrrr", error);
      return responseHandler({
        statusCode: 502,
        message: 'Result Not Updated',
        data: {}
      });
    }
  } catch (error) {
    return responseHandler({
      statusCode: 500,
      message: 'Internal Server Error',
      data: {}
    });
  }
};


export const handler = updateRelationship;
