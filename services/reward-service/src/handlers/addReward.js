import { commonMiddleware } from "common-middleware-layer";
import { updateUserReward, createRewardTransaction, sendSMS } from "../lib/utils";
async function addRewards(event, context) {
  try {
    const { userId, amount, description, transactionType, dialCode, phone } = event.body;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          errorMessage: "not authorized",
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
      await sendSMS(dialCode, phone, amount);
    }


    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "success",
        amount,
        transactionType: payload.transactionType,
        result,
      }),
    };
  } catch (error) {
    console.log("Exception in addRewards", error);
  }
}
export const handler = commonMiddleware(addRewards);
