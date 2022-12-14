import AWS from "aws-sdk";
import {
  sendMessageViaAakash,
  //   sendIndiaSMS,
  getUsers,
} from "../lib/messageHelper";
// const sleep = () => {
//   return new Promise((resolve) => setTimeout(resolve, 500));
// };

const sqs = new AWS.SQS();
async function sendMessageQueue(event, context) {
  try {
    const { receiptHandle, body } = event.Records[0];
    const { smsText, dialCode, createdDate, mobileNumbers } = await JSON.parse(
      body
    );

    console.log({ receiptHandle, smsText, dialCode, createdDate, mobileNumbers });

    let deletedSQSHndlerResult = await sqs
      .deleteMessage({
        QueueUrl: process.env.MESSAGE_SEND_QUEUE,
        ReceiptHandle: receiptHandle,
      })
      .promise();
    console.log('in finally 1', deletedSQSHndlerResult);
    if (mobileNumbers) {
      //split the mobileNumbers and send SMS
      const mobileNumbersArray = mobileNumbers.split(",");
      mobileNumbersArray.forEach((mobileNumber) => {
        console.log(mobileNumber);
      });
    } else {
      console.log({ smsText, dialCode, createdDate });
      let result = await getUsers({ dialCode, createdDate });

      if (dialCode === "91") {
        //   for (let i = 0; i < result.length; i++) {
        //     await sendIndiaSMS(result[i].pk, smsText);
        //   }
      } else {
        console.log("the length is :", result.length);
        let smsPromises = [];
        //deviding into checks
        while (result.length > 0) {
          smsPromises.push(result.splice(-1000).map(item => item.phone.trim()).join());
        }
        console.log('phone number chunks', smsPromises.length, JSON.stringify(smsPromises));
        try {
          //smsPromises.push(sendMessageViaAakash(record.phone, smsText));
          const finalSmsPromise = await Promise.allSettled(smsPromises.map(async (mobiles) => {
            return await sendMessageViaAakash(mobiles, smsText);
          }));
          console.log({ finalSmsPromise });
          console.log("All SMS Sent");

        } catch (e) {
          console.log('error in processing sms', e);
        } finally {
          console.log('in finally', receiptHandle, process.env.MESSAGE_SEND_QUEUE);
          //now delete that sqs message id saying it has been completed

        }
      }
    }

    // console.log("numbers", result);
  } catch (error) {
    console.log("Exception in sendMessageQueue", { error });
  }
}

export const handler = sendMessageQueue;
