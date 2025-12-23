// Return Slips Management for QLTB
(function() {
    'use strict';

    const API_BASE = '/manager/borrow/returns';

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadReturnSlips();
        setupEventListeners();
    });

    function setupEventListeners() {
        // Filter button
        document.getElementById('btnFilter')?.addEventListener('click', function() {
            loadReturnSlips();
        });

        // Reset button
        document.getElementById('btnReset')?.addEventListener('click', function() {
            document.getElementById('searchInput').value = '';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            loadReturnSlips();
        });

        // Search on Enter
        document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadReturnSlips();
            }
        });
    }

    // Load return slips from API
    async function loadReturnSlips() {
        const tbody = document.getElementById('returnBody');
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
                renderReturnSlips(result.data);
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Không thể tải dữ liệu</td></tr>';
            }
        } catch (error) {
            console.error('Error loading return slips:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Lỗi khi tải dữ liệu</td></tr>';
        }
    }

    // Render return slips table
    function renderReturnSlips(slips) {
        const tbody = document.getElementById('returnBody');
        if (!tbody) return;

        if (slips.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Không có phiếu trả nào</td></tr>';
            return;
        }

        tbody.innerHTML = slips.map(slip => {
            const ngayTra = slip.ngayTra ? new Date(slip.ngayTra).toLocaleDateString('vi-VN') : '-';
            const caTra = slip.caTraThucTe === 'sang' ? 'Sáng' : 'Chiều';
            const nguoiTra = slip.nguoiTraId?.hoTen || 'N/A';
            const soThietBi = slip.details?.length || 0;

            return `
                <tr>
                    <td class="fw-bold">${slip.maPhieuTra}</td>
                    <td>${slip.maPhieuMuon}</td>
                    <td>${nguoiTra}</td>
                    <td>${ngayTra}</td>
                    <td>${caTra}</td>
                    <td>${soThietBi}</td>
                    <td>${slip.ghiChu || '-'}</td>
                    <td>
                        <a href="/manager/borrow/returns/${slip.maPhieuTra}" class="btn btn-outline-primary btn-sm" title="Xem chi tiết">
                            <i class="fas fa-eye"></i> Xem
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }
})();

