// Device Edit Form JavaScript
// Validation and form handling for UC_QLTB8.4

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupImagePreview();
});

function initializeForm() {
    // Set max date to today for ngayNhap
    const today = new Date().toISOString().split('T')[0];
    const ngayNhapInput = document.getElementById('ngayNhap');
    if (ngayNhapInput) {
        ngayNhapInput.max = today;
        // Don't set default value - keep existing date
    }
}

function setupEventListeners() {
    const form = document.getElementById('deviceForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Real-time validation
    const requiredFields = ['tenTB', 'category', 'soLuong', 'viTriLuuTru', 'supplier', 'ngayNhap'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldId));
            field.addEventListener('input', () => clearFieldError(fieldId));
        }
    });
    
    // Image validation - check if image is required
    const imageInput = document.getElementById('hinhAnh');
    const currentImage = document.getElementById('currentImage');
    const imageRequired = document.getElementById('hinhAnhRequired');
    
    if (imageInput) {
        // If no current image, image is required
        const isImageRequired = !currentImage || imageRequired;
        
        if (isImageRequired) {
            requiredFields.push('hinhAnh');
            imageInput.addEventListener('blur', () => validateField('hinhAnh'));
        }
        
        imageInput.addEventListener('change', () => {
            if (imageInput.files && imageInput.files.length > 0) {
                validateField('hinhAnh');
            } else if (!isImageRequired) {
                clearFieldError('hinhAnh');
            }
        });
    }
}

function setupImagePreview() {
    const imageInput = document.getElementById('hinhAnh');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const currentImage = document.getElementById('currentImage');
    
    if (imageInput && previewDiv && previewImg) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        previewDiv.style.display = 'block';
                        
                        // Hide current image if new one is selected
                        if (currentImage) {
                            currentImage.style.opacity = '0.5';
                        }
                    };
                    reader.readAsDataURL(file);
                    clearFieldError('hinhAnh');
                } else {
                    showFieldError('hinhAnh', 'Vui lòng chọn file hình ảnh hợp lệ.');
                    previewDiv.style.display = 'none';
                }
            } else {
                previewDiv.style.display = 'none';
                if (currentImage) {
                    currentImage.style.opacity = '1';
                }
            }
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateAllFields();
    
    if (!isValid) {
        // Scroll to first error
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
    
    // Get device ID from form action
    const formAction = e.target.getAttribute('action');
    const deviceId = formAction.split('/').pop();
    
    // Submit form
    const formData = new FormData(e.target);
    
    fetch(`/devices/${deviceId}`, {
        method: 'PUT',
        body: formData,
        headers: {
            'X-HTTP-Method-Override': 'PUT'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(err => Promise.reject(err));
    })
    .then(data => {
        // Show success message
        showSuccessMessage('Sửa thiết bị thành công!');
        
        // Redirect to device list after 1.5 seconds
        setTimeout(() => {
            window.location.href = '/devices';
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = error.message || 'Có lỗi xảy ra khi sửa thiết bị. Vui lòng thử lại.';
        showErrorMessage(errorMessage);
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

function validateAllFields() {
    let isValid = true;
    
    // Validate Tên thiết bị (Required)
    if (!validateField('tenTB')) {
        isValid = false;
    }
    
    // Validate Danh mục (Required)
    if (!validateField('category')) {
        isValid = false;
    }
    
    // Validate Số lượng tồn (Required, >= 0)
    if (!validateField('soLuong')) {
        isValid = false;
    }
    
    // Validate Vị trí lưu trữ (Required)
    if (!validateField('viTriLuuTru')) {
        isValid = false;
    }
    
    // Validate Nhà cung cấp (Required)
    if (!validateField('supplier')) {
        isValid = false;
    }
    
    // Validate Ngày nhập (Required, not future)
    if (!validateField('ngayNhap')) {
        isValid = false;
    }
    
    // Validate Hình ảnh (Required if no current image exists)
    const imageInput = document.getElementById('hinhAnh');
    const currentImage = document.getElementById('currentImage');
    const imageRequired = document.getElementById('hinhAnhRequired');
    
    if (imageInput) {
        // If no current image, image is required
        const isImageRequired = !currentImage || (imageRequired && imageRequired.style.display !== 'none');
        
        if (isImageRequired) {
            if (!validateField('hinhAnh')) {
                isValid = false;
            }
        } else if (imageInput.files && imageInput.files.length > 0) {
            // If new file is selected, validate it
            if (!validateField('hinhAnh')) {
                isValid = false;
            }
        }
    }
    
    return isValid;
}

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldId) {
        case 'tenTB':
            if (!field.value.trim()) {
                isValid = false;
                errorMessage = 'Vui lòng nhập tên thiết bị.';
            }
            break;
            
        case 'category':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Vui lòng chọn danh mục thiết bị.';
            }
            break;
            
        case 'soLuong':
            const quantity = parseInt(field.value);
            if (!field.value || isNaN(quantity) || quantity < 0) {
                isValid = false;
                errorMessage = 'Số lượng tồn phải là số nguyên không âm.';
            }
            break;
            
        case 'viTriLuuTru':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Vui lòng chọn vị trí lưu trữ thiết bị.';
            }
            break;
            
        case 'supplier':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Vui lòng chọn nhà cung cấp.';
            }
            break;
            
        case 'ngayNhap':
            if (!field.value) {
                isValid = false;
                errorMessage = 'Vui lòng chọn ngày nhập.';
            } else {
                const selectedDate = new Date(field.value);
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                
                if (selectedDate > today) {
                    isValid = false;
                    errorMessage = 'Ngày nhập không hợp lệ.';
                }
            }
            break;
            
        case 'hinhAnh':
            const currentImage = document.getElementById('currentImage');
            const imageRequired = document.getElementById('hinhAnhRequired');
            const isImageRequired = !currentImage || (imageRequired && imageRequired.style.display !== 'none');
            
            if (isImageRequired) {
                // Image is required
                if (!field.files || field.files.length === 0) {
                    isValid = false;
                    errorMessage = 'Vui lòng chọn hình ảnh thiết bị.';
                } else {
                    const file = field.files[0];
                    if (!file.type.startsWith('image/')) {
                        isValid = false;
                        errorMessage = 'Vui lòng chọn file hình ảnh hợp lệ.';
                    }
                }
            } else {
                // Image is optional - only validate if new file is selected
                if (field.files && field.files.length > 0) {
                    const file = field.files[0];
                    if (!file.type.startsWith('image/')) {
                        isValid = false;
                        errorMessage = 'Vui lòng chọn file hình ảnh hợp lệ.';
                    }
                }
            }
            break;
    }
    
    if (isValid) {
        clearFieldError(fieldId);
    } else {
        showFieldError(fieldId, errorMessage);
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.remove('is-invalid');
    }
    
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function resetForm() {
    if (confirm('Bạn có chắc chắn muốn nhập lại? Tất cả thay đổi chưa lưu sẽ bị mất.')) {
        // Reload page to reset form to original values
        window.location.reload();
    }
}

function showSuccessMessage(message) {
    // Create toast notification
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
    
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function showErrorMessage(message) {
    // Create toast notification
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
    
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

