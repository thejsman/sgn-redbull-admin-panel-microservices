import AWS from "aws-sdk";
import commonMiddleware from "common-middleware";
import { response } from "../lib/utils";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function AddRozy(event, context) {
	try {
		let { sectionName, sectionLanguage, content } = event.body;
		if (sectionName == undefined || sectionLanguage == "" || content == "") {
			return response(400, { message: "Bad Parameters" });
		}
		sectionName = sectionName.toLowerCase().trim();
		sectionLanguage = sectionLanguage.toLowerCase().trim();
		content = content.trim();
		if (sectionName == "" || sectionLanguage == "" || content == "") {
			return response(406, { message: "Not Acceptable" });
		}
		const sectionData = {
			sectionName,
			sectionLanguage,
			content,
			active: true,
		};
		await dynamoDb
			.put({
				TableName: process.env.SECTION_NAME_TABLE,
				Item: sectionData,
			})
			.promise();

		return response(200, { message: "Success" });
	} catch (error) {
		console.log(error);
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(AddRozy);
