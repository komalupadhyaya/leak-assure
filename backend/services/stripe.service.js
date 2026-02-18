const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const createCheckoutSession = async (customerData, priceId) => {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: customerData.email,
        client_reference_id: customerData.userId, // Link to our DB customer
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        // Correct URL construction with port 5173 (Vite default)
        success_url: `http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:8080/cancel`, // Using /cancel to show message
    });

    return session;
};

const verifySession = async (sessionId) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
};

module.exports = {
    createCheckoutSession,
    verifySession,
    stripe
};
