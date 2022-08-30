// import { responseHandler } from "../lib/response";

import { findUserByPartitionKey, getUserInformation } from "../lib/utils";
import { commonMiddleware } from "common-middleware-layer";

const getOneAppUser = async (event, context) => {
  const data = event.queryStringParameters;

  try {
    const { userId = null, partitionKey = null } = event.body || {};

    const user = {};
    if (userId) {
      user = await getUserInformation(userId);
    } else {
      user = await findUserByPartitionKey(partitionKey);
    }

    console.log({ user });
  } catch (error) {
    let responseData = responseHandler({
      statusCode: 502,
      message: "Error in Getting App User Info",
      data: {},
    });
    return responseData;
  }
};

export const handler = commonMiddleware(getOneAppUser);
