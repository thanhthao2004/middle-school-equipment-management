const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devices-service');
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('** Hướng dẫn: Cài đặt và chạy MongoDB:');
    console.log('   1. brew install mongodb-community (macOS)');
    console.log('   2. brew services start mongodb-community');
    console.log('   3. Hoặc tải MongoDB Compass và chạy local');
    process.exit(1);
  }
};

module.exports = connectDB;