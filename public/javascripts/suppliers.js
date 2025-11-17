/* ================================
   Suppliers Page Scripts
================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       Sidebar Toggle
    ================================= */
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    /* ================================
       Modal Xóa Nhà Cung Cấp
    ================================= */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    const openDeleteModal = (id, name) => {
        deleteText.textContent = `Bạn có chắc chắn muốn xóa nhà cung cấp "${name}" không?`;
        deleteForm.action = `/suppliers/delete/${id}`;
        deleteModal.classList.add("active");
    };

    const closeDeleteModal = () => {
        deleteModal.classList.remove("active");
    };

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            openDeleteModal(this.dataset.id, this.dataset.name);
        });
    });

    if (cancelBtn) cancelBtn.addEventListener("click", closeDeleteModal);

    deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    /* ================================
       Hover Hiệu Ứng Table
    ================================= */
    document.querySelectorAll("table tbody tr").forEach(row => {
        row.addEventListener("mouseenter", () => {
            row.style.transform = "scale(1.01)";
            row.style.transition = "0.25s";
            row.style.backgroundColor = "rgba(0,0,0,0.03)";
        });
        row.addEventListener("mouseleave", () => {
            row.style.transform = "scale(1)";
            row.style.backgroundColor = "transparent";
        });
    });

    /* ================================
       Animation từng dòng khi load
    ================================= */
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 60); // delay từng dòng
    });

    /* ================================
       FORM Thêm + Sửa Nhà Cung Cấp
    ================================= */
    const supplierForm = document.querySelector('form[action^="/suppliers"]');

    if (supplierForm) {
        const nameInput = supplierForm.querySelector('#name');
        const phoneInput = supplierForm.querySelector('#phone');
        const addressInput = supplierForm.querySelector('#address');

        // Focus input đầu tiên
        if (nameInput) nameInput.focus();

        // Validate trước khi submit
        supplierForm.addEventListener("submit", (e) => {
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const address = addressInput.value.trim();

            let messages = [];

            if (!name) messages.push("Tên nhà cung cấp không được để trống.");
            if (!phone) messages.push("Số điện thoại không được để trống.");
            if (!address) messages.push("Địa chỉ không được để trống.");

            if (messages.length > 0) {
                e.preventDefault();
                alert(messages.join("\n"));
            }
        });

        // Hiệu ứng focus
        [nameInput, phoneInput, addressInput].forEach(input => {
            input.addEventListener("focus", () => {
                input.style.borderColor = "#3498db";
                input.style.boxShadow = "0 0 5px rgba(52, 152, 219, 0.5)";
            });
            input.addEventListener("blur", () => {
                input.style.borderColor = "";
                input.style.boxShadow = "";
            });
        });
    }

});
