/*eslint no-mixed-spaces-and-tabs: ["error", "smart-tabs"]*/
import AWS from "aws-sdk";
import moment from "moment";
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getStatsCount = async (statsParms) => {
	let result;
	let lastWeekData;
	if (statsParms.month) {
		result = getMonthData(statsParms);
		lastWeekData = last8days();
		return Promise.all([result, lastWeekData])
			.then(function (result) {
				return { lastWeek: result[1], month: result[0] };

			});
	}
	else if (statsParms.week) {
		result = getWeektData(statsParms);
		lastWeekData = last8days();
		return Promise.all([result, lastWeekData])
			.then(function (result) {
				return { lastWeek: result[1], week: result[0] };

			});
	}
	else if (statsParms.date) {
		result = getDateData(statsParms);
		lastWeekData = last8days();
		return Promise.all([result, lastWeekData])
			.then(function (result) {
				return { lastWeek: result[1], date: result[0] };
			});
	}

};


async function getMonthData(statsParams, arrayData = []) {
	let params = {
		TableName: process.env.CONNECTION_STATS_TABLE_NAME,
		IndexName: "createdMonth-createdAt-Index",
		KeyConditionExpression:
			"#createdMonth = :createdMonth",
		ExpressionAttributeNames: {
			"#createdMonth": "createdMonth"
		},
		ExpressionAttributeValues: {
			":createdMonth": statsParams.month
		},
	};
	if (statsParams.Id) {
		params = {
			...params,
			ExclusiveStartKey: {
				Id: statsParams.Id,
				createdMonth: statsParams.createdMonth,
				createdAt: statsParams.createdAt
			},
		};
	}
	let result = await dynamodb.query(params).promise();
	if (result.LastEvaluatedKey) {
		arrayData = [...arrayData, ...result.Items];
		let paginationParams = {
			...statsParams,
			Id: result.LastEvaluatedKey.Id,
			createdMonth: result.LastEvaluatedKey.createdMonth,
			createdAt: result.LastEvaluatedKey.createdAt
		};
		return getMonthData(paginationParams, arrayData);
	}
	else {
		arrayData = [...arrayData, ...result.Items];
		return calculateStats(arrayData);
	}
}

async function getWeektData(statsParams, arrayData = []) {
	let params = {
		TableName: process.env.CONNECTION_STATS_TABLE_NAME,
		IndexName: "weekNumber-createdAt-Index",
		KeyConditionExpression:
			"#weekNumber = :weekNumber",
		ExpressionAttributeNames: {
			"#weekNumber": "weekNumber"
		},
		ExpressionAttributeValues: {
			":weekNumber": +statsParams.week
		},
	};
	if (statsParams.Id) {
		params = {
			...params,
			ExclusiveStartKey: {
				Id: statsParams.Id,
				weekNumber: statsParams.weekNumber,
				createdAt: statsParams.createdAt
			},
		};
	}
	let result = await dynamodb.query(params).promise();
	if (result.LastEvaluatedKey) {
		arrayData = [...arrayData, ...result.Items];
		let paginationParams = {
			...statsParams,
			Id: result.LastEvaluatedKey.Id,
			weekNumber: result.LastEvaluatedKey.weekNumber,
			createdAt: result.LastEvaluatedKey.createdAt
		};
		return getWeektData(paginationParams, arrayData);
	}
	else {
		arrayData = [...arrayData, ...result.Items];
		return calculateStats(arrayData);
	}
}

async function getDateData(statsParams, arrayData = []) {
	let params = {
		TableName: process.env.CONNECTION_STATS_TABLE_NAME,
		IndexName: "createdDate-createdAt-Index",
		KeyConditionExpression:
			"#createdDate = :createdDate",
		ExpressionAttributeNames: {
			"#createdDate": "createdDate"
		},
		ExpressionAttributeValues: {
			":createdDate": statsParams.date
		},
	};
	if (statsParams.Id) {
		params = {
			...params,
			ExclusiveStartKey: {
				Id: statsParams.Id,
				createdDate: statsParams.createdDate,
				createdAt: statsParams.createdAt
			},
		};
	}
	let result = await dynamodb.query(params).promise();
	if (result.LastEvaluatedKey) {
		arrayData = [...arrayData, ...result.Items];
		let paginationParams = {
			...statsParams,
			Id: result.LastEvaluatedKey.Id,
			createdDate: result.LastEvaluatedKey.createdDate,
			createdAt: result.LastEvaluatedKey.createdAt
		};
		return getDateData(paginationParams, arrayData);
	}
	else {
		arrayData = [...arrayData, ...result.Items];
		return calculateStats(arrayData);
	}
}


function last8days() {
	let date1 = moment().subtract(7, 'days').format("YYYY-MM-DD");
	let date2 = moment().subtract(6, 'days').format("YYYY-MM-DD");
	let date3 = moment().subtract(5, 'days').format("YYYY-MM-DD");
	let date4 = moment().subtract(4, 'days').format("YYYY-MM-DD");
	let date5 = moment().subtract(3, 'days').format("YYYY-MM-DD");
	let date6 = moment().subtract(2, 'days').format("YYYY-MM-DD");
	let date7 = moment().subtract(1, 'days').format("YYYY-MM-DD");
	let date8 = moment().format("YYYY-MM-DD");

	let date1Data = getDateData({ date: date1 });
	let date2Data = getDateData({ date: date2 });
	let date3Data = getDateData({ date: date3 });
	let date4Data = getDateData({ date: date4 });
	let date5Data = getDateData({ date: date5 });
	let date6Data = getDateData({ date: date6 });
	let date7Data = getDateData({ date: date7 });
	let date8Data = getDateData({ date: date8 });
	return Promise.all([date1Data, date2Data, date3Data, date4Data, date5Data, date6Data, date7Data, date8Data])
		.then(function (result) {
			let last8Days = {
				[moment().subtract(7, 'days').format("YYYY-MM-DD")]: result[0],
				[moment().subtract(6, 'days').format("YYYY-MM-DD")]: result[1],
				[moment().subtract(5, 'days').format("YYYY-MM-DD")]: result[2],
				[moment().subtract(4, 'days').format("YYYY-MM-DD")]: result[3],
				[moment().subtract(3, 'days').format("YYYY-MM-DD")]: result[4],
				[moment().subtract(2, 'days').format("YYYY-MM-DD")]: result[5],
				[moment().subtract(1, 'days').format("YYYY-MM-DD")]: result[6],
				[moment().format("YYYY-MM-DD")]: result[7],
			};
			return last8Days;
		});

}


function calculateStats(result) {
	let obj = {
		sent: 0,
		initiative: 0,
		accept: 0,
		expire: 0,
		delete: 0,
		reject: 0,
		total: result.length
	};

	for (let i = 0; i < result.length; i++) {
		obj[result[i].status] += 1;
	}
	return obj;
}