/* ================================
   Sidebar Toggle
================================ */
document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    /* ================================
       Modal Xóa Danh Mục
    ================================== */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    const openDeleteModal = (id, name) => {
        deleteText.textContent = `Bạn có chắc chắn muốn xóa danh mục "${name}" không?`;
        deleteForm.action = `/categories/delete/${id}`;
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

    cancelBtn.addEventListener("click", closeDeleteModal);

    // Click ra ngoài modal để tắt
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });


    /* ================================
       Hiệu ứng Hover Table Row
    ================================== */
    document.querySelectorAll("table tbody tr").forEach(row => {
        row.addEventListener("mouseenter", () => {
            row.style.transform = "scale(1.01)";
            row.style.transition = "0.2s";
            row.style.backgroundColor = "rgba(0,0,0,0.03)";
        });
        row.addEventListener("mouseleave", () => {
            row.style.transform = "scale(1)";
            row.style.backgroundColor = "transparent";
        });
    });


    /* ================================
       Animation Table Khi Load
    ================================== */
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70); // delay từng dòng
    });

});

document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       Form Sửa Danh Mục
    ================================= */
    const editForm = document.querySelector('form[action^="/categories/update/"]');
    if (editForm) {
        const nameInput = editForm.querySelector('#name');
        const locationInput = editForm.querySelector('#location');

        // Focus vào input Tên danh mục khi load
        if (nameInput) nameInput.focus();

        // Validate trước khi submit
        editForm.addEventListener('submit', (e) => {
            const name = nameInput.value.trim();
            const location = locationInput.value.trim();
            let messages = [];

            if (name === '') messages.push('Tên danh mục không được để trống.');
            if (location === '') messages.push('Vị trí lưu trữ không được để trống.');

            if (messages.length > 0) {
                e.preventDefault(); // ngăn submit
                alert(messages.join('\n'));
            }
        });

        // Highlight khi focus vào input
        [nameInput, locationInput].forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#3498db';
                input.style.boxShadow = '0 0 5px rgba(52, 152, 219, 0.5)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });
        });
    }

});

document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       Form Thêm Danh Mục Mới
    ================================= */
    const addForm = document.querySelector('form');
    if (addForm) {
        const nameInput = addForm.querySelector('#name');
        const locationInput = addForm.querySelector('#location');

        // Focus vào input Tên danh mục khi load
        if (nameInput) nameInput.focus();

        // Validate trước khi submit
        addForm.addEventListener('submit', (e) => {
            const name = nameInput.value.trim();
            const location = locationInput.value.trim();
            let messages = [];

            if (name === '') messages.push('Tên danh mục không được để trống.');
            if (location === '') messages.push('Vị trí lưu trữ không được để trống.');

            if (messages.length > 0) {
                e.preventDefault(); // ngăn submit
                alert(messages.join('\n'));
            }
        });

        // Highlight khi focus vào input
        [nameInput, locationInput].forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#3498db';
                input.style.boxShadow = '0 0 5px rgba(52, 152, 219, 0.5)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });
        });
    }

});

