const jwt = require("jsonwebtoken");
const DB = require("../model");
const asyncHandler = require("express-async-handler");

const verify = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get the token from the header(key-value pair, separated by ' ')
      token = req.headers.authorization.split(" ")[1];

      // get the payload
      const payload = jwt.verify(token, process.env.JWT_Key);
      if (!payload) {
        res.status(300);
        throw new Error("invalid Token");
      }
      req.user = await DB.User.findById(payload.id).select("-password"); // this finds the document with the id in the "token" and assigns it to the req.user...(without the user's password )

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { verify };
