/**
 * Script khởi tạo Counter cho mã kế hoạch mua sắm
 * Đảm bảo mã kế hoạch bắt đầu từ KH001
 * 
 * Chạy script: node scripts/init-counter.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CounterSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 },
    },
    { versionKey: false }
);

const Counter = mongoose.model('Counter', CounterSchema);

async function initCounter() {
    try {
        // Kết nối database
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/middle-school-equipment';
        await mongoose.connect(mongoUri);
        console.log('✅ Đã kết nối database');

        // Kiểm tra counter hiện tại
        const existingCounter = await Counter.findById('KH');

        if (existingCounter) {
            console.log(`📊 Counter 'KH' đã tồn tại với giá trị seq = ${existingCounter.seq}`);
            console.log(`   Mã kế hoạch tiếp theo sẽ là: KH${String(existingCounter.seq + 1).padStart(3, '0')}`);

            // Reset về 0 để bắt đầu lại từ KH001
            await Counter.findByIdAndUpdate('KH', { seq: 0 });
            console.log('🔄 Đã reset counter về 0');
            console.log('   Kế hoạch tiếp theo sẽ bắt đầu từ: KH001');
        } else {
            // Tạo counter mới bắt đầu từ 0
            await Counter.create({ _id: 'KH', seq: 0 });
            console.log('✅ Đã tạo counter mới cho mã kế hoạch');
            console.log('   Mã kế hoạch đầu tiên sẽ là: KH001');
        }

        console.log('\n✨ Hoàn tất khởi tạo counter!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối database');
    }
}

initCounter();
