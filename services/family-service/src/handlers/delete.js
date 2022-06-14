import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const deleteRelationship = async (event, context) => {
	try {
		let data = event.queryStringParameters;
		const params = {
			TableName: process.env.RELATIONSHIP_TABLE_NAME,
			Key: {
				relationshipIdentifier: "relationship",
				relationshipName: data.relationshipName,
			},
		};

		try {
			let deleteTemplate = await dynamoDb.delete(params).promise();
			return responseHandler({
				statusCode: 200,
				message: "Relationship has been deleted successfully",
				data: deleteTemplate,
			});
		} catch (error) {
			return responseHandler({
				statusCode: 502,
				message: "Error occur in deleting Relationship",
				data: {},
			});
		}
	} catch (error) {
		return responseHandler({
			statusCode: 500,
			message: "Internal Server Error",
			data: {},
		});
	}
};

export const handler = deleteRelationship;
