// src/features/periodic-reports/services/periodic.service.js
const PeriodicReport = require("../models/periodic-report.model");
const { formatDate } = require("../../../core/utils/date");

class PeriodicReportService {
  async getReports(filters = {}) {
    const docs = await PeriodicReport.find(filters).sort({ createdAt: -1 }).lean();

    return docs.map(d => ({
      id: d._id.toString(),
      code: d.maBaoCao,
      period: d.kyBaoCao,
      date: d.ngayLap ? formatDate(d.ngayLap, "DD/MM/YYYY") : "",
      status: d.trangThaiBaoCao || "pending",
      fileName: d.tenFile || "Không có file",
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
      fileUrl: d.duongDanFile || ""
    };
  }

  async createReport(body, file) {
    const doc = new PeriodicReport({
      maBaoCao: body.code,
      kyBaoCao: body.period,
      ngayLap: body.date ? new Date(body.date) : new Date(),
      trangThaiBaoCao: "pending",
      tenFile: file ? body.originalName || file.originalname : "Untitled.pdf",
      duongDanFile: file ? file.filename : ""
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
