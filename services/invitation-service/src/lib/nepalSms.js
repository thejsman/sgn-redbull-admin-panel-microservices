import axios from "axios";
export const sendNepalSMS = async (
  smsName = "INVITATION_SMS",
  phone,
  payload
) => {
  let smsText = ``;
  switch (smsName) {
    case "INVITATION_SMS":
      // smsText = `Hi! ${payload.firstName} ${payload.dialCodePhone}, I am creating my Family Circle on Sagoon. I want to add you as ${payload.relation} and celebrate all our family events together. Join me using the invitation code ${payload.invitationCode}, it will expire in 24 hours. Download Sagoon App: ${payload.appLink}`;
      smsText = `Welcome to New Sagoon! Login today using invitation code: ${payload.invitationCode} and earn upto Rs 50 reward balance. Hurry, code is valid for 24 hrs only. Download app ${payload.appLink}`;
      // smsText = `As requested, here’s your invitation code: ${payload.invitationCode} It expires in 24 hours. To sign up, download app ${payload.appLink} Enjoy connecting with your family and sharing gifts.`;
      break;
    case "DEAL_SUCCESS":
      smsText = `Successful: Thank you for shopping on Sagoon. Get exciting deals at discounted prices every day on Sagoon. Enjoy Shopping! Team Sagoon`;
      break;
    case "GIFT_SENT":
      smsText = `Confirmed: Thank you for shopping on Sagoon. We're preparing your gift for ${payload.receiversNames}. Check your gift details in ${payload.link}. Your loved ones will receive your gift in 24 hours. Enjoy Gifting! Team Sagoon`;
      break;
    case "GIFT_RECEIVED":
      smsText = `New Gift: ${payload.senderName} sent you gift on ${payload.occasionTitle} Check your gift details in ${payload.link}. ${payload.senderName}'s message will expire in 24 hours. Hurry up and check before it gets deleted. Enjoy Gifting! Team Sagoon`;
      break;
    default:
      smsText = "";
      break;
  }

  try {
    // await sendMessageViaSparrow(phone, smsText);
    await sendMessageViaAakash(phone, smsText);
  } catch (error) {
    console.log("got error in sending sms", error);
    // await sendMessageViaAakash(phone, text);
  }
};

const sendMessageViaAakash = async (to, text) => {
  return new Promise(async (resolve, reject) => {
    const data = JSON.stringify({
      auth_token:
        "59a75236fc4c2829c651ea552976ef4f47ceb185fcb943458de2a498eae89698",
      to,
      text,
    });
    const otpUrl = `https://sms.aakashsms.com/sms/v3/send`;
    const config = {
      method: "post",
      url: otpUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    axios(config)
      .then(function (response) {
        console.log("NEPAL SMS send via Aakash", to, text);
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
};
