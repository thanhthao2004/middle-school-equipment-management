// Device Stats Controller
const deviceStatsService = require('../services/device-stats.service');

class DeviceStatsController {
    // GET /device-stats - Trang thống kê thiết bị
    async getOverviewPage(req, res) {
        try {
            const stats = await deviceStatsService.getOverviewStats();

            res.render('device-stats/views/overview', {
                title: 'Thống kê thiết bị',
                currentPage: 'device-stats',
                sidebarType: 'qltb-sidebar',
                stats,
                user: req.user || { role: 'ql_thiet_bi' }
            });
        } catch (error) {
            console.error('Error rendering device stats overview page:', error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new DeviceStatsController();

