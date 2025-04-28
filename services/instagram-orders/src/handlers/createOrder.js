import commonMiddleware from '../../../../packages/common-middleware';
import { putItem } from '../lib/dynamoDb.manager.js';
import { responseHandler } from '../lib/response';

// Create Order Function
const createOrder = async (event, context) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    console.log('Request Body:', body);
    const { user, products } = body;
    // TODO: Add your order creation logic here
    const now = new Date();
    const transactionId = `insta-${Math.random().toString(36).substring(2, 10)}`;
    const item = {
      createdAt: now.toISOString(),
      createdDate: now.toISOString().substring(0, 10),
      products,
      ...user,
      transactionId,
      transactionStatus: 'PENDING',
    };

    const result = await putItem({
      tableName: process.env.INSTAGRAM_ORDERS_TABLE,
      item,
    });

    console.log('Order Created:', result);
    return responseHandler({
      statusCode: 200,
      message: 'Order has been created successfully',
      data: { transactionId }, // You can pass created order info here
    });
  } catch (error) {
    console.error('CreateOrder Error:', error);

    return responseHandler({
      statusCode: 500,
      message: 'Internal Server Error',
      data: {},
    });
  }
};

export const handler = commonMiddleware(createOrder);
