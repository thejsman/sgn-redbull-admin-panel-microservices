import { sendMessageViaAakash, sendIndiaSMS, getUsers } from "../lib/messageHelper";

async function sendMessageQueue(event, context) {
    try {
        const record = event.Records[0];
        const { smsText, countryCode, createdDate } = await JSON.parse(record.body);
        let result = await getUsers({ countryCode, createdDate });
        if (countryCode === "IN") {
            for (let i = 0; i < result.length; i++) {
                await sendIndiaSMS(result[i].pk, smsText);
            }
        }
        else {
            for (let i = 0; i < result.length; i++) {
                await sendMessageViaAakash(result[i].phone, smsText);
            }
        }
        console.log("numbers", result);
    } catch (error) {
        console.log("Exception in cleanPreUser", { error });
    }
}

export const handler = sendMessageQueue;
