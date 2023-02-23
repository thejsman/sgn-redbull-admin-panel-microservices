import { getRedisItem, setRedisItem } from "redis-middleware";
import { updateUserLoggedInActivityStats } from "../lib/utils";
import { weekNumber } from "../lib/dateUtils";
import AWS from "aws-sdk";
const athena = new AWS.Athena();

const syncingDauMauInDb = async (event, context) => {
  try {
    //get today date and also previous date and extract the data from redis and store in dynmo
    const redisPrefixForDau = "DAU";
    const redisPrefixForMau = "MAU";
    const redisPrefixForWau = "WAU";
    const now = new Date(new Date().getTime() + 19800000);
    let currDate = now.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);
    let yesterday = new Date(now.setDate(now.getDate() - 1));
    let prevDate = yesterday.toISOString().slice(0, 10);
    let prevMonth = yesterday.toISOString().slice(0, 7);
    let currWeek = weekNumber(currDate);
    let prevWeek = weekNumber(yesterday);
    let rcks = []; //cache keys to be removed
    console.log("now", now.toISOString(), yesterday.toISOString());

    //Now extract the infofrom redis for these 4 parameters
    let [
      currDateQID,
      prevDateQID,
      currMonthQID,
      prevMonthQID,
      currWeekQID,
      prevWeekQID,
    ] = await Promise.all([
      getRedisItem(`${redisPrefixForDau}-${currDate}`),
      getRedisItem(`${redisPrefixForDau}-${prevDate}`),
      getRedisItem(`${redisPrefixForMau}-${currMonth}`),
      getRedisItem(`${redisPrefixForMau}-${prevMonth}`),
      getRedisItem(`${redisPrefixForWau}-${currWeek}`),
      getRedisItem(`${redisPrefixForWau}-${prevWeek}`),
    ]);
    console.log("currDateQID-----", currDateQID);
    console.log(
      "prevDateQID",
      currDateQID ? 3 : 4,
      prevDateQID ? 1 : 2,
      currMonthQID,
      prevMonthQID,
      currWeekQID,
      prevWeekQID
    );
    currDateQID = currDateQID.Payload
      ? JSON.parse(JSON.parse(currDateQID.Payload))
      : "";
    prevDateQID = prevDateQID.Payload
      ? JSON.parse(JSON.parse(prevDateQID.Payload))
      : "";
    currMonthQID = currMonthQID.Payload
      ? JSON.parse(JSON.parse(currMonthQID.Payload))
      : "";
    prevMonthQID = prevMonthQID.Payload
      ? JSON.parse(JSON.parse(prevMonthQID.Payload))
      : "";
    currWeekQID = currWeekQID.Payload
      ? JSON.parse(JSON.parse(currWeekQID.Payload))
      : "";
    prevWeekQID = prevWeekQID.Payload
      ? JSON.parse(JSON.parse(prevWeekQID.Payload))
      : "";
    console.log(
      "prevDateQID",
      currDateQID ? 3 : 4,
      prevDateQID ? 1 : 2,
      currMonthQID,
      prevMonthQID,
      currWeekQID,
      prevWeekQID
    );
    console.log("{ QueryExecutionId: currDateQID }", {
      QueryExecutionId: currDateQID,
    });
    let [
      currDateAR,
      prevDateAR,
      currMonthAR,
      prevMonthAR,
      currWeekAR,
      prevWeekAR,
    ] = await Promise.all([
      currDateQID
        ? athena
            .getQueryResults({ QueryExecutionId: currDateQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForDau}-${currDate}`]
                : [...rcks];
            })
        : "",
      prevDateQID
        ? athena
            .getQueryResults({ QueryExecutionId: prevDateQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForDau}-${prevDate}`]
                : [...rcks];
            })
        : "",
      currMonthQID
        ? athena
            .getQueryResults({ QueryExecutionId: currMonthQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForMau}-${currMonth}`]
                : [...rcks];
            })
        : "",
      prevMonthQID && currMonth != prevMonth
        ? athena
            .getQueryResults({ QueryExecutionId: prevMonthQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForMau}-${prevMonth}`]
                : [...rcks];
            })
        : "",
      currWeekQID
        ? athena
            .getQueryResults({ QueryExecutionId: currWeekQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForWau}-${currWeek}`]
                : [...rcks];
            })
        : "",
      prevWeekQID && currWeek != prevWeek
        ? athena
            .getQueryResults({ QueryExecutionId: prevWeekQID })
            .promise()
            .catch((e) => {
              rcks = e.message.includes("FAILED")
                ? [...rcks, `${redisPrefixForWau}-${prevWeek}`]
                : [...rcks];
            })
        : "",
    ]);
    console.log("currDateAR==>", JSON.stringify(currDateAR));
    currDateAR = currDateAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevDateAR = prevDateAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    currMonthAR =
      currMonthAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevMonthAR =
      prevMonthAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    currWeekAR = currWeekAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    prevWeekAR = prevWeekAR?.ResultSet?.Rows?.[1]?.Data?.[0]?.VarCharValue ?? 0;
    console.log("currDateAR", currDateAR);
    console.log("prevDateAR", prevDateAR);
    console.log("currMonthQID", currMonthAR);
    console.log("prevMonthQID", prevMonthAR);
    console.log("currWeekQID", currWeekAR);
    console.log("prevWeekQID", prevWeekAR);
    //remove failed and suceed calls from cache also
    rcks = currDateAR
      ? [...rcks, `${redisPrefixForDau}-${currDate}`]
      : [...rcks];
    rcks = prevDateAR
      ? [...rcks, `${redisPrefixForDau}-${prevDate}`]
      : [...rcks];
    rcks = currMonthAR
      ? [...rcks, `${redisPrefixForMau}-${currMonth}`]
      : [...rcks];
    rcks = prevMonthAR
      ? [...rcks, `${redisPrefixForMau}-${prevMonth}`]
      : [...rcks];
    rcks = currWeekAR
      ? [...rcks, `${redisPrefixForWau}-${currWeek}`]
      : [...rcks];
    rcks = prevWeekAR
      ? [...rcks, `${redisPrefixForWau}-${prevWeek}`]
      : [...rcks];
    console.log("redis keys to be removed", rcks);
    //first extract the data from database
    await updateUserLoggedInActivityStats({
      currDate,
      currMonth,
      prevDate,
      prevMonth,
      currDateCount: +currDateAR,
      currMonthCount: +currMonthAR,
      prevDateCount: +prevDateAR,
      prevMonthCount: +prevMonthAR,
      currWeek,
      prevWeek,
      currWeekCount: +currWeekAR,
      prevWeekCount: +prevWeekAR,
    });
    console.log("data to be stored--", {
      currDate,
      currMonth,
      prevDate,
      prevMonth,
      currDateCount: +currDateAR,
      currMonthCount: +currMonthAR,
      prevDateCount: +prevDateAR,
      prevMonthCount: +prevMonthAR,
      currWeek,
      prevWeek,
      currWeekCount: +currWeekAR,
      prevWeekCount: +prevWeekAR,
    });
    //Now set redis item ttl zero so that it will be deleted from redis
    await Promise.all(
      rcks.map((key) => {
        console.log("key", key);
        return setRedisItem(key, 10, "ToBeDeleted");
      })
    );
  } catch (error) {
    console.log("error", error);
  }
};

export const handler = syncingDauMauInDb;
