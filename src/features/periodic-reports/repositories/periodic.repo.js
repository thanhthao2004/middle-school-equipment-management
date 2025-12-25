const PeriodicReport = require('../models/periodic-report.model');

class PeriodicReportRepository {
  async find(filters = {}) {
    const query = {};
    if (filters.period) {
      query.kyBaoCao = filters.period;
    }

    return PeriodicReport.find(query).sort({ ngayLap: -1 });
  }

  async findById(id) {
    return PeriodicReport.findById(id);
  }

  async create(data) {
    const report = new PeriodicReport(data);
    return report.save();
  }

  async update(id, data) {
    return PeriodicReport.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return PeriodicReport.findByIdAndDelete(id);
  }
}

module.exports = new PeriodicReportRepository();
