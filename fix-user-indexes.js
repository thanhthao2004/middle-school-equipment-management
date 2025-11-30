/**
 * Script để xóa các index không cần thiết trong collection users
 * Chạy: node fix-user-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongo } = require('./src/config/db');

async function fixIndexes() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await connectMongo();
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    console.log('\n📋 Indexes hiện tại:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    console.log('\n🗑️  Đang xóa index không cần thiết...');
    
    // Xóa index id_1 nếu tồn tại
    try {
      await collection.dropIndex('id_1');
      console.log('  ✅ Đã xóa index: id_1');
    } catch (e) {
      if (e.code === 27) {
        console.log('  ℹ️  Index id_1 không tồn tại');
      } else {
        console.log('  ⚠️  Lỗi khi xóa id_1:', e.message);
      }
    }
    
    // Xóa index username_1 nếu tồn tại
    try {
      await collection.dropIndex('username_1');
      console.log('  ✅ Đã xóa index: username_1');
    } catch (e) {
      if (e.code === 27) {
        console.log('  ℹ️  Index username_1 không tồn tại');
      } else {
        console.log('  ⚠️  Lỗi khi xóa username_1:', e.message);
      }
    }
    
    console.log('\n📋 Indexes sau khi xóa:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    console.log('\n✅ Hoàn thành!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

fixIndexes();

