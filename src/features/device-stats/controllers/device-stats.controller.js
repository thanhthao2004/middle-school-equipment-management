// Device Stats Controller
class DeviceStatsController {
    // GET /device-stats - Trang thống kê thiết bị
    async getOverviewPage(req, res) {
        try {
            res.render('device-stats/views/overview', {
                title: 'Thống kê thiết bị',
                currentPage: 'device-stats',
                sidebarType: 'qltb-sidebar'
            });
        } catch (error) {
            console.error('Error rendering device stats overview page:', error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new DeviceStatsController();

