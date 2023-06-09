const express = require("express");
const chatRoute = require("./chat.routes");
const authRoute = require("./signINsignUP.routes");
const messageRoute = require("./message.routes");
const router = express.Router();

router.use(chatRoute);
router.use(authRoute);
router.use(messageRoute);

module.exports = router;
