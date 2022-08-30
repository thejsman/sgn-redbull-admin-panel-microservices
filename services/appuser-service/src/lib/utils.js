import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const findUserByPartitionKey = async (partitionKey) => {
  const result = await dynamoDb
    .query({
      TableName: process.env.APPUSER_TABLE_NAME,
      IndexName: "pkIndex",
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk": partitionKey,
      },
      //   ProjectionExpression:
      //     "userId, currencySymbol, pk, phone, dialCode, totalRewards, totalRewardEarned, totalRewardUsed, email, emailVerified, dob, gender, profileImage, screenName",
    })
    .promise();

  if (result.Items.length === 0) {
    return false;
  }
  return result.Items[0];
};

export const getUserInformation = async (userId) => {
  try {
    const result = await dynamoDb
      .get({
        TableName: process.env.APPUSER_TABLE_NAME,
        Key: { userId },
        // ProjectionExpression:
        //   "userId, currencySymbol, pk, phone, dialCode, email, totalRewards, totalRewardEarned, totalRewardUsed, emailVerified, dob, gender, profileImage, screenName, lastPlayedAt",
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
