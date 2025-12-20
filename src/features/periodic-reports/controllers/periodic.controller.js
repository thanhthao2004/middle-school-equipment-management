const periodicReportService = require('../services/periodic.service');

class PeriodicReportController {
  async getReportListPage(req, res) {
    try {
      const reports = await periodicReportService.getReports(req.query);
      const periods = [...new Set(reports.map((r) => r.period))];

      res.render('periodic-reports/views/list', {
        title: 'Quản lý báo cáo định kỳ',
        reports,
        periods,
        user: req.user || { role: 'ql_thiet_bi' }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi tải danh sách báo cáo');
    }
  }

  async getCreateReportPage(req, res) {
    res.render('periodic-reports/views/create', {
      title: 'Lập báo cáo định kỳ',
      user: req.user || { role: 'ql_thiet_bi' }
    });
  }

  async createReport(req, res) {
    try {
      console.log('BODY:', req.body);
      console.log('FILE:', req.file);

      const { kyBaoCao, ngayLap } = req.body;

      let tenFile = null;
      let duongDanFile = null;

      if (req.file) {
        tenFile = req.file.originalname;
        duongDanFile = `/uploads/devices/${req.file.filename}`;
      }

      await periodicReportService.createReport({
        kyBaoCao,
        ngayLap,
        tenFile,
        duongDanFile
      });

      res.redirect('/manager/periodic-reports');
    } catch (err) {
      console.error(err);
      res.status(400).send('Lỗi tạo báo cáo: ' + err.message);
    }
  }

  async getReportDetailPage(req, res) {
    try {
      const report = await periodicReportService.getReportById(req.params.id);
      if (!report) return res.status(404).send('Không tìm thấy báo cáo');

      res.render('periodic-reports/views/edit', {
        title: 'Chi tiết báo cáo',
        report,
        user: req.user || { role: 'ql_thiet_bi' }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi tải báo cáo');
    }
  }

  async updateReport(req, res) {
    try {
      await periodicReportService.updateReport(req.params.id, req.body);
      res.redirect('/manager/periodic-reports');
    } catch (err) {
      console.error(err);
      res.status(400).send('Lỗi cập nhật: ' + err.message);
    }
  }

  async deleteReport(req, res) {
    try {
      await periodicReportService.deleteReport(req.params.id);
      res.redirect('/manager/periodic-reports');
    } catch (err) {
      console.error(err);
      res.status(400).send('Lỗi xóa: ' + err.message);
    }
  }

  async downloadReportFile(req, res) {
    try {
      const report = await periodicReportService.getReportById(req.params.id);

      if (!report || !report.fileUrl) {
        return res.status(404).send('Không tìm thấy file');
      }

      return res.redirect(report.fileUrl);
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi tải file');
    }
  }

  async exportReport(req, res) {
    try {
      const file = await periodicReportService.exportReport(
        req.query.type || 'pdf'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${file.fileName}`
      );
      res.send(file.buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi xuất báo cáo');
    }
  }

  async updateItemStatus(req, res) {
    res.json({ success: true });
  }
}

module.exports = new PeriodicReportController();
