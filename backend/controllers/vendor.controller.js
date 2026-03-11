const Vendor = require('../models/Vendor');

exports.createVendor = async (req, res) => {
    try {
        const vendor = new Vendor(req.body);
        await vendor.save();
        res.status(201).json(vendor);
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ name: 1 });
        res.json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
