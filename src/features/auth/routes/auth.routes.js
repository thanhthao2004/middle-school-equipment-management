const express = require('express');
const router = express.Router();

// Render change password page
router.get('/change-password', (req, res) => {
	res.render('auth/views/change-password', {
		title: 'Đổi mật khẩu',
		errors: [],
		success: null
	});
});

// Handle change password submission (basic validation only)
router.post('/change-password', (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body || {};
	const errors = [];

	if (!currentPassword || currentPassword.trim() === '') {
		errors.push('Vui lòng nhập mật khẩu hiện tại.');
	}

	if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
		errors.push('Mật khẩu mới phải có ít nhất 8 ký tự.');
	}

	if (newPassword !== confirmPassword) {
		errors.push('Mật khẩu mới và xác nhận không khớp.');
	}

	if (errors.length) {
		return res.render('auth/views/change-password', {
			title: 'Đổi mật khẩu',
			errors,
			success: null
		});
	}

	// TODO: Thực hiện thay đổi mật khẩu thực sự bằng cách gọi service/controller.
	// Ở đây tạm mô phỏng thành công.
	return res.render('auth/views/change-password', {
		title: 'Đổi mật khẩu',
		errors: [],
		success: 'Mật khẩu đã được cập nhật thành công.'
	});
});

module.exports = router;
