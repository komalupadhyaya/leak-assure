const mongoose = require('mongoose');
const User = require('../models/User');
const emailService = require('../services/email.service');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function testTemplate() {
    if (!MONGO_URI) {
        console.error('MONGO_URI missing');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('--- Testing Enrollment Email Template ---');

    // Create a mock user
    const testEmail = 'komalsoftiatric@gmail.com'; // Using your email for both to be safe
    const mockUser = new User({
        fullName: 'Test Template User',
        email: testEmail,
        phone: '1234567890',
        serviceAddress: '123 Leak Lane, Water City',
        plan: 'premium',
        planPrice: 49,
        activatedAt: new Date(),
        waitingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        role: 'member',
        subscriptionStatus: 'active',
        confirmationEmailSent: false
    });

    console.log('Mock user prepared for plan:', mockUser.plan);

    try {
        console.log('Triggering emailService.sendEnrollmentConfirmationEmail...');
        await emailService.sendEnrollmentConfirmationEmail(mockUser);
        console.log('✅ Success: Email triggered.');
    } catch (err) {
        console.error('❌ Error triggering email:', err);
    }

    mongoose.connection.close();
}

testTemplate();
