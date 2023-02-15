import AWS from "aws-sdk";
import { setRedisItem } from "redis-middleware";
import { weekNumber } from "../lib/dateUtils";
const athena = new AWS.Athena();
const runAthena = async (event, context) => {
  try {
    const params = {
      "QueryExecutionContext": {
        "Database": "test"
      },
      "QueryString": "",
      "ResultConfiguration": {
        "OutputLocation": "s3://userloggedinactivity/"
      }
    };
    const now = new Date();
    let currDate = prevDate = currMonth = prevMonth = currWeek = prevWeek = "";
    let currDateQuery = prevDateQuery = currMonthQuery = prevMonthQuery = currWeekQuery = prevWeekQuery = {};
    //prepare query for currDate
    currDate = now.toISOString().slice(0, 10);
    currDateQuery = { ...params, QueryString: `select distinct uid, count(*) from loggedin_data where year=${currDate.slice(0, 4)} and month=${currDate.slice(5, 7)} and day=${currDate.slice(8, 10)}  group by uid` };
    //check if hour is between 0,2 then run a query on prevDate also as we are assumingafter 12AM it will run for last day also once
    if (now.getHours() > 1 && now.getHours() < 3) {
      prevDate = new Date(now.setDate(now.getDate() - 1));;
      prevDate = prevDate.toISOString().slice(0, 10);
      prevDateQuery = { ...params, QueryString: `select distinct uid, count(*) from loggedin_data where year=${prevDate.slice(0, 4)} and month=${prevDate.slice(5, 7)} and day=${prevDate.slice(8, 10)}  group by uid` };
    }
    //for current month but we will run it only once in the night between 1, 2'o clock
    now = new Date();
    if (now.getHours() > 1 && now.getHours() < 3) {
      currMonth = now.toISOString().slice(0, 7);
      currMonthQuery = { ...params, QueryString: `select distinct uid, count(*) from loggedin_data where year=${prevDate.slice(0, 4)} and month=${prevDate.slice(5, 7)}  group by uid` };
      //check if prev month is diffrent from current month
      prevMonth = new Date(now.setDate(now.getDate() - 1));;
      prevMonth = prevMonth.toISOString().slice(0, 7);
      if (currMonth != prevMonth) {
        prevMonthQuery = { ...params, QueryString: `select distinct uid, count(*) from loggedin_data where year=${prevMonth.slice(0, 4)} and month=${prevMonth.slice(5, 7)}  group by uid` };
      }
      //now same for week first update for current week
      now = new Date();
      currWeek = weekNumber(now);
      currWeekQuery = { ...params, QueryString: `select distinct uid, count(*) from loggedin_data where year=${prevMonth.slice(0, 4)} and month=${prevMonth.slice(5, 7)}  group by uid` };
    }

    //let currMonth = now.toISOString().slice(0, 7);
    //let currWeek = weekNumber(now);


    let currDateQuery = athena.startQueryExecution(params).promise();

    console.log('athenaResult---', athenaResult);
    //store this execution id in redis
    await setRedisItem(redisCurrDateKey, 7200, athenaResult.QueryExecutionId);
  } catch (error) {
    console.log("error", error);

  }
};

export const handler = runAthena;
