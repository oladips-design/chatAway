const asyncHandler = require("express-async-handler");
const DB = require("../model");
const bcrypt = require("bcryptjs");
const generateToken = require("../Config/generateToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { ErrorResponse, showError } = require("../utils");

const userSignUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Bad request fill in all fields");
  }

  try {
    //   check if email exists in DB
    let matchingEmail = await DB.User.findOne({ email: email });

    if (matchingEmail) {
      res.status(400);
      throw new ErrorResponse("email exists", 400);
    }
    // hash the incoming password
    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(password, salt);
    let newUser = await DB.User.create({
      name,
      email,
      password: hashPassword,
    });

    if (newUser) {
      res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400);
      throw new ErrorResponse("unable to create user", 521);
    }
  } catch (error) {
    console.log(`error : ${error}`);
    const message = error.message || "Internal Server error";
    const cs = error.statusCode || 500;
    res.status(cs).json(showError(message, cs));
  }
});

// handle login
const userLogIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ((!email, !password)) {
    res.status(400);
    throw new ErrorResponse("invalid request", 400);
  }

  // check if email matches the password given
  try {
    let user = await DB.User.findOne({ email });
    if (!user) throw new ErrorResponse("invalid email", 429);

    // email exists next compare password in that document to that of the input
    let matchingPassword = await bcrypt.compare(password, user.password);
    if (!matchingPassword) {
      throw new ErrorResponse(
        "invalid password please enter correct password",
        429
      );
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(`error : ${error}`);
    const message = error.message || "Internal Server error";
    const cs = error.statusCode || 500;
    res.status(cs).json(showError(message, cs));
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        // so once search has a value the query looks like this
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  try {
    const fetchedUsers = await DB.User.find(keyword).find({
      _id: { $ne: req.user._id },
    });
    if (!fetchedUsers) {
      res.status(300);
      throw new Error("user does not exist");
    }
    res.status(200).send(fetchedUsers);
  } catch (error) {
    console.log(`Error: ${error}`);
    const message = error.message || "Internal Server error";
    const cs = error.statusCode || 500;
    res.status(cs).json(showError(message, cs));
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await DB.User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    // Update user's reset token in DB
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; //1hr
    await user.save();

    // configuration of transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "oladeleghost@gmail.com",
        pass: "idmkiuzotqyvdryh",
      },
    });

    // Define email message options
    const mailOptions = {
      from: "oladeleghost@gmail.com",
      to: email,
      subject: "Password reset request",
      html: `<p>
      You have requested to reset your password. Please click on the following link to reset your password:
      </p>
      <p>
      <a href="http://localhost:4000/reset-password/${resetToken}">Reset Password</a>
      </p>`,
    };

    // send email message
    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(`Email sent to ${info.response}`);
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email address",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const getResetToken = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;

    // find user with token
    const user = await DB.User.findOne({ resetToken: token });

    if (!user || Date.now() > user.resetTokenExpiration) {
      res.redirect("/forgot-password");
      return;
    }

    // send reset token
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    // find user by reset token
    const user = await DB.User.findOne({ resetToken: token });

    // validate
    if (!user || Date.now() > user.resetTokenExpiration) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    const salt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server Error",
    });
  }
});

module.exports = {
  userSignUp,
  userLogIn,
  getAllUsers,
  forgotPassword,
  resetPassword,
  getResetToken,
};
