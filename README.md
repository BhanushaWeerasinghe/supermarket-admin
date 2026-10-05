# Supermarket Admin System

A full-stack supermarket management system built to manage products, inventory, customers, suppliers, orders, reports, and store settings through a modern admin dashboard.

## 🚀 Features

- 🔐 Firebase Authentication
- 📊 Admin Dashboard
- 📦 Product Management
  - Add products
  - Edit products
  - Delete products
  - Product search
  - Automatic quantity update for duplicate products
- 🏷️ Category Management
- 🚚 Supplier Management
- 👥 Customer Management
- 📋 Inventory Management
  - Stock tracking
  - Stock updates
  - Low-stock detection
  - Out-of-stock detection
- 🛒 Order Management
  - Create orders
  - Edit orders
  - Delete orders
  - Order status management
  - Automatic stock deduction
  - Stock restoration when orders are deleted
- 📈 Reports
  - Sales reports
  - Product sales reports
  - Inventory reports
  - Customer reports
  - Payment reports
  - Order status reports
  - Print reports
- ⚙️ Store Settings
  - Store information
  - Store logo
  - Password change
- 🔔 Low-stock Notifications
- 🌙 Dark Mode
- 📱 Responsive Admin Interface

## 🛠️ Technologies

### Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS
- Firebase Authentication
- React Hook Form
- Zod
- TanStack Query
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- Firebase Admin SDK
- Firestore
- Multer
- CORS
- Helmet
- Morgan

## 📁 Project Structure

```text
supermarket-admin/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── firebase/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── .gitignore
├── cors.json
└── README.md