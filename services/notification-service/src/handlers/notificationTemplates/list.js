// 'use strict'

const AWS = require("aws-sdk");
const { responseHandler } = require("../../lib/response");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const listTemplate = async (event, context) => {
	const data = event.queryStringParameters;

	let params = {
		TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
		Limit: +data.limit,
	};

	if (data.LastEvaluatedKey !== "null") {
		params = {
			...params,
			ExclusiveStartKey: {
				notificationName: data.LastEvaluatedKey,
			},
		};
	}

	try {
		let getData = await dynamoDb.scan(params).promise();
		let responseData = responseHandler({
			statusCode: 200,
			message: "Template List",
			data: getData,
		});

		return responseData;
	} catch (error) {
		console.log("errorerror", error);
		let responseData = responseHandler({
			statusCode: 501,
			message: "Couldn't create the todo item.",
			data: {},
		});

		return responseData;
	}
};

export const handler = listTemplate;
