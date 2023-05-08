import { commonMiddleware } from "common-middleware-layer";
import { updateUserReward, createRewardTransaction, sendSMS } from "../lib/utils";
async function addRewards(event, context) {
  try {
    const { userId, amount, description, transactionType, dialCode, phone } = event.body;

    // console.log({ eventBody: event.body });
    if (!userId || !amount || !description || !transactionType) {
      return {
        statusCode: 400,
        headers: {
          "access-control-allow-origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          errorMessage: "Missing params",
        }),
      };
    }

    const payload = {};
    payload.userId = userId;
    payload.transactionType = transactionType;
    payload.description = description;
    payload.amount = amount;
    const result = await Promise.allSettled([
      createRewardTransaction(payload),
      updateUserReward(userId, payload),
    ]);
    console.log("Update result:", result);
    //send sms now
    if (dialCode && phone) {
      console.log('sending sms');
      let smsresult = await sendSMS({ dialCode, phone, reward: amount });
      console.log('smsresult', smsresult);
    }


    return {
      statusCode: 200,
      headers: {
        "access-control-allow-origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: "success",
        amount,
        transactionType: payload.transactionType,
        result,
      }),
    };
  } catch (error) {
    console.log("Exception in addRewards", error);
    return {
      statusCode: 500,
      headers: {
        "access-control-allow-origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: "Something went wrong, please try after sometime",
      }),
    };
  }
}
export const handler = commonMiddleware(addRewards);
