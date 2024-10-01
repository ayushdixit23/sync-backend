const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  fetchstorage,
  uploadtostorage,
  deleteitem,
  downloadhandler,
  fetchstorageuser,
} = require("../controllers/storage");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB limit
});

router.get("/fetchstorage/:orgid", fetchstorage);
router.get("/fetchstorageuser/:id", fetchstorageuser);
router.post("/uploadtostorage", upload.single("file"), uploadtostorage);
router.post("/deleteitem", deleteitem);
router.get("/downloadfile", downloadhandler);

module.exports = router;
