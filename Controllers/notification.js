const { inAppNotification } = require("../utils/novu");
const DB = require("../model");

const createNotif = async (req, res) => {
  const { description } = req.body;

  const newNotif = new DB.Notif({
    description,
  });

  try {
    await newNotif.save();
    await inAppNotification(description, "Sumit");
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

module.exports = { createNotif };
