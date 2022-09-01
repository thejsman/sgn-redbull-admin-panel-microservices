import { responseHandler } from "../lib/response";
import { getConnectionsByUserId } from "../lib/utils";
//import commonMiddleware from "../../../../packages/common-middleware";

const getConnectionsByAppUserId = async (event, context) => {
  try {
    const { userId } = event.queryStringParameters || {};
    let result = await getConnectionsByUserId(userId);
    return responseHandler({
      statusCode: 200,
      message: "Connection List",
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


// export const handler = commonMiddleware(getConnectionsByAppUserId);
export const handler = getConnectionsByAppUserId;
