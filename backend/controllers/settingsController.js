const { db } = require("../config/firebase-admin");

const getSettings = async (req, res) => {
  try {
    const doc = await db
      .collection("settings")
      .doc("store")
      .get();

    if (!doc.exists) {
      return res.json({
        success: true,
        settings: {
          storeName: "SuperMarket",
          storePhone: "",
          storeEmail: "",
          storeAddress: "",
          storeLogo: "",
        },
      });
    }

    res.json({
      success: true,
      settings: doc.data(),
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      storePhone,
      storeEmail,
      storeAddress,
      storeLogo,
    } = req.body;

    await db
      .collection("settings")
      .doc("store")
      .set(
        {
          storeName,
          storePhone,
          storeEmail,
          storeAddress,
          storeLogo: storeLogo || "",
          updatedAt: new Date(),
        },
        { merge: true }
      );

    res.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file uploaded",
      });
    }

    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    await db
      .collection("settings")
      .doc("store")
      .set(
        {
          storeLogo: logoUrl,
          updatedAt: new Date(),
        },
        { merge: true }
      );

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl,
    });
  } catch (error) {
    console.error("Upload logo error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload logo",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
};