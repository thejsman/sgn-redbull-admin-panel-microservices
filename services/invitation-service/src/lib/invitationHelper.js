/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/
import { sendIndiaSMS } from "./indiaSms.js";
import { sendNepalSMS } from "./nepalSms.js";
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
export const retrieveWaitlistedInfo = async (pk) => {
  let waitlistedUserInfo = await dynamodb
    .get({
      TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
      Key: { pk },
    })
    .promise();
  return waitlistedUserInfo;
};
export const updateWaitlistedUserInfo = async (data) => {
  try {
    await dynamodb
      .put({
        TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
        Item: data,
      })
      .promise();
  } catch (e) {
    console.log(e, data);
  }
};

export const radmonAlpha = (number) => {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz23456789";

	for (var i = 0; i < number; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};

export const sendSMS = async ({ dialCode, phone, invitationCode }) => {
	// invitationCode,
	try {
		const appLink = "https://bit.ly/3PJKCVM";
		const flowId = "62cec8b74b9314686017b592";
		let result;
		if (dialCode == "91") {
			result = await sendIndiaSMS(flowId, phone, {
				invitationCode,
				appLink,
			});
		} else if (dialCode == "977") {
			result = await sendNepalSMS("INVITATION_SMS", `${dialCode}${phone}`, {
				invitationCode,
				appLink,
			});
		}
		return result;
	} catch (e) {
		return { message: "could not be send", type: "failed" };
	}
};
