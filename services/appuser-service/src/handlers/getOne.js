import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getOneAppUser = async (event, context) => {
	const data = event.queryStringParameters;
	let params = {
		TableName: process.env.APPUSER_TABLE_NAME,
		KeyConditionExpression:
			"#userId = :userId",
		ExpressionAttributeNames: {
			"#userId": "userId",
		},
		ExpressionAttributeValues: {
			":userId": data.userid,
		},
	};
	try {
		let getData = await dynamoDb.query(params).promise();
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

export const handler = getOneAppUser;
