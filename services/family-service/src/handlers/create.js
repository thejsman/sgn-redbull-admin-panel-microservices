/*eslint new-cap: ["error", { "newIsCap": false }]*/

import AWS from "aws-sdk";
import { responseHandler } from "../lib/response";

var s3 = new AWS.S3({
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY,
	region: process.env.REGION,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const createRelationship = async (event, context) => {
	try {
		const timestamp = new Date().getTime();
		const data = JSON.parse(event.body);

		const params = {
			TableName: process.env.RELATIONSHIP_TABLE_NAME,
			Item: {
				relationshipIdentifier: data.relationshipIdentifier,
				relationshipName: data.relationshipName,
				displayOrder: +data.displayOrder,
				displayName: data.displayName,
				createdAt: timestamp,
				updatedAt: timestamp,
			},
		};

		if (data.base64) {
			const type = data.base64.split(";")[0].split("/")[1];
			const base64Data = new Buffer.from(
				data.base64.replace(/^data:image\/\w+;base64,/, ""),
				"base64"
			);

			var s3Params = {
				Bucket: process.env.S3_BUCKET_NAME,
				Key: data.fileName,
				Body: base64Data,
				ContentEncoding: "base64",
				ContentType: type,
				ACL: "public-read",
			};
			try {
				let data = await s3.upload(s3Params).promise();
				params.Item = { ...params.Item, icon: data.Location };
				console.log(params, "ffffff", data);
			} catch (error) {
				console.log("erorr", error);
				return responseHandler({
					statusCode: 500,
					message: "Error in Image Uploading",
					data: {},
				});
			}
		}

		try {
			await dynamoDb.put(params).promise();
			let response = responseHandler({
				statusCode: 200,
				message: "Data Saved",
				data: {},
			});
			return response;
		} catch (error) {
			console.log("error", error);
			return responseHandler({
				statusCode: 502,
				message: "Error Occur",
				data: {},
			});
		}
	} catch (error) {
		return responseHandler({
			statusCode: 500,
			message: "Internal Server Error",
			data: {},
		});
	}
};

export const handler = createRelationship;
