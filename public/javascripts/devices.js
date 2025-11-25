// Device Management JavaScript
// Global variables
let allDevices = [];
let filteredDevices = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    // Initialize all devices from table
    const tableBody = document.getElementById('equipmentTableBody');
    if (tableBody) {
        allDevices = Array.from(tableBody.querySelectorAll('tr'));
        filteredDevices = [...allDevices];
    }
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Filter selects
    const filterIds = [
        'categoryFilter', 
        'classFilter', 
        'statusFilter', 
        'conditionFilter', 
        'locationFilter', 
        'supplierFilter'
    ];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
    
    // Date filters
    const dateFilters = ['dateFrom', 'dateTo'];
    dateFilters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
}

// Debounce function for search
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

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const classFilter = document.getElementById('classFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const condition = document.getElementById('conditionFilter')?.value || '';
    const location = document.getElementById('locationFilter')?.value || '';
    const supplier = document.getElementById('supplierFilter')?.value || '';
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';
    
    const tableBody = document.getElementById('equipmentTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let show = true;
        
        // Search filter
        if (searchTerm) {
            const text = row.textContent.toLowerCase();
            if (!text.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Category filter
        if (show && category) {
            const rowCategory = row.getAttribute('data-category') || '';
            if (!rowCategory.includes(category)) {
                show = false;
            }
        }
        
        // Class filter
        if (show && classFilter) {
            const rowClass = row.getAttribute('data-class') || '';
            if (!rowClass.includes(classFilter)) {
                show = false;
            }
        }
        
        // Status filter
        if (show && status) {
            const rowStatus = row.getAttribute('data-status') || '';
            if (rowStatus !== status) {
                show = false;
            }
        }
        
        // Condition filter
        if (show && condition) {
            const rowCondition = row.getAttribute('data-condition') || '';
            if (rowCondition !== condition) {
                show = false;
            }
        }
        
        // Location filter
        if (show && location) {
            const locationCell = row.cells[8]; // Vị trí lưu trữ column
            if (locationCell && !locationCell.textContent.includes(location)) {
                show = false;
            }
        }
        
        // Supplier filter
        if (show && supplier) {
            const supplierCell = row.cells[9]; // Nhà cung cấp column
            if (supplierCell && !supplierCell.textContent.includes(supplier)) {
                show = false;
            }
        }
        
        // Date filter
        if (show && (dateFrom || dateTo)) {
            const dateCell = row.cells[10]; // Ngày nhập column
            if (dateCell) {
                const dateText = dateCell.textContent.trim();
                if (dateText !== 'N/A' && dateText) {
                    try {
                        const rowDate = new Date(dateText.split('/').reverse().join('-'));
                        if (dateFrom) {
                            const fromDate = new Date(dateFrom);
                            if (rowDate < fromDate) {
                                show = false;
                            }
                        }
                        if (dateTo) {
                            const toDate = new Date(dateTo);
                            toDate.setHours(23, 59, 59, 999);
                            if (rowDate > toDate) {
                                show = false;
                            }
                        }
                    } catch (e) {
                        // If date parsing fails, show the row
                    }
                }
            }
        }
        
        // Show/hide row
        if (show) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show empty state if no rows visible
    showEmptyStateIfNeeded(visibleCount === 0);
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('classFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('conditionFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('supplierFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    applyFilters();
}

// Toggle advanced filters
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    const toggleBtn = document.getElementById('toggleAdvancedBtn');
    const icon = toggleBtn.querySelector('i');
    
    if (advancedFilters.style.display === 'none' || !advancedFilters.style.display) {
        advancedFilters.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        advancedFilters.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Clear advanced filters
function clearAdvancedFilters() {
    document.getElementById('locationFilter').value = '';
    document.getElementById('supplierFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    applyFilters();
}

// Show empty state if needed
function showEmptyStateIfNeeded(show) {
    const tableBody = document.getElementById('equipmentTableBody');
    if (!tableBody) return;
    
    const tableCard = tableBody.closest('.card');
    if (!tableCard) return;
    
    // Check if empty state already exists
    let emptyState = tableCard.querySelector('.empty-state-filtered');
    
    if (show && !emptyState) {
        // Create empty state message
        emptyState = document.createElement('div');
        emptyState.className = 'empty-state-filtered text-center py-5';
        emptyState.innerHTML = `
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Không tìm thấy thiết bị nào phù hợp với bộ lọc</h5>
            <button class="btn btn-outline-primary mt-3" onclick="resetFilters()">
                <i class="fas fa-undo me-2"></i>Xóa bộ lọc
            </button>
        `;
        tableCard.querySelector('.card-body').appendChild(emptyState);
    } else if (!show && emptyState) {
        emptyState.remove();
    }
}

// Edit device
function editDevice(deviceId) {
    // Navigate to edit page
    window.location.href = `/devices/${deviceId}/edit`;
}

// Delete device
let currentDeleteDeviceId = null;
let currentDeleteDeviceInfo = null;

function deleteDevice(deviceId) {
    currentDeleteDeviceId = deviceId;
    
    // Get device info from table row
    const row = document.querySelector(`tr[data-device-id="${deviceId}"]`);
    if (row) {
        const nameCell = row.querySelector('td:nth-child(2) .fw-bold');
        if (nameCell) {
            currentDeleteDeviceInfo = `${nameCell.textContent.trim()} (Mã: ${deviceId})`;
        } else {
            currentDeleteDeviceInfo = `Mã thiết bị: ${deviceId}`;
        }
    } else {
        currentDeleteDeviceInfo = `Mã thiết bị: ${deviceId}`;
    }
    
    // Update modal content
    const deviceInfoEl = document.getElementById('deviceInfo');
    if (deviceInfoEl) {
        deviceInfoEl.textContent = currentDeleteDeviceInfo;
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Confirm delete action
document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (currentDeleteDeviceId) {
                // Make API call to delete device
                fetch(`/devices/${currentDeleteDeviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Hide modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        if (modal) {
                            modal.hide();
                        }
                        
                        // Show success message
                        showDeleteSuccessMessage('Xóa thiết bị thành công!');
                        
                        // Reload page or remove row after a short delay
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    } else {
                        return response.json().then(err => Promise.reject(err));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    const errorMessage = error.message || 'Có lỗi xảy ra khi xóa thiết bị';
                    
                    // Hide modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // Show error message
                    showDeleteErrorMessage(errorMessage);
                });
            }
        });
    }
});

function showDeleteSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function showDeleteErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Add device
function addDevice() {
    window.location.href = '/devices/create';
}

