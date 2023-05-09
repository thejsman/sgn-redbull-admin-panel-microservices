import commonMiddleware from "../lib/commonMiddleware";
import { responseHandler } from "../lib/utils";
import { putMessageInOccasion } from "../lib/occasionMessageHelper";
async function AddMessageInOccasion(event, context) {
  let now = new Date();
  let { displayOrder, occasionName, message, isHost } = event.body;
  // let messageParams = {
  //   displayOrder,
  //   occasionName,
  //   createdAt: now.toISOString(),
  //   message,
  //   isHost,
  // };
  try {
    const promises = occasionName.map((item) => {
      return putMessageInOccasion({
        displayOrder,
        occasionName: item,
        createdAt: now.toISOString(),
        message,
        isHost,
      });
    });
    await Promise.all(promises);
    //  await putMessageInOccasion(messageParams);
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
