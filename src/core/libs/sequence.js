const { Schema, model } = require('mongoose');

const CounterSchema = new Schema(
	{
		_id: { type: String, required: true }, // prefix
		seq: { type: Number, default: 0 },
	},
	{ versionKey: false }
);

const Counter = model('Counter', CounterSchema);

/**
 * Xem trước mã code tiếp theo mà KHÔNG tăng counter
 * Dùng để hiển thị preview cho user
 * @param {string} prefix - Tiền tố (VD: 'KH' cho kế hoạch)
 * @param {number} width - Độ dài phần số (default: 3)
 * @returns {Promise<string>} Mã code preview (VD: KH001, KH002, ...)
 */
async function peekNextCode(prefix, width = 3) {
	const counter = await Counter.findById(prefix);
	const nextSeq = counter ? counter.seq + 1 : 1;
	const num = String(nextSeq).padStart(width, '0');
	return `${prefix}${num}`;
}

/**
 * Tạo mã code tự động tăng dần - CHỈ gọi khi thực sự lưu dữ liệu
 * @param {string} prefix - Tiền tố (VD: 'KH' cho kế hoạch)
 * @param {number} width - Độ dài phần số (default: 3)
 * @returns {Promise<string>} Mã code (VD: KH001, KH002, ...)
 * 
 * Cơ chế:
 * - Lần đầu tiên gọi với prefix 'KH': tạo counter mới, seq = 1 → KH001
 * - Các lần sau: tăng seq lên 1 → KH002, KH003, ...
 * - CHỈ gọi hàm này khi thực sự lưu dữ liệu thành công
 */
async function getNextCode(prefix, width = 3) {
	const updated = await Counter.findOneAndUpdate(
		{ _id: prefix },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true }
	);
	const num = String(updated.seq).padStart(width, '0');
	return `${prefix}${num}`;
}

module.exports = { getNextCode, peekNextCode };

