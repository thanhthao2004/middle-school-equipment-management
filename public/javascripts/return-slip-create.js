// Create Return Slip for QLTB
(function () {
    'use strict';

    const API_BASE = '/manager/borrow/returns';
    const BORROWED_ITEMS_API = '/manager/borrow/returns/borrowed-items/api';
    let borrowedItems = [];

    // Initialize
    document.addEventListener('DOMContentLoaded', function () {
        setupEventListeners();
        // Set default return date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('returnDate').value = today;

        // Auto-load if maPhieu is in URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const maPhieuParam = urlParams.get('maPhieu');

        if (maPhieuParam) {
            const filterInput = document.getElementById('filterMaPhieu');
            if (filterInput) {
                filterInput.value = maPhieuParam;
                // Automatically trigger load after a short delay to ensure DOM is ready
                setTimeout(() => {
                    loadBorrowedItems();
                }, 100);
            }
        }
    });

    function setupEventListeners() {
        // Load borrowed items button
        document.getElementById('btnLoadBorrowedItems')?.addEventListener('click', function () {
            loadBorrowedItems();
        });

        // Select all checkbox
        document.getElementById('selectAll')?.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.item-checkbox input[type="checkbox"]:not(#selectAll)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateQuantityInputs();
        });

        // Form submit
        document.getElementById('returnSlipForm')?.addEventListener('submit', function (e) {
            e.preventDefault();
            createReturnSlip();
        });
    }

    // Load borrowed items
    async function loadBorrowedItems() {
        const tbody = document.getElementById('borrowedItemsBody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin me-2"></i>Đang tải dữ liệu...</td></tr>';

        try {
            const maPhieu = document.getElementById('filterMaPhieu')?.value || '';
            const params = new URLSearchParams();
            if (maPhieu) params.append('maPhieu', maPhieu);

            const response = await fetch(`${BORROWED_ITEMS_API}?${params.toString()}`);
            const result = await response.json();

            if (result.success && result.data) {
                borrowedItems = result.data.filter(item =>
                    item.remainingQty > 0 &&
                    (item.trangThai === 'dang_muon' || item.trangThai === 'da_tra_mot_phan')
                );
                renderBorrowedItems(borrowedItems);
            } else {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Không thể tải dữ liệu</td></tr>';
            }
        } catch (error) {
            console.error('Error loading borrowed items:', error);
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Lỗi khi tải dữ liệu</td></tr>';
        }
    }

    // Render borrowed items table
    function renderBorrowedItems(items) {
        const tbody = document.getElementById('borrowedItemsBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Không có thiết bị nào đang mượn</td></tr>';
            return;
        }

        tbody.innerHTML = items.map((item, index) => {
            const itemId = item._id || item.id;
            return `
                <tr data-item-id="${itemId}">
                    <td class="item-checkbox">
                        <input type="checkbox" class="item-check" data-item-id="${itemId}" data-index="${index}">
                    </td>
                    <td>${item.maPhieu}</td>
                    <td>${item.maTB}</td>
                    <td>${item.device?.tenTB || item.maTB}</td>
                    <td>${item.soLuongMuon}</td>
                    <td>${item.soLuongDaTra || 0}</td>
                    <td class="fw-bold">${item.remainingQty}</td>
                    <td>
                        <input type="number" 
                               class="form-control form-control-sm quantity-input return-qty" 
                               data-item-id="${itemId}"
                               data-max="${item.remainingQty}"
                               min="1" 
                               max="${item.remainingQty}" 
                               value="${item.remainingQty}"
                               disabled>
                    </td>
                    <td>
                        <select class="form-select form-select-sm condition-select" data-item-id="${itemId}" disabled>
                            <option value="Bình thường">Bình thường</option>
                            <option value="Tốt">Tốt</option>
                            <option value="Khá">Khá</option>
                            <option value="Hỏng">Hỏng</option>
                            <option value="Cần sửa chữa">Cần sửa chữa</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners to checkboxes
        document.querySelectorAll('.item-check').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const itemId = this.dataset.itemId;
                const qtyInput = document.querySelector(`.return-qty[data-item-id="${itemId}"]`);
                const conditionSelect = document.querySelector(`.condition-select[data-item-id="${itemId}"]`);

                if (this.checked) {
                    qtyInput.disabled = false;
                    conditionSelect.disabled = false;
                } else {
                    qtyInput.disabled = true;
                    conditionSelect.disabled = true;
                }
                updateQuantityInputs();
            });
        });

        // Add event listeners to quantity inputs
        document.querySelectorAll('.return-qty').forEach(input => {
            input.addEventListener('change', function () {
                const max = parseInt(this.dataset.max);
                const value = parseInt(this.value) || 0;
                if (value > max) {
                    this.value = max;
                    alert(`Số lượng trả không được vượt quá ${max}`);
                } else if (value < 1) {
                    this.value = 1;
                }
            });
        });
    }

    function updateQuantityInputs() {
        // Update select all checkbox state
        const checkboxes = document.querySelectorAll('.item-check');
        const checkedBoxes = document.querySelectorAll('.item-check:checked');
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
        }
    }

    // Create return slip
    async function createReturnSlip() {
        const checkedItems = document.querySelectorAll('.item-check:checked');

        if (checkedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một thiết bị để trả');
            return;
        }

        const returnDate = document.getElementById('returnDate').value;
        const returnShift = document.getElementById('returnShift').value;
        const notes = document.getElementById('notes').value;

        if (!returnDate) {
            alert('Vui lòng chọn ngày trả');
            return;
        }

        // Collect selected items data
        const borrowedItemIds = [];
        const quantities = {};
        const itemConditions = {};
        const itemNotes = {};

        checkedItems.forEach(checkbox => {
            const itemId = checkbox.dataset.itemId;
            borrowedItemIds.push(itemId);

            const qtyInput = document.querySelector(`.return-qty[data-item-id="${itemId}"]`);
            const conditionSelect = document.querySelector(`.condition-select[data-item-id="${itemId}"]`);

            if (qtyInput) {
                const qty = parseInt(qtyInput.value) || 0;
                const max = parseInt(qtyInput.dataset.max) || 0;

                if (qty > max) {
                    alert(`Số lượng trả cho thiết bị ${itemId} vượt quá số lượng còn lại`);
                    return;
                }

                quantities[itemId] = qty;
            }

            if (conditionSelect) {
                itemConditions[itemId] = conditionSelect.value;
            }
        });

        if (borrowedItemIds.length === 0) {
            alert('Vui lòng chọn ít nhất một thiết bị để trả');
            return;
        }

        // Show loading
        const submitBtn = document.querySelector('#returnSlipForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Đang tạo...';

        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    borrowedItemIds: borrowedItemIds,
                    returnDate: returnDate,
                    returnShift: returnShift,
                    notes: notes,
                    quantities: quantities,
                    itemConditions: itemConditions,
                    itemNotes: itemNotes
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Tạo phiếu trả thành công!');
                window.location.href = '/manager/borrow/returns';
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể tạo phiếu trả'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Error creating return slip:', error);
            alert('Lỗi khi tạo phiếu trả');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
})();
