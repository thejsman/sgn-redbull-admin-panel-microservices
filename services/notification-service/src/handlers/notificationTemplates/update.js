/*eslint new-cap: ["error", { "newIsCap": false }]*/
const AWS = require('aws-sdk');
const { responseHandler } = require('../../lib/response');

var s3 = new AWS.S3({
  accessKeyId: 'AKIAQBCQH5WZD5K5YBMB',
  secretAccessKey: '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',
  region: 'eu-central-1'
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateTemplate = async (event, context) => {
  // const timestamp = new Date().getTime();
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
      Bucket: 'sagoon-dev',
      Key: data.fileName,
      Body: base64Data,
      ContentEncoding: 'base64',
      ContentType: type,
      ACL: 'public-read'
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
    };

    params = {
      TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
      Key: {
        notificationName: data.notificationName
      },
      ExpressionAttributeNames: {
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':image': uploadImage.Location,
        ':message': data.message,
        ':body': data.body,
        ':composed': data.composed,
        ':badge': data.badge,
        ':priority': data.priority,
        ':sound': data.sound,
        ':event': data.event,
        ':event_type': data.event_type
      },
      UpdateExpression:
        'SET #title = :title, image = :image, message = :message, body = :body, composed = :composed,badge = :badge, priority = :priority,sound = :sound,event = :event,event_type = :event_type',
      ReturnValues: 'ALL_NEW'
    };
  } else {
    params = {
      TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
      Key: {
        notificationName: data.notificationName
      },
      ExpressionAttributeNames: {
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':message': data.message,
        ':body': data.body,
        ':composed': data.composed,
        ':badge': data.badge,
        ':priority': data.priority,
        ':sound': data.sound,
        ':event': data.event,
        ':event_type': data.event_type
      },
      UpdateExpression:
        'SET #title = :title, message = :message, body = :body, composed = :composed,badge = :badge, priority = :priority,sound = :sound,event = :event,event_type = :event_type',
      ReturnValues: 'ALL_NEW'
    };
  }

  try {
    let updateData = await dynamoDb.update(params).promise();
    return responseHandler({
      statusCode: 200,
      message: 'Template Updated',
      data: updateData
    });
  } catch (error) {
    console.log("errorrrr",error);
    return responseHandler({
      statusCode: 501,
      message: 'Result Not Updated',
      data: {}
    });
  }
};

export const handler = updateTemplate;
