import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const batchUpdateWaitlistedUser = async (event, context) => {
  const params = {
    TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
  };
  let allWaitlistedUsers = await dynamoDb.scan(params).promise();

  //now update
  await Promise.all(
    allWaitlistedUsers.Items.map(async (item) => {
      await dynamoDb
        .put({
          TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
          Item: {
            ...item,
            date: item.createdAt.slice(0, 10),
            userType: "waitListed",
          },
        })
        .promise();
    })
  );

  console.log("allwaitlisted users--", allWaitlistedUsers);
  return {
    statusCode: 200,
    message: "updated successfully",
  };
};

export const handler = batchUpdateWaitlistedUser;
