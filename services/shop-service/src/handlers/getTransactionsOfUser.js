/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import { getTransactionsByUserId } from "../lib/transactionsHelper";
import { getUserId } from "../lib/userHelper";

const getTransactionsOfUser = async (event, context) => {
  try {
    const { mobileNo, transactionId, limit } = event.queryStringParameters;

    let userId;
    try {
      let user = await getUserId(mobileNo);
      if (user.Items.length) {
        userId = user.Items[0].userId;
      } else {
        return responseHandler({
          statusCode: 400,
          message: "User Not Found",
          data: {},
        });
      }
    } catch (error) {
      return responseHandler({
        statusCode: 400,
        message: "User Not Found",
        data: {},
      });
    }
    try {
      let transactionObject = {
        transactionId,
        limit: limit ? +limit : 5,
        userId,
      };
      let data = await getTransactionsByUserId(transactionObject);
      let response = responseHandler({
        statusCode: 200,
        message: "Transactions List",
        data: data,
      });
      return response;
    } catch (error) {
      console.log("error", error);
      return responseHandler({
        statusCode: 502,
        message: "Error Occur",
        data: {},
      });
    }
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = getTransactionsOfUser;
