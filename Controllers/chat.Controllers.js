const asyncHandler = require("express-async-handler");
const DB = require("../model");

// single 1 on 1 chats
const accessChat = asyncHandler(async (req, res) => {
  // user we want to chat with
  let { userID } = req.body;
  if (!userID) {
    res.status(400).send({
      message:
        "invalid request, send userID with request (who do you want to chat with)",
    });
    throw new Error("bad request");
  }

  try {
    let chats = await DB.Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } }, //user sending the request
        { users: { $elemMatch: { $eq: userID } } },
      ],
    })
      .populate("users", "-password") // populate the users(it is referenced in the chat model/document) field without the password field
      .populate("lastestMessage"); //same thing;

    //the variable chats up till this point(ln27) is a big object with field values name,isGroupchat,groupAdmin,an array of users(with 2 values) and lastestMessage(which is an object that has references as values in its fields namely: "sender" and "chat" but we need SENDER )
    chats = await DB.User.populate(chats, {
      // with the help pf the User model we can populate a given path(field) in the big object
      path: "lastestMessage.sender",
      //   select, selects the values to be populated
      select: "name email",
    });

    if (chats.length > 0) {
      res.status(200).send(chats[0]);
    } else {
      let newChatData = {
        chatName: "sender", //hardcoding
        // isGroupChat: false,
        users: [userID, req.user._id],
      };

      // create a new chat with the 2 users
      const newChat = await DB.Chat.create(newChatData);

      const fetchChat = await DB.Chat.findOne({ _id: newChat._id }).populate(
        "users",
        "-password"
      );
      res.status(201).send(fetchChat);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(`Error: ${error.message}`);
  }
});

// this function fetches all the chats a user is involved in
const fetchChats = asyncHandler(async (req, res) => {
  try {
    let allChats = await DB.Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastestMessage")
      .sort({ updatedAt: -1 });

    allChats = await DB.User.populate(allChats, {
      path: "lastestMessage.sender",
      select: "name email",
    });
    if (!allChats) {
      res.status(300);
      throw new Error("User as no chats");
    }
    res.status(200).send(allChats);
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(`Error : ${error.message}`);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "please fill all the fields" });
  }
  // comes in as a Json string of array
  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 Users are required to form a group");
  }
  users.push(req.user);

  try {
    const newGroupChat = await DB.Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fetchGroupChat = await DB.Chat.findOne({ _id: newGroupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fetchGroupChat);
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(`Error : ${error.message}`);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await DB.Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat NOT found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, users } = req.body;

  // what do you do if the user wants to add more than 1 user at once
  // users or user comes in an array even if its just 1 user that's being added
  let newMembers = JSON.parse(users); //[]

  try {
    for (let i = 0; i < newMembers.length; i++) {
      let addedMembers = await DB.Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { users: newMembers[i] },
        },
        {
          new: true,
        }
      );
    }
    // find and return d group in another query
    let updatedGroup = await DB.Chat.findById(chatId)
      .populate("groupAdmin", "-password")
      .populate("users", "-password");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).send({ message: error });
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await DB.Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("chat not found");
    } else {
      res.json(removed);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).send({ message: error.message });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
