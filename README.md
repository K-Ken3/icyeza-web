# Flame & Fork — Restaurant Ordering Platform

A production-quality restaurant website and online ordering platform for a modern
restaurant in Kigali, Rwanda. Mobile-first food ordering with full cart, checkout,
payment architecture, accounts, favorites, order tracking, and an admin dashboard.

**Tech stack**

- **Frontend:** React, Vite, Tailwind CSS, React Router, Framer Motion, Axios, Lucide
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt

---

## Features

- Homepage with hero, featured products, deals, "how it works", locations
- Full menu with category tabs, search, price/popularity/rating filters, veg/spicy/deal filters
- Product details with size/sauce/extras customization and allergen info
- Cart (drawer + page) with quantities, options and totals
- Multi-step checkout: info → delivery method → address → payment → review
- Payments: Mobile Money, Visa/Mastercard, Cash on Delivery, Cash on Pickup
  (Flutterwave-ready service abstraction; works in demo mode without keys)
- Order confirmation + live order tracking timeline
- Auth: register, login, forgot password (JWT, protected routes)
- Customer dashboard: overview, order history, reorder, favorites, profile
- Admin dashboard: stats, order management with status changes, product overview
- RWF currency, local phone validation, local address fields (province/district/sector/landmark)
- Loading skeletons, empty/error states, toasts, micro-interactions
- SEO: meta tags, Open Graph, robots.txt, sitemap.xml, structured data
- Demo seed data: 20 products, 9 categories, 3 locations, sample accounts

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

---

## Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend `.env`**

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLIENT_URL` | Frontend origin for CORS |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key (optional) |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key (optional) |
| `FLUTTERWAVE_WEBHOOK_HASH` | Flutterwave webhook hash (optional) |

**Frontend `.env`**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key (optional) |

> Never commit `.env` files. Never expose `JWT_SECRET` or `FLUTTERWAVE_SECRET_KEY`
> in the frontend.

---

## MongoDB Setup

1. Ensure MongoDB is running locally:
   ```bash
   mongod
   ```
2. The default connection string is `mongodb://127.0.0.1:27017/flame_fork`.
   Override with `MONGO_URI` in `backend/.env` if needed.

---

## Seed the Demo Data

From the backend directory:

```bash
npm run seed
```

Seeds: 20 products, 9 categories, 3 locations, and two demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@flameandfork.rw` | `admin123` |
| Customer | `customer@flameandfork.rw` | `customer123` |

---

## Running the App

**Backend (terminal 1)**

```bash
cd backend
npm run dev
```

**Frontend (terminal 2)**

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Payment Setup

Payments work in **demo mode** out of the box: orders place successfully and mobile
money / card payments create a pending payment reference without hitting a real
provider.

To connect Flutterwave:

1. Set `FLUTTERWAVE_SECRET_KEY` in `backend/.env`.
2. (Optional) Set `FLUTTERWAVE_PUBLIC_KEY` in `frontend/.env`.
3. Configure the webhook endpoint `POST /api/payments/webhook` in your
   Flutterwave dashboard for the production URL.

All payment provider logic is isolated in `backend/services/paymentService.js` —
swap the mock implementation for your real integration there.

---

## Project Structure

```
frontend/
  src/
    components/   # Reusable UI (Button, ProductCard, CartDrawer, Skeleton, ...)
    pages/        # Route-level pages
    pages/account # Customer dashboard
    pages/admin   # Admin dashboard
    layouts/      # Main + account layouts
    context/      # Auth, Cart, Toast providers
    services/     # Axios API clients
    hooks/        # Shared hooks
    utils/        # Formatters & helpers
    App.jsx       # Router
    main.jsx

backend/
  controllers/    # Request handlers
  models/         # Mongoose models (User, Product, Category, Order, Location)
  routes/         # Express routes
  middleware/     # Auth, error handling
  services/       # Payment abstraction
  config/         # Env config
  seeds/          # Demo data seeder
  server.js
```

---

## API Reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/forgot-password` | — | Send reset link |
| GET | `/api/products` | — | List/search/filter products |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | List categories |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders` | User/Admin | List orders |
| GET | `/api/orders/:id` | User/Admin | Order detail |
| PUT | `/api/orders/:id/status` | Admin | Change order status |
| POST | `/api/payments/create` | User | Create payment |
| POST | `/api/payments/webhook` | — | Payment webhook |
| GET | `/api/users/profile` | User | Get profile |
| PUT | `/api/users/profile` | User | Update profile |
| GET | `/api/users/favorites` | User | List favorites |
| POST | `/api/users/favorites` | User | Add favorite |
| DELETE | `/api/users/favorites/:productId` | User | Remove favorite |
| GET | `/api/locations` | — | List locations |
| GET | `/api/admin/stats` | Admin | Dashboard stats |

---

## Development Commands

```bash
# Backend
cd backend
npm run dev      # start with nodemon
npm start        # start with node
npm run seed     # reset + seed demo data

# Frontend
cd frontend
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
```

---

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in the environment.
2. Use a real MongoDB (Atlas) URI and a strong `JWT_SECRET`.
3. Deploy to any Node host (Render, Railway, Fly, DigitalOcean, etc.).
4. Configure CORS `CLIENT_URL` to your production frontend URL.

### Frontend

1. `npm run build` outputs static files to `frontend/dist`.
2. Set `VITE_API_URL` to your deployed backend URL before building.
3. Serve `dist` from any static host (Netlify, Vercel, Nginx, etc.).
4. Add a SPA rewrite so all routes fall back to `index.html`.

---

## License

MIT