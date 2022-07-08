/*eslint new-cap: ["error", { "newIsCap": false }]*/

import { responseHandler } from "../lib/response";
import { saveInvitation, radmonAlpha } from "../lib/invitationHelper";

const createInvitationCode = async (event, context) => {
	try {
		const { phone, dialCode, firstName, lastName } = JSON.parse(event.body);
		let invitationCode = radmonAlpha(5).toUpperCase();
		let invitationObject = {
			pk: invitationCode,
			phone,
			newPhone: phone,
			countryCode: dialCode.replace("+", ""),
			firstName,
			lastName,
		};
		try {
			await saveInvitation(invitationObject);
			let response = responseHandler({
				statusCode: 200,
				message: "Invitation Code",
				data: invitationObject,
			});
			return response;
		} catch (error) {
			console.log("error", error);
			return responseHandler({
				statusCode: 502,
				message: "Error Occur",
				data: {},
			});
		}
	} catch (error) {
		return responseHandler({
			statusCode: 500,
			message: "Internal Server Error",
			data: {},
		});
	}
};

export const handler = createInvitationCode;
