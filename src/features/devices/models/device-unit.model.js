const { Schema, model, Types } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

/**
 * DeviceUnit - Quản lý từng đơn vị thiết bị riêng biệt
 * 
 * Ví dụ: Thiết bị "Nam châm điện" (maTB: TB001) có 10 cái
 * → Sẽ có 10 DeviceUnit: TB001-001, TB001-002, ..., TB001-010
 * 
 * Mỗi đơn vị có tình trạng riêng (Tốt, Khá, Trung bình, Hỏng)
 * và trạng thái mượn riêng (sẵn sàng, đang mượn, bảo trì)
 */
const DeviceUnitSchema = new Schema(
	{
		// Mã đơn vị thiết bị (unique): TB001-001, TB001-002, ...
		maDonVi: { type: String, required: true, unique: true, trim: true },
		
		// Tham chiếu đến thiết bị gốc
		maTB: { type: String, required: true, index: true },
		deviceId: { type: Types.ObjectId, ref: 'Device', required: true },
		
		// Số thứ tự trong loại thiết bị (1, 2, 3, ...)
		soThuTu: { type: Number, required: true, min: 1 },
		
		// Tình trạng vật lý của đơn vị này
		tinhTrang: { 
			type: String, 
			enum: ['Tốt', 'Khá', 'Trung bình', 'Hỏng'],
			default: 'Tốt'
		},
		
		// Trạng thái sử dụng
		trangThai: {
			type: String,
			enum: ['san_sang', 'dang_muon', 'bao_tri', 'thanh_ly'],
			default: 'san_sang'
		},
		
		// Phiếu mượn hiện tại (nếu đang được mượn)
		maPhieuMuonHienTai: { type: String, default: null, index: true },
		
		// Lịch sử mượn/trả
		lichSu: [{
			maPhieu: String,
			loai: { type: String, enum: ['muon', 'tra'] },
			ngay: Date,
			nguoiThucHien: { type: Types.ObjectId, ref: 'User' },
			ghiChu: String
		}],
		
		// Ghi chú riêng cho đơn vị này
		ghiChu: { type: String, default: '' },
		
		// Vị trí lưu trữ cụ thể (có thể khác vị trí chung của loại thiết bị)
		viTriLuuTru: { type: String, default: '' }
	},
	{ timestamps: true }
);

// Index cho tìm kiếm nhanh
DeviceUnitSchema.index({ maTB: 1, trangThai: 1 });
DeviceUnitSchema.index({ maTB: 1, tinhTrang: 1 });
DeviceUnitSchema.index({ trangThai: 1, tinhTrang: 1 });

/**
 * Pre-save hook: Tự động tạo maDonVi nếu chưa có
 * Format: TB001-001, TB001-002, ...
 */
DeviceUnitSchema.pre('validate', async function(next) {
    // Chỉ tạo maDonVi nếu chưa có và đã có maTB và soThuTu
    if (!this.maDonVi && this.maTB && this.soThuTu) {
        this.maDonVi = `${this.maTB}-${String(this.soThuTu).padStart(3, '0')}`;
    }
    next();
});

/**
 * Static method: Tạo các đơn vị cho một thiết bị mới
 * @param {Object} device - Document thiết bị
 * @param {Number} quantity - Số lượng đơn vị cần tạo
 * @param {String} defaultCondition - Tình trạng mặc định
 */
DeviceUnitSchema.statics.createUnitsForDevice = async function(device, quantity, defaultCondition = 'Tốt') {
	const units = [];
	const existingCount = await this.countDocuments({ maTB: device.maTB });
	
	for (let i = 1; i <= quantity; i++) {
		const soThuTu = existingCount + i;
		const maDonVi = `${device.maTB}-${String(soThuTu).padStart(3, '0')}`;
		
		units.push({
			maDonVi,
			maTB: device.maTB,
			deviceId: device._id,
			soThuTu,
			tinhTrang: defaultCondition,
			trangThai: 'san_sang',
			viTriLuuTru: device.viTriLuuTru || ''
		});
	}
	
	return await this.insertMany(units);
};

/**
 * Static method: Lấy các đơn vị sẵn sàng cho mượn
 * @param {String} maTB - Mã thiết bị
 * @param {Number} quantity - Số lượng cần mượn
 */
DeviceUnitSchema.statics.getAvailableUnits = async function(maTB, quantity = 1) {
	return await this.find({
		maTB,
		trangThai: 'san_sang',
		tinhTrang: { $in: ['Tốt', 'Khá'] } // Chỉ cho mượn thiết bị tốt hoặc khá
	})
	.sort({ soThuTu: 1 })
	.limit(quantity);
};

/**
 * Static method: Đếm số lượng sẵn sàng cho mượn
 * @param {String} maTB - Mã thiết bị
 */
DeviceUnitSchema.statics.countAvailable = async function(maTB) {
	return await this.countDocuments({
		maTB,
		trangThai: 'san_sang',
		tinhTrang: { $in: ['Tốt', 'Khá'] }
	});
};

/**
 * Static method: Thống kê tình trạng theo loại thiết bị
 * @param {String} maTB - Mã thiết bị
 */
DeviceUnitSchema.statics.getConditionStats = async function(maTB) {
	const stats = await this.aggregate([
		{ $match: { maTB } },
		{
			$group: {
				_id: '$tinhTrang',
				count: { $sum: 1 }
			}
		}
	]);
	
	return stats.reduce((acc, item) => {
		acc[item._id] = item.count;
		return acc;
	}, { 'Tốt': 0, 'Khá': 0, 'Trung bình': 0, 'Hỏng': 0 });
};

/**
 * Static method: Thống kê trạng thái sử dụng theo loại thiết bị
 * @param {String} maTB - Mã thiết bị
 */
DeviceUnitSchema.statics.getStatusStats = async function(maTB) {
	const stats = await this.aggregate([
		{ $match: { maTB } },
		{
			$group: {
				_id: '$trangThai',
				count: { $sum: 1 }
			}
		}
	]);
	
	return stats.reduce((acc, item) => {
		acc[item._id] = item.count;
		return acc;
	}, { 'san_sang': 0, 'dang_muon': 0, 'bao_tri': 0, 'thanh_ly': 0 });
};

module.exports = model('DeviceUnit', DeviceUnitSchema);

