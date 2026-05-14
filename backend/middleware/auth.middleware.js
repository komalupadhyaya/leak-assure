const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

module.exports = (req, res, next) => {
    // Read from httpOnly cookie first, fallback to Authorization header
    const token = req.cookies?.token || (req.headers.authorization?.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure role is member or admin
        if (decoded.role !== 'member' && decoded.role !== 'admin' && decoded.role !== undefined) {
            return res.status(403).json({ error: 'Access denied. Authorized privileges required.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
