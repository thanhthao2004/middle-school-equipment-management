// Borrow Feature JavaScript
// Global variables
let selectedDevices = [];
let filteredDevices = [];
let loadedDevices = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await initializePage();
    setupEventListeners();
    updateSelectionCounter();
});

async function initializePage() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const borrowDateFrom = document.getElementById('borrowDateFrom');
    const borrowDateTo = document.getElementById('borrowDateTo');
    
    if (borrowDateFrom) {
        borrowDateFrom.min = today;
    }
    if (borrowDateTo) {
        borrowDateTo.min = today;
    }

    // Load devices from API for register page
    const equipmentTableBody = document.getElementById('equipmentTableBody');
    if (equipmentTableBody) {
        await loadDevicesFromApi();
    }
}

async function loadDevicesFromApi() {
    const tbody = document.getElementById('equipmentTableBody');
    if (!tbody) return;

    // Show loading row
    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-4 text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i>Đang tải danh sách thiết bị...
            </td>
        </tr>
    `;

    try {
        const params = new URLSearchParams();
        const category = document.getElementById('categoryFilter')?.value;
        const classFilter = document.getElementById('classFilter')?.value;
        const status = document.getElementById('statusFilter')?.value;
        const condition = document.getElementById('conditionFilter')?.value;
        const location = document.getElementById('locationFilter')?.value;
        const origin = document.getElementById('originFilter')?.value;
        const search = document.getElementById('searchInput')?.value;

        if (category) params.append('category', category);
        if (classFilter) params.append('class', classFilter);
        if (status) params.append('status', status);
        if (condition) params.append('condition', condition);
        if (location) params.append('location', location);
        if (origin) params.append('origin', origin);
        if (search) params.append('search', search);

        const res = await fetch(`/borrow/api/devices?${params.toString()}`);
        const json = await res.json();

        if (!json.success) {
            throw new Error(json.message || 'Không thể tải danh sách thiết bị');
        }

        loadedDevices = json.data || [];

        if (loadedDevices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center py-4 text-muted">
                        Không có thiết bị phù hợp với bộ lọc hiện tại.
                    </td>
                </tr>
            `;
            return;
        }

        const categoryLabels = {
            chemistry: 'Hóa học',
            it: 'Tin học',
            literature: 'Ngữ văn',
            physics: 'Vật lý'
        };

        const statusLabels = {
            available: 'Có sẵn',
            borrowed: 'Đã mượn'
        };

        const conditionLabels = {
            good: 'Tốt',
            damaged: 'Hỏng'
        };

        tbody.innerHTML = '';

        loadedDevices.forEach(device => {
            const tr = document.createElement('tr');
            tr.dataset.category = device.category || '';
            tr.dataset.class = device.class || '';
            tr.dataset.status = device.status || '';
            tr.dataset.condition = device.condition || '';
            tr.dataset.deviceId = device.id;

            const categoryLabel = categoryLabels[device.category] || device.category || '';
            const statusLabel = statusLabels[device.status] || device.status || '';
            const conditionLabel = conditionLabels[device.condition] || device.condition || '';

            tr.innerHTML = `
                <td><span class="fw-bold text-primary">${device.id}</span></td>
                <td>
                    <div class="fw-bold">${device.name || ''}</div>
                    ${device.description ? `<small class="text-muted">${device.description}</small>` : ''}
                </td>
                <td><span class="badge bg-info">${categoryLabel}</span></td>
                <td>${device.unit || ''}</td>
                <td>${device.class || ''}</td>
                <td><span class="fw-bold text-success">${device.quantity ?? ''}</span></td>
                <td><span class="${device.status === 'available' ? 'status-available' : 'status-borrowed'}">${statusLabel}</span></td>
                <td><span class="${device.condition === 'good' ? 'condition-good' : 'condition-damaged'}">${conditionLabel}</span></td>
                <td>${device.location || ''}</td>
                <td>${device.origin || ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${device.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
                <td>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input equipment-checkbox" data-device-id="${device.id}" data-max-quantity="${device.quantity ?? 1}">
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Cập nhật danh sách hàng để filter
        filteredDevices = Array.from(document.querySelectorAll('#equipmentTableBody tr'));
    } catch (err) {
        console.error('Error loading devices:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center py-4 text-danger">
                    Không thể tải danh sách thiết bị. Vui lòng thử lại sau.
                </td>
            </tr>
        `;
    }
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Filter selects
    const filterIds = ['categoryFilter', 'classFilter', 'statusFilter', 'conditionFilter', 'locationFilter', 'originFilter'];
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', async () => {
                await loadDevicesFromApi();
                applyFilters();
            });
        }
    });
    
    // Date filters
    const dateFilters = ['borrowDateFrom', 'borrowDateTo'];
    dateFilters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', async () => {
                await loadDevicesFromApi();
                applyFilters();
            });
        }
    });
    
    // Checkbox changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('equipment-checkbox')) {
            updateSelectionCounter();
        }
    });
}

