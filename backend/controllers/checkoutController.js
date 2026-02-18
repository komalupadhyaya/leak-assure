const stripeService = require('../services/stripe.service');
const Customer = require('../models/Customer');

exports.createSession = async (req, res) => {
  try {
    const { fullName, email, phone, address, plan } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !phone || !address || !plan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 2. Determine Stripe price ID
    let priceId;
    if (plan === 'plan_a') {
      priceId = process.env.STRIPE_PLAN_A_PRICE_ID;
    } else if (plan === 'plan_b') {
      priceId = process.env.STRIPE_PLAN_B_PRICE_ID;
    } else {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!priceId) {
      console.error("Price ID not found for plan:", plan);
      return res.status(500).json({ error: 'Server configuration error: Price ID not found' });
    }

    console.log("Creating checkout session for:", email, "Plan:", plan, "PriceID:", priceId);

    // 3. Save customer in MongoDB first to get ID
    const newCustomer = new Customer({
      fullName,
      email,
      phone,
      address,
      plan,
      subscription_status: 'pending'
    });

    await newCustomer.save();

    // 4. Create Stripe Checkout Session
    // Pass userId to linked with client_reference_id
    const customerData = {
      email,
      userId: newCustomer._id.toString()
    };

    const session = await stripeService.createCheckoutSession(customerData, priceId);

    console.log("Stripe session created:", session.id);

    // 5. Return URL
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'Session ID required' });

    console.log("Verifying session:", session_id);
    const session = await stripeService.verifySession(session_id);

    if (session.payment_status === 'paid') {
      const customerId = session.client_reference_id;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      if (customerId) {
        await Customer.findByIdAndUpdate(customerId, {
          subscription_status: 'active',
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'Active' // Ensure main status is also Active
        });
        console.log("Customer updated to active:", customerId);
      } else {
        console.warn("No client_reference_id found in session");
      }

      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
