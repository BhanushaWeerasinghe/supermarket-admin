import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-6 text-gray-900 dark:text-white">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;