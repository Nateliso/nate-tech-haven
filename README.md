# Nate's Tech Haven
A full-stack MERN e-commerce app for buying/renting tech products.

## Features
- User signup/login with JWT auth
- Product grid with add-to-cart (buy/rent)
- Cart view and checkout
- MongoDB backend with Express APIs

## Known Issues
- Visiting `/api/users/login` or `/api/users/signup` shows "Cannot GET /api/users/*" (404).
- Cause: Browser navigates to backend API URLs as frontend routes.
- Workaround: Use `/signup` or `/login` routes.
- TODO: Fix in production (e.g., nginx block `/api/*` GETs).

## Setup
1. `cd backend`, `npm install`, `node index.js`
2. `cd frontend`, `npm install`, `npm run dev`
3. Visit `localhost:5173`