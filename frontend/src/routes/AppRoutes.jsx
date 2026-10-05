import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/products/Products";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import Categories from "../pages/categories/Categories";
import AddCategory from "../pages/categories/AddCategory";
import EditCategory from "../pages/categories/EditCategory";
import Suppliers from "../pages/suppliers/Suppliers";
import AddSupplier from "../pages/suppliers/AddSupplier";
import EditSupplier from "../pages/suppliers/EditSupplier";
import Customers from "../pages/customers/Customers";
import AddCustomer from "../pages/customers/AddCustomer";
import EditCustomer from "../pages/customers/EditCustomer";
import Inventory from "../pages/inventory/Inventory";
import Orders from "../pages/orders/Orders";
import CreateOrder from "../pages/orders/CreateOrder";
import OrderDetails from "../pages/orders/OrderDetails";
import EditOrder from "../pages/orders/EditOrder";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";


import ProtectedRoute from "../components/common/ProtectedRoute";


const AppRoutes = () => {

  return (

    <Routes>

      <Route 
        path="/login" 
        element={<Login />} 
      />


      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Dashboard />} />

        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        <Route path="categories" element={<Categories />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />

        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/add" element={<AddSupplier />} />
        <Route path="suppliers/edit/:id" element={<EditSupplier />} />

        <Route path="customers" element={<Customers />} />
        <Route path="customers/add" element={<AddCustomer />} />
        <Route path="customers/edit/:id" element={<EditCustomer />} />

        <Route path="inventory" element={<Inventory />} />

        <Route path="orders" element={<Orders />} />
        <Route path="orders/create" element={<CreateOrder />} />
        <Route path="orders/:id/edit" element={<EditOrder />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        <Route path="reports" element={<Reports />} />

        <Route path="settings" element={<Settings />} />

      </Route>


    </Routes>

  );

};


export default AppRoutes;