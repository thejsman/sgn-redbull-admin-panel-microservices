import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getPendingVouchers = async () => {
	var d1 = new Date();
	var d2 = new Date(d1);
	d2.setMinutes(d1.getMinutes() - 5);

	const params = {
		TableName: process.env.VOUCHER_TABLE_NAME,
		IndexName: "updatedDate_updatedAt-Index",
		KeyConditionExpression:
			"#updatedDate = :updatedDate and #updatedAt < :updatedAt",
		FilterExpression: "#status=:status",
		ExpressionAttributeNames: {
			"#updatedDate": "updatedDate",
			"#updatedAt": "updatedAt",
			"#status": "status",
		},
		ExpressionAttributeValues: {
			":updatedDate": d1.toISOString().slice(0, 10),
			":updatedAt": d2.toISOString(),
			":status": "PENDING",
		},
		ProjectionExpression: "pk, couponVoucherId",
	};

	console.log({ params });

	try {
		const result = await dynamodb.query(params).promise();
		console.log({ result });
		return result.Items;
	} catch (error) {
		console.log("Exception in getPendingVouchers", error);
	}
};

export const updatePendingVouchers = async (vouchers) => {
	let updatePromises = [];
	for (const voucher of vouchers) {
		const params = {
			TableName: process.env.VOUCHER_TABLE_NAME,
			Key: {
				pk: voucher.pk,
				couponVoucherId: voucher.couponVoucherId,
			},
			UpdateExpression: "SET #status = :status",
			ExpressionAttributeNames: {
				"#status": "status",
			},
			ExpressionAttributeValues: {
				":status": "FREE",
			},
			ReturnValues: "NONE",
		};
		console.log(params);
		updatePromises.push(dynamodb.update(params).promise());
	}
	console.log("Check all promises: ", updatePromises);

	try {
		await Promise.all(updatePromises);
	} catch (error) {
		console.log("Exception in updatePendingVouchers", error);
	}
};

export const generateUpdateQuery = (fields) => {
	let exp = {
		UpdateExpression: "set",
		ExpressionAttributeNames: {},
		ExpressionAttributeValues: {},
	};
	Object.entries(fields).forEach(([key, item]) => {
		exp.UpdateExpression += ` #${key} = :${key},`;
		exp.ExpressionAttributeNames[`#${key}`] = key;
		exp.ExpressionAttributeValues[`:${key}`] = item;
	});
	exp.UpdateExpression = exp.UpdateExpression.replace(/(^,)|(,$)/g, "");
	return exp;
};
