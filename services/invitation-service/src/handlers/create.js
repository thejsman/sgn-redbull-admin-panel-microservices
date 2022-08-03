/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";
import {
  saveInvitation,
  radmonAlpha,
  sendSMS,
  retrieveWaitlistedInfo,
  updateWaitlistedUserInfo,
} from "../lib/invitationHelper";

const createInvitationCode = async (event, context) => {
  try {
    let { phone, dialCode, firstName, lastName, receiversList } = JSON.parse(
      event.body
    );
    let bulk = true;
    if (!receiversList) {
      receiversList = [{ phone, dialCode, firstName, lastName }];
      bulk = false;
    }
    let result = await Promise.all(
      receiversList.map(async ({ phone, dialCode, firstName, lastName }) => {
        let invitationCode = radmonAlpha(5).toUpperCase();
        let invitationObject = {
          pk: invitationCode,
          phone,
          newPhone: phone,
          countryCode: dialCode.replace("+", ""),
          firstName,
          lastName,
        };
        if (bulk) {
          //in case of waitlisted users invitation code will be send and attempt count will be
          //stored in waitlisted user data
          //first retrive current info if any for this user to increase the total attemps to send code
          let waitlistedUserInfo = await retrieveWaitlistedInfo(
            `${dialCode}${phone}`
          );
          if (waitlistedUserInfo.Item) {
            waitlistedUserInfo = {
              ...waitlistedUserInfo.Item,
              codeSentInfo: {
                invitationCode,
                createdAt: new Date().toISOString(),
                attempts: waitlistedUserInfo.Item.codeSentInfo
                  ? waitlistedUserInfo.Item.codeSentInfo.attempts + 1
                  : 1,
              },
            };
          }
          //update waitlisted user info with current attemps count increased by 1
          await updateWaitlistedUserInfo(waitlistedUserInfo);
        }
        await saveInvitation(invitationObject);
        let smsResult = await sendSMS({
          dialCode,
          phone,
          invitationCode,
        });
        return { ...invitationObject, smsResult };
      })
    );

    let response = responseHandler({
      statusCode: 200,
      message: "Invitation Code",
      data: bulk ? result : { ...result[0] },
    });
    return response;
  } catch (error) {
    console.log("error", error);
    return responseHandler({
      statusCode: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

export const handler = createInvitationCode;
