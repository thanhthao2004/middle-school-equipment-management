/* ================================
   disposal.js
================================ */

// Lấy các nút xóa
const deleteButtons = document.querySelectorAll(".btn-delete");
const deleteModal = document.getElementById("deleteModal");
const deleteText = document.getElementById("deleteText");
const deleteForm = document.getElementById("deleteForm");
const cancelBtn = document.getElementById("cancelBtn");

// Mỗi nút xóa
deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const code = btn.dataset.code;

        // Hiển thị thông tin trong modal
        deleteText.textContent = `Bạn có chắc muốn xóa biên bản ${code}?`;

        // Thiết lập action form
        deleteForm.action = `/manager/disposal/delete/${id}`;

        // Hiện modal
        deleteModal.classList.add("active");
    });
});

// Nút hủy đóng modal
cancelBtn.addEventListener("click", () => {
    deleteModal.classList.remove("active");
});

// Ngoài modal click cũng đóng
deleteModal.addEventListener("click", e => {
    if (e.target === deleteModal) {
        deleteModal.classList.remove("active");
    }
});
