export const responseHandler = ({ statusCode, message, data }) => {
	return {
		statusCode: statusCode,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
		},
		body: JSON.stringify({ message: message, data }),
	};
};
