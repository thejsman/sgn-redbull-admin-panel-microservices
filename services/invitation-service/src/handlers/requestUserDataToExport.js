import { sendMessageToUserExportQueue } from "../lib/userExportRequestHelper";
const requestUserDataToExport = async (event, context) => {
  //date range for which data will be downloaded
  let { startDate, endDate } = event.queryStringParameters;
  //send this request to SQS
  await sendMessageToUserExportQueue({ startDate, endDate });
  return {
    statusCode: 200,
    body: "Your request has been received to process. Once done you will get the email.",
  };
};

export const handler = requestUserDataToExport;
