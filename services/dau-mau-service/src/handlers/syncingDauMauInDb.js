import { getRedisItem } from "redis-middleware";
//import { updateUserLoggedInActivityStats } from "../lib/utils";
import { weekNumber } from "../lib/dateUtils";
import AWS from "aws-sdk";
const athena = new AWS.Athena();

const syncingDauMauInDb = async (event, context) => {
  try {
    //get today date and also previous date and extract the data from redis and store in dynmo
    const redisPrefixForDau = 'DAUC';
    const redisPrefixForMau = 'MAUC';
    const redisPrefixForWau = 'WAUC';
    const now = new Date();
    let currDate = now.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);
    let yesterday = new Date(now.setDate(now.getDate() - 1));
    let prevDate = yesterday.toISOString().slice(0, 10);
    let prevMonth = yesterday.toISOString().slice(0, 7);
    let currWeek = weekNumber(currDate);
    let prevWeek = weekNumber(yesterday);
    let rcks = []; //cache keys to be removed


    //Now extract the infofrom redis for these 4 parameters
    let [currDateQID, prevDateQID, currMonthQID, prevMonthQID, currWeekQID, prevWeekQID] = await Promise.all([getRedisItem(`${redisPrefixForDau}-${currDate}`), getRedisItem(`${redisPrefixForDau}-${prevDate}`), getRedisItem(`${redisPrefixForMau}-${currMonth}`), getRedisItem(`${redisPrefixForMau}-${prevMonth}`), getRedisItem(`${redisPrefixForWau}-${currWeek}`), getRedisItem(`${redisPrefixForWau}-${prevWeek}`)]);
    currDateQID = currDateQID.Payload ? JSON.parse(JSON.parse(currDateQID.Payload)) : '';
    prevDateQID = prevDateQID.Payload ? JSON.parse(JSON.parse(prevDateQID.Payload)) : '';
    currMonthQID = currMonthQID.Payload ? JSON.parse(JSON.parse(currMonthQID.Payload)) : '';
    prevMonthQID = prevMonthQID.Payload ? JSON.parse(JSON.parse(prevMonthQID.Payload)) : '';
    currWeekQID = currWeekQID.Payload ? JSON.parse(JSON.parse(currWeekQID.Payload)) : '';
    prevWeekQID = prevWeekQID.Payload ? JSON.parse(JSON.parse(prevWeekQID.Payload)) : '';
    prevDateQID = "8a9248e9-3503-462b-a576-a308b3263e2d";
    console.log('prevDateQID', currDateQID ? 3 : 4, prevDateQID ? 1 : 2, currMonthQID, prevMonthQID, currWeekQID, prevWeekQID);
    let [currDateAR, prevDateAR, currMonthAR, prevMonthAR, currWeekAR, prevWeekAR] = await Promise.all([
      currDateQID ? athena.getQueryResults({ QueryExecutionId: currDateQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, currDateQID] : [...rcks]; }) : "",
      prevDateQID ? athena.getQueryResults({ QueryExecutionId: prevDateQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, prevDateQID] : [...rcks]; }) : "",
      currMonthQID ? athena.getQueryResults({ QueryExecutionId: currMonthQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, currMonthQID] : [...rcks]; }) : "",
      prevMonthQID ? athena.getQueryResults({ QueryExecutionId: prevMonthQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, prevMonthQID] : [...rcks]; }) : "",
      currWeekQID ? athena.getQueryResults({ QueryExecutionId: currWeekQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, currWeekQID] : [...rcks]; }) : "",
      prevWeekQID ? athena.getQueryResults({ QueryExecutionId: prevWeekQID }).promise().catch(e => { rcks = e.message.includes('FAILED') ? [...rcks, prevWeekQID] : [...rcks]; }) : "",
    ]);
    currDateAR = currDateAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevDateAR = prevDateAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    currMonthAR = currMonthAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevMonthAR = prevMonthAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    currWeekAR = currWeekAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevWeekAR = prevWeekAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    console.log('currDateAR', currDateAR);
    console.log('prevDateAR', prevDateAR);
    console.log('currMonthQID', currMonthAR);
    console.log('prevMonthQID', prevMonthAR);
    console.log('currWeekQID', currWeekAR);
    console.log('prevWeekQID', prevWeekAR);
    //first extract the data from database
    // await updateUserLoggedInActivityStats({ currDate, currMonth, prevDate, prevMonth, currDateCount: currDateData && currDateData.length > 0 ? currDateData.length : 0, currMonthCount: currMonthData && currMonthData.length > 0 ? currMonthData.length : 0, prevDateCount: prevDateData && prevDateData.length > 0 ? prevDateData.length : 0, prevMonthCount: prevMonthData && prevMonthData.length ? prevMonthData.length : 0, currWeek, prevWeek, currWeekCount: currWeekData && currWeekData.length ? currWeekData.length : 0, prevWeekCount: prevWeekData && prevWeekData.length ? prevWeekData.length : 0 });
  } catch (error) {
    console.log("error", error);
  }
};

export const handler = syncingDauMauInDb;
