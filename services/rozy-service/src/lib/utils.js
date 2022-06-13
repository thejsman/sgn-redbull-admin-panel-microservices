import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function response(statusCode, data) {
	return {
		statusCode,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
		},
		body: JSON.stringify(data),
	};
}

export const getOnboardingData = async (sectionNames, sectionLanguage) => {
	let responseObj = [];
	// const promises = [];
	console.log({ sectionNames });
	return new Promise(async (resolve, reject) => {
		try {
			for (const sectionName of sectionNames) {
				const params = {
					TableName: process.env.SECTION_NAME_TABLE,
					KeyConditionExpression:
						"sectionName = :sectionName and sectionLanguage = :sectionLanguage",
					FilterExpression: "active = :active",
					ExpressionAttributeValues: {
						":sectionName": sectionName,
						":sectionLanguage": sectionLanguage,
						":active": true,
					},
				};
				let result = await dynamoDb.query(params).promise();

				if (result.Items.length > 0) {
					responseObj.push({
						sectionName: result.Items[0].sectionName,
						sectionLanguage: result.Items[0].sectionLanguage,
						content: result.Items[0].content,
					});
				}
			}
			resolve(responseObj);
		} catch (error) {
			console.log("error: ", error);
			reject(error);
		}
	});
};

// return new Promise(async (resolve, reject) => {
// 	// not taking our time to do the job
// 	resolve(123); // immediately give the result: 123
// });

// const params = {
// 	TableName: process.env.SECTION_NAME_TABLE,
// 	KeyConditionExpression:
// 		"sectionName = :sectionName and sectionLanguage = :sectionLanguage",
// 	FilterExpression: "active = :active",
// 	ExpressionAttributeValues: {
// 		":sectionName": sectionName,
// 		":sectionLanguage": sectionLanguage,
// 		":active": true,
// 	},
// };
// 		let result = await dynamoDb.query(params).promise();
// 		if (result.Items.length > 0) {
// 			responseObj.section = {
// 				sectionName: result.Items[0].sectionName,
// 				sectionLanguage: result.Items[0].sectionLanguage,
// 				content: result.Items[0].content,
// 			};
// }
