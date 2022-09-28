import {
  sendMessageViaAakash,
  //   sendIndiaSMS,
  getUsers,
} from "../lib/messageHelper";

async function sendMessageQueue(event, context) {
  try {
    const record = event.Records[0];
    const { smsText, dialCode, createdDate } = await JSON.parse(record.body);
    console.log({ smsText, dialCode, createdDate });
    let result = await getUsers({ dialCode, createdDate });
    if (dialCode === "91") {
      //   for (let i = 0; i < result.length; i++) {
      //     await sendIndiaSMS(result[i].pk, smsText);
      //   }
    } else {
      for (let i = 0; i < result.length; i++) {
        // Do nothing
        await sendMessageViaAakash(result[i].phone, smsText);
      }
    }
    console.log("numbers", result);
  } catch (error) {
    console.log("Exception in cleanPreUser", { error });
  }
}

export const handler = sendMessageQueue;
