// Borrow Approvals Management for QLTB
(function() {
    'use strict';

    const API_BASE = '/manager/borrow/approvals';
    let currentAction = null;
    let currentSlipId = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadBorrowTickets();
        setupEventListeners();
    });

    function setupEventListeners() {
        // Filter button
        document.getElementById('btnFilter')?.addEventListener('click', function() {
            loadBorrowTickets();
        });

        // Reset button
        document.getElementById('btnReset')?.addEventListener('click', function() {
            document.getElementById('searchInput').value = '';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            loadBorrowTickets();
        });

        // Search on Enter
        document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadBorrowTickets();
            }
        });

        // Confirm button in modal
        document.getElementById('confirmBtn')?.addEventListener('click', function() {
            if (currentAction === 'approve') {
                approveBorrow(currentSlipId);
            } else if (currentAction === 'reject') {
                rejectBorrow(currentSlipId);
            }
        });
    }

    // Load borrow tickets from API
    async function loadBorrowTickets() {
        const tbody = document.getElementById('borrowBody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin me-2"></i>Đang tải dữ liệu...</td></tr>';

        try {
            const search = document.getElementById('searchInput')?.value || '';
            const dateFrom = document.getElementById('dateFrom')?.value || '';
            const dateTo = document.getElementById('dateTo')?.value || '';

            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (dateFrom) params.append('createdFrom', dateFrom);
            if (dateTo) params.append('createdTo', dateTo);

            const response = await fetch(`${API_BASE}/api?${params.toString()}`);
            const result = await response.json();

            if (result.success && result.data) {
                renderBorrowTickets(result.data);
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Không thể tải dữ liệu</td></tr>';
            }
        } catch (error) {
            console.error('Error loading borrow tickets:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Lỗi khi tải dữ liệu</td></tr>';
        }
    }

    // Render borrow tickets table
    function renderBorrowTickets(tickets) {
        const tbody = document.getElementById('borrowBody');
        if (!tbody) return;

        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Không có phiếu mượn nào chờ duyệt</td></tr>';
            return;
        }

        tbody.innerHTML = tickets.map(ticket => {
            const statusBadge = getStatusBadge(ticket.trangThai);
            const ngayTao = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('vi-VN') : '-';
            const ngayMuon = ticket.ngayMuon ? new Date(ticket.ngayMuon).toLocaleDateString('vi-VN') : '-';
            const ngayTra = ticket.ngayDuKienTra ? new Date(ticket.ngayDuKienTra).toLocaleDateString('vi-VN') : '-';
            const teacherName = ticket.nguoiLapPhieuId?.hoTen || 'N/A';

            return `
                <tr data-id="${ticket.maPhieu}">
                    <td class="fw-bold">${ticket.maPhieu}</td>
                    <td>${teacherName}</td>
                    <td>${ngayTao}</td>
                    <td>${ngayMuon}</td>
                    <td>${ngayTra}</td>
                    <td>${ticket.lyDo || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="/manager/borrow/approvals/${ticket.maPhieu}" class="btn btn-outline-primary" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </a>
                            ${ticket.trangThai === 'cho_duyet' ? `
                                <button class="btn btn-outline-success" onclick="showApproveModal('${ticket.maPhieu}')" title="Duyệt">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="showRejectModal('${ticket.maPhieu}')" title="Từ chối">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get status badge HTML
    function getStatusBadge(status) {
        const statusMap = {
            'cho_duyet': { text: 'Chờ duyệt', class: 'bg-warning text-dark' },
            'approved': { text: 'Đã duyệt', class: 'bg-success' },
            'dang_muon': { text: 'Đang mượn', class: 'bg-info' },
            'rejected': { text: 'Từ chối', class: 'bg-danger' },
            'da_tra_mot_phan': { text: 'Đã trả một phần', class: 'bg-primary' },
            'da_hoan_tat': { text: 'Đã hoàn tất', class: 'bg-secondary' },
            'huy': { text: 'Đã hủy', class: 'bg-dark' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'bg-secondary' };
        return `<span class="badge status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    // Show approve modal
    window.showApproveModal = function(slipId) {
        currentAction = 'approve';
        currentSlipId = slipId;
        
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        document.getElementById('confirmModalTitle').textContent = 'Xác nhận duyệt phiếu mượn';
        document.getElementById('confirmModalBody').innerHTML = `
            <p>Bạn có chắc chắn muốn duyệt phiếu mượn <strong>${slipId}</strong> không?</p>
        `;
        modal.show();
    };

    // Show reject modal
    window.showRejectModal = function(slipId) {
        currentAction = 'reject';
        currentSlipId = slipId;
        
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        document.getElementById('confirmModalTitle').textContent = 'Xác nhận từ chối phiếu mượn';
        document.getElementById('confirmModalBody').innerHTML = `
            <p>Bạn có chắc chắn muốn từ chối phiếu mượn <strong>${slipId}</strong> không?</p>
            <div class="mb-3">
                <label for="rejectReason" class="form-label">Lý do từ chối:</label>
                <textarea id="rejectReason" class="form-control" rows="3" placeholder="Nhập lý do từ chối..."></textarea>
            </div>
        `;
        modal.show();
    };

    // Approve borrow ticket
    async function approveBorrow(slipId) {
        try {
            const response = await fetch(`${API_BASE}/${slipId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                alert('Đã duyệt phiếu mượn thành công!');
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                loadBorrowTickets();
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể duyệt phiếu mượn'));
            }
        } catch (error) {
            console.error('Error approving borrow:', error);
            alert('Lỗi khi duyệt phiếu mượn');
        }
    }

    // Reject borrow ticket
    async function rejectBorrow(slipId) {
        const reason = document.getElementById('rejectReason')?.value || 'Không rõ lý do';

        try {
            const response = await fetch(`${API_BASE}/${slipId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason })
            });

            const result = await response.json();

            if (result.success) {
                alert('Đã từ chối phiếu mượn thành công!');
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                loadBorrowTickets();
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể từ chối phiếu mượn'));
            }
        } catch (error) {
            console.error('Error rejecting borrow:', error);
            alert('Lỗi khi từ chối phiếu mượn');
        }
    }
})();

