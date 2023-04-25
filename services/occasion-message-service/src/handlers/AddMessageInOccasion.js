import commonMiddleware from "../lib/commonMiddleware";
import { responseHandler } from "../lib/utils";
import { putMessageInOccasion } from "../lib/occasionMessageHelper";
async function AddMessageInOccasion(event, context) {
  let now = new Date();
  let { displayOrder, occasionName,message } = event.body;
  let messageParams = {
    displayOrder,
    occasionName,
    createdAt: now.toISOString(),
    message
  };
  try {
    await putMessageInOccasion(messageParams);
    return responseHandler({
      statusCode: 200,
      message: "Message Saved",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return responseHandler({
      statusCode: 500,
      message: "Error Occur",
      data: {},
    });
  }
}

export const handler = commonMiddleware(AddMessageInOccasion);
