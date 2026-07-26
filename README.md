# 🛒 Luxe E-Commerce Platform

A premium, full-stack e-commerce application built with the **MERN stack** (MongoDB, Express, React, Node.js) and TypeScript. 

The application features a fully redesigned luxury storefront with glassmorphism, fluid framer-motion animations, responsive layouts, dark mode support, and a comprehensive admin panel for managing products and orders.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [Seeding the Database](#-seeding-the-database)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### Customer Features

- **Luxury UI Design** — Brand new glassmorphic aesthetics with floating navbar and fluid Framer Motion animations.
- **Dark Mode Support** — Seamless toggle between stunning light and dark themes.
- **Product Browsing** — View all active products with keyword search and hover effects.
- **Product Details** — View product info, ratings, and customer reviews.
- **Shopping Cart** — Add/remove items, quantity management (persisted in `localStorage`).
- **User Authentication** — Register and login with secure JWT-based authentication.
- **Checkout** — Place orders with shipping address, payment method, and price breakdown.
- **Order History** — View past orders from the modernized user profile dashboard.
- **Responsive Design** — Fully responsive UI built with Tailwind CSS v4.

### Admin Features

- **Product Management** — Create, edit, and delete products with full CRUD support.
- **Order Management** — View all orders and mark orders as delivered.
- **Role-Based Access Control** — Admin-only routes protected by dedicated middleware.

---

## 🛠 Tech Stack

| Layer           | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| **Frontend**    | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v8 |
| **Backend**     | Node.js, Express, TypeScript, tsx                            |
| **Database**    | MongoDB with Mongoose ODM                                    |
| **Auth**        | JWT (JSON Web Tokens), bcryptjs                              |
| **HTTP Client** | Axios                                                        |
| **Icons**       | lucide-react                                                 |
| **Animation**   | framer-motion                                                |

---

## 📁 Project Structure

```text
mern-ecommerce/
├── frontend/               # React frontend (TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── context/        # Global state (auth, cart, etc.)
│   │   ├── services/       # API service functions (Axios)
│   │   ├── types/          # Shared TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── backend/                # Express backend (TypeScript)
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── middleware/     # Auth, error handling, etc.
│   │   ├── config/         # DB connection, env config
│   │   └── server.ts
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/mern-ecommerce.git
   cd mern-ecommerce
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend/` directory (see [Environment Variables](#-environment-variables) below).

5. **Run the development servers**

   In one terminal (backend):

   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):

   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the app**

   Visit `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
PAYHERE_NOTIFY_URL=https://your-api-domain.com/api/orders/payhere/notify
PAYHERE_SANDBOX=true
FRONTEND_URL=http://localhost:5173
SHIPPING_FEE_LKR=0
TAX_RATE=0
```

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint              | Description           | Access |
| ------ | --------------------- | --------------------- | ------ |
| POST   | `/api/users/register` | Register a new user   | Public |
| POST   | `/api/users/login`    | Login and receive JWT | Public |

### Products

| Method | Endpoint            | Description                | Access |
| ------ | ------------------- | -------------------------- | ------ |
| GET    | `/api/products`     | Get all active products    | Public |
| GET    | `/api/products/:id` | Get single product details | Public |
| POST   | `/api/products`     | Create a new product       | Admin  |
| PUT    | `/api/products/:id` | Update a product           | Admin  |
| DELETE | `/api/products/:id` | Delete a product           | Admin  |

### Orders

| Method | Endpoint                  | Description                 | Access        |
| ------ | ------------------------- | --------------------------- | ------------- |
| POST   | `/api/orders`             | Place a new order           | Authenticated |
| GET    | `/api/orders/my-orders`   | Get logged-in user's orders | Authenticated |
| GET    | `/api/orders`             | Get all orders              | Admin         |
| PUT    | `/api/orders/:id/deliver` | Mark order as delivered     | Admin         |

---

## 🧑‍💼 Admin Panel

The admin panel is accessible only to users with the `admin` role and includes:

- **Dashboard** — Overview of products and orders
- **Product Management** — Add, edit, and delete products
- **Order Management** — View all customer orders and update delivery status

Admin routes are protected via a role-based middleware that verifies the JWT and checks the user's role before granting access.

---

## 🌱 Seeding the Database

To seed an admin account into the database:

```bash
cd backend
npm run seed
```

**Requirements:** `MONGO_URI` must be set in `backend/.env`.

This will check for an existing admin account before creating one, or populate the database with sample products and users if needed for local testing.

---

## 📜 Scripts

### Backend (`backend/`)

| Script  | Description                                  |
| ------- | -------------------------------------------- |
| `dev`   | Start dev server with hot-reload (tsx watch) |
| `build` | Bundle with esbuild to `dist/server.cjs`     |
| `start` | Start production server from built output    |
| `lint`  | Type-check without emitting                  |
| `seed`  | Seed admin account into the database         |

### Frontend (`frontend/`)

| Script    | Description                 |
| --------- | --------------------------- |
| `dev`     | Start Vite dev server       |
| `build`   | Build for production        |
| `preview` | Preview production build    |
| `lint`    | Type-check without emitting |

---

## 🔧 Troubleshooting

**1. Login is taking too long / Timing out**
This is typically caused by Node trying to resolve `localhost` via IPv6 first. 
*Fix*: The `frontend/vite.config.ts` has been configured to use `target: 'http://127.0.0.1:5000'` instead of `localhost` for the proxy, forcing IPv4 resolution and resolving this issue.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
