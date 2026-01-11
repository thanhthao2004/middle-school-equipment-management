const TrainingPlan = require('../models/training-plan.model');
const { getNextCode } = require('../../../core/libs/sequence');

class TrainingPlanRepository {
    async findAll(query = {}) {
        return await TrainingPlan.find(query).sort({ createdAt: -1 });
    }

    async findById(id) {
        return await TrainingPlan.findById(id);
    }

    async create(data) {
        // Đảm bảo có mã kế hoạch trước khi lưu
        const plan = new TrainingPlan(data);
        return await plan.save();
    }

    async delete(id) {
        return await TrainingPlan.findByIdAndDelete(id);
    }
}

module.exports = new TrainingPlanRepository();
