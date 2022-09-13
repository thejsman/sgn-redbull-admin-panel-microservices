/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getTransactionsDateWise = async (data) => {
	try {
		let params = {};

		if (data.status && data.transactionDate) {
			params = {
				TableName: process.env.TRANSACTION_TABLE_NAME,
				Limit: +data.limit,
				IndexName: "transactionDate-transactionStatus-Index",
				ScanIndexForward: true,
				KeyConditionExpression:
					"#transactionDate = :transactionDate AND #transactionStatus = :transactionStatus",
				ExpressionAttributeNames: {
					"#transactionDate": "transactionDate",
					"#transactionStatus": "transactionStatus"
					// "#displayOrder": "displayOrder"
				},
				ExpressionAttributeValues: {
					":transactionDate": data.transactionDate,
					":transactionStatus": data.status

					// ":sOrder": +data.sOrder,
					// ":eOrder": +data.eOrder
				},
			};
			if (data.transactionId) {
				params = {
					...params,
					ExclusiveStartKey: {
						transactionDate: data.transactionDate,
						transactionId: data.transactionId,
						userId: data.userId,
						transactionStatus: data.status
					},
				};
			}
		}
		else {
			params = {
				TableName: process.env.TRANSACTION_TABLE_NAME,
				Limit: +data.limit,
				IndexName: "transactionDate-transactionStatus-Index",
				ScanIndexForward: true,
				KeyConditionExpression:
					"#transactionDate = :transactionDate",
				ExpressionAttributeNames: {
					"#transactionDate": "transactionDate",
					// "#displayOrder": "displayOrder"
				},
				ExpressionAttributeValues: {
					":transactionDate": data.transactionDate

					// ":sOrder": +data.sOrder,
					// ":eOrder": +data.eOrder
				},
			};
			if (data.createdAt) {
				params = {
					...params,
					ExclusiveStartKey: {
						transactionDate: data.transactionDate,
						transactionId: data.transactionId,
						userId: data.userId,
						transactionStatus: data.status
					},
				};
			}
		}
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

export const getTransactionsByUserId = async (data) => {
	try {
		let params = {
			TableName: process.env.TRANSACTION_TABLE_NAME,
			Limit: +data.limit,
			ScanIndexForward: true,
			KeyConditionExpression:
				"#userId = :userId",
			ExpressionAttributeNames: {
				"#userId": "userId",
				// "#displayOrder": "displayOrder"
			},
			ExpressionAttributeValues: {
				":userId": data.userId,
				// ":sOrder": +data.sOrder,
				// ":eOrder": +data.eOrder
			},
		};

		if (data.transactionId) {
			params = {
				...params,
				ExclusiveStartKey: {
					transactionId: data.transactionId,
					userId: data.userId
				},

			};
		}
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

export const getTransactionsStatusWise = async (data) => {
	try {
		let params = {
			TableName: process.env.TRANSACTION_TABLE_NAME,
			Limit: +data.limit,
			IndexName: "transactionStatus-Index",
			ScanIndexForward: true,
			KeyConditionExpression:
				"#transactionStatus = :transactionStatus",
			ExpressionAttributeNames: {
				"#transactionStatus": "transactionStatus",
				// "#displayOrder": "displayOrder"
			},
			ExpressionAttributeValues: {
				":transactionStatus": data.status,
				// ":sOrder": +data.sOrder,
				// ":eOrder": +data.eOrder
			},
		};

		if (data.transactionId) {
			params = {
				...params,
				ExclusiveStartKey: {
					transactionId: data.transactionId,
					userId: data.userId,
					transactionStatus: data.status
				},

			};
		}
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

export const getTransactionsByTransactionId = async (data) => {
	console.log("pppppppppp", data);
	try {
		let params = {
			TableName: process.env.TRANSACTION_TABLE_NAME,
			IndexName: "transactionId-Index",
			KeyConditionExpression:
				"#transactionId = :transactionId",
			ExpressionAttributeNames: {
				"#transactionId": "transactionId",
				// "#displayOrder": "displayOrder"
			},
			ExpressionAttributeValues: {
				":transactionId": data.transactionId

				// ":sOrder": +data.sOrder,
				// ":eOrder": +data.eOrder
			},
		};
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};


export const updateTransaction = async (data) => {
	console.log("ddddddddddd", data);
	let params = {};
	params = {
		TableName: process.env.TRANSACTION_TABLE_NAME,
		Key: {
			userId: data.userId,
			transactionId: data.transactionId,
		},
		ReturnValues: "ALL_NEW",
	};

	params = {
		...params,
		ExpressionAttributeNames: {
			"#deliveryObject": "deliveryObject"
		},
		ExpressionAttributeValues: {
			":deliveryObject": data.deliveryObject,
		},
		UpdateExpression: "SET #deliveryObject = :deliveryObject",
	};
	// console.log("params", params);
	try {
		let updateData = await dynamodb.update(params).promise();
		return updateData;
	} catch (error) {
		throw error;
	}
};