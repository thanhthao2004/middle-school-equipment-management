const dateUtil = require('../utils/date.util');

/**
 * Middleware to provide global view helpers
 */
const viewHelpers = (req, res, next) => {
    // Make dateUtil functions available in all views
    res.locals.formatDate = dateUtil.formatDate;
    res.locals.formatDateTime = dateUtil.formatDateTime;

    // Helper: Translate Session
    res.locals.getSessionName = (session) => {
        const map = {
            'sang': 'Sáng',
            'chieu': 'Chiều',
            'toi': 'Tối'
        };
        return map[session] || session;
    };

    // Helper: Status Badge HTML
    res.locals.getStatusBadge = (status) => {
        const map = {
            'dang_muon': { class: 'bg-warning text-dark', text: 'Chờ duyệt' },
            'pending': { class: 'bg-warning text-dark', text: 'Đang xử lý' },
            'approved': { class: 'bg-success', text: 'Đã duyệt' },
            'da_hoan_tat': { class: 'bg-info text-dark', text: 'Đã hoàn tất' },
            'rejected': { class: 'bg-danger', text: 'Từ chối' },
            'huy': { class: 'bg-secondary', text: 'Đã hủy' }
        };

        const info = map[status] || { class: 'bg-secondary', text: status };
        return `<span class="badge ${info.class}">${info.text}</span>`;
    };

    next();
};

module.exports = viewHelpers;
