import { responseHandler } from "../lib/response";
import { getTransactionsByUserId } from "../lib/utils";
//import commonMiddleware from "../../../../packages/common-middleware";

const getTransactionsByAppUserId = async (event, context) => {
  try {
    const { userId, limit, transactionId } = event.queryStringParameters || {};
    let transactionObject = {
      limit: limit ? +limit : 5,
      userId,
      transactionId,
    };
    let result = await getTransactionsByUserId(transactionObject);
    return responseHandler({
      statusCode: 200,
      message: "Transactions List",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 502,
      message: "Error Occur",
      data: [],
    });
  }
};

//export const handler = commonMiddleware(getTransactionsByAppUserId);
export const handler = getTransactionsByAppUserId;
