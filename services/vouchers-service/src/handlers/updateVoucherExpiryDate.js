/*eslint new-cap: ["error", { "newIsCap": false }]*/
const { responseHandler } = require("../lib/response");
import commonMiddleware from "../../../../packages/common-middleware";
import { updateVoucherValidTill } from "../lib/voucherHelper";
// const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateVoucherExpiryDate = async (event, context) => {
  // const timestamp = new Date().getTime();
  const data = event.body;
  try {
    let updateData;
    let dbPromises = [];
    if (data.vouchers && data.vouchers.length > 0 && data.validTill) {
      console.log("data,", data);
      data.vouchers.forEach((item, i) => {
        console.log("item,", item);
        dbPromises.push(updateVoucherValidTill(item, data.validTill));
      });
      console.log("dbPromises,", dbPromises);
      const response = await Promise.allSettled(dbPromises);
      console.log("response,", response);
      return responseHandler({
        statusCode: 200,
        message: "Voucher has been Updated",
        data: updateData,
      });
    } else {
      return responseHandler({
        statusCode: 400,
        message: "Bad Request",
        data: {},
      });
    }
  } catch (error) {
    console.log("errorrrr", error);
    return responseHandler({
      statusCode: 501,
      message: "Request not Updated",
      data: {},
    });
  }
};

// export const handler = updateConnection;
export const handler = commonMiddleware(updateVoucherExpiryDate);
