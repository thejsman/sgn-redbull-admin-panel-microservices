import {
  // sendMessageViaAakash,
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
      console.log({ result });
      if (dialCode === "91") {
        //   for (let i = 0; i < result.length; i++) {
        //     await sendIndiaSMS(result[i].pk, smsText);
        //   }
      } else {
        console.log("the length is :", result.length);

        for (const record of result) {
          // await sleep();
          console.log("Check:", record.phone);
        }
        // for (let i = 0; i < result.length; i++) {
        //   // Do nothing
        //   // await sendMessageViaAakash(result[i].phone, smsText);
        //   console.log("Number: ", result[i].phone);
        // }
      }
    }

    // console.log("numbers", result);
  } catch (error) {
    console.log("Exception in cleanPreUser", { error });
  }
}

export const handler = sendMessageQueue;
