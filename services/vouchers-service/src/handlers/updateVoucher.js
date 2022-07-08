/*eslint new-cap: ["error", { "newIsCap": false }]*/
const AWS = require("aws-sdk");
const { responseHandler } = require("../lib/response");
import commonMiddleware from "../../../../packages/common-middleware";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateVoucher = async (event, context) => {
	// const timestamp = new Date().getTime();
	const data = event.body;
	let params = {};
	params = {
		TableName: process.env.VOUCHER_TABLE_NAME,
		Key: {
			pk: data.pk,
			couponVoucherId: data.couponVoucherId,
		},
		ExpressionAttributeNames: {
			"#status": "status",
		},
		ExpressionAttributeValues: {
			":status": data.status,
		},
		UpdateExpression: "SET #status = :status",
		ReturnValues: "ALL_NEW",
	};
	try {
		let updateData = await dynamoDb.update(params).promise();
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
