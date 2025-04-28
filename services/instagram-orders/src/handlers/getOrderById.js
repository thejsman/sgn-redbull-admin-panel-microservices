import commonMiddleware from '../../../../packages/common-middleware';
import { queryItems } from '../lib/dynamoDb.manager.js';
import { responseHandler } from '../lib/response';

const getAllOrders = async (event) => {
  try {
    const { transactionId } = event.pathParameters || {};
    const { dialCode = '977' } = event.queryStringParameters || {};

    if (!transactionId) {
      return responseHandler({
        statusCode: 400,
        message: 'transactionId is required',
        data: {},
      });
    }

    const params = {
      tableName: process.env.INSTAGRAM_ORDERS_TABLE,
      expression: {
        IndexName: 'DialCode-TransactionId-index',
        KeyConditionExpression: 'dialCode = :dialCode AND transactionId = :transactionId',
        ExpressionAttributeValues: {
          ':dialCode': dialCode,
          ':transactionId': transactionId,
        },
      },
    };

    console.info('Fetching Order with params:', JSON.stringify(params));

    const result = await queryItems(params);

    if (!result.Items || result.Items.length === 0) {
      return responseHandler({
        statusCode: 200,
        message: 'Order not found',
        data: [],
      });
    }

    return responseHandler({
      statusCode: 200,
      message: 'Successfully fetched order',
      data: {
        order: result.Items,
      },
    });
  } catch (error) {
    console.error('Error in getAllOrders:', {
      errorMessage: error.message,
      errorStack: error.stack,
    });

    return responseHandler({
      statusCode: 500,
      message: 'Internal Server Error',
      data: {},
    });
  }
};

export const handler = commonMiddleware(getAllOrders);
