import commonMiddleware from '../../../../packages/common-middleware';
import { queryItems } from '../lib/dynamoDb.manager.js';
import { responseHandler } from '../lib/response';

// Create Order Function
const getAllOrders = async (event, context) => {
  try {
    const { channel = '977', limit = 10, continuationToken = null } = event.queryStringParameters || {};

    const exclusiveStartKey =
      continuationToken && continuationToken !== 'null'
        ? JSON.parse(Buffer.from(continuationToken, 'base64').toString('utf8'))
        : undefined;

    const expression = {
      IndexName: 'DialCode-CreatedAt-index',
      KeyConditionExpression: 'dialCode = :dialCode',
      ExpressionAttributeValues: {
        ':dialCode': channel,
      },
      Limit: Number(limit),
      ExclusiveStartKey: exclusiveStartKey,
      ScanIndexForward: false,
    };
    console.log('Request expression:', expression);

    const result = await queryItems({
      tableName: process.env.INSTAGRAM_ORDERS_TABLE,
      expression,
    });
    console.log('Orders:', result);
    if (result.Items.length === 0) {
      return responseHandler({
        statusCode: 200,
        message: 'No orders found',
        data: [],
      });
    }

    return responseHandler({
      statusCode: 200,
      message: 'successfully fetched orders',
      data: {
        orders: result.Items,
        continuationToken: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : null,
      },
    });
  } catch (error) {
    console.error('getAllOrders Error:', error);

    return responseHandler({
      statusCode: 500,
      message: 'Internal Server Error',
      data: {},
    });
  }
};

export const handler = commonMiddleware(getAllOrders);
