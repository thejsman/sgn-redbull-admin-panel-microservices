/*eslint new-cap: ["error", { "newIsCap": false }]*/
import commonMiddleware from "../../../../packages/common-middleware";
import { responseHandler } from "../lib/response";
import { setRedisSets } from "redis-middleware";

const userLoggedIn = async (event, context) => {
  try {
    let { userId } = event.body;
    const now = new Date();
    let currDate = now.toISOString().slice(0, 10);
    let currMonth = now.toISOString().slice(0, 7);

    console.log('userId', userId);
    //logged this user id for today date in redis
    await setRedisSets(currDate, userId);
    await setRedisSets(currMonth, userId);
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
