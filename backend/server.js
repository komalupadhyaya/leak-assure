require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

// --- STRICT ENVIRONMENT VALIDATION ---
const requiredEnv = [
    'MONGO_URI',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'JWT_SECRET'
];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: ${env} is not defined in environment variables.`);
        process.exit(1);
    }
});

// Import Routes
const signupRoutes = require('./routes/signup.routes');
const stripeRoutes = require('./routes/stripe.routes');
const claimRoutes = require('./routes/claim.routes');
const memberRoutes = require('./routes/member.routes');
const phase3AdminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const memberPortalRoutes = require('./routes/memberPortal.routes');
const vendorRoutes = require('./routes/vendor.routes');

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors({
    origin: [
        'https://admin.leakassure.com',
        'https://signup.leakassure.com',
        'https://member.leakassure.com',
        ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:8080'])
    ],
    credentials: true
}));

const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

// Mount Stripe routes BEFORE express.json() to allow raw body for webhooks
app.use('/api/stripe', stripeRoutes);

app.use(express.json());

// Apply limiters
app.use('/api/auth', authLimiter);
app.use('/api/signup', authLimiter);
app.use('/api/admin', generalLimiter);
app.use('/api/member', generalLimiter);
app.use('/api/members', generalLimiter);
app.use('/api/claims', generalLimiter);
app.use('/api/vendors', generalLimiter);



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

const adminAuth = require('./middleware/adminAuth.middleware');
const adminAuthRoutes = require('./routes/adminAuth.routes');

// Routes
app.use('/api/signup', signupRoutes);
app.use('/api/admin', adminAuthRoutes); // Public admin login
app.use('/api/admin/ph3', adminAuth, phase3AdminRoutes); // Protected Admin Dash Stats
app.use('/api/claims', adminAuth, claimRoutes);
app.use('/api/members', adminAuth, memberRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/member', memberPortalRoutes);
app.use('/api/vendors', adminAuth, vendorRoutes);

// Base Route for testing
app.get('/', (req, res) => {
    res.send('Leak Assure Backend is Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});