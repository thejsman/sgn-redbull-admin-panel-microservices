import AWS from "aws-sdk";
const ses = new AWS.SES();

export const sendEmailToAdmin = async (subject, body) => {
  const params = {
    Source: "Sagoon <niranjan.bhambi@sagoon.com>",
    Destination: {
      ToAddresses: ["ankit.rathi@sagoon.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log("email status---", result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
