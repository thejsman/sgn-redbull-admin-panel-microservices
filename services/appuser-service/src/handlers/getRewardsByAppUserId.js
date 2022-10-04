import { responseHandler } from "../lib/response";
import { getRewardsByUserId } from "../lib/utils";
//import commonMiddleware from "../../../../packages/common-middleware";

const getRewardsByAppUserId = async (event, context) => {
  try {
    const { userId } = event.queryStringParameters || {};
    let result = await getRewardsByUserId(userId);
    return responseHandler({
      statusCode: 200,
      message: "Rewards List",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 502,
      message: "Error Occur",
      data: [],
    });
  }
};

// export const handler = commonMiddleware(getRewardsByAppUserId);
export const handler = getRewardsByAppUserId;
