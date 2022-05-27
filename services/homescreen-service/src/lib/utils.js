export function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "AccessToken",
      preflightContinue: false,
    },
    body: JSON.stringify(data),
  };
}
