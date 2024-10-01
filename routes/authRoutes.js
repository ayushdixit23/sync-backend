const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  signup,
  signin,
  forgotpass,
  updatedetails,
  getuserdata,
  getorgname,
  login,
  signupnew,
  fetchAllOrganisation,
  checkInviteCode,
  getuserdatanew,
  signupind,
} = require("../controllers/userAuth");
const { members } = require("../controllers/members");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/v1/signup", upload.single("dp"), signup);
router.post("/v1/signin", signin);
router.post("/forgotpass", forgotpass);
router.post("/updatedetails", updatedetails);
router.get("/getmembers/:userid/:orgid", members);
router.get("/getuserdata/:id", getuserdata);
router.post("/v1/getuserdata/:id", getuserdatanew);

// ayush's route

router.get("/getorgname", getorgname);
router.post("/signin", login);
router.post("/signup", upload.any(), signupnew);
router.post("/signupind", upload.single("dp"), signupind);
router.get("/fetchAllOrganisation", fetchAllOrganisation);
router.post("/checkInviteCode/:orgid", checkInviteCode);

module.exports = router;
