import AWS from "aws-sdk";
const sqs = new AWS.SQS();
export const sendMessageToUserExportQueue = async (data) => {
  return new Promise(async (resolve, reject) => {
    // console.log("check ARN : ", process.env.OCCASION_STATS_QUEUE);
    try {
      await sqs
        .sendMessage({
          QueueUrl: process.env.USER_EXPORT_REQUEST_QUEUE,
          MessageBody: JSON.stringify(data),
        })
        .promise();
      resolve("success");
    } catch (error) {
      console.log("Error in user export QUEUE", error);
      reject(error);
    }
  });
};