function viewDetails(deviceId) {
    // Tìm thiết bị từ dữ liệu đã load
    const device = loadedDevices.find(d => String(d.id) === String(deviceId));
    if (!device) return;

    const categoryLabels = {
        chemistry: 'Hóa học',
        it: 'Tin học',
        literature: 'Ngữ văn',
        physics: 'Vật lý'
    };

    const statusLabels = {
        available: 'Có sẵn',
        borrowed: 'Đã mượn'
    };

    const conditionLabels = {
        good: 'Tốt',
        damaged: 'Hỏng'
    };

    const modalElements = {
        'deviceName': device.name || '',
        'deviceId': device.id,
        'deviceCategory': categoryLabels[device.category] || device.category || '',
        'deviceUnit': device.unit || '',
        'deviceClass': device.class || '',
        'deviceQuantity': device.quantity ?? '',
        'deviceStatus': statusLabels[device.status] || device.status || '',
        'deviceCondition': conditionLabels[device.condition] || device.condition || '',
        'deviceLocation': device.location || '',
        'deviceOrigin': device.origin || '',
        'deviceSupplier': device.supplier || ''
    };
    
    Object.keys(modalElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = modalElements[id];
        }
    });
    
    const modal = new bootstrap.Modal(document.getElementById('deviceDetailsModal'));
    modal.show();
}

// Filter functions - Tối ưu với early return và cache
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const classFilter = document.getElementById('classFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const conditionFilter = document.getElementById('conditionFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const originFilter = document.getElementById('originFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';

    const rows = document.querySelectorAll('#equipmentTableBody tr');
    const searchLower = searchTerm.toLowerCase();
    
    // Tối ưu: Dùng requestAnimationFrame cho batch DOM updates
    requestAnimationFrame(() => {
        rows.forEach(row => {
            // Early return pattern - kiểm tra điều kiện nhanh nhất trước
            if (categoryFilter && row.dataset.category !== categoryFilter) {
                row.style.display = 'none';
                return;
            }
            
            if (statusFilter && row.dataset.status !== statusFilter) {
                row.style.display = 'none';
                return;
            }
            
            if (conditionFilter && row.dataset.condition !== conditionFilter) {
                row.style.display = 'none';
                return;
            }
            
            // Class filter - tối ưu với Set nếu có nhiều classes
            if (classFilter) {
                const classes = row.dataset.class?.split(',') || [];
                if (!classes.includes(classFilter)) {
                    row.style.display = 'none';
                    return;
                }
            }
            
            // Location filter
            if (locationFilter) {
                const locationCell = row.cells[8]?.textContent?.trim();
                if (locationCell !== locationFilter) {
                    row.style.display = 'none';
                    return;
                }
            }
            
            // Origin filter
            if (originFilter) {
                const originCell = row.cells[9]?.textContent?.trim();
                if (originCell !== originFilter) {
                    row.style.display = 'none';
                    return;
                }
            }
            
            // Search filter - tối ưu với includes() thay vì regex
            if (searchLower) {
                const deviceName = (row.cells[1]?.textContent || '').toLowerCase();
                const deviceId = (row.cells[0]?.textContent || '').toLowerCase();
                if (!deviceName.includes(searchLower) && !deviceId.includes(searchLower)) {
                    row.style.display = 'none';
                    return;
                }
            }
            
            // Hiển thị row nếu pass tất cả filters
            row.style.display = '';
            row.classList.add('table-row-enter');
            setTimeout(() => row.classList.remove('table-row-enter'), 300);
        });
        
        updateSelectionCounter();
    });
}

function resetFilters() {
    const filterIds = ['categoryFilter', 'classFilter', 'statusFilter', 'conditionFilter', 'locationFilter', 'originFilter', 'searchInput', 'borrowDateFrom', 'borrowDateTo'];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });
    
    applyFilters();
}

