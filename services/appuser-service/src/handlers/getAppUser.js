import { responseHandler } from "../lib/response";
import { findUserByPartitionKey, getUserInformation } from "../lib/utils";
import { commonMiddleware } from "common-middleware-layer";

const getAppUser = async (event, context) => {
  const data = event.queryStringParameters;
  try {
    const { userId = null, mobileNO = null } = event.queryStringParameters || {};
    const user = {};
    if (userId) {
      user = await getUserInformation(userId);
    } else {
      user = await findUserByPartitionKey(mobileNO);
    }
    console.log({ user });
    return responseHandler({
      statusCode: 200,
      message: "User Information",
      data: user
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

export const handler = commonMiddleware(getAppUser);
