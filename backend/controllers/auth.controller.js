const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

        // Prevent login if subscription is not active
        if (user.subscriptionStatus !== 'active') {
            const message = user.subscriptionStatus === 'canceled'
                ? 'Your subscription is canceled.'
                : 'Please complete your payment to activate your account.';
            return res.status(403).json({ error: message });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'member' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
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

