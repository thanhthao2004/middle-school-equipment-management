// Return Slips Management for QLTB - Shows Active Borrow Tickets
(function () {
    'use strict';

    const API_BASE = '/manager/borrow/returns';

    // Initialize
    document.addEventListener('DOMContentLoaded', function () {
        loadReturnSlips();
        setupEventListeners();
    });

    function setupEventListeners() {
        // Filter button
        document.getElementById('btnFilter')?.addEventListener('click', function () {
            loadReturnSlips();
        });

        // Reset button
        document.getElementById('btnReset')?.addEventListener('click', function () {
            document.getElementById('searchInput').value = '';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            loadReturnSlips();
        });

        // Search on Enter
        document.getElementById('searchInput')?.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loadReturnSlips();
            }
        });
    }

    // Load active borrow tickets from API
    async function loadReturnSlips() {
        const tbody = document.getElementById('returnBody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin me-2"></i>Đang tải dữ liệu...</td></tr>';

        try {
            const search = document.getElementById('searchInput')?.value || '';
            const dateFrom = document.getElementById('dateFrom')?.value || '';
            const dateTo = document.getElementById('dateTo')?.value || '';

            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (dateFrom) params.append('createdFrom', dateFrom);
            if (dateTo) params.append('createdTo', dateTo);

            const url = `${API_BASE}/api${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Lỗi khi tải dữ liệu');
            }

            const tickets = result.data || [];

            if (tickets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Không có phiếu mượn nào đang mượn</td></tr>';
                return;
            }

            renderBorrowTickets(tickets);
        } catch (error) {
            console.error('Error loading borrow tickets:', error);
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>`;
        }
    }

    // Render active borrow tickets table
    function renderBorrowTickets(tickets) {
        const tbody = document.getElementById('returnBody');
        if (!tbody || !tickets || tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Không có phiếu mượn nào</td></tr>';
            return;
        }

        tbody.innerHTML = tickets.map(ticket => {
            const borrowDate = formatDate(ticket.ngayMuon);
            const returnDate = formatDate(ticket.ngayDuKienTra);
            const teacher = ticket.nguoiLapPhieuId?.hoTen || 'N/A';
            const totalItems = ticket.totalItems || ticket.details?.length || 0;
            const status = getStatusBadge(ticket.trangThai);

            return `
                <tr>
                    <td><strong>${ticket.maPhieu}</strong></td>
                    <td>${teacher}</td>
                    <td>${borrowDate}</td>
                    <td>${returnDate}</td>
                    <td class="text-center">${totalItems}</td>
                    <td>${status}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="/manager/borrow/returns/create?maPhieu=${ticket.maPhieu}" 
                               class="btn btn-primary" 
                               title="Tạo phiếu trả">
                                <i class="fas fa-undo"></i> Tạo phiếu trả
                            </a>
                            <a href="/manager/borrow/approvals/${ticket.maPhieu}" 
                               class="btn btn-info" 
                               title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Helper functions
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    }

    function getStatusBadge(status) {
        const statusMap = {
            'approved': '<span class="badge bg-warning">Đang mượn</span>',
            'dang_muon': '<span class="badge bg-warning">Đang mượn</span>',
            'da_tra_mot_phan': '<span class="badge bg-info">Đã trả 1 phần</span>',
            'cho_duyet': '<span class="badge bg-secondary">Chờ duyệt</span>',
            'da_tra': '<span class="badge bg-success">Đã trả</span>',
            'da_hoan_tat': '<span class="badge bg-success">Đã hoàn tất</span>'
        };
        return statusMap[status] || '<span class="badge bg-secondary">N/A</span>';
    }
})();
