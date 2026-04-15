# MoneyMind AI

A complete, modern, production-ready Money Management Web App.

## Features

- **Dashboard**: Track income, expenses, net balance, and savings goal percentage with beautiful Recharts components.
- **Transactions Management**: Full CRUD, pagination, filtering, exporting (CSV) and bulk delete features.
- **Budgets**: Set and monitor monthly spending limits by category with visual progress bars.
- **Savings Goals**: Track savings with target amounts, visual feedback, and confetti animations when reached.
- **Udhari**: Manage lending and borrowing money seamlessly.
- **Reports**: Analyze your spending with 12-month trends and category breakdowns. PDF export available.
- **Settings**: Change personal info, theme (Dark/Light/System), and manage passwords securely.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion, Context API
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Security**: JWT via httpOnly cookies, bcrypt hashing, Helmet, Express Rate Limiter.

## Getting Started

1. Set up MongoDB URI in `/server/.env` (Current setup uses placeholder variable `MONGO_URI` that should be configured properly).
2. Ensure you have Node.js installed.
3. In the root directory, run `npm install`. This will automatically set up `concurrently`.
4. Install backend dependencies: `cd server && npm install`.
5. Install frontend dependencies: `cd client && npm install`.
6. Go back to root and start the application: `npm run dev`.

App will be available at `http://localhost:5173`.
Backend will be available at `http://localhost:5000`.

*Built by Antigravity.*
