const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getSettings,
  updateSettings,
  uploadLogo,
} = require("../controllers/settingsController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `store-logo-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.get("/", getSettings);

router.put("/", updateSettings);

router.post("/logo", upload.single("logo"), uploadLogo);

module.exports = router;