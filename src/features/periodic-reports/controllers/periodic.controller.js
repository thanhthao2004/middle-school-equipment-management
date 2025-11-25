const periodicReportService = require('../services/periodic.service');
const { getNextCode } = require('../../../core/libs/sequence'); // Để mock sinh Mã BC

class PeriodicReportController {
    // GET /periodic-reports
    async getReportListPage(req, res) {
        try {
            const reports = await periodicReportService.getReports(req.query);
            
            // Lấy danh sách kỳ báo cáo duy nhất để mock filter
            const periods = [...new Set(reports.map(r => r.period))].sort();

            res.render('periodic-reports/views/list', { 
                title: 'Quản lý báo cáo định kỳ',
                reports, 
                periods, // Đảm bảo periods được truyền vào
                active: 'periodic-reports', // Dùng cho sidebar
            });
        } catch (error) {
            console.error('Error rendering report list page:', error);
            res.status(500).send(error.message);
        }
    }

    // GET /periodic-reports/create
    async getCreateReportPage(req, res) {
        try {
            // Mock generate MaBC (Tùy chọn, có thể sinh ở client như EJS đã làm)
            // const mockCode = await getNextCode('BC', 3);
            
            res.render('periodic-reports/views/create', { 
                title: 'Lập báo cáo định kỳ',
                // mockCode,
                active: 'periodic-reports',
                // Dùng cho sidebar
            });
        } catch (error) {
            console.error('Error rendering create report page:', error);
            res.status(500).send(error.message);
        }
    }
    
    // GET /periodic-reports/:id
    async getReportDetailPage(req, res) {
        try {
            const report = await periodicReportService.getReportById(req.params.id);
            
            if (!report) return res.status(404).send('Báo cáo không tồn tại');
            
            // Dùng view edit cho chi tiết, thiết lập readOnly = true
            res.render('periodic-reports/views/edit', { 
                title: `Chi tiết báo cáo ${report.code}`,
                report,
                readOnly: true, // Chỉ xem
                active: 'periodic-reports',
            });
        } catch (error) {
            console.error('Error rendering report detail page:', error);
            res.status(500).send(error.message);
        }
    }

    // POST /periodic-reports
    async createReport(req, res) {
        try {
            // Mock: Giả định đã có middleware xử lý upload file (req.file)
            const result = await periodicReportService.createReport(req.body, req.file);
            // Sau khi tạo thành công, chuyển hướng về trang danh sách
            res.redirect('/periodic-reports');
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(500).send(error.message);
        }
    }
    
    // POST /periodic-reports/:id
    async updateReport(req, res) {
        // Chỉ là placeholder
        await periodicReportService.updateReport(req.params.id, req.body);
        res.redirect(`/periodic-reports/${req.params.id}`);
    }
    
    // POST /periodic-reports/:id/delete
    async deleteReport(req, res) {
        // Chỉ là placeholder
        await periodicReportService.deleteReport(req.params.id);
        res.redirect('/periodic-reports');
    }
    
    // GET /periodic-reports/:id/download
    async downloadReportFile(req, res) {
        // Chỉ là placeholder: download mock file
        console.log(`Downloading report file for ID: ${req.params.id}`);
        res.send('Tải file báo cáo thành công (mock)');
    }
}

module.exports = new PeriodicReportController();