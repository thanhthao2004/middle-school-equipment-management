/* ================================
   devices.js - Scripts for Devices Management
================================ */

document.addEventListener("DOMContentLoaded", () => {
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
       Form Validation
    ----------------------------- */
    const deviceForm = document.getElementById("deviceForm");
    if (deviceForm) {
        const tenTBInput = deviceForm.querySelector("#tenTB");
        const maTBInput = deviceForm.querySelector("#maTB");

        // Focus first input
        if (tenTBInput) {
            tenTBInput.focus();
        }

        // Validate before submit
        deviceForm.addEventListener("submit", (e) => {
            let isValid = true;
            const messages = [];

            // Validate tên thiết bị
            if (tenTBInput && !tenTBInput.value.trim()) {
                isValid = false;
                messages.push("Tên thiết bị không được để trống.");
                tenTBInput.classList.add("is-invalid");
            } else if (tenTBInput) {
                tenTBInput.classList.remove("is-invalid");
            }

            // Validate mã thiết bị (if provided)
            if (maTBInput && maTBInput.value.trim()) {
                const maTBValue = maTBInput.value.trim();
                if (maTBValue.length < 3) {
                    isValid = false;
                    messages.push("Mã thiết bị phải có ít nhất 3 ký tự.");
                    maTBInput.classList.add("is-invalid");
                } else {
                    maTBInput.classList.remove("is-invalid");
                }
            }

            // Validate số lượng
            const soLuongInput = deviceForm.querySelector("#soLuong");
            if (soLuongInput && soLuongInput.value) {
                const soLuong = parseInt(soLuongInput.value);
                if (isNaN(soLuong) || soLuong < 0) {
                    isValid = false;
                    messages.push("Số lượng phải là số nguyên dương.");
                    soLuongInput.classList.add("is-invalid");
                } else {
                    soLuongInput.classList.remove("is-invalid");
                }
            }

            if (!isValid) {
                e.preventDefault();
                if (messages.length > 0) {
                    alert(messages.join("\n"));
                }
            }
        });

        // Real-time validation
        if (tenTBInput) {
            tenTBInput.addEventListener("blur", () => {
                if (!tenTBInput.value.trim()) {
                    tenTBInput.classList.add("is-invalid");
                } else {
                    tenTBInput.classList.remove("is-invalid");
                }
            });
        }
    }

    /* -----------------------------
       Filter Form Enhancement
    ----------------------------- */
    const filterForm = document.getElementById("filterForm");
    if (filterForm) {
        // Auto-submit on filter change (optional)
        const filterInputs = filterForm.querySelectorAll("select, input[type='text']");
        
        // Add clear filters button
        const clearFiltersBtn = document.createElement("button");
        clearFiltersBtn.type = "button";
        clearFiltersBtn.className = "btn btn-outline-secondary";
        clearFiltersBtn.innerHTML = '<i class="fas fa-times"></i> Xóa bộ lọc';
        clearFiltersBtn.addEventListener("click", () => {
            window.location.href = "/manager/devices";
        });

        const submitBtn = filterForm.querySelector('button[type="submit"]');
        if (submitBtn && submitBtn.parentElement) {
            submitBtn.parentElement.appendChild(clearFiltersBtn);
        }
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
       Image Preview (for create/edit forms)
    ----------------------------- */
    const hinhAnhInput = document.getElementById("hinhAnh");
    if (hinhAnhInput) {
        const previewContainer = document.createElement("div");
        previewContainer.className = "mt-2";
        previewContainer.id = "imagePreview";
        previewContainer.style.display = "none";
        
        hinhAnhInput.parentElement.appendChild(previewContainer);

        hinhAnhInput.addEventListener("input", () => {
            const imageUrl = hinhAnhInput.value.trim();
            if (imageUrl) {
                previewContainer.innerHTML = `
                    <label class="form-label">Xem trước:</label>
                    <img src="${imageUrl}" 
                         alt="Preview" 
                         class="img-fluid rounded"
                         style="max-width: 300px; max-height: 200px; border: 1px solid #dee2e6;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display:none; color: #dc3545;">Không thể tải hình ảnh từ URL này.</p>
                `;
                previewContainer.style.display = "block";
            } else {
                previewContainer.style.display = "none";
            }
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
});

