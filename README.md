# Atelier - Payment Management System

This branch contains the **Payment Management** module for the Atelier Ecommerce application. The project has been isolated to include only the core components, routes, and logic related to payment processing, transaction logging, and admin settlement management.

## 🚀 Features

### 💳 For Customers
- **Secure Checkout**: Integrated payment flow with card and Cash on Delivery (COD) options.
- **Payment Methods**: Ability to save and manage multiple payment methods.
- **Order Confirmation**: Real-time feedback after successful transaction authorization.

### 📊 For Admins
- **Transaction Clearing**: A dedicated dashboard to monitor all incoming payments and settlements.
- **Refund Processing**: One-click refund initiation with status tracking.
- **Audit Logs**: Detailed logs for every transaction, including customer details, date, method, and purchased items.
- **Settlement Metrics**: High-level overview of total revenue and transaction counts.

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo), React Navigation, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Payment Integration**: Stripe API.
- **Security**: JWT Authentication, Bcrypt password hashing.

## 📂 Project Structure (Isolated)

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Payment, Order, and User controllers
│   ├── models/          # Mongoose models (Order, User, Cart)
│   ├── routes/          # API Route definitions
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── screens/     # Payment & Management screens
    │   ├── context/     # State management (Admin, User, Shop)
    │   └── config/      # API configurations
    └── App.js           # Navigation setup
```

## ⚙️ Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## 📝 Note
This module is part of a larger Ecommerce system but has been decoupled for specialized development on the **Payment Management** feature set.