function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    const advancedButtons = document.getElementById('advancedFilterButtons'); // Thêm dòng này
    const toggleBtn = document.getElementById('toggleAdvancedBtn');
    
    if (advancedFilters && toggleBtn && advancedButtons) { // Thêm advancedButtons vào
        const icon = toggleBtn.querySelector('i');
        
        if (advancedFilters.style.display === 'none') {
            advancedFilters.style.display = 'block';
            advancedButtons.style.display = 'block'; 
            icon.className = 'fas fa-chevron-up me-1';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up me-1"></i>Ẩn bộ lọc nâng cao';
        } else {
            advancedFilters.style.display = 'none';
            advancedButtons.style.display = 'none'; 
            icon.className = 'fas fa-chevron-down me-1';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down me-1"></i>Bộ lọc nâng cao';
        }
    }
}

function clearAdvancedFilters() {
    const advancedFilterIds = ['statusFilter', 'conditionFilter', 'locationFilter', 'originFilter'];
    
    advancedFilterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });
    
    applyFilters();
}

function selectAllAvailable() {
    const checkboxes = document.querySelectorAll('.equipment-checkbox:not(:disabled)');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateSelectionCounter();
}

function cancelSelection() {
    const checkboxes = document.querySelectorAll('.equipment-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectionCounter();
}

function updateSelectionCounter() {
    const selectedCheckboxes = document.querySelectorAll('.equipment-checkbox:checked');
    const count = selectedCheckboxes.length;
    const counter = document.getElementById('selectionCounter');
    const countSpan = document.getElementById('selectedCount');
    
    if (countSpan) {
        countSpan.textContent = count;
    }
    
    if (counter) {
        if (count > 0) {
            counter.style.display = 'inline-block';
        } else {
            counter.style.display = 'none';
        }
    }
}

function selectDevice() {
    // Close details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('deviceDetailsModal'));
    if (detailsModal) {
        detailsModal.hide();
    }
    
    // Get device ID from modal and find corresponding checkbox
    const deviceId = document.getElementById('deviceId')?.textContent;
    if (deviceId) {
        // Find the checkbox for this device
        const checkbox = document.querySelector(`input[data-device-id="${deviceId}"]`);
        if (checkbox && !checkbox.disabled) {
            // Check the checkbox
            checkbox.checked = true;
            
            // Update selection counter
            updateSelectionCounter();
            
            // Scroll to the table to show the selected item
            const tableContainer = document.querySelector('.table-responsive');
            if (tableContainer) {
                tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Highlight the selected row briefly
            const row = checkbox.closest('tr');
            if (row) {
                row.classList.add('row-highlight');
                setTimeout(() => {
                    row.classList.remove('row-highlight');
                }, 2000);
            }
            
            // Show success message
            showSuccessMessage(`Đã chọn thiết bị "${document.getElementById('deviceName')?.textContent}" để mượn!`);
        } else {
            showErrorModal('Không thể chọn thiết bị này. Vui lòng kiểm tra trạng thái thiết bị.');
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function openBorrowForm() {
    // Get selected devices from checkboxes
    const selectedDevices = [];
    const checkboxes = document.querySelectorAll('.equipment-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showErrorModal('Vui lòng chọn ít nhất một thiết bị để mượn!');
        return;
    }
    
    checkboxes.forEach((checkbox, index) => {
        const row = checkbox.closest('tr');
        const cells = row.querySelectorAll('td');
        const deviceId = checkbox.dataset.deviceId;
        const maxQuantity = parseInt(checkbox.dataset.maxQuantity);
        
        selectedDevices.push({
            st: index + 1,
            deviceId: deviceId,
            name: cells[1]?.querySelector('.fw-bold')?.textContent || '',
            category: cells[2]?.textContent || '',
            unit: cells[3]?.textContent || '',
            quantity: cells[5]?.textContent || '',
            maxQuantity: maxQuantity,
            location: cells[8]?.textContent || '',
            origin: cells[9]?.textContent || ''
        });
    });
    
    // Populate borrow form table
    const tbody = document.getElementById('borrowFormTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    selectedDevices.forEach(device => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center fw-bold">${device.st}</td>
            <td>
                <div class="device-name">${device.name}</div>
                <div class="device-code">Mã: ${device.deviceId}</div>
            </td>
            <td class="text-center"><span class="badge bg-info">${device.category}</span></td>
            <td class="text-center">${device.unit}</td>
            <td class="text-center">
                <span class="fw-bold text-success">${device.quantity}</span>
            </td>
            <td>${device.location}</td>
            <td class="text-center">${device.origin}</td>
            <td>
                <input type="date" class="form-control form-control-sm borrow-date" 
                       value="${today.toISOString().split('T')[0]}" 
                       min="${today.toISOString().split('T')[0]}" required>
            </td>
            <td>
                <input type="date" class="form-control form-control-sm return-date" 
                       value="${nextWeek.toISOString().split('T')[0]}" 
                       min="${today.toISOString().split('T')[0]}" required>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm borrow-quantity" 
                       value="1" min="1" max="${device.maxQuantity}" 
                       data-max="${device.maxQuantity}" required>
                <small class="text-muted d-block mt-1">Tối đa: ${device.maxQuantity}</small>
            </td>
            <td>
                <select class="form-select form-select-sm session-time" required style="min-width: 120px;">
                    <option value="">-- Chọn ca --</option>
                    <option value="sang">Sáng (7:00-11:30)</option>
                    <option value="chieu">Chiều (13:00-17:30)</option>
                </select>
            </td>
            <td>
                <textarea class="form-control form-control-sm content-note" 
                          rows="2" placeholder="Nội dung dạy học..." required></textarea>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners for form validation
    addFormValidationListeners();
    
    const modal = new bootstrap.Modal(document.getElementById('borrowFormModal'));
    modal.show();
}

function addFormValidationListeners() {
    // Quantity validation
    document.querySelectorAll('.borrow-quantity').forEach(input => {
        input.addEventListener('input', function() {
            const max = parseInt(this.dataset.max);
            const value = parseInt(this.value);
            
            if (value > max) {
                this.value = max;
                showErrorModal(`Số lượng mượn không được vượt quá ${max}`);
            }
        });
    });
    
    // Date validation
    document.querySelectorAll('.borrow-date, .return-date').forEach(input => {
        input.addEventListener('change', function() {
            validateBorrowDates();
        });
    });
}

function validateBorrowDates() {
    const borrowDates = document.querySelectorAll('.borrow-date');
    const returnDates = document.querySelectorAll('.return-date');
    
    borrowDates.forEach((borrowInput, index) => {
        const returnInput = returnDates[index];
        const borrowDate = new Date(borrowInput.value);
        const returnDate = new Date(returnInput.value);
        
        if (returnDate < borrowDate) {
            returnInput.value = borrowInput.value;
            showErrorModal('Ngày trả phải sau hoặc bằng ngày mượn!');
        }
    });
}

function submitBorrowForm() {
    // Validate all required fields
    const requiredFields = document.querySelectorAll('#borrowFormTable input[required], #borrowFormTable select[required], #borrowFormTable textarea[required]');
    let isValid = true;
    let errorMessage = '';
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc!';
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    if (!isValid) {
        showErrorModal(errorMessage);
        return;
    }
    
    // Validate dates - Reset time về 00:00:00 để chỉ so sánh ngày
    const borrowDates = document.querySelectorAll('.borrow-date');
    const returnDates = document.querySelectorAll('.return-date');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (let i = 0; i < borrowDates.length; i++) {
        const borrowDate = new Date(borrowDates[i].value);
        borrowDate.setHours(0, 0, 0, 0);
        
        const returnDate = new Date(returnDates[i].value);
        returnDate.setHours(0, 0, 0, 0);
        
        if (returnDate < borrowDate) {
            showErrorModal('Ngày trả phải sau hoặc bằng ngày mượn!');
            return;
        }
        
        // Phải đăng ký ít nhất 1 ngày trước (tức là >= tomorrow)
        // Ví dụ: Hôm nay 20/11, chọn 21/11 là OK (21/11 >= 21/11)
        if (borrowDate < tomorrow) {
            showErrorModal('Cần đăng ký sớm hơn (≥1 ngày) trước buổi dạy!');
            return;
        }
    }
    
    // Validate quantities
    const quantities = document.querySelectorAll('.borrow-quantity');
    quantities.forEach(input => {
        const max = parseInt(input.dataset.max);
        const value = parseInt(input.value);
        
        if (value > max) {
            showErrorModal(`Số lượng mượn không được vượt quá ${max}!`);
            isValid = false;
        }
    });
    
    if (!isValid) return;

    // Build payload for backend
    const rows = document.querySelectorAll('#borrowFormTable tr');
    const devices = [];

    rows.forEach((row) => {
        const deviceCodeText = row.querySelector('.device-code')?.textContent || '';
        const match = deviceCodeText.match(/(\d+)/);
        const deviceId = match ? parseInt(match[1], 10) : null;

        const quantityInput = row.querySelector('.borrow-quantity');

        if (deviceId && quantityInput) {
            devices.push({
                deviceId: deviceId,
                quantity: parseInt(quantityInput.value, 10) || 1
            });
        }
    });

    const borrowDateInput = document.querySelector('.borrow-date');
    const returnDateInput = document.querySelector('.return-date');
    const sessionInput = document.querySelector('.session-time');
    const contentInput = document.querySelector('.content-note');

    const payload = {
        devices,
        borrowDate: borrowDateInput?.value,
        returnDate: returnDateInput?.value,
        sessionTime: sessionInput?.value,
        content: contentInput?.value?.trim() || ''
    };

    // Show loading state
    const submitBtn = document.querySelector('#borrowFormModal .btn-primary');
    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
    submitBtn.disabled = true;

    fetch('/borrow/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (!data.success) {
            showErrorModal(data.message || 'Đăng ký mượn thất bại. Vui lòng thử lại.');
            return;
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('borrowFormModal'));
        if (modal) {
            modal.hide();
        }

        showSuccessModal();
    })
    .catch(err => {
        console.error('Error submitting borrow request:', err);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showErrorModal('Có lỗi khi gửi yêu cầu mượn. Vui lòng thử lại.');
    });
}

function showSuccessModal() {
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-5">
                        <div class="mb-4">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="text-success mb-3 fw-bold">THÔNG BÁO</h4>
                        <h5 class="text-success mb-4">ĐĂNG KÝ MƯỢN THÀNH CÔNG!</h5>
                        <p class="text-muted mb-4">Phiếu mượn đã được tạo và gửi đến email của bạn.</p>
                        <div class="d-flex gap-3 justify-content-center">
                            <button class="btn btn-primary btn-lg" onclick="viewBorrowSlip()">
                                <i class="fas fa-file-alt me-2"></i>Xem phiếu mượn
                            </button>
                            <button class="btn btn-outline-secondary btn-lg" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Auto remove modal after 10 seconds
    setTimeout(() => {
        const modalElement = document.getElementById('successModal');
        if (modalElement) {
            modalElement.remove();
        }
    }, 10000);
}

function showErrorModal(message) {
    const modalHtml = `
        <div class="modal fade" id="errorModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="mb-3">
                            <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                        </div>
                        <h4 class="text-danger mb-3 fw-bold">THÔNG BÁO LỖI</h4>
                        <p class="mb-4 text-muted">${message}</p>
                        <button class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-2"></i>Đã hiểu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
    
    // Auto remove modal after 5 seconds
    setTimeout(() => {
        const modalElement = document.getElementById('errorModal');
        if (modalElement) {
            modalElement.remove();
        }
    }, 5000);
}

function showSuccessMessage(message) {
    // Create toast notification
    const toastHtml = `
        <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" id="successToast">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show toast
    const toastElement = document.getElementById('successToast');
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function viewBorrowSlip() {
    // Close success modal
    const successModal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
    if (successModal) {
        successModal.hide();
    }
    
    // Show borrow slip
    window.location.href = '/borrow/slip/PM01';
}
