const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

const sendSMS = async (to, body) => {
    try {
        if (!client) {
            console.log(`[SMS LOG] To: ${to} | Body: ${body}`);
            return;
        }
        await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

exports.sendClaimStatusUpdateSMS = (phone, status) => {
    const body = `Leak Assure: Your claim status has been updated to ${status}. Log in to view details.`;
    sendSMS(phone, body);
};

exports.sendServiceScheduledSMS = (phone, date, vendor) => {
    const body = `Leak Assure: A service visit from ${vendor} has been scheduled for ${date}.`;
    sendSMS(phone, body);
};
