export function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "access-control-allow-origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(data),
  };
}
