import { useEffect, useState } from "react";

import axios from "axios";

import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { auth } from "../../firebase/firebaseConfig";

const Settings = () => {
  
  const [storeName, setStoreName] = useState("SuperMarket");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/settings"
      );

      const settings = response.data.settings;

      setStoreName(settings.storeName || "");
      setStorePhone(settings.storePhone || "");
      setStoreEmail(settings.storeEmail || "");
      setStoreAddress(settings.storeAddress || "");
      setStoreLogo(settings.storeLogo || "");
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  fetchSettings();
}, []);

const handleSave = async (e) => {
  e.preventDefault();

  try {
    let logoUrl = storeLogo;

    // Upload logo to Express backend
    if (logoFile) {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/settings/logo",
        formData
      );

      logoUrl = uploadResponse.data.logoUrl;
    }

    // Save store settings
    await axios.put(
      "http://localhost:5000/api/settings",
      {
        storeName,
        storePhone,
        storeEmail,
        storeAddress,
        storeLogo: logoUrl,
      }
    );

    setStoreLogo(logoUrl);
    setLogoFile(null);

    alert("Settings saved successfully!");
  } catch (error) {
    console.error("Failed to save settings:", error);

    alert("Failed to save settings.");
  }
};

const handleChangePassword = async (e) => {
  e.preventDefault();

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  if (newPassword.length < 6) {
    alert("New password must be at least 6 characters.");
    return;
  }

  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      alert("No logged-in user found.");
      return;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);

    alert("Password changed successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    console.error("Change password error:", error);

    if (error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential") {
      alert("Current password is incorrect.");
    } else {
      alert("Failed to change password.");
    }
  }
};

  return (
    <div className="p-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your supermarket settings
        </p>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Store Information
        </h2>

        <p className="text-gray-500 mt-1">
          Update your supermarket details
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
        
          {/* Store Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Logo
            </label>

            <div className="flex items-center gap-4">
              {storeLogo && (
                <img
                  src={storeLogo}
                  alt="Store Logo"
                  className="w-20 h-20 object-contain border rounded-lg p-2"
                />
              )}

              <input
                id="store-logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    const previewUrl = URL.createObjectURL(file);

                    setLogoFile(file);
                    setStoreLogo(previewUrl);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>

            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter store name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter phone number"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter email address"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Address
            </label>

            <textarea
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter store address"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>

        </form>
      </div>
      {/* Security */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800">
          Security
        </h2>

        <p className="text-gray-500 mt-1">
          Change your admin account password
        </p>

        <form
          onSubmit={handleChangePassword}
          className="mt-6 space-y-5"
        >
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;