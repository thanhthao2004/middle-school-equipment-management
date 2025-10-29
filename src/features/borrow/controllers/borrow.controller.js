// Borrow Controller
const borrowService = require('../services/borrow.service');

class BorrowController {
    // GET /borrow/register - Đăng ký mượn thiết bị
    async getRegisterPage(req, res) {
        try {
            res.render('borrow/register', {
                title: 'Đăng ký mượn thiết bị',
                currentPage: 'register',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering register page:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải trang đăng ký mượn',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    // GET /borrow/history - Lịch sử mượn/trả
    async getHistoryPage(req, res) {
        try {
            res.render('borrow/history', {
                title: 'Lịch sử mượn/trả',
                currentPage: 'history',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering history page:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải trang lịch sử',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    // GET /borrow/status - Tình trạng phiếu mượn
    async getStatusPage(req, res) {
        try {
            res.render('borrow/status', {
                title: 'Tình trạng phiếu mượn',
                currentPage: 'status',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering status page:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải trang tình trạng',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    // GET /borrow/teacher-home - Trang chủ giáo viên
    async getTeacherHomePage(req, res) {
        try {
            res.render('borrow/teacher-home', {
                title: 'Trang chủ giáo viên',
                currentPage: 'teacher-home',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering teacher home page:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải trang chủ giáo viên',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    // POST /borrow/register - Xử lý đăng ký mượn
    async createBorrowRequest(req, res) {
        try {
            const borrowData = req.body;
            const userId = req.user?.id || 1; // Mock user ID
            
            const result = await borrowService.createBorrowRequest(userId, borrowData);
            
            res.json({
                success: true,
                message: 'Đăng ký mượn thành công!',
                data: result
            });
        } catch (error) {
            console.error('Error creating borrow request:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đăng ký mượn',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Có lỗi xảy ra'
            });
        }
    }

    // GET /borrow/slip/:id - Xem phiếu mượn
    async getBorrowSlip(req, res) {
        try {
            const slipId = req.params.id;
            const slip = await borrowService.getBorrowSlip(slipId);
            
            res.render('borrow/slip', {
                title: `Phiếu mượn ${slipId}`,
                currentPage: 'slip',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                slip: slip,
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering borrow slip:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải phiếu mượn',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    // GET /borrow/api/devices - API lấy danh sách thiết bị
    async getDevices(req, res) {
        try {
            const { category, class: classFilter, status, condition, location, origin, search } = req.query;
            
            const devices = await borrowService.getDevices({
                category,
                class: classFilter,
                status,
                condition,
                location,
                origin,
                search
            });
            
            res.json({
                success: true,
                data: devices
            });
        } catch (error) {
            console.error('Error fetching devices:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách thiết bị',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Có lỗi xảy ra'
            });
        }
    }
}

module.exports = new BorrowController();
