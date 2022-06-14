export function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "POST,PATCH",
      "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
      preflightContinue: false,
    },
    body: JSON.stringify(data),
  };
}
