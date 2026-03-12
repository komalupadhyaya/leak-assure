const { z } = require('zod');
const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Zod validation schema
const signupSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    serviceAddress: z.string().min(1, 'Service address is required'),
    plan: z.enum(['essential', 'premium'], {
        errorMap: () => ({ message: 'Plan must be essential or premium' }),
    }),
    smsOptIn: z.boolean().optional().default(false),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

exports.startSignup = async (req, res) => {
    // 1. Validate request body
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors;
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { fullName, email, phone, serviceAddress, plan, smsOptIn, password } = parseResult.data;

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
        // 3. Find or create Strconfiguredipe customer
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

        // 4. Save preliminary user record BEFORE checkout
        console.log("Creating checkout session for:", email);

        const createdAt = new Date();
        const waitingPeriodEnd = new Date(createdAt);
        waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + 30);

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            phone,
            serviceAddress,
            plan,
            smsOptIn,
            password: hashedPassword,
            role: 'member', // Force role to member
            forcePasswordChange: false,
            stripeCustomerId,
            subscriptionStatus: 'pending',
            waitingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt,
        });

        await user.save();
        console.log('User record saved with pending status:', user._id);

        // 5. Create Stripe Checkout Session
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
            success_url: `${process.env.FRONTEND_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/`,
            metadata: {
                email: email,
                plan: plan,
                userId: user._id.toString()
            }
        });

        console.log('Stripe checkout session created:', session.id);

        // Update user with session ID for tracking
        user.stripeSessionId = session.id;
        await user.save();

        // 6. Return checkout URL
        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Stripe session creation failed:', error);
        return res.status(500).json({ error: 'Stripe session creation failed' });
    }
};
