import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const putMessageInOccasion = async (messageParams) => {
  const params = {
    ...messageParams,
  };
  return await dynamodb
    .put({
      TableName: process.env.LC_OCCASION_MESSAGE_TABLE,
      Item: params,
    })
    .promise();
};

export const getMessages = async (messageParams) => {
  const params = {
    TableName: process.env.LC_OCCASION_MESSAGE_TABLE,
    KeyConditionExpression: "#occasionName = :occasionName",
    ExpressionAttributeNames: {
      "#occasionName": "occasionName",
    },
    ExpressionAttributeValues: {
      ":occasionName": messageParams.occasionName,
    },
  };
  try {
    let result = await dynamodb.query(params).promise();
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteMessage = async (messageParams) => {
  try {
    let result = await dynamodb
      .delete({
        TableName: process.env.LC_OCCASION_MESSAGE_TABLE,
        Key: {
          occasionName: messageParams.occasionName,
          displayOrder: messageParams.displayOrder,
        },
      })
      .promise();
    return result;
  } catch (error) {
    throw error;
  }
};
