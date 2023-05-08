import commonMiddleware from "../lib/commonMiddleware";
import { responseHandler } from "../lib/utils";
import { deleteMessage } from "../lib/occasionMessageHelper";

async function DeleteOccasion(event, context) {
  try {
    const { occasionName, displayOrder } = event.body;
    await deleteMessage({ occasionName, displayOrder: +displayOrder });
    return responseHandler({
      statusCode: 200,
      message: "Message Has been Deleted",
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

export const handler = commonMiddleware(DeleteOccasion);
