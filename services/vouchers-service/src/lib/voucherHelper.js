/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const createVoucher = async (voucher) => {
	const timestamp = new Date().getTime();
	const params = {
		...voucher,
		createdAt: timestamp,
	};
	await dynamodb
		.put({
			TableName: process.env.VOUCHER_TABLE_NAME,
			Item: params,
		})
		.promise();
};

export const voucherList = async (data) => {
	let params = {
		TableName: process.env.VOUCHER_TABLE_NAME,
		Limit: +data.limit,
	};
	if (data.pk !== "null") {
		params = {
			...params,
			ExclusiveStartKey: {
				pk: data.pk,
				couponVoucherId: data.couponVoucherId,
			},
		};
	}

	try {
		return await dynamodb.scan(params).promise();
	} catch (error) {
		console.log("error", error);
		throw error;
	}
};

export const getSingleVoucher = async (data) => {
	console.log("data", data);
	let params = {
		TableName: process.env.VOUCHER_TABLE_NAME,
		IndexName: "productName-Index",
		Limit: +data.limit,
		KeyConditionExpression: "#productName=:productName",
		ExpressionAttributeNames: {
			"#productName": "productName",
		},
		ExpressionAttributeValues: {
			":productName": data.productName,
		},
	};
	if (data.pk !== "null") {
		params = {
			...params,
			ExclusiveStartKey: {
				pk: data.pk,
				couponVoucherId: data.couponVoucherId,
				productName: data.productName,
			},
		};
	}
	try {
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};

export const getVoucherByVoucherId = async (data) => {
	console.log("data", data);
	let params = {
		TableName: process.env.VOUCHER_TABLE_NAME,
		IndexName: "couponVoucherId-Index",
		KeyConditionExpression: "#couponVoucherId = :couponVoucherId",
		ExpressionAttributeNames: {
			"#couponVoucherId": "couponVoucherId",
		},
		ExpressionAttributeValues: {
			":couponVoucherId": data.couponVoucherId,
		},
	};
	try {
		return await dynamodb.query(params).promise();
	} catch (error) {
		throw error;
	}
};
