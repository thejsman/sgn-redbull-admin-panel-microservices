import AWS from "aws-sdk";
import { setRedisItem } from "redis-middleware";
import { weekNumber, datesOfTheWeek } from "../lib/dateUtils";
const athena = new AWS.Athena();
const runAthena = async (event, context) => {
  try {
    const params = {
      QueryExecutionContext: {
        Database: "test"
      },
      QueryString: "",
      ResultConfiguration: {
        OutputLocation: "s3://userloggedinactivity/"
      }
    };
    let now = new Date();
    let currDate, prevDate, currMonth, prevMonth, currWeek, prevWeek;
    currDate = prevDate = currMonth = prevMonth = currWeek = prevWeek = "";
    let currDateQuery, prevDateQuery, currMonthQuery, prevMonthQuery, currWeekQuery, prevWeekQuery;
    currDateQuery = prevDateQuery = currMonthQuery = prevMonthQuery = currWeekQuery = prevWeekQuery = "";
    //prepare query for currDate
    currDate = now.toISOString().slice(0, 10);
    currDateQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where year=${currDate.slice(0, 4)} and month=${currDate.slice(5, 7)} and day=${currDate.slice(8, 10)} group by uid)` };
    //check if hour is between 0,2 then run a query on prevDate also as we are assumingafter 12AM it will run for last day also once
    if (now.getHours() > 1 && now.getHours() < 24) {
      prevDate = new Date(now.setDate(now.getDate() - 1));
      prevDate = prevDate.toISOString().slice(0, 10);
      prevDateQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where year=${prevDate.slice(0, 4)} and month=${prevDate.slice(5, 7)} and day=${prevDate.slice(8, 10)} group by uid)` };
    }
    //for current month but we will run it only once in the night between 1, 2'o clock
    now = new Date();
    if (now.getHours() > 1 && now.getHours() < 24) {
      currMonth = now.toISOString().slice(0, 7);
      currMonthQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where year=${prevDate.slice(0, 4)} and month=${prevDate.slice(5, 7)} group by uid)` };
      //check if prev month is diffrent from current month
      prevMonth = new Date(now.setDate(now.getDate() - 1));
      prevMonth = prevMonth.toISOString().slice(0, 7);
      if (currMonth != prevMonth) {
        prevMonthQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where year=${prevMonth.slice(0, 4)} and month=${prevMonth.slice(5, 7)} group by uid)` };
      }
      //now same for week first update for current week
      now = new Date();
      currWeek = weekNumber(now);

      currWeekQuery =
        currWeekQuery = datesOfTheWeek(currWeek.slice(0, 10)).map(cDate => {
          return `year=${cDate.slice(0, 4)} and month=${cDate.slice(5, 7)} and day=${cDate.slice(8, 10)}`;
        }).join(' or ');
      currWeekQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where ${currWeekQuery} group by uid)` };
      //check previous week
      prevWeek = weekNumber(new Date(now.setDate(now.getDate() - 1)).toISOString().slice(0, 10));
      if (currWeek != prevWeek) {
        prevWeekQuery =
          prevWeekQuery = datesOfTheWeek(prevWeek.slice(0, 10)).map(cDate => {
            return `year=${cDate.slice(0, 4)} and month=${cDate.slice(5, 7)} and day=${cDate.slice(8, 10)}`;
          }).join(' or ');
        prevWeekQuery = { ...params, QueryString: `select count(*) from (select count(*) from loggedin_data where ${prevWeekQuery} group by uid)` };

      }
    }
    console.log("currDateQuery", currDateQuery, "prevDateQuery", prevDateQuery);

    //Now execute the query to athena
    let [currDateQR, prevDateQR, currMonthQR, prevMonthQR, currWeekQR, prevWeekQR] = await Promise.all([
      currDateQuery ? athena.startQueryExecution(currDateQuery).promise() : "",
      prevDateQuery ? athena.startQueryExecution(prevDateQuery).promise() : "",
      currMonthQuery ? athena.startQueryExecution(currMonthQuery).promise() : "",
      prevMonthQuery ? athena.startQueryExecution(prevMonthQuery).promise() : "",
      currWeekQuery ? athena.startQueryExecution(currWeekQuery).promise() : "",
      prevWeekQuery ? athena.startQueryExecution(prevWeekQuery).promise() : "",
    ]);

    console.log('athenaResult---,currDateQR', currDateQR);

    console.log('athenaResult---,prevDateQR', prevDateQR);
    console.log('athenaResult---,currMonthQR', currMonthQR);
    console.log('athenaResult---,prevMonthQR', prevMonthQR);
    console.log('athenaResult---,currWeekQR', currWeekQR);
    console.log('athenaResult---,prevWeekQR', prevWeekQR);

    //Now put all Query execution ids in cache for later fecth the result
    await Promise.all([currDateQR?.QueryExecutionId ? setRedisItem(`DAUC-${currDate}`, 7200, currDateQR?.QueryExecutionId) : "",
    prevDateQR?.QueryExecutionId ? setRedisItem(`DAUC-${prevDate}`, 7200, prevDateQR?.QueryExecutionId) : "",
    currMonthQR?.QueryExecutionId ? setRedisItem(`MAUC-${currMonth}`, 7200, currMonthQR?.QueryExecutionId) : "",
    prevMonthQR?.QueryExecutionId ? setRedisItem(`MAUC-${prevMonth}`, 7200, prevMonthQR?.QueryExecutionId) : "",
    currWeekQR?.QueryExecutionId ? setRedisItem(`WAUC-${currWeek}`, 7200, currWeekQR?.QueryExecutionId) : "",
    prevWeekQR?.QueryExecutionId ? setRedisItem(`WAUC-${prevWeek}`, 7200, prevWeekQR?.QueryExecutionId) : ""]);

  } catch (error) {
    console.log("error", error);

  }
};

export const handler = runAthena;
