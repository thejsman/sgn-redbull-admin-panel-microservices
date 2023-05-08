import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
import { generateUpdateQuery } from "../../../../common/lib/utils";
import { sendIndiaSMS } from "./indiaSms.js";
import { sendNepalSMS } from "./nepalSms.js";

export const createRewardTransaction = async (payload) => {
  const now = new Date();
  const params = {
    userId: payload.userId,
    createdAt: now.toISOString(),
    ...payload,
  };
  return new Promise(async (resolve, reject) => {
    try {
      await dynamoDb
        .put({
          TableName: process.env.USER_REWARDS_TABLE_NAME,
          Item: params,
        })
        .promise();

      resolve(true);
    } catch (error) {
      console.log("Exception in createRewardTransaction", error);
      reject(false);
    }
  });
};
export const updateUserReward = async (userId, payload) => {
  //first get the use and get totalRewardEarned and totalRewardUsed
  const userParam = {
    TableName: process.env.USER_TABLE_NAME,
    Key: { userId },
    ProjectionExpression:
      "userId, totalRewards, totalRewardEarned, totalRewardUsed",
  };
  try {
    const result = await dynamoDb.get(userParam).promise();
    if (result.Item) {
      const updateParms = {
        totalRewards: result.Item.totalRewards || 0,
        totalRewardEarned: result.Item.totalRewardEarned || 0,
        totalRewardUsed: result.Item.totalRewardUsed || 0,
      };
      if (payload.transactionType === "credit") {
        updateParms.totalRewardEarned += parseFloat(payload.amount);
        updateParms.totalRewards += parseFloat(payload.amount);
      } else if (payload.transactionType === "debit") {
        updateParms.totalRewardUsed += parseFloat(payload.amount);
        updateParms.totalRewards -= parseFloat(payload.amount);
      }

      const updateExpression = generateUpdateQuery(updateParms);

      const params = {
        TableName: process.env.USER_TABLE_NAME,
        Key: { userId },
        ...updateExpression,
        ReturnValues: "NONE",
      };
      await dynamoDb.update(params).promise();
      return updateParms;
    }
  } catch (error) {
    console.log("Exception in updateUserReward", error);
  }
};

export const sendSMS = async ({ dialCode, phone, reward }) => {
  // invitationCode,
  try {
    const flowId = "62cec8b74b9314686017b592";
    let result;
    console.log('dialCode', dialCode);
    if (dialCode == "91") {
      result = await sendIndiaSMS(flowId, `${dialCode}${phone}`, {
        reward
      });
    } else if (dialCode == "977") {
      result = await sendNepalSMS("REWARD_ADDED", `${dialCode}${phone}`, {
        reward
      });
    }
    console.log('result', result);
    return result;
  } catch (e) {
    return { message: "could not be send", type: "failed" };
  }
};