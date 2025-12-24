// src/features/periodic-reports/controllers/periodic.controller.js
const periodicReportService = require("../services/periodic.service");
const { getNextCode } = require("../../../core/libs/sequence");
const path = require("path");
const fs = require("fs");

class PeriodicReportController {
  // GET /periodic-reports
  async getReportListPage(req, res) {
    try {
      const reports = await periodicReportService.getReports(req.query);
      const periods = [...new Set(reports.map(r => r.period))].sort();

      res.render("periodic-reports/views/list", {
        title: "Quản lý báo cáo định kỳ",
        reports,
        periods,
        currentPage: "periodic-reports",
        user: req.user || { role: "ql_thiet_bi" }
      });
    } catch (error) {
      console.error("Error rendering report list page:", error);
      res.status(500).send(error.message);
    }
  }

  // GET /periodic-reports/create
  async getCreateReportPage(req, res) {
    try {
      res.render("periodic-reports/views/create", {
        title: "Lập báo cáo định kỳ",
        currentPage: "periodic-reports",
        user: req.user || { role: "ql_thiet_bi" }
      });
    } catch (error) {
      console.error("Error rendering create report page:", error);
      res.status(500).send(error.message);
    }
  }

  // GET /periodic-reports/:id
  async getReportDetailPage(req, res) {
    try {
      const report = await periodicReportService.getReportById(req.params.id);
      if (!report) return res.status(404).send("Báo cáo không tồn tại");

      res.render("periodic-reports/views/edit", {
        title: `Chi tiết báo cáo ${report.code}`,
        report,
        readOnly: false,       // nếu muốn cho duyệt, đổi thành false
        currentPage: "periodic-reports",
        user: req.user || { role: "ql_thiet_bi" }
      });
    } catch (error) {
      console.error("Error rendering report detail page:", error);
      res.status(500).send(error.message);
    }
  }

  // POST /periodic-reports
  async createReport(req, res) {
    try {
      await periodicReportService.createReport(req.body, req.file);
      res.redirect("/manager/periodic-reports");
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).send(error.message);
    }
  }

  // POST /periodic-reports/:id
  async updateReport(req, res) {
    try {
      await periodicReportService.updateReport(req.params.id, req.body);
      res.redirect(`/manager/periodic-reports/${req.params.id}`);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).send(error.message);
    }
  }
  //    // POST /periodic-reports/:id
  //   async updateReport(req, res) {
  //     try {
  //       await periodicReportService.updateReport(req.params.id, req.body);
  //       res.redirect(`/manager/periodic-reports/${req.params.id}`);
  //     } catch (error) {
  //       console.error("Error updating report:", error);
  //       res.status(500).send(error.message);
  //     }
  //   }

  // POST /periodic-reports/:id/delete
  async deleteReport(req, res) {
    try {
      await periodicReportService.deleteReport(req.params.id);
      res.redirect("/manager/periodic-reports");
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).send(error.message);
    }
  }

  // GET /periodic-reports/:id/download
  async downloadReportFile(req, res) {
    try {
      const report = await periodicReportService.getReportById(req.params.id);

      if (!report || !report.fileUrl) {
        return res.status(404).send("Không tìm thấy file");
      }

      const filePath = path.join(
        __dirname,
        "../../../../public/uploads/devices",
        report.fileUrl
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File không tồn tại trên server");
      }

      res.download(filePath, report.fileName);
    } catch (error) {
      console.error("Error downloading report file:", error);
      res.status(500).send(error.message);
    }
  }
}

module.exports = new PeriodicReportController();
