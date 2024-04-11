export const responseHandler = ({ statusCode, message, data }) => {
  return {
    statusCode: statusCode,
    headers: {
      "access-control-allow-origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({ message: message, data }),
  };
};
