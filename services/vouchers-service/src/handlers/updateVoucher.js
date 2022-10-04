/*eslint new-cap: ["error", { "newIsCap": false }]*/
const { responseHandler } = require("../lib/response");
import commonMiddleware from "../../../../packages/common-middleware";
import { updateVoucherStatus, updateVoucherVoucherStatus, getSingleVoucher } from "../lib/voucherHelper";
// const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateVoucher = async (event, context) => {
	// const timestamp = new Date().getTime();
	const data = event.body;
	try {
		let updateData;
		if (data.status) {
			updateData = await updateVoucherStatus(data);
		}
		else if (data.voucherStatus) {
			let allVouchers = await getSingleVoucher({ ...data, limit: 10000,pk:"null" });
			for (let i = 0; i < allVouchers.Items.length; i++) {
				updateData = await updateVoucherVoucherStatus({ ...allVouchers.Items[i], voucherStatus: data.voucherStatus });
			}
		} else {
			return responseHandler({
				statusCode: 400,
				message: "Bad Request",
				data: {},
			});
		}
		return responseHandler({
			statusCode: 200,
			message: "Voucher has been Updated",
			data: updateData,
		});
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
export const handler = commonMiddleware(updateVoucher);
