import commonMiddleware from "common-middleware";
import { response } from "../lib/utils";
import { rozyFaqs } from "../lib/faqs";
import createError from "http-errors";

async function ListFaqs(event, context) {
  try {
    // const languages = ["english", "hindi", "nepali"];
    // let rozyTextToSpeech = {};

    // let { sectionLanguage } = event.queryStringParameters;

    // if (sectionLanguage === undefined || sectionLanguage === "") {
    // 	return response(400, { message: "Bad Request" });
    // }
    // sectionLanguage = sectionLanguage.toLowerCase().trim();

    // if (languages.indexOf(sectionLanguage) === -1) {
    // 	return response(400, { message: "language not supported yet" });
    // }
    // if (sectionLanguage === "english") {
    // 	rozyTextToSpeech = rozyFaqs;
    // } else if (sectionLanguage === "hindi") {
    // 	rozyTextToSpeech = rozyFaqsHindi;
    // } else {
    // 	rozyTextToSpeech = rozyFaqsHindiNepali;
    // }
    return response(200, { rozyFaqs });
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(ListFaqs);
