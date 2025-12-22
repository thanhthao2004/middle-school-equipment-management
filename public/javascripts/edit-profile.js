/**
 * Edit Profile Page JavaScript
 * Xử lý avatar preview và form submission
 */

// Avatar preview handler
(function () {
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatar-preview');

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
                avatarPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'img-fluid rounded';
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'cover';
                avatarPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    // Auto redirect after success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
        setTimeout(() => {
            window.location.href = '/profile';
        }, 1500);
    }
})();
