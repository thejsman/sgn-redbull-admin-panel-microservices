import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function UpdateRozy(event, context) {
	try {
		let { sectionName, sectionLanguage, data } = event.body;

		if (sectionName === undefined || sectionLanguage === undefined) {
			return response(400, { message: "Bad Parameters" });
		}

		sectionName = sectionName.toLowerCase().trim();
		sectionLanguage = sectionLanguage.toLowerCase().trim();

		if (sectionName === "" || sectionLanguage === "") {
			return response(406, { message: "Not Acceptable" });
		}

		let UpdateExpression = [];
		let ExpressionAttributeValues = {};

		for (let key in data) {
			UpdateExpression.push(`${key} = :${key}`);
			ExpressionAttributeValues[`:${key}`] = data[key];
		}

		await dynamoDb
			.update({
				TableName: process.env.SECTION_NAME_TABLE,
				Key: {
					sectionName: sectionName,
					sectionLanguage: sectionLanguage,
				},
				UpdateExpression: `SET ${UpdateExpression.join(",")}`,
				ExpressionAttributeValues: ExpressionAttributeValues,
				ReturnValues: "UPDATED_NEW",
			})
			.promise();
		return response(200, { message: "Success" });
	} catch (error) {
		console.log(error);
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(UpdateRozy);
