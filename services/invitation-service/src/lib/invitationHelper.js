/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/

import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const saveInvitation = async (invitation) => {
	const now = new Date();
	const params = {
		...invitation,
		createdAt: now.toISOString(),
	};
	await dynamodb
		.put({
			TableName: process.env.INVITATION_TABLE_NAME,
			Item: params,
		})
		.promise();
};

export const radmonAlpha = (number) => {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz23456789";

	for (var i = 0; i < number; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};
