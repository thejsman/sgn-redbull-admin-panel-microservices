import AWS from "aws-sdk";
import commonMiddleware from "common-middleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function ListRozy(event, context) {
	try {
		const params = {
			TableName: process.env.SECTION_NAME_TABLE,
		};

		let result = await dynamoDb.scan(params).promise();
		if (result.Items.length > 0) {
			return response(200, { message: JSON.stringify(result.Items) });
		} else {
			return response(404, { message: [] });
		}
	} catch (error) {
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(ListRozy);
