const { PurchasingPlan, PurchasingPlanDetail } = require('../models/purchasing-plan.model');
const { getNextCode } = require('../../../core/libs/sequence');

class PurchasingRepository {
	/**
	 * Tạo kế hoạch mua sắm mới cùng chi tiết thiết bị
	 * @param {Object} payload
	 * @param {string} [payload.code]            Mã kế hoạch (LUÔN tự động tạo - bỏ qua tham số này)
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
			// Tự động tạo mã kế hoạch mới: KH001, KH002, KH003...
			// Mã chỉ tăng khi lưu thành công (commit transaction)
			const maKeHoachMuaSam = await getNextCode('KH', 3);

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

	/**
	 * Lấy chi tiết kế hoạch mua sắm theo mã
	 * @param {string} maKeHoachMuaSam Mã kế hoạch
	 */
	async getPlanByCode(maKeHoachMuaSam) {
		try {
			const plan = await PurchasingPlan.findOne({ maKeHoachMuaSam }).lean();
			if (!plan) return null;

			const details = await PurchasingPlanDetail.find({ maKeHoachMuaSam }).lean();

			return {
				...plan,
				details
			};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Lấy chi tiết kế hoạch mua sắm theo id
	 * @param {string} id ID kế hoạch
	 */
	async getPlanById(id) {
		try {
			const plan = await PurchasingPlan.findById(id).lean();
			if (!plan) return null;

			const details = await PurchasingPlanDetail.find({ maKeHoachMuaSam: plan.maKeHoachMuaSam }).lean();

			return {
				...plan,
				details
			};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Lấy danh sách tất cả kế hoạch
	 */
	async getAllPlans() {
		try {
			const plans = await PurchasingPlan.find({}).sort({ createdAt: -1 }).lean();
			return plans;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Lấy danh sách kế hoạch theo trạng thái
	 */
	async getPlansByStatus(trangThai) {
		try {
			const plans = await PurchasingPlan.find({ trangThai }).sort({ createdAt: -1 }).lean();
			return plans;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Cập nhật kế hoạch mua sắm
	 * @param {string} id ID kế hoạch
	 * @param {Object} payload Dữ liệu cần cập nhật
	 */
	async updatePlan(id, payload) {
		const session = await PurchasingPlan.startSession();
		session.startTransaction();

		try {
			const plan = await PurchasingPlan.findByIdAndUpdate(
				id,
				{
					namHoc: payload.namHoc,
					trangThai: payload.trangThai
				},
				{ new: true, session }
			);

			if (!plan) {
				throw new Error('Kế hoạch không tồn tại');
			}

			// Update plan details
			const items = Array.isArray(payload.items) ? payload.items : [];
			
			// Delete old details
			await PurchasingPlanDetail.deleteMany(
				{ maKeHoachMuaSam: plan.maKeHoachMuaSam },
				{ session }
			);

			// Insert new details
			if (items.length > 0) {
				const details = items.map(item => ({
					maKeHoachMuaSam: plan.maKeHoachMuaSam,
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

	/**
	 * Xóa kế hoạch mua sắm
	 * @param {string} id ID kế hoạch
	 */
	async deletePlan(id) {
		const session = await PurchasingPlan.startSession();
		session.startTransaction();

		try {
			const plan = await PurchasingPlan.findByIdAndDelete(id, { session });

			if (!plan) {
				throw new Error('Kế hoạch không tồn tại');
			}

			// Delete associated details
			await PurchasingPlanDetail.deleteMany(
				{ maKeHoachMuaSam: plan.maKeHoachMuaSam },
				{ session }
			);

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
