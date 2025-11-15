const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://rahulrajkosta:b7SRzCuVSK3Tbc3G@cluster0.qclzrb4.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB; 