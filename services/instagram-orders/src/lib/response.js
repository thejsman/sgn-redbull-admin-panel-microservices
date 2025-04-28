// Response Handler with CORS
export const responseHandler = ({ statusCode = 200, message = '', data = {} }) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow all origins
      'Access-Control-Allow-Credentials': true, // Allow cookies/authorization headers with CORS
      'Access-Control-Allow-Headers': 'Content-Type,Authorization', // You can add more if needed
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', // Common HTTP methods
    },
    body: JSON.stringify({
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
    }),
  };
};
