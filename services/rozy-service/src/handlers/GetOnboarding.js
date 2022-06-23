import {
  setRedisItem,
  getRedisItem,
} from "./../../../../packages/redis-middleware";
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
    //redisKey is
    let redisKey = `ROZY:BOARDING:${sectionLanguage.toUpperCase()}`;
    //geting from cache if exists in cache
    let content = await getRedisItem(redisKey);
    content = JSON.parse(JSON.parse(content.Payload));
    console.log("cache content", content);
    if (!content) {
      console.log("from db..");
      const responseObj = await getOnboardingData(
        sectionNames,
        sectionLanguage
      );
      if (responseObj.length > 0) {
        content = responseObj;
        await setRedisItem(redisKey, 3600, responseObj);
      }
    }

    if (content) {
      return response(200, content);
    } else {
      return response(404, { message: "data not found" });
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(GetOnboarding);
