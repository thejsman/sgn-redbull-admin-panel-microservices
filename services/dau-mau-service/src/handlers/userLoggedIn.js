import { commonMiddleware } from "common-middleware-layer";
import { responseHandler } from "../lib/response";
import { setRedisSets } from "redis-middleware";
import { getUserFromToken } from "jwt-layer";
import { thisWeekAndLastWeekNumber } from "../lib/dateUtils";

const userLoggedIn = async (event, context) => {
  try {
    const { user } = await getUserFromToken(event.headers.Authorization);
    const redisPrefixForDau = 'DAU';
    const redisPrefixForMau = 'MAU';
    const redisPrefixForWau = 'WAU';
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          errorMessage: "not authorized",
        }),
      };
    }
    const now = new Date();
    let currDate = now.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);
    let { thisWeekNumber } = thisWeekAndLastWeekNumber(now);

    console.log('userId', user.userId);
    //logged this user id for today date in redis
    await setRedisSets(`${redisPrefixForDau}-${currDate}`, user.userId);
    await setRedisSets(`${redisPrefixForMau}-${currMonth}`, user.userId);
    await setRedisSets(`${redisPrefixForWau}-${thisWeekNumber}`, user.userId);
    let response = responseHandler({
      statusCode: 200,
      message: "Activity Registered"
    });
    return response;
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = commonMiddleware(userLoggedIn);
