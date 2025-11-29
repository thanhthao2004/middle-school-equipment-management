/**
 * Script test kết nối MongoDB
 * Chạy: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config/env');

async function testConnection() {
  console.log('🔍 Kiểm tra cấu hình MongoDB...\n');
  
  // Kiểm tra config
  console.log('📋 Cấu hình từ env.js:');
  console.log('   MONGODB_URI:', config.mongodb.uri || '(chưa cấu hình)');
  console.log('   MONGODB_DB:', config.mongodb.dbName || '(chưa cấu hình)');
  console.log('');
  
  if (!config.mongodb.uri) {
    console.error('❌ Lỗi: MONGODB_URI chưa được cấu hình trong file .env');
    console.log('💡 Hãy thêm dòng sau vào file .env:');
    console.log('   MONGODB_URI=mongodb://127.0.0.1:27017/middle-school-equipment');
    process.exit(1);
  }
  
  console.log('🔌 Đang thử kết nối MongoDB...\n');
  
  try {
    const connectionOptions = {
      dbName: config.mongodb.dbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };
    
    await mongoose.connect(config.mongodb.uri, connectionOptions);
    
    console.log('✅ Kết nối MongoDB thành công!');
    console.log('');
    console.log('📊 Thông tin kết nối:');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('');
    
    // Test query đơn giản
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections trong database:');
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (Chưa có collection nào)');
    }
    console.log('');
    
    // Đóng connection
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
    console.log('');
    console.log('🎉 Tất cả đều hoạt động tốt!');
    
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:');
    console.error('   ', error.message);
    console.log('');
    console.log('💡 Hãy kiểm tra:');
    console.log('   1. MongoDB có đang chạy không? (npm run db:up)');
    console.log('   2. Connection string trong .env có đúng không?');
    console.log('   3. MongoDB Compass có kết nối được không?');
    process.exit(1);
  }
}

testConnection();

