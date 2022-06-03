import { getPendingVouchers, updatePendingVouchers } from "../lib/utils";
const processPendingVouchers = async (event, context) => {
	try {
		// Get the pending vouchers
		const pendingVouchers = await getPendingVouchers();
		console.log("Pending Vouchers: ", pendingVouchers);
		// Update and set them FREE
		pendingVouchers.length > 0
			? await updatePendingVouchers(pendingVouchers)
			: null;
	} catch (error) {
		console.log("Exception in processPendingVouchers", error);
	}
};

export const handler = processPendingVouchers;
