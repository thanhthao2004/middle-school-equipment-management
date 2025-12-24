const DisposalReport = require('../../disposal/models/disposal-report.model');
const Device = require('../../devices/models/device.model');
const Category = require('../../categories/models/category.model');

class ReportsController {
    // GET /teacher/reports/damaged
    async getDamagedEquipmentReport(req, res) {
        try {
            // Lấy tất cả disposal reports đã được duyệt
            const approvedReports = await DisposalReport.find({
                status: 'Đã duyệt'
            }).populate({
                path: 'items.device',
                populate: {
                    path: 'maDM',
                    model: 'Category'
                }
            }).sort({ createdAt: -1 });

            // Flatten items từ tất cả reports
            const damagedItems = [];
            for (const report of approvedReports) {
                for (const item of report.items || []) {
                    if (item.device) {
                        damagedItems.push({
                            categoryName: item.device.maDM?.name || 'N/A',
                            deviceCode: item.device.maTB || 'N/A',
                            deviceName: item.device.tenTB || 'N/A',
                            quantity: 1, // Mỗi item là 1 thiết bị
                            unit: item.device.donViTinh || 'Bộ',
                            damageLevel: item.level || 'N/A',
                            brokenDate: item.broken_date,
                            reason: item.reason || ''
                        });
                    }
                }
            }

            // Group by device code và tính tổng số lượng
            const groupedItems = {};
            for (const item of damagedItems) {
                const key = item.deviceCode;
                if (!groupedItems[key]) {
                    groupedItems[key] = { ...item, quantity: 0 };
                }
                groupedItems[key].quantity += item.quantity;
            }

            const finalItems = Object.values(groupedItems);

            res.render('reports/views/damaged-summary', {
                title: 'Báo cáo thiết bị hỏng',
                currentPage: 'reports',
                user: req.user,
                items: finalItems,
                totalItems: finalItems.length,
                totalQuantity: finalItems.reduce((sum, item) => sum + item.quantity, 0)
            });
        } catch (err) {
            console.error('Error loading damaged equipment report:', err);
            res.status(500).send('Lỗi tải báo cáo thiết bị hỏng');
        }
    }

    // API: Export damaged equipment report
    async exportDamagedReport(req, res) {
        try {
            // Similar logic but return JSON for export
            const approvedReports = await DisposalReport.find({
                status: 'Đã duyệt'
            }).populate('items.device');

            const damagedItems = [];
            for (const report of approvedReports) {
                for (const item of report.items || []) {
                    if (item.device) {
                        damagedItems.push({
                            categoryName: item.device.maDM || 'N/A',
                            deviceCode: item.device.maTB || 'N/A',
                            deviceName: item.device.tenTB || 'N/A',
                            quantity: 1,
                            unit: item.device.donViTinh || 'Bộ',
                            damageLevel: item.level || 'N/A'
                        });
                    }
                }
            }

            res.json({
                success: true,
                data: damagedItems,
                timestamp: new Date()
            });
        } catch (err) {
            console.error('Error exporting damaged report:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi xuất báo cáo'
            });
        }
    }
}

module.exports = new ReportsController();
