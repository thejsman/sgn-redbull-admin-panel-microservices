import { responseHandler } from "../lib/response";
import commonMiddleware from "../lib/commonMiddleware";
import {getVoucherByVoucherId} from "../lib/voucherHelper";

const getVoucherById = async (event, context) => {
	try {
		let getData = await getVoucherByVoucherId(event.queryStringParameters);
		console.log("getDatagetData", getData);
		let responseData = responseHandler({
			statusCode: 200,
			message: "Vouchers List",
			data: getData,
		});
		return responseData;
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

export const handler = commonMiddleware(getVoucherById);


