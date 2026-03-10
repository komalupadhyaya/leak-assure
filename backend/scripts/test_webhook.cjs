const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env' });

const WEBHOOK_URL = `${process.env.BACKEND_URL}/api/stripe/webhook`;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function testWebhook() {
    console.log('--- Simulating Standardized checkout.session.completed ---');

    const payload = {
        id: 'evt_test_' + Date.now(),
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_' + Date.now(),
                customer: 'cus_TEST_WEBHOOK_123',
                subscription: 'sub_test_' + Date.now(),
                amount_total: 2900,
                metadata: {
                    email: 'test_standard_webhook@leakassure.com',
                    plan: 'essential'
                }
            }
        }
    };

    const payloadString = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `${timestamp}.${payloadString}`;
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(signaturePayload);
    const signature = hmac.digest('hex');
    const stripeSignature = `t=${timestamp},v1=${signature}`;

    try {
        console.log('Sending webhook to:', WEBHOOK_URL);
        const response = await axios.post(WEBHOOK_URL, payloadString, {
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': stripeSignature
            }
        });
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
    } catch (error) {
        console.error('Error sending webhook:', error.response ? error.response.data : error.message);
    }
}

testWebhook();
