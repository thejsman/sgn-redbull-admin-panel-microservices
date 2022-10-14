import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { response } from "../lib/utils";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function GetPredefinedOccasions(event, context) {
	try {
		const data = event.queryStringParameters;
		let params = {
			TableName: process.env.OCCASION_ICON_TABLE,
			Limit: +data.limit,
			IndexName: "occasion_order-Index",
			ScanIndexForward: true,
			KeyConditionExpression: "#occasionIdentifier = :occasionIdentifier",
			ExpressionAttributeNames: {
				"#occasionIdentifier": "occasionIdentifier",
			},
			ExpressionAttributeValues: {
				":occasionIdentifier": "predefinedOccasion",
			},
		};

		if (data.displayOrder && +data.displayOrder > 0) {
			params = {
				...params,
				ExclusiveStartKey: {
					occasionIdentifier: "predefinedOccasion",
					displayOrder: +data.displayOrder,
					occasionName: data.occasionName,
				},
			};
		}
		let result = await dynamoDb.query(params).promise();
		let startKey = {};
		let next = false;
		//check if next value exists after evaluation key
		if (result.LastEvaluatedKey) {
			let { displayOrder, occasionName } = result.LastEvaluatedKey;
			startKey = { displayOrder, occasionName };
			params.Limit = 1;
			params.ExclusiveStartKey = result.LastEvaluatedKey;
			let nextResult = await dynamoDb.query(params).promise();
			if (nextResult.Items.length > 0) {
				next = true;
			}
		}
		if (result.Items.length > 0) {
			return response(200, {
				occasionList: result.Items,
				next,
				startKey,
			});
		} else {
			return response(404, { occasionList: [] });
		}
	} catch (error) {
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(GetPredefinedOccasions);
