/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getUserId = async (mobileNo) => {
	try {
		let params = {
			TableName: process.env.USER_TABLE_NAME,
			IndexName: "pkIndex",
			ScanIndexForward: true,
			KeyConditionExpression:
				"#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: {
				":pk": mobileNo,
			},
		};

		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

