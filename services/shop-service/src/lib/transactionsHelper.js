/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getTransactionsDateWise = async (data) => {
	try {
		let params = {
			TableName: process.env.TRANSACTION_TABLE_NAME,
			Limit: +data.limit,
			IndexName: "transactionDate-createdAt-Index",
			ScanIndexForward: true,
			KeyConditionExpression:
				"#transactionDate = :transactionDate",
			ExpressionAttributeNames: {
				"#transactionDate": "transactionDate",
				// "#displayOrder": "displayOrder"
			},
			ExpressionAttributeValues: {
				":transactionDate": data.transactionDate,
				// ":sOrder": +data.sOrder,
				// ":eOrder": +data.eOrder
			},
		};

		if (data.createdAt) {
			params = {
				...params,
				ExclusiveStartKey: {
					transactionDate: data.transactionDate,
					createdAt: data.createdAt
				},
			};
		}
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

