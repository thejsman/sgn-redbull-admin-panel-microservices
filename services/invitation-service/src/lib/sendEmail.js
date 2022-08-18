import AWS from "aws-sdk";
const ses = new AWS.SES();

export const sendEmailToAdmin = async (subject, body, email = "") => {
  console.log("email --", email);
  const params = {
    Source: "Sagoon <niranjan.bhambi@sagoon.com>",
    Destination: {
      ToAddresses: [!email ? "niranjan.bhambi@sagoon.com" : email],
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
    return result;
  } catch (error) {
    console.error(error);
  }
};
