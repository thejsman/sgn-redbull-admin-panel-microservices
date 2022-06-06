import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function DeleteRozy(event, context) {
	try {
		let { sectionName, sectionLanguage } = event.body;
		if (sectionName == undefined || sectionLanguage == undefined) {
			return response(400, { message: "Bad Parameters" });
		}
		sectionName = sectionName.toLowerCase().trim();
		sectionLanguage = sectionLanguage.toLowerCase().trim();
		if (sectionName == "" || sectionLanguage == "") {
			return response(406, { message: "Not Acceptable" });
		}
		await dynamoDb
			.delete({
				TableName: process.env.SECTION_NAME_TABLE,
				Key: {
					sectionName: sectionName,
					sectionLanguage: sectionLanguage,
				},
			})
			.promise();
		return response(200, { message: "Success" });
	} catch (error) {
		console.log(error);
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(DeleteRozy);
