import commonMiddleware from "../lib/commonMiddleware";
import { responseHandler } from "../lib/utils";
import { getMessages } from "../lib/occasionMessageHelper";

async function getMessageInOccasion(event, context) {
  console.log("event body", event);
  let { occasionName } = event.queryStringParameters;
  try {
    let result = await getMessages({ occasionName });
    return responseHandler({
      statusCode: 200,
      message: "Get Messages",
      data: result.Items,
    });
  } catch (error) {
    console.log("error",error);
    return responseHandler({
      statusCode: 500,
      message: "Error Occur",
      data: {},
    });
  }
}

export const handler = commonMiddleware(getMessageInOccasion);
