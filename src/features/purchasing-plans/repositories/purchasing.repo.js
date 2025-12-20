const { PurchasingPlan, PurchasingPlanDetail } = require('../models/purchasing-plan.model');
const { getNextCode } = require('../../../core/libs/sequence');

class PurchasingRepository {
	/**
	 * Tạo kế hoạch mua sắm mới cùng chi tiết thiết bị
	 * @param {Object} payload
	 * @param {string} [payload.code]            Mã kế hoạch (nếu không truyền sẽ tự sinh KHxxx)
	 * @param {string} [payload.namHoc]          Năm học
	 * @param {string} [payload.trangThai]       Trạng thái
	 * @param {string} [payload.tenFile]         Tên file đính kèm
	 * @param {string} [payload.duongDanFile]    Đường dẫn file đính kèm
	 * @param {Array}  payload.items             Danh sách thiết bị
	 */
	async createPlan(payload) {
		const session = await PurchasingPlan.startSession();
		session.startTransaction();

		try {
			const maKeHoachMuaSam = payload.code || await getNextCode('KH', 3);

			const [plan] = await PurchasingPlan.create([
				{
					maKeHoachMuaSam,
					namHoc: payload.namHoc || '',
					trangThai: payload.trangThai || 'cho_phe_duyet',
					tenFile: payload.tenFile || '',
					duongDanFile: payload.duongDanFile || ''
				}
			], { session });

			const items = Array.isArray(payload.items) ? payload.items : [];

			if (items.length > 0) {
				const details = items.map(item => ({
					maKeHoachMuaSam,
					maTB: item.code,
					soLuongDuKienMua: item.quantity || 0,
					donViTinh: item.uom || '',
					thoiGianDuKienMua: item.expectedAt ? new Date(item.expectedAt) : undefined,
					duToanKinhPhi: typeof item.budget === 'number'
						? item.budget
						: (item.quantity || 0) * (item.unitPrice || 0),
					lyDoMua: item.reason || ''
				}));

				await PurchasingPlanDetail.insertMany(details, { session });
			}

			await session.commitTransaction();
			session.endSession();

			return plan;
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}
}

module.exports = new PurchasingRepository();
