const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This will use the MONGO_URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

// THIS LINE IS CRITICAL - DO NOT DELETE
module.exports = connectDB;