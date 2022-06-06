

const AWS = require('aws-sdk');
const { responseHandler } = require('../../lib/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const singleTemplate = async (event, context) => {
  const data = event.queryStringParameters;

  const params = {
    TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
    Key: {
      notificationName: data.notificationName
    }
  };

  try {
    let getData = await dynamoDb.get(params).promise();
    return responseHandler({
      statusCode: 200,
      message: 'Single Template',
      data: getData.Item
    });
  } catch (error) {
    return responseHandler({
      statusCode: 200,
      message: 'Error in getting single Template',
      data: {}
    });
  }
};


export const handler = singleTemplate;
