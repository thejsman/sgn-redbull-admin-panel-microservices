import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const findUserByPartitionKey = async (partitionKey) => {
  const result = await dynamoDb
    .query({
      TableName: process.env.APPUSER_TABLE_NAME,
      KeyConditionExpression: "#phone = :phone",
      ExpressionAttributeNames: {
        "#phone": "phone",
      },
      ExpressionAttributeValues: {
        ":phone": partitionKey,
      },
    })
    .promise();

  if (result.Item) {
    return result.Item;
  } else {
    return {};
  }
};

export const getUserInformation = async (userId) => {
  try {
    const result = await dynamoDb
      .get({
        TableName: process.env.APPUSER_TABLE_NAME,
        Key: { userId },
      })
      .promise();
    if (result.Item) {
      return result.Item;
    } else {
      return {};
    }
  } catch (error) {
    console.log("Exception in getUserInformation", error);
    return {};
  }
};

export const getUserList = async (data) => {
  try {
    let params = {
      TableName: process.env.APPUSER_TABLE_NAME,
      Limit: + data.limit,
    };
    if (data.userId !== "null") {
      params = {
        ...params,
        ExclusiveStartKey: {
          userId: data.userId,
        },
      };
    }

    let getData = await dynamoDb.scan(params).promise();
    const result = await dynamoDb
      .get({
        TableName: process.env.APPUSER_TABLE_NAME,
        Key: { userId },
      })
      .promise();
    if (result.Item) {
      return result.Item;
    } else {
      return {};
    }
  } catch (error) {
    console.log("Exception in getUserList", error);
    return {};
  }
};
