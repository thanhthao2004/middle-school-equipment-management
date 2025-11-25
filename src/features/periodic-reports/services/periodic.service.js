// Periodic Report Service
// const periodicReportRepo = require('../repositories/periodic-report.repo'); 
const { formatDate } = require('../../../core/utils/date');

// Mock Data
const reports = [
    { id: 1, code: 'BC001', period: 'Học kỳ I 2024-2025', date: new Date('2025-01-05'), status: 'completed', fileName: 'BaoCaoHK1_2024-2025.pdf', fileUrl: '#' },
    { id: 2, code: 'BC002', period: 'Học kỳ II 2024-2025', date: new Date('2025-06-15'), status: 'pending', fileName: 'BaoCaoHK2_2024-2025.pdf', fileUrl: '#' },
    { id: 3, code: 'BC003', period: 'Năm học 2025-2026', date: new Date('2026-06-20'), status: 'rejected', fileName: 'BaoCaoNH2025-2026.pdf', fileUrl: '#' },
];

class PeriodicReportService {
    // Lấy danh sách báo cáo với bộ lọc (filters not implemented for simplicity)
    async getReports(filters = {}) {
        // Trong thực tế sẽ gọi repo: await periodicReportRepo.findAll(filters);
        const formattedReports = reports.map(r => ({
            ...r,
            date: formatDate(r.date, 'DD/MM/YYYY'),
        }));
        return formattedReports;
    }

    // Lấy chi tiết báo cáo theo ID
    async getReportById(id) {
        // Trong thực tế: periodicReportRepo.findById(id);
        const report = reports.find(r => String(r.id) === String(id));
        if (!report) return null;
        
        const formattedReport = {
            ...report,
            date: formatDate(report.date, 'DD/MM/YYYY'),
        };
        return formattedReport;
    }
    
    // Tạo báo cáo mới (Mock logic)
    async createReport(reportData, file) {
        // Trong thực tế: save file, generate code, save to DB.
        console.log('Creating report with data:', reportData, 'and file:', file?.originalname);
        const newId = reports.length + 1;
        const newReport = {
            id: newId,
            code: `BC${String(newId).padStart(3, '0')}`,
            period: reportData.period,
            date: new Date(),
            status: 'pending', // Mặc định chờ duyệt
            fileName: file?.originalname || reportData.fileName || 'Untitled.pdf',
            fileUrl: '#mock-download-url',
        };
        reports.push(newReport);
        return newReport;
    }
    
    // Các hàm khác: updateReport, deleteReport, downloadFile (Chỉ là placeholder)
    async updateReport(id, data) {
        console.log(`Updating report ${id} with:`, data);
        return { success: true };
    }
    
    async deleteReport(id) {
        console.log(`Deleting report ${id}`);
        const index = reports.findIndex(r => String(r.id) === String(id));
        if (index > -1) {
            reports.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }
}

module.exports = new PeriodicReportService();