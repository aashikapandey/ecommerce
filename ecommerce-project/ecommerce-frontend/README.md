# E-Commerce Frontend

React frontend for the Spring Boot E-Commerce Backend.

## Setup

```bash
npm install
npm start       # dev server at http://localhost:3000
npm run build   # production build
```

## Features
- Product catalog with search & filter by category
- Shopping cart with quantity management
- Order placement & order history
- Admin dashboard (stats, low stock alerts, API endpoints, Spring features)
- JWT authentication (sign in / register)

## Demo Credentials
- Admin: `admin@ecommerce.com` / `admin123`
- User: any email + password ≥ 6 chars (demo mode)

## API Integration
Set `API_BASE = "http://localhost:8080/api"` in `src/App.jsx`.
The app ships with mock data so it runs without a backend for development/demo.
