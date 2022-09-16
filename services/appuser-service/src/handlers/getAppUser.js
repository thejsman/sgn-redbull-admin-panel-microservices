import { responseHandler } from "../lib/response";
import { getUserByPhoneNo, getUserInformation } from "../lib/utils";
//import commonMiddleware from "../../../../packages/common-middleware";

const getAppUser = async (event, context) => {
  try {
    const { userId = null, phone = null } = event.queryStringParameters || {};
    let user = {};
    if (userId) {
      user = await getUserInformation(userId);
    } else {
      user = await getUserByPhoneNo(phone);
    }
    console.log({ user });
    return responseHandler({
      statusCode: 200,
      message: "User Information",
      data: user,
    });
  } catch (error) {
    let responseData = responseHandler({
      statusCode: 502,
      message: "Error in Getting App User Info",
      data: {},
    });
    return responseData;
  }
};

//export const handler = commonMiddleware(getAppUser);
export const handler = getAppUser;
