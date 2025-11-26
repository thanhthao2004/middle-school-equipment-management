// Borrow Controller
const borrowService = require("../services/borrow.service");

class BorrowController {
    // GET /borrow/register - Đăng ký mượn thiết bị
    async getRegisterPage(req, res) {
        try {
            res.render('borrow/views/register', { 
                title: 'Đăng ký mượn thiết bị',
                currentPage: 'register',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering register page:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // GET /borrow/pending-approvals - Danh sách phiếu chờ duyệt
    async getPendingApprovalsPage(req, res) {
        try {
            const userId = req.user?.id || null; // Không dùng giá trị mặc định số
            const slips = await borrowService.getPendingApprovals(userId, {});
            res.render('borrow/views/pending-approvals', {
                title: 'Phiếu mượn chờ duyệt',
                currentPage: 'status',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                slips,
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering pending approvals page:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // API: GET /borrow/api/pending-approvals
    async getPendingApprovals(req, res) {
        try {
            const userId = req.user?.id || null; // Không dùng giá trị mặc định số
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
            res.render('borrow/views/history', { 
                title: 'Lịch sử mượn/trả',
                currentPage: 'history',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering history page:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // GET /borrow/status - Tình trạng phiếu mượn
    async getStatusPage(req, res) {
        try {
            // LƯU Ý: file 'borrow/status.ejs' không tồn tại.
            // Tạm thời render trang 'pending-approvals'
            res.render('borrow/views/pending-approvals', { // <-- ĐÃ SỬA
                title: 'Tình trạng phiếu mượn',
                currentPage: 'status',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering status page:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // GET /borrow/teacher-home - Trang chủ giáo viên
    async getTeacherHomePage(req, res) {
        try {
            res.render('borrow/views/teacher-home', { // <-- ĐÃ SỬA
                title: 'Trang chủ giáo viên',
                currentPage: 'teacher-home',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering teacher home page:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // POST /borrow/register - Xử lý đăng ký mượn
    async createBorrowRequest(req, res) {
        try {
            const borrowData = req.body;
            const userId = req.user?.id || null; // Không dùng giá trị mặc định số
            
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
            
            res.render('borrow/views/slip', { //
                title: `Phiếu mượn ${slipId}`,
                currentPage: 'slip',
                sidebarType: 'borrow-sidebar',
                bodyClass: '',
                slip: slip,
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' }
            });
        } catch (error) {
            console.error('Error rendering borrow slip:', error);
            res.status(500).send(error.message); // Sửa lỗi render
        }
    }

    // GET /borrow/return/:id - Xem chi tiết phiếu trả (cho giáo viên)
    async getReturnSlipForTeacher(req, res) {
        try {
            const slipId = req.params.id;
            const slip = await borrowService.getReturnSlip(slipId);
            
            res.render('borrow/views/return-slip', {
                title: `Phiếu trả ${slipId}`,
                currentPage: 'history',
                slip: slip,
                user: req.user || { name: 'Nguyễn Văn A', role: 'giao_vien' },
                readOnly: true // Chỉ xem, không có nút duyệt
            });
        } catch (error) {
            console.error('Error rendering return slip:', error);
            res.status(500).send(error.message);
        }
    }

    // API: GET /borrow/api/history
    async getHistoryApi(req, res) {
        try {
            const userId = req.user?.id || null; // Không dùng giá trị mặc định số
            const { status, createdFrom, createdTo, search, type } = req.query;
            const items = await borrowService.getBorrowHistory(userId, { 
                status, 
                createdFrom, 
                createdTo, 
                search,
                type 
            });
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

    // API: GET /borrow/api/borrow/pending - Lấy danh sách phiếu mượn chờ duyệt
    async getPendingBorrowSlips(req, res) {
        try {
            const slips = await borrowService.getPendingBorrows();
            res.json({ success: true, data: slips });
        } catch (error) {
            // Log lỗi chính xác là hàm service bị thiếu
            console.error("Error fetching pending borrows:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách phiếu mượn chờ duyệt",
            });
        }
    }

    // API: GET /borrow/api/return/pending - Lấy danh sách phiếu trả chờ duyệt
    async getPendingReturnSlips(req, res) {
        try {
            const slips = await borrowService.getPendingReturns();
            res.json({ success: true, data: slips });
        } catch (error) {
            console.error("Error fetching pending returns:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách phiếu trả chờ duyệt",
            });
        }
    }

    // API: POST /borrow/api/borrow/approve/:id - Duyệt phiếu mượn
    async approveBorrowSlip(req, res) {
        try {
            const slipId = req.params.id;
            const approvedBy = req.user?.name || "QLTB (Mock)";
            const result = await borrowService.approveBorrow(slipId, approvedBy);
            res.json({
                success: true,
                message: `Đã duyệt thành công phiếu mượn ${slipId}`,
                data: result,
            });
        } catch (error) {
            console.error("Error approving borrow slip:", error);
            res.status(500).json({ success: false, message: "Lỗi khi duyệt phiếu mượn" });
        }
    }

    // API: POST /borrow/api/borrow/reject/:id - Từ chối phiếu mượn
    async rejectBorrowSlip(req, res) {
        try {
            const slipId = req.params.id;
            const reason = "Từ chối bởi QLTB";
            const result = await borrowService.rejectBorrow(slipId, reason);
            res.json({
                success: true,
                message: `Đã từ chối phiếu mượn ${slipId}`,
                data: result,
            });
        } catch (error) {
            console.error("Error rejecting borrow slip:", error);
            res.status(500).json({ success: false, message: "Lỗi khi từ chối phiếu mượn" });
        }
    }

    // API: POST /borrow/api/return/approve/:id - Xác nhận trả phiếu (Duyệt phiếu trả)
    async approveReturnSlip(req, res) {
        try {
            const slipId = req.params.id;
            const confirmedBy = req.user?.name || "QLTB (Mock)";
            const result = await borrowService.approveReturn(slipId, confirmedBy);
            res.json({
                success: true,
                message: `Đã xác nhận trả thiết bị cho phiếu ${slipId}`,
                data: result,
            });
        } catch (error) {
            console.error("Error confirming return slip:", error);
            res.status(500).json({ success: false, message: "Lỗi khi xác nhận trả thiết bị" });
        }
    }

    // API: POST /borrow/api/return/reject/:id - Từ chối phiếu trả
    async rejectReturnSlip(req, res) {
        try {
            const slipId = req.params.id;
            const result = await borrowService.rejectBorrow(
                slipId,
                "Từ chối xác nhận trả"
            );
            res.json({
                success: true,
                message: `Đã từ chối phiếu trả ${slipId}`,
                data: result,
            });
        } catch (error) {
            console.error("Error rejecting return slip:", error);
            res.status(500).json({ success: false, message: "Lỗi khi từ chối phiếu trả" });
        }
    }

    // ========== MANAGER PAGE ==========

    // /borrow/manager/manager-home
    async getManagerHomePage(req, res) {
        res.render("borrow/views/manager/manager-home", {
            title: "Trang chủ QLTB",
            currentPage: "manager-home",
            user: req.user || { name: "QLTB (mock)", role: 'ql_thiet_bi' },
        });
    }

    // /borrow/manager/approvals
    async getApprovalsPage(req, res) {
        res.render("borrow/views/manager/borrow-approvals", {
            title: "Danh sách phiếu mượn",
            currentPage: "borrow-approvals",
            user: req.user || { name: "QLTB (mock)", role: 'ql_thiet_bi' },
        });
    }

    // /borrow/manager/borrow/:id
    async getBorrowDetailPage(req, res) {
        const slipId = req.params.id;
        res.render("borrow/views/manager/borrow-detail", {
            title: `Phiếu mượn ${slipId}`,
            id: slipId,
            currentPage: "borrow-approvals",
            user: req.user || { name: "QLTB (mock)", role: 'ql_thiet_bi' },
        });
    }

    // /borrow/manager/return-slips
    async getReturnSlipsListPage(req, res) {
        res.render("borrow/views/manager/return-slips-list", {
            title: "Danh sách phiếu trả",
            slips: [],
            currentPage: "return-slips",
            user: req.user || { name: "QLTB (mock)", role: 'ql_thiet_bi' },
        });
    }

    // /borrow/manager/return/:id
    async getReturnSlipDetailPage(req, res) {
        const slipId = req.params.id;
        res.render("borrow/views/manager/return-slip-detail", {
            title: `Phiếu trả ${slipId}`,
            id: slipId,
            currentPage: "return-slips",
            user: req.user || { name: "QLTB (mock)", role: 'ql_thiet_bi' },
        });
    }
}

module.exports = new BorrowController();
