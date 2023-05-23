import { responseHandler } from "../lib/response";
import commonMiddleware from "../../../../packages/common-middleware";
import { getVoucherByVoucherId, deleteVoucher } from "../lib/voucherHelper";

const deleteVoucherByVoucherId = async (event, context) => {
  try {
    let data = event.queryStringParameters;
    if (data.couponVoucherId) {
      let getData = await getVoucherByVoucherId(data);
      console.log("getData", getData);

      if (getData.Items && getData.Items[0].status === "FREE") {
        await deleteVoucher(getData.Items[0]);
        return responseHandler({
          statusCode: 200,
          message: "Voucher has been deleted successfully ",
          data: {},
        });
      } else {
        return responseHandler({
          statusCode: 400,
          message: "Voucher status should be FREE",
          data: {},
        });
      }
    } else {
      return responseHandler({
        statusCode: 400,
        message: "Bad Request",
        data: {},
      });
    }
  } catch (error) {
    console.log("error", error);
    let responseData = responseHandler({
      statusCode: 502,
      message: "Error in query Data",
      data: {},
    });
    console.log("responseData", responseData);
    return responseData;
  }
};

export const handler = commonMiddleware(deleteVoucherByVoucherId);
