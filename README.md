# Expense Tracker App

A full-stack expense tracker application built with React, Node.js, Express, and MongoDB.

## Features
- User Authentication (JWT & Google OAuth)
- Expense Management (Add, Edit, Delete)
- Budgeting and Visualization
- Responsive Design

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### Installation
1. Clone the repository.
2. Install dependencies for both client and server:
   ```bash
   npm run install-all
   ```

### Configuration
1. Create `.env` files in both `client` and `server` directories based on the provided `.env.example` files.

### Development
To run both the server and client in development mode (using concurrently):
```bash
npm run dev
```

### Deployment

#### 1. Build the Client
```bash
npm run build
```
This will create a `dist` folder in the `client` directory.

#### 2. Start the Server
```bash
npm start
```
The server is configured to serve the client's static files when `NODE_ENV=production`.

## Environment Variables

### Server (`/server/.env`)
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `NODE_ENV`: Set to `production` for live deployment
- `CLIENT_URL`: URL of your frontend (e.g., `https://your-app.vercel.app`)

### Client (`/client/.env`)
- `VITE_API_BASE_URL`: Base URL for the API (e.g., `https://your-api.com/api` or `/api` if hosted on same domain)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID
