import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { response } from "../lib/utils";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetTemplates(event, context) {
	try {
		const data = event.queryStringParameters;
		let params = {
			TableName: process.env.OCCASION_TEMPLATES_TABLE,
			Limit: +data.limit,
			IndexName: "templateIdentifier-displayOrder-index",
			ScanIndexForward: true,
			KeyConditionExpression: "#templateIdentifier = :templateIdentifier",
			ExpressionAttributeNames: {
				"#templateIdentifier": "templateIdentifier",
			},
			ExpressionAttributeValues: {
				":templateIdentifier": "occasionTemplate",
			},
		};
		console.log("params--- --", params);

		if (data.displayOrder && +data.displayOrder > 0) {
			params = {
				...params,
				ExclusiveStartKey: {
					templateIdentifier: "occasionTemplate",
					displayOrder: +data.displayOrder,
					templateName: data.templateName,
					occasionName: data.occasionName,
				},
			};
		}
		let result = await dynamoDb.query(params).promise();
		console.log("get template result =>", result);
		let startKey = {};
		let next = false;
		//check if next value exists after evaluation key
		if (result.LastEvaluatedKey) {
			let { displayOrder, occasionName, templateName } =
				result.LastEvaluatedKey;
			startKey = {
				displayOrder,
				occasionName,
				templateName,
				templateIdentifier: "occasionTemplate",
			};
			params.Limit = 1;
			params.ExclusiveStartKey = result.LastEvaluatedKey;
			let nextResult = await dynamoDb.query(params).promise();
			if (nextResult.Items.length > 0) {
				next = true;
			}
		}
		if (result.Items.length > 0) {
			return response(200, {
				templateList: result.Items,
				next,
				startKey,
			});
		} else {
			return response(404, { templateList: [] });
		}
	} catch (error) {
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(GetTemplates);
