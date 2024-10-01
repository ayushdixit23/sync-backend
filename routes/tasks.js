const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  newtask,
  fetchalltasks,
  deletetask,
  updatetask,
  assigntask,
  getAssignedTasks,
  fetchgettasks,
} = require("../controllers/tasks");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/newtask", newtask);
router.get("/fetchalltasks/:id", fetchalltasks);
router.post("/updatetask", updatetask);
router.post("/deletetask", deletetask);
router.post("/assigntask/:id", assigntask);
router.get("/getAssignedTasks/:id", getAssignedTasks);

router.get("/fetchgettasks/:id", fetchgettasks);

module.exports = router;
