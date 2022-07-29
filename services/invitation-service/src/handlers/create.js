/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";
import { saveInvitation, radmonAlpha, sendSMS } from "../lib/invitationHelper";

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
