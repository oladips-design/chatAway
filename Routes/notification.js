const { createNotif } = require("../Controllers/notification");
const express = require("express");
const router = express.Router();
router.post("/newnotif", createNotif);

module.exports = router;
