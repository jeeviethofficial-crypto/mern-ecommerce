# 🛒 MERN E-Commerce Platform

A full-stack e-commerce application built with the **MERN stack** (MongoDB, Express, React, Node.js) using TypeScript. Features a customer-facing storefront with product browsing, cart management, and checkout, plus a comprehensive admin panel for managing products and orders.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Admin Panel](#admin-panel)
- [Seeding the Database](#seeding-the-database)
- [Scripts](#scripts)
- [License](#license)

---

## ✨ Features

### Customer Features

- **Product Browsing** — View all active products with keyword search
- **Product Details** — View product info, ratings, and customer reviews
- **Shopping Cart** — Add/remove items, quantity management (persisted in localStorage)
- **User Authentication** — Register and login with JWT-based authentication
- **Checkout** — Place orders with shipping address, payment method, and price breakdown
- **Order History** — View your past orders in the profile page
- **Responsive Design** — Fully responsive UI built with Tailwind CSS

### Admin Features

- **Product Management** — Create, edit, delete products with full CRUD
- **Order Management** — View all orders, mark orders as delivered
- **Role-Based Access** — Admin-only routes protected by middleware

---

## 🛠 Tech Stack

| Layer           | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| **Frontend**    | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v8 |
| **Backend**     | Node.js, Express, TypeScript, tsx                            |
| **Database**    | MongoDB with Mongoose ODM                                    |
| **Auth**        | JWT (JSON Web Tokens), bcryptjs                              |
| **HTTP Client** | axios                                                        |
| **Icons**       | lucide-react                                                 |
| **Animation**   | motion                                                       |

---

## 📁 Project Structure

```
mern-ecommerce/
├── backend/                    # Express API server
│   ├── middleware/
│   │   └── authMiddleware.ts   # JWT protect & admin guards
│   ├── models/
│   │   ├── Product.ts          # Product schema (with reviews)
│   │   ├── User.ts             # User schema (customer / admin)
│   │   └── Order.ts            # Order schema (with shipping & payment)
│   ├── routes/
│   │   ├── productRoutes.ts    # /api/products
│   │   ├── userRoutes.ts       # /api/users
│   │   └── orderRoutes.ts      # /api/orders
│   ├── .env                    # Environment variables
│   ├── seed.ts                 # Admin account seeder
│   ├── server.ts               # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── CustomerLayout.tsx   # Header, footer, nav
│   │   │   ├── AdminRoute.tsx           # Admin route guard
│   │   │   └── Rating.tsx               # Star rating component
│   │   ├── context/
│   │   │   ├── AuthContext.tsx           # Auth state management
│   │   │   └── CartContext.tsx           # Cart state management
│   │   ├── pages/
│   │   │   ├── Home.tsx                 # Product listing
│   │   │   ├── ProductDetail.tsx        # Single product view
│   │   │   ├── Cart.tsx                 # Shopping cart
│   │   │   ├── Login.tsx                # User login
│   │   │   ├── Register.tsx             # User registration
│   │   │   ├── Checkout.tsx             # Order checkout
│   │   │   ├── Profile.tsx              # User profile & orders
│   │   │   └── admin/
│   │   │       ├── ProductList.tsx       # Admin product list
│   │   │       ├── ProductEdit.tsx       # Edit product
│   │   │       ├── ProductCreate.tsx     # Create product
│   │   │       └── OrderList.tsx         # Admin order list
│   │   ├── App.tsx               # Router configuration
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Tailwind imports
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** (or yarn/pnpm)

### 1. Clone the repository

```bash
git clone https://github.com/jeeviethofficial-crypto/mern-ecommerce.git
cd mern-ecommerce
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

| Variable       | Description                          | Default                 |
| -------------- | ------------------------------------ | ----------------------- |
| `PORT`         | Backend server port                  | `5000`                  |
| `MONGO_URI`    | MongoDB connection string            | (required)              |
| `JWT_SECRET`   | Secret key for signing JWT tokens    | `fallback_secret`       |
| `FRONTEND_URL` | Allowed CORS origin for the frontend | `http://localhost:5173` |

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Seed the admin account (optional)

```bash
cd ../backend
npm run seed
```

This creates an admin user with the following credentials:

> **Email:** admin@eshop.com  
> **Password:** Admin@123

### 6. Start the development servers

**Backend** (from `backend/`):

```bash
npm run dev
```

The API server starts at `http://localhost:5000`.

**Frontend** (from `frontend/` in a separate terminal):

```bash
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.

---

## 🔗 API Endpoints

### Products

| Method | Endpoint                       | Description             | Access  |
| ------ | ------------------------------ | ----------------------- | ------- |
| GET    | `/api/products`                | Get all active products | Public  |
| GET    | `/api/products?keyword=search` | Search products         | Public  |
| GET    | `/api/products/:id`            | Get single product      | Public  |
| POST   | `/api/products/:id/reviews`    | Add a review            | Private |
| GET    | `/api/products/admin/all`      | Get all products        | Admin   |
| POST   | `/api/products`                | Create a product        | Admin   |
| PUT    | `/api/products/:id`            | Update a product        | Admin   |
| DELETE | `/api/products/:id`            | Delete a product        | Admin   |

### Users

| Method | Endpoint              | Description      | Access  |
| ------ | --------------------- | ---------------- | ------- |
| POST   | `/api/users/register` | Register a user  | Public  |
| POST   | `/api/users/login`    | Login user       | Public  |
| GET    | `/api/users/profile`  | Get user profile | Private |

### Orders

| Method | Endpoint                  | Description               | Access  |
| ------ | ------------------------- | ------------------------- | ------- |
| POST   | `/api/orders`             | Create new order          | Private |
| GET    | `/api/orders/myorders`    | Get logged-in user orders | Private |
| GET    | `/api/orders/:id`         | Get order by ID           | Private |
| GET    | `/api/orders`             | Get all orders            | Admin   |
| PUT    | `/api/orders/:id/deliver` | Mark order as delivered   | Admin   |

### Health

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

---

## 🔐 Admin Panel

Once logged in with an **admin account**, admin navigation links appear in the header.

| Route                     | Description          |
| ------------------------- | -------------------- |
| `/admin/products`         | Manage all products  |
| `/admin/product/new`      | Create a product     |
| `/admin/product/:id/edit` | Edit a product       |
| `/admin/orders`           | View & manage orders |

---

## 🌱 Seeding the Database

To seed an admin account into the database:

```bash
cd backend
npm run seed
```

**Requirements:** `MONGO_URI` must be set in `backend/.env`.

The script checks for an existing admin account before creating one.

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

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
