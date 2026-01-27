const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now to avoid issues with inline scripts/styles if any
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

// Routes Configuration
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', require('./routes/budgets'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Expense Tracker API is running');
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
