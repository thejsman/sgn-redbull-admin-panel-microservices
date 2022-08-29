import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const relationshipQuery = async (event, context) => {
	try {
		let params = {
			TableName: process.env.APPUSER_TABLE_NAME,
			Limit: +data.limit,
		};
		if (data.userId !== "null") {
			params = {
				...params,
				ExclusiveStartKey: {
					userId: data.userId,
				},
			};
		}

		let getData = await dynamoDb.scan(params).promise();
		let responseData = responseHandler({
			statusCode: 200,
			message: "App User Info",
			data: getData,
		});
		return responseData;

	} catch (error) {
		let responseData = responseHandler({
			statusCode: 502,
			message: "Error in Getting App User Info",
			data: {},
		});
		return responseData;
	}
};

export const handler = relationshipQuery;
