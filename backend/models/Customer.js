const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Active'
  },
  subscription_status: {
    type: String,
    default: 'pending'
  },
  stripe_customer_id: {
    type: String
  },
  stripe_subscription_id: {
    type: String
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);
