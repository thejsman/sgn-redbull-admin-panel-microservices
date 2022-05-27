// 'use strict'

const AWS = require('aws-sdk');
const { responseHandler } = require('../../lib/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const listTemplate = async (event, context) => {
  const data = event.queryStringParameters;
  console.log('datadata', data);
  let params = {
    TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
    Limit: +data.limit
  };

  if (data.LastEvaluatedKey !== 'null') {
    params = {
      ...params,
      ExclusiveStartKey: {
        notificationName: data.LastEvaluatedKey
      }
    };
  }

  try {
    let getData = await dynamoDb.scan(params).promise();
    let responseData = responseHandler({
      statusCode: 200,
      message: 'Template List',
      data: getData
    });
    console.log('responseData', responseData);
    return responseData;
  } catch (error) {
    console.log("errorerror",error);
    let responseData = responseHandler({
      statusCode: 501,
      message: "Couldn't create the todo item.",
      data: {}
    });
    console.log('responseData', responseData);
    return responseData;
  }
};

export const handler = listTemplate;

// 'use strict'

// const parser = require('lambda-multipart-parser')
// const AWS = require("aws-sdk");
// AWS.config = {
//     accessKeyId: "AKIAQBCQH5WZD5K5YBMB",
//     secretAccessKey: "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",
//     bucketName: "sagoon-dev",
//     region: "eu-central-1",
//     signatureVersion: "v2"
//   };
// var s3 = new AWS.S3({ params: { Bucket: "sagoon-dev" } });
// let fs = require("fs");

// module.exports.parse = async (event, context) => {
//     let data=JSON.parse(event.body);
// //   const result = await parser.parse(event)
// //   console.log(result.files[0])
// const type = data.base64.split(';')[0].split('/')[1];
// const base64Data =new Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

//   var params = {
//     Bucket: "sagoon-dev",
//     Key: data.filename,
//     Body: base64Data,
//     ContentEncoding: 'base64',
//     ContentType: type,
//     ACL: "public-read"
//   }
//   try {
//     let data = await s3.upload(params).promise();
//     console.log('ffffff', data)
//   } catch (error) {
//     console.log('erorr', error)
//   }
// }
