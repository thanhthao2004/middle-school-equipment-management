/**
 * Edit Profile Page JavaScript
 * Xử lý avatar preview và form submission
 */

// Avatar preview handler
(function () {
    const avatarInput = document.getElementById('avatar');
    const avatarContainer = document.querySelector('.avatar-container');

    function removeAvatar(e) {
        e.preventDefault();
        e.stopPropagation();

        // Xóa file input
        if (avatarInput) {
            avatarInput.value = '';
        }

        // Xóa ảnh
        const img = avatarContainer.querySelector('img');
        if (img) {
            img.remove();
        }

        // Xóa nút X
        const removeBtn = document.getElementById('remove-avatar-btn');
        if (removeBtn) {
            removeBtn.remove();
        }
    }

    function attachRemoveButtonListener() {
        const removeBtn = document.getElementById('remove-avatar-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', removeAvatar);
        }
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được lớn hơn 5MB.');
                this.value = '';
                return;
            }

            // Preview image
            const reader = new FileReader();
            reader.onload = function (event) {
                // Xóa ảnh cũ nếu có
                const oldImg = avatarContainer.querySelector('img');
                if (oldImg) {
                    oldImg.remove();
                }

                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'img-fluid rounded';
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'cover';

                avatarContainer.insertBefore(img, avatarContainer.firstChild);

                // Tạo hoặc hiển thị nút X
                let removeBtn = document.getElementById('remove-avatar-btn');
                if (!removeBtn) {
                    removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.id = 'remove-avatar-btn';
                    removeBtn.className = 'btn btn-danger btn-sm rounded-circle position-absolute';
                    removeBtn.style.cssText = 'top: -10px; right: -10px; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; opacity: 0.9; border: none; cursor: pointer;';
                    removeBtn.title = 'Gỡ ảnh đại diện';
                    removeBtn.innerHTML = '<i class="fas fa-times" style="font-size: 1.2rem;"></i>';
                    avatarContainer.appendChild(removeBtn);
                    attachRemoveButtonListener();
                } else {
                    removeBtn.style.display = 'flex';
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Gán sự kiện cho nút X hiện tại
    attachRemoveButtonListener();

    // Auto redirect after success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
        setTimeout(() => {
            window.location.href = '/profile';
        }, 1500);
    }
})();
