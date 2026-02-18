const Customer = require('../models/Customer');

exports.admin = (req, res) => {
  res.send('Admin endpoint');
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ date: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};
