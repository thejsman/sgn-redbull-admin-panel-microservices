/*eslint new-cap: ["error", { "newIsCap": false }]*/
import commonMiddleware from "common-middleware";
const AWS = require("aws-sdk");
const { responseHandler } = require("../lib/response");
import { getUserFromToken } from "../lib/userHelper";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const updateConnection = async (event, context) => {
	// const timestamp = new Date().getTime();

	const { user } = await getUserFromToken(event.headers.Authorization);

	console.log(user, "yyyyyy", user.userId);
	if (!user) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				errorMessage: "not authorized",
			}),
		};
	}

	const data = event.body;

	let params = {};
	params = {
		TableName: process.env.CONNECTION_TABLE_NAME,
		Key: {
			subFrom: user.userId,
			subTo: data.subTo,
		},
	};
	try {
		let updateData = await dynamoDb.delete(params).promise();
		return responseHandler({
			statusCode: 200,
			message: "Request has been Deleted",
			data: updateData,
		});
	} catch (error) {
		console.log("errorrrr", error);
		return responseHandler({
			statusCode: 501,
			message: "Request Not Deleted",
			data: {},
		});
	}
};

// export const handler = updateConnection;
export const handler = commonMiddleware(updateConnection);
