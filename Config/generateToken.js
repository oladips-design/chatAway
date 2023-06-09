const JWT = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id) => {
  let token = JWT.sign({ id }, process.env.JWT_Key, {
    expiresIn: "1d",
  });

  return token;
};

module.exports = generateToken;
