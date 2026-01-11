// src/features/periodic-reports/services/periodic.service.js
const PeriodicReport = require("../models/periodic-report.model");
const { formatDate } = require("../../../core/utils/date");

const Device = require('../../devices/models/device.model');
const DeviceUnit = require('../../devices/models/device-unit.model');

class PeriodicReportService {
  async getReports(filters = {}) {
    const docs = await PeriodicReport.find(filters).sort({ createdAt: -1 }).lean();

    return docs.map(d => ({
      id: d._id.toString(),
      code: d.maBaoCao,
      period: d.kyBaoCao,
      date: d.ngayLap ? formatDate(d.ngayLap, "DD/MM/YYYY") : "",
      status: d.trangThaiBaoCao || "pending",
      fileName: d.tenFile || (d.items && d.items.length > 0 ? "Báo cáo số liệu" : "Không có file"),
      fileUrl: d.duongDanFile || ""
    }));
  }

  async getReportById(id) {
    const d = await PeriodicReport.findById(id).lean();
    if (!d) return null;

    return {
      id: d._id.toString(),
      code: d.maBaoCao,
      period: d.kyBaoCao,
      date: d.ngayLap ? formatDate(d.ngayLap, "DD/MM/YYYY") : "",
      status: d.trangThaiBaoCao || "pending",
      fileName: d.tenFile || "Không có file",
      fileUrl: d.duongDanFile || "",
      items: d.items || []
    };
  }

  async createReport(body, file) {
    // 1. Generate snapshot of all devices
    const devices = await Device.find().populate('category');
    const items = await Promise.all(devices.map(async (d) => {
      const stats = await DeviceUnit.getConditionStats(d.maTB);
      return {
        maTB: d.maTB,
        tenTB: d.tenTB,
        soLuong: d.soLuong,
        categoryName: d.category ? (d.category.name || d.category.tenDM) : 'Khác',
        stats: {
          tot: stats['Tốt'] || 0,
          kha: stats['Khá'] || 0,
          trungBinh: stats['Trung bình'] || 0,
          hong: stats['Hỏng'] || 0
        }
      };
    }));

    // 2. Create Report
    const doc = new PeriodicReport({
      maBaoCao: body.code,
      kyBaoCao: body.period,
      ngayLap: body.date ? new Date(body.date) : new Date(),
      trangThaiBaoCao: "pending",
      tenFile: file ? (body.originalName || file.originalname) : (items.length > 0 ? "Báo cáo số liệu hệ thống" : ""),
      duongDanFile: file ? file.filename : "",
      items: items
    });

    await doc.save();
    return doc;
  }

  async updateReport(id, data) {
    await PeriodicReport.findByIdAndUpdate(id, {
      kyBaoCao: data.period,
      trangThaiBaoCao: data.trangThaiBaoCao     // lấy từ dropdown/hidden
    });
    return { success: true };
  }

  async deleteReport(id) {
    await PeriodicReport.findByIdAndDelete(id);
    return { success: true };
  }
}

module.exports = new PeriodicReportService();
