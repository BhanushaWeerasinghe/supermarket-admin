import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell, LogOut } from "lucide-react";


const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("darkMode") === "true"
);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

  const [storeName, setStoreName] = useState("SuperMarket");
  const [storeLogo, setStoreLogo] = useState("");

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/settings"
      );

      setStoreName(
        response.data.settings.storeName || "SuperMarket"
      );
      setStoreLogo(
        response.data.settings.storeLogo || ""
      );
    } catch (error) {
      console.error("Failed to load store settings:", error);
    }
  };

  fetchSettings();
}, []);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/inventory"
      );

      const inventory = response.data.inventory || [];

      const lowStock = inventory.filter(
        (item) => item.quantity <= 10
      );

      setNotifications(lowStock);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  fetchNotifications();
}, []);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };
  return (
    <header className="h-16 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {storeLogo && (
          <img
            src={storeLogo}
            alt="Store Logo"
            className="w-10 h-10 object-contain rounded-lg border p-1"
          />
        )}

        <div>
          <h1 className="text-xl font-semibold">
            {storeName}
          </h1>

          <p className="text-sm text-gray-500">
            Admin Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* Admin Email */}
        <span className="text-gray-600 dark:text-gray-300">
          {user?.email}
        </span>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-white"
            title="Notifications"
          >
            <Bell size={22} />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-b border-gray-100 dark:border-slate-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.quantity === 0
                          ? "Out of Stock"
                          : "Low Stock"}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode */}
       {/* <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>*/}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Logout"
        >
          <LogOut size={22} />
        </button>

      </div>
    </header>
  );
};

export default Navbar;