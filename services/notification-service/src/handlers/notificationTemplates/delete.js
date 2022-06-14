const AWS = require("aws-sdk");
const { responseHandler } = require("../../lib/response");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const deleteTemplate = async (event, context) => {
	const params = {
		TableName: process.env.NOTIFICATION_TEMPLATE_TABLE,
		Key: {
			notificationName: event.queryStringParameters.notificationName,
		},
	};

	try {
		let deleteTemplate = await dynamoDb.delete(params).promise();
		return responseHandler({
			statusCode: 200,
			message: "Template has been deleted successfully",
			data: deleteTemplate,
		});
	} catch (error) {
		return responseHandler({
			statusCode: 501,
			message: "Error occur in deleting template",
			data: {},
		});
	}
};

export const handler = deleteTemplate;
