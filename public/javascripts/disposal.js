/* ================================
   disposal.js
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
       Modal Xóa Báo Cáo
    ================================= */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    const openDeleteModal = (id, code) => {
        deleteText.textContent = `Bạn có chắc chắn muốn xóa báo cáo "${code}" không?`;
        deleteForm.action = `/manager/disposal/${id}/delete`;
        deleteModal.classList.add("active");
    };

    const closeDeleteModal = () => {
        deleteModal.classList.remove("active");
    };

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openDeleteModal(btn.dataset.id, btn.dataset.code);
        });
    });

    cancelBtn.addEventListener("click", closeDeleteModal);

    // Click ra ngoài modal để tắt
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    /* ================================
       Hover Table Row
    ================================= */
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
    ================================= */
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70);
    });

    /* ================================
       Tìm kiếm Báo Cáo (Filter)
    ================================= */
    const searchInput = document.querySelector(".search-box input");
    const searchBtn = document.querySelector(".search-btn");
    const tableRows = document.querySelectorAll("table tbody tr");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.toLowerCase().trim();
            tableRows.forEach(row => {
                const codeCell = row.querySelector("td:first-child div");
                if (codeCell && codeCell.textContent.toLowerCase().includes(query)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    }
});


/* ================================
   add.js
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
       Hover Table Row
    ================================= */
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
    ================================= */
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70);
    });

    /* ================================
       Nếu có modal xóa (trang danh sách) thì giữ nguyên
    ================================= */
    const deleteModal = document.getElementById("deleteModal");
    const deleteText = document.getElementById("deleteText");
    const deleteForm = document.getElementById("deleteForm");
    const cancelBtn = document.getElementById("cancelBtn");

    if (deleteModal) {
        const openDeleteModal = (id, code) => {
            deleteText.textContent = `Bạn có chắc chắn muốn xóa báo cáo "${code}" không?`;
            deleteForm.action = `/manager/disposal/${id}/delete`;
            deleteModal.classList.add("active");
        };

        const closeDeleteModal = () => {
            deleteModal.classList.remove("active");
        };

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                openDeleteModal(btn.dataset.id, btn.dataset.code);
            });
        });

        cancelBtn.addEventListener("click", closeDeleteModal);

        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    /* ================================
       Tìm kiếm Báo Cáo (trang danh sách)
    ================================= */
    const searchInput = document.querySelector(".search-box input");
    const searchBtn = document.querySelector(".search-btn");
    const tableRows = document.querySelectorAll("table tbody tr");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.toLowerCase().trim();
            tableRows.forEach(row => {
                const codeCell = row.querySelector("td:first-child div");
                if (codeCell && codeCell.textContent.toLowerCase().includes(query)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    }
});


/*view.js */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       Sidebar Toggle
    ================================= */
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    /* ================================
       Hover Table Row
    ================================= */
    const tableRows = document.querySelectorAll(".table-modern tbody tr");
    tableRows.forEach(row => {
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
    ================================= */
    tableRows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";

        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70);
    });

});



// edit.js
document.addEventListener("DOMContentLoaded", () => {

    // Toggle sidebar
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    // Table row hover effect
    const tableRows = document.querySelectorAll(".table-modern tbody tr");
    tableRows.forEach(row => {
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

    // Animate table load
    tableRows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";
        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70);
    });

    // Highlight input when focus
    const inputs = document.querySelectorAll(".table-modern input, .table-modern select");
    inputs.forEach(input => {
        input.addEventListener("focus", () => {
            input.style.borderColor = "#3498db";
            input.style.boxShadow = "0 0 5px rgba(52, 152, 219, 0.5)";
        });
        input.addEventListener("blur", () => {
            input.style.borderColor = "";
            input.style.boxShadow = "";
        });
    });

    // Optional: format price inputs with commas while typing
    const priceInputs = document.querySelectorAll('input[type="number"]');
    priceInputs.forEach(input => {
        input.addEventListener("input", () => {
            const value = input.value.replace(/\D/g, '');
            input.value = value ? Number(value).toLocaleString('vi-VN') : '';
        });
    });
});



// add.js
document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // Toggle Sidebar
    // ================================
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }

    // ================================
    // Table row hover effect
    // ================================
    const tableRows = document.querySelectorAll(".disposal-table tbody tr");

    tableRows.forEach(row => {
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

    // ================================
    // Animate table load
    // ================================
    tableRows.forEach((row, index) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        row.style.transition = "0.3s";
        setTimeout(() => {
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, index * 70);
    });

    // ================================
    // Optional: highlight column on hover
    // ================================
    tableRows.forEach(row => {
        row.addEventListener("mouseenter", () => {
            const priceCell = row.querySelector("td:last-child");
            if (priceCell) {
                priceCell.style.backgroundColor = "rgba(52,152,219,0.1)";
            }
        });
        row.addEventListener("mouseleave", () => {
            const priceCell = row.querySelector("td:last-child");
            if (priceCell) priceCell.style.backgroundColor = "";
        });
    });

});


