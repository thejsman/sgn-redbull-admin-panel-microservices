/*eslint new-cap: ["error", { "newIsCap": false }]*/
import commonMiddleware from "../../../../packages/common-middleware";
import { responseHandler } from "../lib/response";
import { getStatsCount } from "../lib/statsHelper";

const statsRecords = async (event, context) => {
  try {
    let { month, date, week } = event.queryStringParameters;
    let result = await getStatsCount({ month, date, week });
    let response = responseHandler({
      statusCode: 200,
      message: "Connection Stats",
      data: result,
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

export const handler = commonMiddleware(statsRecords);
