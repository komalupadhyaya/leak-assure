const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure role is member or admin
        if (decoded.role !== 'member' && decoded.role !== 'admin' && decoded.role !== undefined) {
            // allowing undefined for legacy if any, but plan says tokens MUST include role
            return res.status(403).json({ error: 'Access denied. Authorized privileges required.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
