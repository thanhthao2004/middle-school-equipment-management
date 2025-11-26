/* ================================
   suppliers.js - Full scripts
================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------
       Sidebar Toggle
    ----------------------------- */
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    /* -----------------------------
       Modal Xóa Nhà Cung Cấp
    ----------------------------- */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    const openDeleteModal = (id, name) => {
        deleteText.textContent = `Bạn có chắc chắn muốn xóa nhà cung cấp "${name}" không?`;
        deleteForm.action = `/manager/suppliers/${id}/delete`;
        deleteModal.style.display = "flex";
        setTimeout(() => deleteModal.classList.add("active"), 10);
    };

    const closeDeleteModal = () => {
        deleteModal.classList.remove("active");
        deleteModal.addEventListener("transitionend", () => {
            if (!deleteModal.classList.contains("active")) deleteModal.style.display = "none";
        }, { once: true });
    };

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openDeleteModal(btn.dataset.id, btn.dataset.name);
        });
        btn.addEventListener("mouseenter", () => btn.style.color = "#dc2626");
        btn.addEventListener("mouseleave", () => btn.style.color = "#1e3a8a");
    });

    if (cancelBtn) cancelBtn.addEventListener("click", closeDeleteModal);
    if (deleteModal) {
        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    /* -----------------------------
       Table Row Animation + Hover
    ----------------------------- */
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row, index) => {
        // animation khi load
        row.style.opacity = 0;
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";
        setTimeout(() => {
            row.style.opacity = 1;
            row.style.transform = "translateY(0)";
        }, index * 60);

        // hover hiệu ứng
        row.addEventListener("mouseenter", () => {
            row.style.transform = "scale(1.02)";
            row.style.transition = "0.25s";
            row.style.boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)";
            row.style.backgroundColor = "rgba(0,0,0,0.03)";
        });
        row.addEventListener("mouseleave", () => {
            row.style.transform = "scale(1)";
            row.style.boxShadow = "none";
            row.style.backgroundColor = "transparent";
        });
    });

    /* -----------------------------
       Form Add/Edit Supplier
    ----------------------------- */
    const supplierForm = document.querySelector('form[action^="/manager/suppliers"]');
    if (supplierForm) {
        const nameInput = supplierForm.querySelector('#name');
        const phoneInput = supplierForm.querySelector('#phone');
        const addressInput = supplierForm.querySelector('#address');

        // focus đầu tiên
        if (nameInput) nameInput.focus();

        // validate trước submit
        supplierForm.addEventListener("submit", (e) => {
            let messages = [];
            if (!nameInput.value.trim()) messages.push("Tên nhà cung cấp không được để trống.");
            if (!phoneInput.value.trim()) messages.push("Số điện thoại không được để trống.");
            if (!addressInput.value.trim()) messages.push("Địa chỉ không được để trống.");

            if (messages.length > 0) {
                e.preventDefault();
                alert(messages.join("\n"));
            }
        });

        // hiệu ứng focus input
        [nameInput, phoneInput, addressInput].forEach(input => {
            if (!input) return;
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

    /* -----------------------------
       Search Box Realtime + Button
    ----------------------------- */
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    const filterTable = () => {
        const filter = searchInput.value.toLowerCase();
        document.querySelectorAll('table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterTable();
        });
    }

    

});
