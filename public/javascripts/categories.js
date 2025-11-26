/* ================================
   categories.js - Scripts for Categories Management
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
        
        deleteText.textContent = `Bạn có chắc chắn muốn xóa danh mục "${name}" không? Hành động này không thể hoàn tác!`;
        deleteForm.action = `/manager/categories/${id}/delete`;
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
            const categoryId = btn.dataset.id;
            const categoryName = btn.dataset.name;
            if (categoryId && categoryName) {
                openDeleteModal(categoryId, categoryName);
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
    const categoryForm = document.querySelector('form[action^="/manager/categories"]');
    if (categoryForm) {
        const nameInput = categoryForm.querySelector("#name");
        const locationInput = categoryForm.querySelector("#location");

        // Focus first input
        if (nameInput) {
            nameInput.focus();
        }

        // Validate before submit
        categoryForm.addEventListener("submit", (e) => {
            let isValid = true;
            const messages = [];

            // Validate tên danh mục
            if (nameInput && !nameInput.value.trim()) {
                isValid = false;
                messages.push("Tên danh mục không được để trống.");
                nameInput.classList.add("is-invalid");
            } else if (nameInput) {
                nameInput.classList.remove("is-invalid");
            }

            // Validate vị trí lưu trữ
            if (locationInput && !locationInput.value.trim()) {
                isValid = false;
                messages.push("Vị trí lưu trữ không được để trống.");
                locationInput.classList.add("is-invalid");
            } else if (locationInput) {
                locationInput.classList.remove("is-invalid");
            }

            if (!isValid) {
                e.preventDefault();
                if (messages.length > 0) {
                    alert(messages.join("\n"));
                }
            }
        });

        // Real-time validation
        if (nameInput) {
            nameInput.addEventListener("blur", () => {
                if (!nameInput.value.trim()) {
                    nameInput.classList.add("is-invalid");
                } else {
                    nameInput.classList.remove("is-invalid");
                }
            });
        }

        if (locationInput) {
            locationInput.addEventListener("blur", () => {
                if (!locationInput.value.trim()) {
                    locationInput.classList.add("is-invalid");
                } else {
                    locationInput.classList.remove("is-invalid");
                }
            });
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
});

