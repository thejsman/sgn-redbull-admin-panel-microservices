/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getConectedMembers = async ({ data }) => {
  console.log("data", data);
  let KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues;
  // KeyConditionExpression = "#subTo = :subTo and begins_with(#status,:status) or begins_with(#status,:status1)";
  KeyConditionExpression = "#subTo = :subTo and #status = :status";
  ExpressionAttributeNames = {
    "#subTo": "subTo",
    "#status": "status",
  };
  ExpressionAttributeValues = {
    ":subTo": `${data.dialCode}${data.phone}`,
    ":status": "accept",
  };
  let params = {
    TableName: process.env.CONNECTION_TABLE_NAME,
    Limit: +data.limit,
    IndexName: "subTo_status-Index",
    ScanIndexForward: data.ScanIndexForward,
    KeyConditionExpression: KeyConditionExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
  if (data.lastKey) {
    params = {
      ...params,
      ExclusiveStartKey: {
        subTo: data.lastKey,
        status: data.status,
        createdAt: +data.createdAt,
      },
    };
  }
  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    throw error;
  }
};

export const getConnectedMemebersFrom = async ({ data }) => {
  console.log("getConnectedMemebersFrom - request-", data.userId);
  let KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues;
  // KeyConditionExpression = "#subTo = :subTo and begins_with(#status,:status) or begins_with(#status,:status1)";
  KeyConditionExpression = "#subFrom = :subFrom and #status = :status";
  ExpressionAttributeNames = {
    "#subFrom": "subFrom",
    "#status": "status",
  };
  ExpressionAttributeValues = {
    ":subFrom": `${data.userId}`,
    ":status": "accept",
  };
  let params = {
    TableName: process.env.CONNECTION_TABLE_NAME,
    Limit: +data.limit,
    IndexName: "subFrom_status-Index",
    ScanIndexForward: data.ScanIndexForward,
    KeyConditionExpression: KeyConditionExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
  console.log("params -----", params);
  if (data.lastKey) {
    params = {
      ...params,
      ExclusiveStartKey: {
        subTo: data.lastKey,
        status: data.status,
        createdAt: +data.createdAt,
      },
    };
  }
  try {
    return await dynamodb.query(params).promise();
  } catch (error) {
    throw error;
  }
};
