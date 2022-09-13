/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";
import { putSendMessageOnSQS, saveMessage } from "../lib/messageHelper";
import commonMiddleware from "../../../../packages/common-middleware";
import moment from "moment";

const sendMessage = async (event, context) => {
	const now = new Date();
	try {
		const { countryCode, createdDate, smsText } =
			event.body;

		await saveMessage({
			smsText: smsText,
			countryCode: countryCode,
			createdAt: now.toISOString(),
			createdDate: moment().format("YYYY-MM-DD"),
		});
		await putSendMessageOnSQS({ countryCode, createdDate, smsText });
		return responseHandler({
			statusCode: 200,
			message: "Message has been sent",
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
export const handler = commonMiddleware(sendMessage);
