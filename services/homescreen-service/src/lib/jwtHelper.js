const jwt = require("jsonwebtoken");

export const getUserFromToken = async (token) => {
  try {
    console.log("secret --", process.env.ACCESS_TOKEN_SECRET, "token", token);
    const secret = Buffer.from(process.env.ACCESS_TOKEN_SECRET, "base64");
    const decoded = jwt.verify(token.replace("Bearer ", ""), secret);
    console.log("decoded", decoded);
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};
