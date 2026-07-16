# 🛒 MERN E-Commerce Platform

A full-stack e-commerce application built with the **MERN stack** (MongoDB, Express, React, Node.js) using TypeScript. Features a customer-facing storefront with product browsing, cart management, and checkout, plus a comprehensive admin panel for managing products and orders.

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
- [Scripts](#-scripts)
- [License](#-license)

---

## ✨ Features

### Customer Features

- **Product Browsing** — View all active products with keyword search
- **Product Details** — View product info, ratings, and customer reviews
- **Shopping Cart** — Add/remove items, quantity management (persisted in `localStorage`)
- **User Authentication** — Register and login with JWT-based authentication
- **Checkout** — Place orders with shipping address, payment method, and price breakdown
- **Order History** — View past orders in the profile page
- **Responsive Design** — Fully responsive UI built with Tailwind CSS

### Admin Features

- **Product Management** — Create, edit, and delete products with full CRUD support
- **Order Management** — View all orders and mark orders as delivered
- **Role-Based Access Control** — Admin-only routes protected by dedicated middleware

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
| **Animation**   | Motion                                                       |

---

## 📁 Project Structure

```
mern-ecommerce/
├── client/                 # React frontend (TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── context/        # Global state (auth, cart, etc.)
│   │   ├── services/       # API service functions (Axios)
│   │   ├── types/          # Shared TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── server/                 # Express backend (TypeScript)
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

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server/` directory (see [Environment Variables](#-environment-variables) below).

5. **Run the development servers**

   In one terminal (backend):

   ```bash
   cd server
   npm run dev
   ```

   In another terminal (frontend):

   ```bash
   cd client
   npm run dev
   ```

6. **Open the app**

   Visit `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

Create a `.env` file inside the `server/` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

| Variable     | Description                                          |
| ------------ | ---------------------------------------------------- |
| `PORT`       | Port on which the Express server runs                |
| `MONGO_URI`  | MongoDB connection string (local or Atlas)           |
| `JWT_SECRET` | Secret key used to sign and verify JWTs              |
| `NODE_ENV`   | Application environment (`development`/`production`) |

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

> **Note:** Endpoint names above are illustrative — update this table to match your actual route definitions.

---

## 🧑‍💼 Admin Panel

The admin panel is accessible only to users with the `admin` role and includes:

- **Dashboard** — Overview of products and orders
- **Product Management** — Add, edit, and delete products
- **Order Management** — View all customer orders and update delivery status

Admin routes are protected via a role-based middleware that verifies the JWT and checks the user's role before granting access.

---

## 🌱 Seeding the Database

To populate the database with sample products and users, run the seed script from the `server/` directory:

```bash
npm run seed
```

This will insert sample product and admin user data into MongoDB, useful for local development and testing.

---

## 📜 Scripts

### Server

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the backend in development mode |
| `npm run build` | Compile TypeScript to JavaScript      |
| `npm start`     | Run the compiled production build     |
| `npm run seed`  | Seed the database with sample data    |

### Client

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build the frontend for production    |
| `npm run preview` | Preview the production build locally |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

Built with the MERN stack and TypeScript, styled with Tailwind CSS, and powered by MongoDB Atlas.
