/* ================================
   devices.js - Scripts for Devices Management
================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Tính thành tiền ban đầu khi trang load (nếu có giá trị sẵn)
    if (document.getElementById('tongGia')) {
        calculateTotalPrice();
    }

    /* -----------------------------
       Delete Modal Handler
    ----------------------------- */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    const openDeleteModal = (id, name) => {
        if (!deleteModal || !deleteText || !deleteForm) return;

        deleteText.textContent = `Bạn có chắc chắn muốn xóa thiết bị "${name}" không? Hành động này không thể hoàn tác!`;
        deleteForm.action = `/manager/devices/delete/${id}`;
        deleteModal.style.display = "flex";
        setTimeout(() => deleteModal.classList.add("active"), 10);
    };

    const closeDeleteModal = () => {
        if (!deleteModal) return;

        deleteModal.classList.remove("active");
        deleteModal.addEventListener("transitionend", () => {
            if (!deleteModal.classList.contains("active")) {
                deleteModal.style.display = "none";
            }
        }, { once: true });
    };

    // Handle delete buttons
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const deviceId = btn.dataset.id;
            const deviceName = btn.dataset.name;
            if (deviceId && deviceName) {
                openDeleteModal(deviceId, deviceName);
            }
        });
    });

    // Close modal handlers
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeDeleteModal);
    }

    if (deleteModal) {
        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    /* -----------------------------
       Form Validation (Improvement: prevent submission with errors)
    ----------------------------- */
    const deviceForm = document.getElementById('deviceForm');
    if (deviceForm) {
        deviceForm.addEventListener('submit', function (e) {
            const ngayNhapInput = document.getElementById('ngayNhap');
            const tenTBInput = document.getElementById('tenTB');
            const soLuongInput = document.getElementById('soLuong');

            let hasError = false;
            let errorMessages = [];

            // Validate Tên thiết bị (required)
            if (tenTBInput && tenTBInput.value.trim() === '') {
                hasError = true;
                errorMessages.push('- Tên thiết bị không được để trống');
                tenTBInput.classList.add('is-invalid');
            } else if (tenTBInput) {
                tenTBInput.classList.remove('is-invalid');
            }

            // Validate Số lượng (must be positive integer)
            if (soLuongInput && soLuongInput.value.trim() !== '') {
                const soLuong = parseInt(soLuongInput.value);
                if (isNaN(soLuong) || soLuong < 0) {
                    hasError = true;
                    errorMessages.push('- Số lượng phải là số nguyên dương (≥ 0)');
                    soLuongInput.classList.add('is-invalid');
                } else {
                    soLuongInput.classList.remove('is-invalid');
                }
            }

            // Validate Ngày nhập (cannot be future date)
            if (ngayNhapInput && ngayNhapInput.value) {
                const selectedDate = new Date(ngayNhapInput.value);
                const today = new Date();
                // Set giờ về 00:00:00 để so sánh chỉ phần ngày
                selectedDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                // Chỉ báo lỗi nếu ngày nhập > hôm nay (không bao gồm hôm nay)
                if (selectedDate > today) {
                    hasError = true;
                    errorMessages.push('- Ngày nhập không thể là ngày trong tương lai');
                    ngayNhapInput.classList.add('is-invalid');
                } else {
                    ngayNhapInput.classList.remove('is-invalid');
                }
            }

            // Show errors and prevent submission if validation fails
            if (hasError) {
                e.preventDefault();
                if (errorMessages.length > 0) {
                    alert('Vui lòng kiểm tra lại:\n\n' + errorMessages.join('\n'));
                }
                return false;
            }

            // Show loading spinner during submission
            showLoadingSpinner();
        });

        // Real-time validation for required fields
        const tenTBInput = document.getElementById('tenTB');
        const soLuongInput = document.getElementById('soLuong');
        const ngayNhapInput = document.getElementById('ngayNhap');

        if (tenTBInput) {
            tenTBInput.addEventListener('blur', () => {
                if (!tenTBInput.value.trim()) {
                    tenTBInput.classList.add('is-invalid');
                } else {
                    tenTBInput.classList.remove('is-invalid');
                }
            });

            tenTBInput.addEventListener('input', () => {
                if (tenTBInput.value.trim()) {
                    tenTBInput.classList.remove('is-invalid');
                }
            });
        }

        if (soLuongInput) {
            soLuongInput.addEventListener('blur', () => {
                if (soLuongInput.value.trim() !== '') {
                    const soLuong = parseInt(soLuongInput.value);
                    if (isNaN(soLuong) || soLuong < 0) {
                        soLuongInput.classList.add('is-invalid');
                    } else {
                        soLuongInput.classList.remove('is-invalid');
                    }
                }
            });
        }

        if (ngayNhapInput) {
            ngayNhapInput.addEventListener('change', () => {
                if (ngayNhapInput.value) {
                    const selectedDate = new Date(ngayNhapInput.value);
                    const today = new Date();
                    // Set giờ về 00:00:00 để so sánh chỉ phần ngày
                    selectedDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    // Chỉ báo lỗi nếu ngày nhập > hôm nay (không bao gồm hôm nay)
                    if (selectedDate > today) {
                        ngayNhapInput.classList.add('is-invalid');
                    } else {
                        ngayNhapInput.classList.remove('is-invalid');
                    }
                }
            });
        }
    }

    /* -----------------------------
       Filter Form Enhancement
    ----------------------------- */
    const filterForm = document.getElementById("filterForm");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            window.location.href = "/manager/devices";
        });
    }

    /* -----------------------------
       Table Row Animation
    ----------------------------- */
    const tableRows = document.querySelectorAll("table tbody tr");
    tableRows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 50);
    });

    /* -----------------------------
       Input Focus Effects
    ----------------------------- */
    const inputs = document.querySelectorAll(".form-control, .form-select");
    inputs.forEach(input => {
        input.addEventListener("focus", () => {
            input.style.borderColor = "#2563eb";
            input.style.boxShadow = "0 0 0 0.2rem rgba(37, 99, 235, 0.25)";
        });

        input.addEventListener("blur", () => {
            if (!input.classList.contains("is-invalid")) {
                input.style.borderColor = "";
                input.style.boxShadow = "";
            }
        });
    });

    /* -----------------------------
       Image Preview (for create/edit forms with MULTIPLE FILE upload)
    ----------------------------- */
    const hinhAnhInput = document.getElementById("hinhAnh");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const imagePreviewGrid = document.getElementById("imagePreviewGrid");

    if (hinhAnhInput && imagePreviewContainer && imagePreviewGrid) {
        hinhAnhInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);

            // Clear previous previews
            imagePreviewGrid.innerHTML = '';

            if (files.length === 0) {
                imagePreviewContainer.style.display = 'none';
                return;
            }

            // Validate max 5 images
            if (files.length > 5) {
                alert('Chỉ được chọn tối đa 5 ảnh!');
                hinhAnhInput.value = '';
                imagePreviewContainer.style.display = 'none';
                return;
            }

            // Process each file
            files.forEach((file, index) => {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    alert(`File "${file.name}" không phải định dạng ảnh hợp lệ!`);
                    return;
                }

                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`File "${file.name}" vượt quá 5MB!`);
                    return;
                }

                // Create preview for each image
                const reader = new FileReader();
                reader.onload = (event) => {
                    const col = document.createElement('div');
                    col.className = 'col-6 col-md-4 col-lg-3';

                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'position-relative';
                    imgContainer.style.border = '2px solid #dee2e6';
                    imgContainer.style.borderRadius = '8px';
                    imgContainer.style.overflow = 'hidden';
                    imgContainer.style.aspectRatio = '1/1';

                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'w-100 h-100';
                    img.style.objectFit = 'cover';
                    img.alt = `Preview ${index + 1}`;

                    const badge = document.createElement('span');
                    badge.className = 'position-absolute top-0 start-0 badge bg-primary m-1';
                    badge.textContent = `${index + 1}`;

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(badge);
                    col.appendChild(imgContainer);
                    imagePreviewGrid.appendChild(col);
                };
                reader.readAsDataURL(file);
            });

            imagePreviewContainer.style.display = 'block';
        });
    }

    /* -----------------------------
       Confirm Navigation (if form has changes)
    ----------------------------- */
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        let formChanged = false;
        const formInputs = form.querySelectorAll("input, select, textarea");

        formInputs.forEach(input => {
            input.addEventListener("change", () => {
                formChanged = true;
            });
        });

        // Check before leaving page
        window.addEventListener("beforeunload", (e) => {
            if (formChanged) {
                e.preventDefault();
                e.returnValue = "";
            }
        });

        form.addEventListener("submit", () => {
            formChanged = false;
        });
    });

    /* -----------------------------
       Custom Location Handler (Edit/Create Forms)
       Improved version with name attribute switching
    ----------------------------- */
    const locationSelect = document.getElementById('viTriLuuTru');
    const customLocationInput = document.getElementById('customViTriLuuTru');

    if (locationSelect && customLocationInput) {
        // Khởi tạo trạng thái ban đầu (cho edit form khi load với custom value)
        if (locationSelect.value === '__custom__') {
            customLocationInput.style.display = 'block';
            customLocationInput.setAttribute('name', 'viTriLuuTru');
            locationSelect.removeAttribute('name');
        } else {
            customLocationInput.style.display = 'none';
        }

        // Toggle custom input visibility
        locationSelect.addEventListener('change', function () {
            if (this.value === '__custom__') {
                customLocationInput.style.display = 'block';
                customLocationInput.setAttribute('name', 'viTriLuuTru');
                this.removeAttribute('name');
                customLocationInput.focus();
            } else {
                customLocationInput.style.display = 'none';
                customLocationInput.removeAttribute('name');
                this.setAttribute('name', 'viTriLuuTru');
            }
        });
    }

    /* -----------------------------
       Auto-Fill Location from Category Selection
       When category is selected, auto-populate storage location
    ----------------------------- */
    const categorySelect = document.getElementById('category');

    if (categorySelect && locationSelect) {
        categorySelect.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            const categoryLocation = selectedOption.getAttribute('data-location');

            if (categoryLocation && categoryLocation.trim() !== '') {
                // Check if the location exists in the dropdown
                let locationFound = false;
                for (let i = 0; i < locationSelect.options.length; i++) {
                    if (locationSelect.options[i].value === categoryLocation) {
                        locationSelect.value = categoryLocation;
                        locationFound = true;
                        break;
                    }
                }

                // If location not found in dropdown, use custom input
                if (!locationFound && customLocationInput) {
                    locationSelect.value = '__custom__';
                    customLocationInput.style.display = 'block';
                    customLocationInput.value = categoryLocation;
                    customLocationInput.setAttribute('name', 'viTriLuuTru');
                    locationSelect.removeAttribute('name');
                }
            }
        });
    }

    /* -----------------------------
       Auto-Price Handler for Teacher-Made Equipment
       When "Giáo viên tự làm" is selected, price = 0đ
    ----------------------------- */
    const nguonGocSelect = document.getElementById('nguonGoc');
    const giaThanhInput = document.getElementById('giaThanh');

    if (nguonGocSelect && giaThanhInput) {
        nguonGocSelect.addEventListener('change', function () {
            if (this.value === 'Giáo viên tự làm') {
                giaThanhInput.value = 0;
                giaThanhInput.readOnly = true;
                giaThanhInput.style.backgroundColor = '#e9ecef';
                giaThanhInput.title = 'Thiết bị do giáo viên tự làm không có chi phí';
            } else {
                giaThanhInput.readOnly = false;
                giaThanhInput.style.backgroundColor = '';
                giaThanhInput.title = '';
            }
        });
    }

    /* -----------------------------
       Delete Image Handler (Edit Form)
       With live count update and text refresh
    ----------------------------- */
    const deletedImagesInput = document.getElementById('deletedImages');
    const imageCountSpan = document.getElementById('imageCount');

    if (deletedImagesInput) {
        let deletedImages = [];

        // Handle delete image button clicks
        document.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const imagePath = this.dataset.imagePath;
                const imageCard = this.closest('[data-image-path]');

                if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
                    // Add to deleted list
                    deletedImages.push(imagePath);
                    deletedImagesInput.value = JSON.stringify(deletedImages);

                    // Remove from UI
                    imageCard.remove();

                    // Update count
                    const currentCount = document.querySelectorAll('#currentImagesGrid [data-image-path]').length;
                    if (imageCountSpan) {
                        imageCountSpan.textContent = currentCount;
                    }

                    // Hide grid if no images left
                    if (currentCount === 0) {
                        const grid = document.getElementById('currentImagesGrid');
                        if (grid && grid.parentElement) {
                            grid.parentElement.style.display = 'none';
                        }
                    }

                    // Cập nhật thông báo giới hạn ảnh (chỉ cho edit form)
                    const helpText = document.querySelector('#hinhAnhFile + small.form-text');
                    if (helpText && currentCount >= 0) {
                        helpText.innerHTML =
                            '<i class="fas fa-info-circle"></i> Chọn thêm ảnh mới (tối đa ' +
                            Math.max(0, 5 - currentCount) +
                            ' ảnh). Ảnh mới sẽ được THÊM vào.';
                    }
                }
            });
        });
    }

    /* -----------------------------
       Image Preview Handler (Create/Edit Forms)
       Works with 'hinhAnhFile' ID for edit, 'hinhAnh' for create
    ----------------------------- */
    const imageInput = document.getElementById('hinhAnhFile') || document.getElementById('hinhAnh');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewGrid = document.getElementById('imagePreviewGrid');

    if (imageInput && previewContainer && previewGrid) {
        imageInput.addEventListener('change', function () {
            previewGrid.innerHTML = '';
            if (this.files.length > 0) {
                previewContainer.style.display = 'block';
                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const col = document.createElement('div');
                        col.className = 'col-6 col-md-4 col-lg-3';
                        col.innerHTML = `
                            <div style="border: 2px solid #ccc; border-radius: 8px; overflow: hidden; aspect-ratio: 1/1;">
                                <img src="${e.target.result}" alt="Ảnh mới" class="w-100 h-100" style="object-fit: cover;">
                            </div>
                        `;
                        previewGrid.appendChild(col);
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
});

/* -----------------------------
   Helper Functions
----------------------------- */
function showLoadingSpinner() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
}

/* -----------------------------
   Calculate Total Price (Thành tiền)
   Tự động tính = Giá thành × Số lượng
----------------------------- */
function calculateTotalPrice() {
    const giaThanhInput = document.getElementById('giaThanh');
    const soLuongInput = document.getElementById('soLuong');
    const tongGiaInput = document.getElementById('tongGia');

    if (!giaThanhInput || !soLuongInput || !tongGiaInput) {
        return;
    }

    const giaThanh = parseFloat(giaThanhInput.value) || 0;
    const soLuong = parseInt(soLuongInput.value) || 0;
    const tongGia = giaThanh * soLuong;

    // Format số với dấu phẩy ngăn cách hàng nghìn
    const formattedPrice = tongGia.toLocaleString('vi-VN');
    tongGiaInput.value = formattedPrice + ' VNĐ';
}
