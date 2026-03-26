const Affiliate = require('../models/Affiliate');

/**
 * Reads ?ref=<referralCode> from the query string.
 * If a valid affiliate is found, sets req.affiliateRef = affiliate doc.
 * Also reads la_ref from cookies as fallback.
 */
module.exports = async (req, res, next) => {
    try {
        const refCode = req.query.ref || (req.cookies && req.cookies.la_ref);
        if (!refCode) return next();

        const affiliate = await Affiliate.findOne({ referralCode: refCode, status: 'approved' });
        if (affiliate) {
            req.affiliateRef = affiliate;
            // Set/refresh persistent cookie if ref is in query
            if (req.query.ref) {
                res.cookie('la_ref', refCode, {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }
        }
    } catch (err) {
        console.error('[ReferralTracker] Error:', err.message);
    }
    next();
};
