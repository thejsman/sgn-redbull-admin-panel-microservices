import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function deleteWaitlistedUser(event, context) {
	let { pk } = event.pathParameters;
	await dynamoDb
		.delete({
			TableName: process.env.WAITLISTEDUSERS_TABLE_NAME,
			Key: {
				pk: pk,
			},
		})
		.promise();

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "Waitlisted user deleted successfully",
		}),
	};
}
export const handler = deleteWaitlistedUser;
