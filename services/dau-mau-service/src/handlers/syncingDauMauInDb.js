import { getRedisSet } from "redis-middleware";

const syncingDauMauInDb = async (event, context) => {
  try {
    //get today date and also previous date and extract the data from redis and store in dynmo
    const now = new Date();
    let yesterday = new Date(now.setDate(now.getDate() - 1));
    let currDate = now.toISOString().slice(0, 10);
    let prevDate = yesterday.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);
    let prevMonth = yesterday.toISOString().slice(0, 7);
    console.log(currDate, prevDate, currMonth, prevMonth);
    //logged this user id for today date in redis
    let result = await getRedisSet("2023-01-03");
    console.log('result', JSON.parse(JSON.parse(result.Payload)));
  } catch (error) {
    console.log("error", error);
  }
};

export const handler = syncingDauMauInDb;
