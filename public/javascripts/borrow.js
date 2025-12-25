// Borrow Feature JavaScript
// Global variables
let selectedDevices = [];
let filteredDevices = [];
let loadedDevices = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function () {
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
    if (!tbody) {
        console.error('equipmentTableBody not found!');
        return;
    }

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
        // Bỏ filter condition - chỉ hiển thị thiết bị sẵn sàng cho mượn
        const location = document.getElementById('locationFilter')?.value;
        const origin = document.getElementById('originFilter')?.value;
        const search = document.getElementById('searchInput')?.value;

        if (category) params.append('category', category);
        if (classFilter) params.append('class', classFilter);
        if (status) params.append('status', status);
        // Không gửi condition filter
        if (location) params.append('location', location);
        if (origin) params.append('origin', origin);
        if (search) params.append('search', search);

        const apiUrl = `/teacher/borrow/api/devices?${params.toString()}`;
        console.log('Fetching devices from:', apiUrl);

        const res = await fetch(apiUrl);
        console.log('Response status:', res.status);

        const json = await res.json();
        console.log('Response data:', json);

        if (!json.success) {
            throw new Error(json.message || 'Không thể tải danh sách thiết bị');
        }

        loadedDevices = json.data || [];
        console.log('Loaded devices count:', loadedDevices.length);

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
            fair: 'Khá',
            average: 'Trung bình',
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
                </td>
                <td><span class="badge bg-info">${categoryLabel}</span></td>
                <td>${device.unit || ''}</td>
                <td>${device.class || ''}</td>
                <td><span class="fw-bold text-success">${device.quantity ?? ''}</span></td>
                <td><span class="${device.status === 'available' ? 'status-available' : 'status-borrowed'}">${statusLabel}</span></td>
                <td><span class="condition-${device.condition}">${conditionLabel}</span></td>
                <td>${device.location || ''}</td>
                <td>${device.origin || ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails('${device.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
                <td>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input equipment-checkbox" 
                               data-device-id="${device.id}" 
                               data-max-quantity="${device.quantity ?? 0}"
                               ${(device.quantity ?? 0) === 0 ? 'disabled title="Thiết bị đã hết, không thể mượn"' : ''}>
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
    const filterIds = ['categoryFilter', 'classFilter', 'statusFilter', 'locationFilter', 'originFilter'];
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
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('equipment-checkbox')) {
            updateSelectionCounter();
        }
    });
}

// Store current device ID for selectDevice function
let currentViewingDeviceId = null;

function viewDetails(deviceId) {
    // Tìm thiết bị từ dữ liệu đã load
    const device = loadedDevices.find(d => String(d.id) === String(deviceId));
    if (!device) return;

    // Store device ID for selectDevice function
    currentViewingDeviceId = device.id;

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

    // Update device image with carousel if multiple images
    const imageContainer = document.querySelector('#deviceDetailsModal .bg-light.border.rounded.p-5');
    if (imageContainer && device.images && device.images.length > 0) {
        if (device.images.length === 1) {
            // Single image - simple display
            imageContainer.innerHTML = `<img src="${device.images[0]}" alt="${device.name}" class="img-fluid rounded" style="max-height: 300px; object-fit: contain;">`;
        } else {
            // Multiple images - use carousel
            let carouselHTML = `
                <div id="deviceModalCarousel" class="carousel slide" data-bs-ride="carousel">
                    <!-- Indicators -->
                    <div class="carousel-indicators">
                        ${device.images.map((img, idx) => `
                            <button type="button" data-bs-target="#deviceModalCarousel" data-bs-slide-to="${idx}" 
                                    class="${idx === 0 ? 'active' : ''}" aria-label="Slide ${idx + 1}"></button>
                        `).join('')}
                    </div>
                    
                    <!-- Slides -->
                    <div class="carousel-inner">
                        ${device.images.map((img, idx) => `
                            <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                                <img src="${img}" class="d-block w-100" alt="${device.name} - ${idx + 1}" 
                                     style="max-height: 300px; object-fit: contain; background: #f8f9fa;">
                                <div class="position-absolute top-0 end-0 m-2">
                                    <span class="badge bg-dark bg-opacity-75">${idx + 1} / ${device.images.length}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Controls -->
                    <button class="carousel-control-prev" type="button" data-bs-target="#deviceModalCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#deviceModalCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            `;
            imageContainer.innerHTML = carouselHTML;
        }
    } else if (imageContainer) {
        // Reset to placeholder if no image
        imageContainer.innerHTML = `
            <i class="fas fa-image fa-3x text-muted"></i>
            <p class="mt-2 text-muted">Hình ảnh thiết bị</p>
        `;
    }

    // Update device description/instruction
    const descriptionContainer = document.getElementById('deviceDescription');
    if (descriptionContainer) {
        if (device.description && device.description.trim()) {
            descriptionContainer.innerHTML = `<p class="mb-0">${device.description.replace(/\n/g, '<br>')}</p>`;
        } else {
            descriptionContainer.innerHTML = '<p class="mb-0 text-muted fst-italic">Không có hướng dẫn sử dụng</p>';
        }
    }

    const modal = new bootstrap.Modal(document.getElementById('deviceDetailsModal'));
    modal.show();
}

