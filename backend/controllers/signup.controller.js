const { z } = require('zod');
const Stripe = require('stripe');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const bcrypt = require('bcryptjs');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const { validateAddress } = require('../services/addressValidation.service');

// Zod validation schema
const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    serviceAddress: z.string().min(1, 'Service address is required'),
    plan: z.enum(['essential', 'premium'], {
        errorMap: () => ({ message: 'Plan must be essential or premium' }),
    }),
    smsOptIn: z.boolean().optional().default(false),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

exports.startSignup = async (req, res) => {
    // 1. Validate request body
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors;
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { firstName, lastName, email, phone, serviceAddress, plan, smsOptIn, password, latitude, longitude } = parseResult.data;
    const fullName = `${firstName} ${lastName}`;

    // 1.2 Validate address via Google Address Validation API
    const validation = await validateAddress(serviceAddress);
    if (!validation.isValid) {
        return res.status(400).json({ 
            error: 'Address validation failed', 
            details: { serviceAddress: [validation.error] } 
        });
    }

    // 1.5. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            error: 'This email is already registered. Please log in.'
        });
    }

    // 2. Resolve Stripe price ID
    let priceId;
    if (plan === 'essential') {
        priceId = process.env.STRIPE_ESSENTIAL_PRICE_ID;
    } else if (plan === 'premium') {
        priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    }

    if (!priceId) {
        console.error('Price ID not configured for plan:', plan);
        return res.status(500).json({ error: 'Server configuration error: price ID not found' });
    }

    try {
        // 3. Find or create Stripe customer
        let stripeCustomerId;
        const existingCustomers = await stripe.customers.list({ email, limit: 1 });

        if (existingCustomers.data.length > 0) {
            stripeCustomerId = existingCustomers.data[0].id;
            console.log('Found existing Stripe customer:', stripeCustomerId);
        } else {
            const newCustomer = await stripe.customers.create({
                email,
                name: fullName,
                phone,
            });
            stripeCustomerId = newCustomer.id;
            console.log('Created new Stripe customer:', stripeCustomerId);
        }

        // 4. Hash the password BEFORE checkout so we can store it in metadata securely
        const hashedPassword = await bcrypt.hash(password, 10);
        const refCode = req.body.ref || (req.cookies && req.cookies.la_ref) || '';

        console.log("Creating Stripe checkout session for:", email);

        // 5. Create Stripe Checkout Session with all user details in metadata
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_SIGNUP_URL || 'https://signup.leakassure.com'}/welcome?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_SIGNUP_URL || 'https://signup.leakassure.com'}/`,
            metadata: {
                firstName,
                lastName,
                fullName,
                email,
                phone,
                serviceAddress: validation.formattedAddress || serviceAddress,
                addressStreet: validation.components?.street || '',
                addressCity: validation.components?.city || '',
                addressState: validation.components?.state || '',
                addressZip: validation.components?.zip || '',
                addressCountry: validation.components?.country || 'US',
                plan,
                smsOptIn: smsOptIn ? 'true' : 'false',
                passwordHash: hashedPassword,
                refCode: refCode
            }
        });

        console.log('Stripe checkout session created:', session.id);

        // 6. Return checkout URL
        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Stripe session creation failed:', error);
        return res.status(500).json({ error: 'Stripe session creation failed' });
    }
};
