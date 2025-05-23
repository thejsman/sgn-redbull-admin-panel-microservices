/*eslint new-cap: ["error", { "newIsCap": false }]*/
/*eslint no-unneeded-ternary: "error"*/

import { responseHandler } from "../lib/response";
import { getTransactionsDateWise } from "../lib/transactionsHelper";
import moment from "moment";

const getTransactionsByDate = async (event, context) => {
	try {
		const {
			transactionDate,
			transactionId,
			userId,
			status,
			limit = 50,
		} = event.queryStringParameters;
		let transactionObject = {
			transactionDate: transactionDate
				? transactionDate
				: moment().format("YYYY-MM-DD"),
			transactionId,
			userId,
			limit: limit ? +limit : 50,
			status,
		};
		try {
			let data = await getTransactionsDateWise(transactionObject);
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

export const handler = getTransactionsByDate;