// Filter functions - Tối ưu với early return và cache
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const classFilter = document.getElementById('classFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    // Bỏ conditionFilter - không cần thiết cho đăng ký mượn
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

            // Bỏ filter condition - chỉ hiển thị thiết bị sẵn sàng

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
    const filterIds = ['categoryFilter', 'classFilter', 'statusFilter', 'locationFilter', 'originFilter', 'searchInput', 'borrowDateFrom', 'borrowDateTo'];

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
    const advancedFilterIds = ['statusFilter', 'locationFilter', 'originFilter'];

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

    // Use stored device ID or get from modal
    const deviceId = currentViewingDeviceId || document.getElementById('deviceId')?.textContent?.trim();

    if (!deviceId) {
        showErrorModal('Không tìm thấy thông tin thiết bị.');
        return;
    }

    // Find the checkbox for this device - try both string and number comparison
    let checkbox = document.querySelector(`input[data-device-id="${deviceId}"]`);

    // If not found, try finding by iterating through all checkboxes
    if (!checkbox) {
        const allCheckboxes = document.querySelectorAll('input.equipment-checkbox');
        for (let cb of allCheckboxes) {
            if (String(cb.dataset.deviceId) === String(deviceId)) {
                checkbox = cb;
                break;
            }
        }
    }

    if (checkbox && !checkbox.disabled) {
        // Check the checkbox
        checkbox.checked = true;

        // Trigger change event to update selection
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));

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
        const deviceName = document.getElementById('deviceName')?.textContent || 'thiết bị';
        showSuccessMessage(`Đã chọn thiết bị "${deviceName}" để mượn!`);
    } else {
        showErrorModal('Không thể chọn thiết bị này. Vui lòng kiểm tra trạng thái thiết bị hoặc tải lại trang.');
    }

    // Clear stored device ID
    currentViewingDeviceId = null;
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
        row.dataset.deviceId = device.deviceId; // Store deviceId in row data attribute
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
                <select class="form-select form-select-sm session-time" required style="min-width: 95px;">
                    <option value="">-- Ca --</option>
                    <option value="sang">Sáng</option>
                    <option value="chieu">Chiều</option>
                </select>
            </td>
            <td>
                <select class="form-select form-select-sm return-session-time" required style="min-width: 95px;">
                    <option value="">-- Ca --</option>
                    <option value="sang">Sáng</option>
                    <option value="chieu">Chiều</option>
                </select>
            </td>
            <td>
                <textarea class="form-control form-select-sm content-note" 
                          rows="2" placeholder="Nội dung..." required></textarea>
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
        input.addEventListener('input', function () {
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
        input.addEventListener('change', function () {
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
        // For select: check if value is empty or default placeholder
        // For input/textarea: check if trimmed value is empty
        let isEmpty = false;

        if (field.tagName === 'SELECT') {
            isEmpty = !field.value || field.value === '' || field.value.trim() === '';
        } else if (field.tagName === 'TEXTAREA') {
            isEmpty = !field.value || field.value.trim() === '';
        } else if (field.type === 'number') {
            // For number inputs, check if value exists and is valid number
            isEmpty = !field.value || isNaN(parseFloat(field.value));
        } else {
            isEmpty = !field.value || field.value.trim() === '';
        }

        if (isEmpty) {
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

    // Validate quantities: must be > 0 and <= max
    const quantities = document.querySelectorAll('.borrow-quantity');
    quantities.forEach(input => {
        const max = parseInt(input.dataset.max);
        const value = parseInt(input.value);

        if (isNaN(value) || value <= 0) {
            showErrorModal('Số lượng mượn phải lớn hơn 0!');
            input.classList.add('is-invalid');
            isValid = false;
            return;
        }

        if (value > max) {
            showErrorModal(`Số lượng mượn không được vượt quá ${max}!`);
            input.classList.add('is-invalid');
            isValid = false;
            return;
        }

        input.classList.remove('is-invalid');
    });

    if (!isValid) return;

    // Build payload for backend
    const rows = document.querySelectorAll('#borrowFormTable tr');
    const devices = [];

    rows.forEach((row) => {
        // Get deviceId from row data attribute (set when creating the row)
        let deviceId = row.dataset.deviceId;

        // Fallback: try to get from device-code text (format: "Mã: 123")
        if (!deviceId) {
            const deviceCodeText = row.querySelector('.device-code')?.textContent || '';
            const match = deviceCodeText.match(/Mã:\s*(\d+)/i);
            if (match) {
                deviceId = match[1];
            }
        }

        // Last fallback: try to get from any number in device-code
        if (!deviceId) {
            const deviceCodeText = row.querySelector('.device-code')?.textContent || '';
            const match = deviceCodeText.match(/(\d+)/);
            if (match) {
                deviceId = match[1];
            }
        }

        const quantityInput = row.querySelector('.borrow-quantity');

        if (deviceId && quantityInput) {
            // Ensure deviceId is valid
            const deviceIdStr = String(deviceId).trim();
            if (deviceIdStr) {
                devices.push({
                    deviceId: deviceIdStr,
                    quantity: parseInt(quantityInput.value, 10) || 1
                });
            }
        }
    });

    // Get SHARED date/session values (all devices use same dates/shifts on this form)
    const borrowDateInput = document.querySelector('.borrow-date');
    const returnDateInput = document.querySelector('.return-date');
    const sessionTimeInput = document.querySelector('.session-time');
    const returnSessionTimeInput = document.querySelector('.return-session-time');
    const contentInput = document.querySelector('.content-note');

    const payload = {
        devices,
        borrowDate: borrowDateInput?.value,
        returnDate: returnDateInput?.value,
        sessionTime: sessionTimeInput?.value,
        sessionTimeReturn: returnSessionTimeInput?.value || sessionTimeInput?.value, // Default to same shift
        content: contentInput?.value?.trim() || ''
    };

    console.log(' Sending payload to server:', JSON.stringify(payload, null, 2));

    // Show loading state
    const submitBtn = document.querySelector('#borrowFormModal .btn-primary');
    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
    submitBtn.disabled = true;

    fetch('/teacher/borrow/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async res => {
            console.log('📥 Response status:', res.status);

            let data;
            try {
                data = await res.json();
                console.log('📥 Response data:', data);
            } catch (e) {
                // If response is not JSON, show generic error
                console.error('❌ Failed to parse JSON:', e);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showErrorModal('Lỗi không xác định từ server. Vui lòng thử lại.');
                return;
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Handle HTTP 202 Accepted (async processing) or HTTP 200 OK (fallback)
            if (res.status === 202 || (res.ok && data.success)) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('borrowFormModal'));
                if (modal) {
                    modal.hide();
                }

                // Show appropriate message based on status
                const maPhieu = data.data?.maPhieu || data.data?.ticket?.maPhieu || 'N/A';
                const trangThai = data.data?.trangThai;

                if (trangThai === 'pending' || res.status === 202) {
                    // Async processing message
                    showSuccessMessage(
                        `Đăng ký mượn thành công! Yêu cầu đang được xử lý.\n\nMã yêu cầu tạm thời: ${maPhieu}\n\nBạn sẽ nhận được thông báo khi yêu cầu được phê duyệt.`
                    );
                } else {
                    // Direct processing message (fallback)
                    showSuccessModal(maPhieu);
                }

                // Refresh the page after 5s to allow user to see success modal
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                // Show actual error message from server
                const errorMsg = data.message || data.error || 'Có lỗi xảy ra khi đăng ký mượn';
                console.error('❌ Server error:', errorMsg);
                showErrorModal(errorMsg);
            }
        })
        .catch(err => {
            console.error('Error submitting borrow request:', err);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showErrorModal('Có lỗi khi gửi yêu cầu mượn. Vui lòng thử lại.');
        });
}

function showSuccessModal(maPhieu) {
    const slipId = maPhieu || 'PM0001';
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
                            <button class="btn btn-primary btn-lg" onclick="viewBorrowSlip('${slipId}')">
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
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            modalElement.remove();
        }
    }, 10000);
}

