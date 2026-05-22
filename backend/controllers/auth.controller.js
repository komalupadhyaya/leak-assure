const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

exports.register = async (req, res) => {
    try {
        const { email, password, fullName, phone, serviceAddress, plan } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.password) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        let isNewSignup = false;

        if (existingUser) {
            // Update existing record (e.g. from Stripe checkout)
            existingUser.password = hashedPassword;
            user = await existingUser.save();
        } else {
            // Create new record
            user = new User({
                email,
                password: hashedPassword,
                fullName,
                phone,
                serviceAddress,
                plan,
                subscriptionStatus: 'pending'
            });
            await user.save();
            isNewSignup = true;
        }

        // Send Welcome Email for new signups
        try {
            await emailService.sendSignupConfirmation(user.email, user.fullName);
        } catch (emailErr) {
            console.error('Failed to send welcome email during registration:', emailErr.message);
        }

        // Notify Admin of new registration
        try {
            await emailService.sendNewMemberAdminNotification(user);
        } catch (adminErr) {
            console.error('Failed to send admin notification during registration:', adminErr.message);
        }


        // Generate token with role
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'member' }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role || 'member' } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        console.log(`[DEBUG LOGIN] Email: ${email}, User found: ${!!user}, Status: ${user?.subscriptionStatus}`);

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Prevent admin login through member portal
        if (user.role !== 'member') {
            return res.status(403).json({
                error: 'Access denied. Admin users must use the admin portal.'
            });
        }

        // Prevent login if subscription is canceled
        if (user.subscriptionStatus === 'canceled') {
            return res.status(403).json({ error: 'Your subscription is canceled.' });
        }

        // Allow 'active' and 'pending' statuses to login
        if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'pending') {
            return res.status(403).json({ error: 'Please complete your payment to activate your account.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'member' }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role || 'member',
                forcePasswordChange: user.forcePasswordChange
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};

exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.id, {
            password: hashedPassword,
            forcePasswordChange: false
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

