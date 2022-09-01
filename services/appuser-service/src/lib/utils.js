import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const getUserByPhoneNo = async (phone) => {
  try {
    let params = {
      TableName: process.env.APPUSER_TABLE_NAME,
      IndexName: "pkIndex",
      KeyConditionExpression:
        "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk": phone,
      },
    };
    const result = await dynamoDb.query(params).promise();
    if (result.Items.length) {
      return result.Items[0];
    } else {
      return {};
    }
  } catch (error) {
    console.log("Exception in getUserByPhoneNo", error);
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
    // if (data.userId !== "null") {
    //   params = {
    //     ...params,
    //     ExclusiveStartKey: {
    //       userId: data.userId,
    //     },
    //   };
    // }

    console.log('params', params);
    let result = await dynamoDb.scan(params).promise();
    console.log('result', result);
    if (result.Items) {
      return result.Items;
    } else {
      return {};
    }
  } catch (error) {
    console.log("Exception in getUserList", error);
    return {};
  }
};

export const getTransactionsByUserId = async (data) => {
  try {
    let params = {
      TableName: process.env.TRANSACTION_TABLE_NAME,
      Limit: +data.limit,
      KeyConditionExpression:
        "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": data.userId,
      },
    };

    if (data.transactionId !== "null") {
      params = {
        ...params,
        ExclusiveStartKey: {
          userId: data.userId,
          transactionId: data.transactionId
        },
      };
    }

    return await dynamoDb.query(params).promise();
  } catch (error) {
    throw error;
  }
};


export const getRewardsByUserId = async (userId) => {
  try {
    let params = {
      TableName: process.env.USER_REWARDS_TABLE_NAME,
      KeyConditionExpression:
        "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };


    return await dynamoDb.query(params).promise();
  } catch (error) {
    throw error;
  }
};

export const getConnectionsByUserId = async (userId) => {
  try {
    let params = {
      TableName: process.env.CONNECTION_TABLE_NAME,
      IndexName: "subFrom_status-Index",
      KeyConditionExpression:
        "#subFrom = :subFrom",
      ExpressionAttributeNames: {
        "#subFrom": "subFrom",
      },
      ExpressionAttributeValues: {
        ":subFrom": userId,
      },
    };
    console.log("params", params);

    return await dynamoDb.query(params).promise();
  } catch (error) {
    throw error;
  }
};