// Show simple success message (without ticket reference)
function showSuccessMessage(message) {
    const modalHtml = `
        <div class="modal fade" id="simpleSuccessModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="mb-3">
                            <i class="fas fa-check-circle fa-4x text-success"></i>
                        </div>
                        <h5 class="mb-3">THÀNH CÔNG</h5>
                        <p class="mb-4" style="white-space: pre-line;">${message}</p>
                        <button class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('simpleSuccessModal'));
    modal.show();

    // Auto remove modal after showing
    document.getElementById('simpleSuccessModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Show error modal for validation errors
function showErrorModal(message) {
    const modalHtml = `
        <div class="modal fade" id="errorModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="mb-3">
                            <i class="fas fa-exclamation-circle fa-4x text-danger"></i>
                        </div>
                        <h5 class="mb-3">LỖI</h5>
                        <p class="mb-4" style="white-space: pre-line;">${message}</p>
                        <button class="btn btn-danger" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();

    // Auto remove modal after showing
    document.getElementById('errorModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function viewBorrowSlip(maPhieu) {
    if (!maPhieu && maPhieu !== 'N/A') {
        window.location.href = '/teacher/borrow/history';
        return;
    }
    // Chuyển hướng đến trang chi tiết phiếu mượn
    // Giả sử URL là /teacher/borrow/slip?id=MA_PHIEU hoặc /teacher/borrow/history?open=MA_PHIEU
    // Dựa vào slip.ejs, nó lấy thông tin từ render, nên ta có thể redirect về history với param để mở modal hoặc trang slip riêng
    // Tuy nhiên, slip.ejs là một page riêng (route /teacher/borrow/slip/:id hoặc similar)
    // Check controller routes:
    // GET /teacher/borrow/:id -> chi tiết (see borrow.routes.js line 43)
    window.location.href = `/teacher/borrow/${maPhieu}?from=register`;
}
