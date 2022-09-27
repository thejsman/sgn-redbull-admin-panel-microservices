export const responseHandler = ({ statusCode, message, data }) => {
	return {
		statusCode,
		headers: {
			"Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
			"Access-Control-Allow-Credentials": true,
			"Access-Control-Allow-Headers": "AccessToken",
			preflightContinue: false,
		},
		body: JSON.stringify({ message: message, data }),
	};
};
