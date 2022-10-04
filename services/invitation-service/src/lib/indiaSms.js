import axios from "axios";
export const sendIndiaSMS = async (flow_id, mobiles, payload) => {
  return new Promise(async (resolve, reject) => {
    var data = JSON.stringify({
      sender: "SAGOON",
      flow_id,
      mobiles,
      ...payload,
    });

    // console.log("Data in sendIndiaSMS: ", { data });
    var config = {
      method: "post",
      url: "https://api.msg91.com/api/v5/flow/",
      headers: {
        authkey: "280897A5ccbqio5d2840c4",
        "content-type": "application/json",
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
};
