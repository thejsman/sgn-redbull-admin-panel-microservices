import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const findUserByPartitionKey = async (partitionKey) => {
  const result = await dynamodb
    .query({
      TableName: process.env.USER_TABLE_NAME,
      IndexName: "pkIndex",
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk": partitionKey,
      },
    })
    .promise();

  if (result.Items.length === 0) {
    return false;
  }
  return result.Items[0];
};

export const findUserByUserId = async (userId) => {
  const result = await dynamodb
    .query({
      TableName: process.env.USER_TABLE_NAME,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
    .promise();

  if (result.Items.length === 0) {
    return false;
  }
  return result.Items[0];
};
