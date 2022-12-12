import {
  sendMessageViaAakash,
  //   sendIndiaSMS,
  getUsers,
} from "../lib/messageHelper";
// const sleep = () => {
//   return new Promise((resolve) => setTimeout(resolve, 500));
// };

async function sendMessageQueue(event, context) {
  try {
    const record = event.Records[0];
    const { smsText, dialCode, createdDate, mobileNumbers } = await JSON.parse(
      record.body
    );

    console.log({ smsText, dialCode, createdDate, mobileNumbers });
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

        for (const record of result) {
          // await sleep();
          console.log("Check:", record.phone);
          smsPromises.push(sendMessageViaAakash(record.phone, smsText));
        }
        const finalSmsPromise = await Promise.allSettled(smsPromises);
        console.log({ finalSmsPromise });
        console.log("All SMS Sent");
      }
    }

    // console.log("numbers", result);
  } catch (error) {
    console.log("Exception in sendMessageQueue", { error });
  }
}

export const handler = sendMessageQueue;
