// Borrow Controller
const borrowService = require('../services/borrow.service');

class BorrowController {
    // GET /borrow/register - Đăng ký mượn thiết bị
    async getRegisterPage(req, res) {
        try {
            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
            res.render('borrow/register', {
                title: 'Đăng ký mượn thiết bị',
                currentPage: 'register',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering register page:', error);
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // GET /borrow/pending-approvals - Danh sách phiếu chờ duyệt
    async getPendingApprovalsPage(req, res) {
        try {
            const userId = req.user?.id || 1;
            const slips = await borrowService.getPendingApprovals(userId, {});
            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
            res.render('borrow/pending-approvals', {
                title: 'Phiếu mượn chờ duyệt',
                currentPage: 'status',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                slips
            });
        } catch (error) {
            console.error('Error rendering pending approvals page:', error);
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // API: GET /borrow/api/pending-approvals
    async getPendingApprovals(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { id, createdFrom, createdTo, search } = req.query;
            const slips = await borrowService.getPendingApprovals(userId, { id, createdFrom, createdTo, search });
            res.json({ success: true, data: slips });
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách chờ duyệt' });
        }
    }

    // API: POST /borrow/api/cancel/:id
    async cancelBorrow(req, res) {
        try {
            const slipId = req.params.id;
            await borrowService.cancelBorrow(slipId);
            res.json({ success: true, message: 'Hủy mượn thành công' });
        } catch (error) {
            console.error('Error canceling borrow:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi hủy phiếu mượn' });
        }
    }

    // GET /borrow/history - Lịch sử mượn/trả
    async getHistoryPage(req, res) {
        try {
            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
            res.render('borrow/history', {
                title: 'Lịch sử mượn/trả',
                currentPage: 'history',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering history page:', error);
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // GET /borrow/status - Tình trạng phiếu mượn
    async getStatusPage(req, res) {
        try {
            // Tạm thời render trang 'pending-approvals'
            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
            res.render('borrow/pending-approvals', {
                title: 'Tình trạng phiếu mượn',
                currentPage: 'status',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering status page:', error);
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // GET /borrow/teacher-home - Trang chủ giáo viên
    async getTeacherHomePage(req, res) {
        try {
            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
            res.render('borrow/teacher-home', {
                title: 'Trang chủ giáo viên',
                currentPage: 'teacher-home',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'Giáo viên bộ môn' }
            });
        } catch (error) {
            console.error('Error rendering teacher home page:', error);
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // POST /borrow/register - Xử lý đăng ký mượn
    async createBorrowRequest(req, res) {
        try {
            const borrowData = req.body;
            const userId = req.user?.id;

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

            // FIX: Sử dụng đường dẫn tương đối từ views root (src/views)
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
            // Sửa lỗi render
            res.status(500).send(error.message);
        }
    }

    // API: GET /borrow/api/history
    async getHistoryApi(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { status, createdFrom, createdTo, search } = req.query;
            const items = await borrowService.getBorrowHistory(userId, { status, createdFrom, createdTo, search });
            res.json({ success: true, data: items });
        } catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử mượn/trả' });
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

    // =================================================================
    // QLTB (Equipment Manager) - Các hàm được thêm ở bước trước 
    // =================================================================

    // GET /borrow-management/approvals - Trang duyệt phiếu mượn (QLTB)
    async getBorrowApprovalsPage(req, res) {
        try {
            const slips = await borrowService.getApprovalsList({}); // Giả lập lấy tất cả
            res.render('borrow/admin-borrow-approvals', { // FIX path
                title: 'Duyệt Phiếu Mượn Thiết Bị',
                active: 'borrow-mgmt',
                slips
            });
        } catch (error) {
            console.error('Error rendering admin borrow approvals page:', error);
            res.status(500).send(error.message);
        }
    }

    // GET /borrow-management/returns - Trang duyệt phiếu trả (QLTB)
    async getReturnApprovalsPage(req, res) {
        try {
            const returns = await borrowService.getReturnsList({}); // Giả lập lấy tất cả
            res.render('borrow/admin-return-approvals', { // FIX path
                title: 'Xác nhận Phiếu Trả Thiết Bị',
                active: 'return-mgmt',
                returns
            });
        } catch (error) {
            console.error('Error rendering admin return approvals page:', error);
            res.status(500).send(error.message);
        }
    }

    // POST /borrow-management/api/approve/:id - API Duyệt phiếu mượn
    async approveBorrowSlip(req, res) {
        try {
            const slipId = req.params.id;
            const approvedBy = req.user?.hoTen || req.user?.name;
            await borrowService.approveBorrow(slipId, approvedBy);
            res.json({ success: true, message: `Đã duyệt thành công phiếu mượn ${slipId}` });
        } catch (error) {
            console.error('Error approving borrow slip:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi duyệt phiếu mượn' });
        }
    }

    // POST /borrow-management/api/reject/:id - API Từ chối phiếu mượn
    async rejectBorrowSlip(req, res) {
        try {
            const slipId = req.params.id;
            const { reason } = req.body;
            await borrowService.rejectBorrow(slipId, reason || 'Không rõ lý do');
            res.json({ success: true, message: `Đã từ chối phiếu mượn ${slipId}` });
        } catch (error) {
            console.error('Error rejecting borrow slip:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi từ chối phiếu mượn' });
        }
    }

    // POST /borrow-management/api/confirm-return/:id - API Xác nhận trả
    async confirmReturnSlip(req, res) {
        try {
            const slipId = req.params.id;
            const confirmedBy = req.user?.hoTen || req.user?.name;
            // Giả lập chi tiết trả từ body req.body.returnDetails
            await borrowService.confirmReturn(slipId, confirmedBy, req.body.details);
            res.json({ success: true, message: `Đã xác nhận trả thiết bị cho phiếu ${slipId}` });
        } catch (error) {
            console.error('Error confirming return slip:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi xác nhận trả thiết bị' });
        }
    }

}

module.exports = new BorrowController();