import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const menuItems = [
  {
    name: "Dashboard",
    path: "/"
  },
  {
    name: "Products",
    path: "/products"
  },
  {
    name: "Categories",
    path: "/categories"
  },
  {
    name: "Suppliers",
    path: "/suppliers"
  },
  {
    name: "Customers",
    path: "/customers"
  },
  {
    name: "Inventory",
    path: "/inventory"
  },
  {
    name: "Orders",
    path: "/orders"
  },
  {
    name: "Reports",
    path: "/reports"
  },
  {
    name: "Settings",
    path: "/settings"
  }
];


const Sidebar = () => {
  const [storeName, setStoreName] = useState("SuperMarket");
const [storeLogo, setStoreLogo] = useState("");

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/settings"
      );

      const settings = response.data.settings;

      setStoreName(settings.storeName || "SuperMarket");
      setStoreLogo(settings.storeLogo || "");
    } catch (error) {
      console.error("Failed to load store settings:", error);
    }
  };

  fetchSettings();
}, []);

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">

      <div className="p-6 flex items-center gap-3">
        {storeLogo && (
          <img
            src={storeLogo}
            alt="Store Logo"
            className="w-10 h-10 object-contain rounded-lg bg-white p-1"
          />
        )}

        <span className="text-xl font-bold">
          {storeName}
        </span>
      </div>


      <nav>

        {menuItems.map((item)=>(
          <NavLink
            key={item.path}
            to={item.path}
            className={({isActive}) =>
              `block px-6 py-3 transition
              hover:bg-slate-800
              ${isActive ? "bg-slate-700" : ""}`
            }
          >

            {item.name}

          </NavLink>
        ))}

      </nav>


    </aside>
  );
};


export default Sidebar;