import { responseHandler } from "../lib/response";
import { getUserList } from "../lib/utils";
//import commonMiddleware from "../../../../packages/common-middleware";

const listAppUsers = async (event, context) => {
  try {
    const { userId = null, limit = 10 } = event.queryStringParameters || {};
    let response = await getUserList({ userId: userId, limit: limit });
    return responseHandler({
      statusCode: 200,
      message: "App User Info",
      data: response,
    });
  } catch (error) {
    return responseHandler({
      statusCode: 502,
      message: "Error in Getting App User Info",
      data: [],
    });
  }
};

//export const handler = commonMiddleware(listAppUsers);
export const handler = listAppUsers;
