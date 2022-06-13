import commonMiddleware from "../lib/commonMiddleware";
import { response } from "../lib/utils";
import createError from "http-errors";
import { getOnboardingData } from "../lib/utils";

async function GetOnboarding(event, context) {
	try {
		let { sectionLanguage } = event.queryStringParameters;

		if (sectionLanguage == undefined || sectionLanguage == "") {
			return response(400, { message: "Bad Request" });
		}
		const sectionNames = [
			"invitationscreen",
			"mobilenumberscreen",
			"otpscreen",
			"namescreen",
			"homescreen",
			"welcomeback",
		];
		const responseObj = await getOnboardingData(sectionNames, sectionLanguage);

		if (responseObj.length > 0) {
			return response(200, responseObj);
		} else {
			return response(404, { message: "data not found" });
		}
	} catch (error) {
		throw new createError.InternalServerError(error);
	}
}

export const handler = commonMiddleware(GetOnboarding);
