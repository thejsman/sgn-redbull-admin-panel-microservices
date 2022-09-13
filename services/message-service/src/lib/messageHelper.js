/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";
const sqs = new AWS.SQS();
import axios from "axios";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const saveMessage = async (message) => {
	const timestamp = new Date().getTime();
	const params = {
		...message,
		createdAt: timestamp,
	};
	await dynamodb
		.put({
			TableName: process.env.MESSAGE_TABLE_NAME,
			Item: params,
		})
		.promise();
};

export const getUsers = async (params = {}, data = []) => {
	let getFilterUsers = await getUsersByCountryCodeAndCreatedDate(params);
	console.log("getFilterUsers", getFilterUsers);
	if (data && data.length) {
		data = [...data, ...getFilterUsers.Items];
	}
	else {
		data = getFilterUsers.Items;
	}
	if (getFilterUsers.LastEvaluatedKey && getFilterUsers.LastEvaluatedKey.userId) {
		let paginationParams = {
			...params,
			userId: getFilterUsers.LastEvaluatedKey.userId,
			countryCode: getFilterUsers.LastEvaluatedKey.countryCode,
			createdDate: getFilterUsers.LastEvaluatedKey.createdDate,
		};
		return getUsers(paginationParams, data);
	}
	else {
		console.log("dataaa", data.length);
		return data;
	}
};

const getUsersByCountryCodeAndCreatedDate = async (data) => {
	console.log("dataaaaaa", data);
	let params = {
		TableName: process.env.USER_TABLE_NAME,
		IndexName: "countryCode_createdDate-Index",
		KeyConditionExpression: "#countryCode = :countryCode and #createdDate >= :createdDate",
		ExpressionAttributeNames: {
			"#countryCode": "countryCode",
			"#createdDate": "createdDate",
		},
		ExpressionAttributeValues: {
			":countryCode": data.countryCode,
			":createdDate": data.createdDate,
		},
	};
	if (data.userId) {
		params = {
			...params,
			ExclusiveStartKey: {
				userId: data.userId,
				countryCode: data.countryCode,
				createdDate: data.createdDate
			},
		};
	}
	console.log("query", params);
	try {
		return await dynamodb.query(params).promise();
	} catch (error) {
		console.log("error", error);
		throw error;
	}
};


export const putSendMessageOnSQS = async (payload) => {
	return new Promise(async (resolve, reject) => {
		try {
			await sqs
				.sendMessage({
					QueueUrl: process.env.MESSAGE_SEND_QUEUE,
					MessageBody: JSON.stringify(payload),
				})
				.promise();
			resolve("success");
		} catch (error) {
			console.log("Error in updateConnectionData", error);
			reject(error);
		}
	});
};

export const sendMessageViaAakash = async (to, text) => {
	return new Promise(async (resolve, reject) => {
		const data = JSON.stringify({
			auth_token:
				"59a75236fc4c2829c651ea552976ef4f47ceb185fcb943458de2a498eae89698",
			to,
			text,
		});
		const otpUrl = `https://sms.aakashsms.com/sms/v3/send`;
		const config = {
			method: "post",
			url: otpUrl,
			headers: {
				"Content-Type": "application/json",
			},
			data,
		};

		axios(config)
			.then(function (response) {
				console.log("NEPAL SMS send via Aakash", to, text);
				resolve(response.data);
			})
			.catch(function (error) {
				console.log(error);
				reject(error);
			});
	});
};


export const sendIndiaSMS = async (mobiles, payload) => {
	return new Promise(async (resolve, reject) => {
		var data = JSON.stringify({
			sender: "SAGOON",
			flow_id:"62cec8b74b9314686017b592",
			mobiles,
			...payload,
		});

		// console.log("Data in sendIndiaSMS: ", { data });
		var config = {
			method: "post",
			url: "https://api.msg91.com/api/v5/flow/",
			headers: {
				authkey: "280897A5ccbqio5d2840c4",
				"content-type": "application/json",
			},
			data: data,
		};
		axios(config)
			.then(function (response) {
				console.log({ mobiles, payload });
				resolve(response.data);
			})
			.catch(function (error) {
				console.log(error);
				// reject(error);
			});
	});
};
