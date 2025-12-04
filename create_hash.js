// create_hash.js - Phiên bản tối giản
const bcrypt = require('bcrypt');

// Mật khẩu chung cho tất cả tài khoản test
const plainPassword = '123456';
const saltRounds = 10; 

console.log(`\n--- BƯỚC 1: ĐANG TẠO MẬT KHẨU HASH CHO '${plainPassword}' ---`);

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error('Lỗi khi Hash:', err);
        return;
    }
    
    console.log('\n✅ SAO CHÉP GIÁ TRỊ SAU:');
    console.log(hash); // <--- GIÁ TRỊ BẠN CẦN CHÉP
    console.log('\n---------------------------------------------------------');
    console.log('Sử dụng giá trị này để dán vào LỆNH MONGODB ở BƯỚC 2.2');
    process.exit(0);
});