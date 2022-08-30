/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";
import { createVoucher } from "../lib/voucherHelper";
import commonMiddleware from "../../../../packages/common-middleware";
import { v4 as uuid } from "uuid";

const addVoucher = async (event, context) => {
	try {
		const { itemId, variantId, validTill, coupon, productName, value,country } =
			event.body;
		let couponSplit = coupon.split(",");
		for (let i = 0; i < couponSplit.length; i++) {
			// Split the coupon Pin if exist
			const [coupon, couponPin = null] = couponSplit[i].split("*");

			let voucher = {
				pk: `${itemId}-${variantId}`,
				itemId,
				variantId,
				couponVoucherId: uuid(),
				validTill,
				status: "FREE",
				coupon,
				couponPin,
				productName,
				value,
				country,
				voucherStatus:"notArchived"
			};
			await createVoucher(voucher);
		}
		return responseHandler({
			statusCode: 200,
			message: "Vocuher Has been Created",
			data: {},
		});
	} catch (error) {
		console.log("error", error);
		return responseHandler({
			statusCode: 500,
			message: "Internal Server Error",
			data: {},
		});
	}
};

// export const handler = userExists;
export const handler = commonMiddleware(addVoucher);
