const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  fetchallmembers,
  createTeam,
  getteams,
  joinedteam,
  getTeamChats,
  getAddMembers,
  deleteTeam
} = require("../controllers/org");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/fetchallmembers", fetchallmembers);
router.post("/v1/createteam/:userId/:orgid", createTeam);
router.post("/v1/deleteteam/:userId/:teamId/:orgid", deleteTeam);
router.get("/getteams/:orgid", getteams);
router.get("/getTeamconv/:userId", getTeamChats);
router.post("/joinedteam/:userId/:teamId", joinedteam);
router.get("/getAddMembers/:userId/:teamId", getAddMembers);


module.exports = router;
