const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

const adminAuth = async (req, res, next) => {
    try {
        // 1. Get token from cookie or header
        const token = req.cookies?.admin_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Check role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        }

        // 4. Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = adminAuth;
