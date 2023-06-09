const router = require("express").Router();
const { verify } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../Controllers/chat.Controllers");

router.route("/").get(verify, fetchChats).post(verify, accessChat);
router.post("/group", verify, createGroupChat);
router.put("/rename", verify, renameGroup);
router.put("/groupadd", verify, addToGroup);
router.put("/groupremove", verify, removeFromGroup);

module.exports = router;
