const { verify } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getAllMessages,
} = require("../Controllers/message.Controllers");

const router = require("express").Router();

router.post("/", verify, sendMessage);
router.get("/:chatId", verify, getAllMessages);

module.exports = router;
