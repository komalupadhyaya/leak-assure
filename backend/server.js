require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose directly here

// Import Routes
const checkoutRoutes = require('./routes/checkoutRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (Moved inside to fix the error) ---
const connectDB = async () => {
    try {
        // connect to mongodb
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

// Execute connection
connectDB();
// -----------------------------------------------------------

// Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Base Route for testing
app.get('/', (req, res) => {
    res.send('Leak Assure Backend is Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});