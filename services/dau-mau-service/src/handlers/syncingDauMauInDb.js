import { getRedisSet } from "redis-middleware";
import { updateUserLoggedInActivityStats } from "../lib/utils";
import { weekNumber } from "../lib/dateUtils";
const syncingDauMauInDb = async (event, context) => {
  try {
    //get today date and also previous date and extract the data from redis and store in dynmo
    const redisPrefixForDau = 'DAU';
    const redisPrefixForMau = 'MAU';
    const redisPrefixForWau = 'WAU';
    const now = new Date();
    let currDate = now.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);
    let yesterday = new Date(now.setDate(now.getDate() - 1));
    let prevDate = yesterday.toISOString().slice(0, 10);
    let prevMonth = yesterday.toISOString().slice(0, 7);
    let currWeek = weekNumber(currDate);
    let prevWeek = weekNumber(yesterday);


    //Now extract the infofrom redis for these 4 parameters
    let [currDateData, prevDateData, currMonthData, prevMonthData, currWeekData, prevWeekData] = await Promise.all([getRedisSet(`${redisPrefixForDau}-${currDate}`), getRedisSet(`${redisPrefixForDau}-${prevDate}`), getRedisSet(`${redisPrefixForMau}-${currMonth}`), (currMonth != prevMonth) ? getRedisSet(`${redisPrefixForMau}-${prevMonth}`) : '', getRedisSet(`${redisPrefixForWau}-${currWeek}`), (currWeek != prevWeek) ? getRedisSet(`${redisPrefixForWau}-${prevWeek}`) : '']);
    currDateData = currDateData.Payload ? JSON.parse(JSON.parse(currDateData.Payload)) : '';
    prevDateData = prevDateData.Payload ? JSON.parse(JSON.parse(prevDateData.Payload)) : '';
    currMonthData = currMonthData.Payload ? JSON.parse(JSON.parse(currMonthData.Payload)) : '';
    prevMonthData = prevMonthData.Payload ? JSON.parse(JSON.parse(prevMonthData.Payload)) : '';
    currWeekData = currWeekData.Payload ? JSON.parse(JSON.parse(currWeekData.Payload)) : '';
    prevWeekData = prevWeekData.Payload ? JSON.parse(JSON.parse(prevWeekData.Payload)) : '';

    //first extract the data from database
    await updateUserLoggedInActivityStats({ currDate, currMonth, prevDate, prevMonth, currDateCount: currDateData && currDateData.length > 0 ? currDateData.length : 0, currMonthCount: currMonthData && currMonthData.length > 0 ? currMonthData.length : 0, prevDateCount: prevDateData && prevDateData.length > 0 ? prevDateData.length : 0, prevMonthCount: prevMonthData && prevMonthData.length ? prevMonthData.length : 0, currWeek, prevWeek, currWeekCount: currWeekData && currWeekData.length ? currWeekData.length : 0, prevWeekCount: prevWeekData && prevWeekData.length ? prevWeekData.length : 0 });
  } catch (error) {
    console.log("error", error);
  }
};

export const handler = syncingDauMauInDb;
