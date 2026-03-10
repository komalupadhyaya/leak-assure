require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const email = 'admin@gmail.com';
        const password = 'Password123'; // You should change this later
        const fullName = 'System Administrator';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingAdmin) {
            console.log('Admin user already exists. Updating credentials...');
            existingAdmin.role = 'admin';
            existingAdmin.password = hashedPassword;
            existingAdmin.forcePasswordChange = false;
            await existingAdmin.save();
            console.log('Admin credentials updated.');
            process.exit(0);
        }

        const adminUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone: '000-000-0000',
            serviceAddress: 'System HQ',
            plan: 'premium', // Default just in case
            subscriptionStatus: 'active',
            role: 'admin',
            forcePasswordChange: false
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
