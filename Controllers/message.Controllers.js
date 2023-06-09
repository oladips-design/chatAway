const DB = require("../model");
const asyncHandler = require("express-async-handler");

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  if (!content || !chatId) {
    console.log("Invalid request");
    return res.status(400);
  }

  let newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let messageSent = await DB.Message.create(newMessage);

    (await messageSent.populate("sender")).populate("chat");
    messageSent = DB.User.populate(messageSent, {
      path: "chat.users",
      select: "name email",
    });
    if (!messageSent) {
      res.status(300);
      throw new Error("something went wrong while sending the message");
    }

    // update the lastest message in the chat model
    await DB.Chat.findByIdAndUpdate(req.body.chatId, {
      lastestMessage: messageSent,
    });

    res.status(200).send(messageSent);
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(`Error: ${error.message}`);
  }
});

const getAllMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  try {
    let messages = await DB.Message.find({ chat: chatId })
      .populate("sender", "name email -password")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = { sendMessage, getAllMessages };
