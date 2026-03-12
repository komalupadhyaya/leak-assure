const mongoose = require('mongoose');
const User = require('../models/User');
const emailService = require('../services/email.service');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function verifyEnvConfig() {
    if (!MONGO_URI) {
        console.error('MONGO_URI missing');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('--- Verifying Email Environment Configuration ---');
    console.log('EMAIL_RECEIVER:', process.env.EMAIL_RECEIVER);
    console.log('MEMBER_PORTAL:', process.env.MEMBER_PORTAL);

    // Mock user
    const mockUser = {
        fullName: 'Env Test User',
        email: 'test@example.com',
        phone: '1234567890',
        serviceAddress: 'Env Var Ave',
        plan: 'essential',
        planPrice: 29,
        activatedAt: new Date(),
        waitingPeriodEnd: new Date(),
        role: 'member'
    };

    console.log('\nSimulating development environment (NODE_ENV != production)...');
    process.env.NODE_ENV = 'development';
    try {
        // We catch the error because Resend might still reject it if the domain isn't verified, 
        // but we want to see the logs from emailService
        await emailService.sendEnrollmentConfirmationEmail(mockUser);
    } catch (err) {
        console.log('Email delivery attempt logged (expected rejection if domain not verified).');
    }

    console.log('\nSimulating production environment (NODE_ENV = production)...');
    process.env.NODE_ENV = 'production';
    try {
        await emailService.sendEnrollmentConfirmationEmail(mockUser);
    } catch (err) {
        console.log('Email delivery attempt logged.');
    }

    mongoose.connection.close();
    console.log('\nVerification complete. Check console logs above for recipient and URL correctness.');
}

verifyEnvConfig();
