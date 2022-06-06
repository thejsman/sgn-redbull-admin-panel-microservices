/*eslint new-cap: ["error", { "newIsCap": false }]*/

const AWS = require('aws-sdk');
const { responseHandler } = require('../../lib/response');


var s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const createTemplate = async (event, context) => {
  const timestamp = new Date();

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
    Item: {
      notificationName: data.notificationName,
      title: data.title,
      message: data.message,
      body: data.body,
      composed: data.composed,
      badge: data.badge,
      priority: data.priority,
      sound: data.sound,
      event: data.event,
      event_type: data.event_type,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };

  if (data.base64) {
    const type = data.base64.split(';')[0].split('/')[1];
    const base64Data = new Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    var s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: data.fileName,
      Body: base64Data,
      ContentEncoding: 'base64',
      ContentType: type,
      ACL: "public-read"
    };
    try {
      let data = await s3.upload(s3Params).promise();
      params.Item = { ...params.Item, image: data.Location };
      console.log(params, 'ffffff', data);

    } catch (error) {
      console.log('erorr', error);
      return responseHandler({
        statusCode: 500,
        message: 'Error in Image Uploading',
        data: {}
      });
    }
  }

  try {
    await dynamoDb.put(params).promise();
    let response = responseHandler({
      statusCode: 200,
      message: 'Data Saved',
      data: {}
    });
    return response;
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: 'Error Occur',
      data: {}
    });
  }
};

export const handler = createTemplate;
