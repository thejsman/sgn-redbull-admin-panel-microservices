import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const updateUserLoggedInActivityStats = async (payload) => {
    //waitlistedUser registration date, fetching it from payload
    let { currDate, currMonth, prevDate, prevMonth, currDateCount, currMonthCount, prevDateCount, prevMonthCount, currWeek, prevWeek, currWeekCount, prevWeekCount } = payload;
    let prevMonthCountQuery = '';
    let currMonthCountQuery = '';
    let prevWeekCountQuery = '';
    let currWeekCountQuery = '';
    currMonthCountQuery = prepareUserLoggedInActivityStatsFetchQuery(currMonth, "allCounts");
    currWeekCountQuery = prepareUserLoggedInActivityStatsFetchQuery(currWeek, "allCounts");

    if (currMonth !== prevMonth) {
        prevMonthCountQuery = prepareUserLoggedInActivityStatsFetchQuery(prevMonth, "allCounts");
    }
    if (currWeek !== prevWeek) {
        prevWeekCountQuery = prepareUserLoggedInActivityStatsFetchQuery(prevWeek, "allCounts");
    }
    try {
        let currMonthData = dynamoDb.query(currMonthCountQuery).promise();
        let currWeekData = dynamoDb.query(currWeekCountQuery).promise();
        let prevMonthData = ((currMonth !== prevMonth) && prevMonthCount) ? dynamoDb.query(prevMonthCountQuery).promise() : '';
        let prevWeekData = ((currWeek !== prevWeek) && prevWeekCount) ? dynamoDb.query(prevWeekCountQuery).promise() : '';
        [currMonthData, prevMonthData] =
            await Promise.all([currMonthData, prevMonthData]);
        [currWeekData, prevWeekData] =
            await Promise.all([currWeekData, prevWeekData]);
        //extract the data object for current months
        currMonthData = currMonthData.Items.length
            ? currMonthData.Items[0]["countInfo"]
            : {};
        prevMonthData = prevMonthData && prevMonthData.Items.length ? prevMonthData.Items[0]["countInfo"]
            : {};
        currWeekData = currWeekData.Items.length
            ? currWeekData.Items[0]["countInfo"]
            : 0;
        prevWeekData = prevWeekData && prevWeekData.Items.length ? prevWeekData.Items[0]["countInfo"]
            : 0;
        //check if current date is available in data then update count by 1 if current date is not there then add data for curdate
        currMonthData = (currDateCount > 0 && !currMonthData[currDate]) || (currDateCount > 0 && currMonthData[currDate] && (currMonthData[currDate]["count"] < currDateCount)) ? { ...currMonthData, [currDate]: { "date": currDate, "count": currDateCount } } : { ...currMonthData };
        currMonthData = (currMonth == prevMonth) && (!currMonthData[prevDate] && prevDateCount > 0 || currMonthData[prevDate] && (prevDateCount > currMonthData[prevDate]["count"])) ? { ...currMonthData, [prevDate]: { "date": prevDate, "count": prevDateCount } } : { ...currMonthData };
        currMonthData = !currMonthData["count"] && currMonthCount > 0 || currMonthCount > currMonthData["count"] ? { ...currMonthData, "count": currMonthCount } : { ...currMonthData };
        prevMonthData = (currMonth != prevMonth) && (!prevMonthData[prevDate] && prevDateCount > 0 || prevMonthData[prevDate] && prevDateCount > prevMonthData[prevDate]["count"]) ? { ...prevMonthData, [prevDate]: { "date": prevDate, "count": prevDateCount } } : { ...prevMonthData };
        prevMonthData = (currMonth != prevMonth) && (!prevMonthData["count"] && prevMonthCount > 0 || prevMonthData["count"] && prevMonthCount > prevMonthData["count"]) ? { ...prevMonthData, "count": prevMonthCount } : { ...prevMonthData };
        currWeekData = !currWeekData && currWeekCount > 0 || currWeekCount > currWeekData ? currWeekCount : currWeekData;
        prevWeekData = (currWeek != prevWeek) && (!prevWeekData && prevWeekCount > 0 || prevWeekData && prevWeekCount > prevWeekData) ? prevWeekCount : prevWeekData;

        //Now update the data into DynamoDB
        //Now update the occasion data for perticular month & date
        currMonthCountQuery = currDateCount > 0 || currMonthCount > 0 ? prepareUserActivityLoggedInStatsUpdateQuery(
            currMonth,
            "allCounts",
            currMonthData
        ) : '';
        prevMonthCountQuery = prevMonthCount > 0 || ((prevMonth != currMonth) && prevDateCount > 0) ? prepareUserActivityLoggedInStatsUpdateQuery(
            prevMonth,
            "allCounts",
            prevMonthData
        ) : '';

        currWeekCountQuery = currWeekCount > 0 || currWeekCount > 0 ? prepareUserActivityLoggedInStatsUpdateQuery(
            currWeek,
            "allCounts",
            currWeekData
        ) : '';
        prevWeekCountQuery = prevWeekCount > 0 || ((currWeek != prevWeek) && prevWeekCount > 0) ? prepareUserActivityLoggedInStatsUpdateQuery(
            prevWeek,
            "allCounts",
            prevWeekData
        ) : '';

        let currMonthCountQueryStatus = currMonthCountQuery ? dynamoDb.update(currMonthCountQuery).promise() : '';
        let prevMonthCountQueryStatus = prevMonthCountQuery ? dynamoDb.update(prevMonthCountQuery).promise() : '';
        let currWeekCountQueryStatus = currWeekCountQuery ? dynamoDb.update(currWeekCountQuery).promise() : '';
        let prevWeekCountQueryStatus = prevWeekCountQuery ? dynamoDb.update(prevWeekCountQuery).promise() : '';

        let updatedData = await Promise.all([
            currMonthCountQueryStatus,
            prevMonthCountQueryStatus,
            currWeekCountQueryStatus,
            prevWeekCountQueryStatus
        ]);

        return updatedData;
    } catch (error) {
        console.log("Exception in user activity syncing DAU & MSAU", error);
    }
};

const prepareUserLoggedInActivityStatsFetchQuery = (pk, sk) => {
    return {
        TableName: process.env.USERS_LOGGED_IN_ACTIVITY_STATS_TABLE,
        KeyConditionExpression: "pk = :pk and #type=:type",
        ExpressionAttributeNames: {
            "#type": "type",
        },
        ExpressionAttributeValues: {
            ":pk": `${pk}`,
            ":type": `${sk}`,
        },
        ProjectionExpression: "countInfo",
    };
};

const prepareUserActivityLoggedInStatsUpdateQuery = (pk, sk, data) => {
    const updateExpression = generateUpdateQuery({ countInfo: data });
    return {
        TableName: process.env.USERS_LOGGED_IN_ACTIVITY_STATS_TABLE,
        Key: { pk, type: sk },
        ...updateExpression,
        ReturnValues: "NONE",
    };
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