import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getOneRelationship = async (event, context) => {
	const data = event.queryStringParameters;
	let params = {
		TableName: process.env.RELATIONSHIP_TABLE_NAME,
		KeyConditionExpression:
			"#relationshipIdentifier = :relationshipIdentifier AND relationshipName =:relationshipName",
		ExpressionAttributeNames: {
			"#relationshipIdentifier": "relationshipIdentifier",
		},
		ExpressionAttributeValues: {
			":relationshipIdentifier": "relationship",
			":relationshipName": data.relationshipName,
		},
	};
	try {
		let getData = await dynamoDb.query(params).promise();
		console.log("getDatagetData", getData);
		let responseData = responseHandler({
			statusCode: 200,
			message: "Relationship Info",
			data: getData,
		});
		console.log("responseData", responseData);
		return responseData;
	} catch (error) {
		console.log("error", error);
		let responseData = responseHandler({
			statusCode: 502,
			message: "Error in Getting Relationship Info",
			data: {},
		});
		console.log("responseData", responseData);
		return responseData;
	}
};

export const handler = getOneRelationship;
