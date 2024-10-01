const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  fetchallmsgs,
  postmsg,
  getmsg,
  sendteammsg,
  getTeammsg,
} = require("../controllers/messages");
const { chats } = require("../controllers/chats");
const {
  conversations,
  getConversation,
} = require("../controllers/conversations");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/fetchallmsgs", fetchallmsgs);
router.get("/getchats", chats);
router.post("/updateconv", conversations);
router.post("/savemsg", postmsg);

router.get("/getmsg/:convId", getmsg);
router.get("/getconv/:receiverId", getConversation);

router.get("/getTeammsg/:teamId", getTeammsg);
router.post("/sendteammsg", sendteammsg);
module.exports = router;
