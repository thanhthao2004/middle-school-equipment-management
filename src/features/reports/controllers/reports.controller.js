const DisposalReport = require('../../disposal/models/disposal-report.model');
const Device = require('../../devices/models/device.model');
const Category = require('../../categories/models/category.model');

class ReportsController {
    // GET /teacher/reports/damaged
    async getDamagedEquipmentReport(req, res) {
        try {
            console.log('[DEBUG] Loading damaged equipment report...');

            // Lấy tất cả disposal reports đã được duyệt
            const approvedReports = await DisposalReport.find({
                status: 'Đã duyệt'
            }).populate({
                path: 'items.device',
                model: Device,
                populate: {
                    path: 'maDM',
                    model: Category
                }
            }).sort({ createdAt: -1 });

            console.log('[DEBUG] Found approved reports:', approvedReports.length);

            if (approvedReports.length > 0) {
                console.log('[DEBUG] Sample report:', {
                    id: approvedReports[0]._id,
                    status: approvedReports[0].status,
                    itemsCount: approvedReports[0].items?.length || 0
                });

                if (approvedReports[0].items && approvedReports[0].items.length > 0) {
                    console.log('[DEBUG] Sample item:', {
                        device: approvedReports[0].items[0].device ? 'populated' : 'null',
                        level: approvedReports[0].items[0].level,
                        reason: approvedReports[0].items[0].reason
                    });
                }
            }

            // Flatten items từ tất cả reports
            const damagedItems = [];
            for (const report of approvedReports) {
                console.log('[DEBUG] Processing report:', report._id, 'Items:', report.items?.length || 0);

                for (const item of report.items || []) {
                    console.log('[DEBUG] Item device:', item.device ? item.device.maTB : 'null');

                    if (item.device) {
                        damagedItems.push({
                            categoryName: item.device.maDM?.tenDanhMuc || item.device.maDM?.name || 'N/A',
                            code: item.device.maTB || 'N/A',
                            name: item.device.tenTB || 'N/A',
                            quantity: 1, // Mỗi item là 1 thiết bị
                            unit: item.device.donViTinh || 'Bộ',
                            severity: item.level || 'trungbinh',
                            damageLevel: item.level || 'N/A',
                            brokenDate: item.broken_date,
                            reason: item.reason || ''
                        });
                    }
                }
            }

            console.log('[DEBUG] Total damaged items collected:', damagedItems.length);

            // Group by device code và tính tổng số lượng
            const groupedItems = {};
            for (const item of damagedItems) {
                const key = item.code;
                if (!groupedItems[key]) {
                    groupedItems[key] = { ...item, quantity: 0 };
                }
                groupedItems[key].quantity += item.quantity;
            }

            const finalItems = Object.values(groupedItems);
            console.log('[DEBUG] Final items after grouping:', finalItems.length);

            res.render('reports/views/damaged-summary', {
                title: 'Báo cáo thiết bị hỏng',
                currentPage: 'reports',
                user: req.user,
                items: finalItems,
                totalItems: finalItems.length,
                totalQuantity: finalItems.reduce((sum, item) => sum + item.quantity, 0)
            });
        } catch (err) {
            console.error('[ERROR] Error loading damaged equipment report:', err);
            res.status(500).send('Lỗi tải báo cáo thiết bị hỏng: ' + err.message);
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
