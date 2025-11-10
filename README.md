# 🚀 Real-Time Order Delivery System

A modern, real-time order delivery management system with separate interfaces for users, delivery partners, and administrators. Built with React, Node.js, Express, MongoDB, and Socket.io for real-time updates.
- Video Demo: https://drive.google.com/file/d/18zfuHwIwcuB-ZzGfxsfi_9udq20A81oJ/view?usp=sharing
- Frontend: https://delivery-system-1-i9dc.onrender.com
- Backend:  https://delivery-system-backend-4w4v.onrender.com 

## 📋 Project Overview

The Real-Time Order Delivery System is a full-stack web application that facilitates seamless order management and delivery tracking. The system supports three types of users:

- **Users**: Browse products, place orders, track deliveries in real-time, and manage their cart
- **Delivery Partners**: Accept orders, update delivery status, and manage assigned deliveries
- **Admins**: Monitor all orders, manage users and partners, and oversee the entire system

### Key Features

- 🔐 JWT-based authentication with role-based access control
- 🔄 Real-time order status updates using Socket.io
- 🛒 Shopping cart management with Zustand state management
- 📦 Order tracking and management
- 👥 User and partner management for admins
- 🐳 Fully containerized with Docker
- 🌐 Nginx reverse proxy for efficient routing
- 📱 Responsive UI built with React and Tailwind CSS

## 🏗️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     User     │  │   Partner    │  │    Admin     │          │
│  │  Interface   │  │  Interface   │  │  Dashboard   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            │                                   │
│                   ┌────────▼────────┐                          │
│                   │  React Frontend │                          │
│                   │  (Vite + TS)    │                          │
│                   └────────┬────────┘                          │
└────────────────────────────┼───────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Nginx Reverse  │
                    │     Proxy       │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
    │   HTTP    │    │  WebSocket  │   │   Static    │
    │    API    │    │   Socket.io │   │   Assets    │
    └─────┬─────┘    └──────┬──────┘   └─────────────┘
          │                  │
          └──────────────────┘
                    │
          ┌─────────▼─────────┐
          │   Express Server  │
          │    (Node.js)      │
          │                   │
          │  ┌─────────────┐  │
          │  │   Routes    │  │
          │  ├─────────────┤  │
          │  │ Controllers │  │
          │  ├─────────────┤  │
          │  │ Middleware  │  │
          │  ├─────────────┤  │
          │  │ Validations │  │
          │  └─────────────┘  │
          └─────────┬─────────┘
                    │
          ┌─────────▼─────────┐
          │     MongoDB       │
          │    (Database)     │
          │                   │
          │  Collections:     │
          │  • Users          │
          │  • Partners       │
          │  • Admins         │
          │  • Orders         │
          │  • Deliveries     │
          │  • BlacklistTokens│
          └───────────────────┘
```

## 🛠️ Stack Used

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Animations**: Motion (Framer Motion)
- **Real-time**: Socket.io Client
- **Icons**: Lucide React, Radix Icons
- **Validation**: Zod
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod + express-validator
- **Real-time**: Socket.io v4
- **CORS**: cors middleware
- **Environment**: dotenv

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **Development**: Nodemon (backend), Vite HMR (frontend)
- **API Testing**: Postman (collection included)
- **Linting**: ESLint

## 📁 Folder Structure

```
Real-Time-Order-Delivery-System/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, fonts, etc.
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # Reusable UI components (buttons, cards, etc.)
│   │   │   ├── _admin/              # Admin-specific components
│   │   │   ├── _partner/            # Partner-specific components
│   │   │   ├── _user/               # User-specific components
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── OffersCard.tsx
│   │   │   ├── Products.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/                 # State management (Zustand stores)
│   │   │   ├── useCartStore.ts      # Shopping cart state
│   │   │   └── useUserStore.ts      # User authentication state
│   │   ├── lib/                     # Utility functions
│   │   │   ├── socket.ts            # Socket.io client configuration
│   │   │   └── utils.ts             # Helper functions
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── AdminHome.tsx
│   │   │   │   ├── AdminProfile.tsx
│   │   │   │   ├── OrdersList.tsx
│   │   │   │   ├── PartnersList.tsx
│   │   │   │   └── UsersList.tsx
│   │   │   ├── partner/             # Partner pages
│   │   │   │   ├── PartnerHome.tsx
│   │   │   │   └── PartnerOrders.tsx
│   │   │   ├── user/                # User pages
│   │   │   │   ├── UserCart.tsx
│   │   │   │   ├── UserHome.tsx
│   │   │   │   └── UserOrders.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── App.tsx                  # Main App component
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── components.json              # shadcn/ui configuration
│   ├── Dockerfile                   # Frontend Docker configuration
│   ├── nginx.conf                   # Nginx config for frontend
│   ├── package.json                 # Frontend dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── vite.config.ts               # Vite configuration
│   └── README.md                    # Client documentation
│
├── server/                          # Backend Node.js Application
│   ├── controllers/                 # Request handlers
│   │   ├── admin.controller.js      # Admin operations
│   │   ├── delivery.controller.js   # Delivery management
│   │   ├── map.controller.js        # Map/location services
│   │   ├── partner.controller.js    # Partner operations
│   │   └── user.controller.js       # User operations
│   ├── db/
│   │   └── db.js                    # Database connection
│   ├── middlewares/
│   │   └── auth.middleware.js       # JWT authentication
│   ├── models/                      # Mongoose schemas
│   │   ├── admin.model.js
│   │   ├── BlacklistToken.model.js  # Token revocation
│   │   ├── delivery.model.js
│   │   ├── order.model.js
│   │   ├── partner.model.js
│   │   └── user.model.js
│   ├── routes/                      # API route definitions
│   │   ├── admin.routes.js
│   │   ├── partner.routes.js
│   │   └── user.routes.js
│   ├── validations/                 # Input validation schemas
│   │   ├── admin.validation.js
│   │   ├── order.validation.js
│   │   ├── partner.validation.js
│   │   └── user.validation.js
│   ├── app.js                       # Express app configuration
│   ├── server.js                    # Server entry point
│   ├── socket.js                    # Socket.io configuration
│   ├── seed-admin.js                # Admin seeding script
│   ├── Dockerfile                   # Backend Docker configuration
│   ├── docker-compose.yml           # Local development compose
│   ├── package.json                 # Backend dependencies
│   ├── Real-Time-Order-Delivery-System.postman_collection.json
│   └── Real-Time-Order-Delivery-System-Local.postman_environment.json
│
├── docker-compose.yml               # Production Docker Compose
├── nginx.conf                       # Root Nginx reverse proxy config
└── README.md                        # This file

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- Docker & Docker Compose (for containerized deployment)


### Docker Deployment

#### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at http://localhost

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/dmelloaries/Delivery-System.git
cd Real-Time-Order-Delivery-System
```

#### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/delivery-system
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run the admin seeder:

```bash
node seed-admin.js
```

Start the server:

```bash
npm start
```

#### 3. Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### Default Admin Credentials

After running the seed script, use these credentials to login as admin:

- **Email**: admin@gmail.com
- **Password**: admin123

## 📡 API Documentation

Import the Postman collection and environment files from the `server/` directory:
- `Real-Time-Order-Delivery-System.postman_collection.json`
- `Real-Time-Order-Delivery-System-Local.postman_environment.json`

## 🔌 Real-Time Events

The system uses Socket.io for real-time updates:

- `order:created` - New order placed
- `order:updated` - Order status changed
- `order:assigned` - Order assigned to partner
- `delivery:updated` - Delivery status updated
- `delivery:completed` - Delivery completed



Made by dmelloaries
