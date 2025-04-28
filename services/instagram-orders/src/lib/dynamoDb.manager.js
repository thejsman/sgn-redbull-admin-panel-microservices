import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: true, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

// Create an Amazon DynamoDB service client object.
export const ddbClient = new DynamoDBClient({ region: process.env.REGION });

// Create the DynamoDB document client.
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions,
  unmarshallOptions,
});

export const getItem = async ({ tableName, params, projectionArray = [] }, { requestId } = {}) => {
  const input = {
    TableName: tableName,
    ...params,
  };
  if (projectionArray.length) {
    input.ProjectionExpression = projectionArray.toString();
  }
  try {
    const result = await ddbDocClient.send(new GetCommand(input));

    return result;
  } catch (error) {
    throw error;
  }
};

// {
//   TableName:
//     type === 'deal'
//       ? dynamoDbConfig.transactionsTableName
//       : dynamoDbConfig.giftsTableName,
//   KeyConditionExpression:
//     '#transactionId = :transactionId AND #userId = :userId',
//   ExpressionAttributeNames: {
//     '#transactionId': 'transactionId',
//     '#userId': 'userId'
//   },
//   ExpressionAttributeValues: {
//     ':transactionId': transactionId,
//     ':userId': userId
//   }
// }

export const queryItems = async ({ tableName, expression }, { requestId } = {}) => {
  try {
    const params = {
      TableName: tableName,
      ...expression,
    };

    const result = await ddbDocClient.send(new QueryCommand(params));

    return result;
  } catch (error) {
    console.error('DynamoDB Query Error', {
      requestId,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw new Error(`Failed to query items: ${error.message}`);
  }
};

export const putItem = async ({ tableName, item }, { requestId } = {}) => {
  // Set the parameters.
  console.log('tableName:::', tableName, item);
  const input = {
    TableName: tableName,
    Item: item,
  };
  try {
    console.log('input:::', input);
    const result = await ddbDocClient.send(new PutCommand(input));

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateItem = async ({ tableName, item }, { requestId } = {}) => {
  const input = {
    TableName: tableName,
    ...item,
  };
  try {
    const result = await ddbDocClient.send(new UpdateCommand(input));

    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteItem = async ({ tableName, params }, { requestId } = {}) => {
  const input = {
    TableName: tableName,
    ...params,
  };
  try {
    const result = await ddbDocClient.send(new DeleteCommand(input));

    return result;
  } catch (error) {
    throw error;
  }
};

export default {
  getItem,
  queryItems,
  putItem,
  updateItem,
  deleteItem,
};
