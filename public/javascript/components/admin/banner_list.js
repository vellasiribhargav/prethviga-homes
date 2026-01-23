import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const bannerData = JSON.parse(this.dataset.banner);
            const index = this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = index;

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            if (imageBtn) {
                if (bannerData.image) {
                    imageBtn.dataset.image = bannerData.image;
                    imageBtn.style.display = 'inline-flex';
                } else {
                    imageBtn.style.display = 'none';
                }
            }

            // Reset validation states
            resetValidation(itemForm);

            openModal(itemModal);
        });
    });

    // Listener for View Current Image button inside the form
    const viewCurrentImageBtn = document.querySelector('.view-current-image-btn');
    if (viewCurrentImageBtn) {
        viewCurrentImageBtn.addEventListener('click', function () {
            const imageUrl = this.dataset.image;
            if (imageUrl) {
                previewImage.src = imageUrl;
                openModal(previewModal);
            }
        });
    }

    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.addEventListener('click', function () {
            const imageUrl = this.dataset.image;
            if (imageUrl) {
                previewImage.src = imageUrl;
                openModal(previewModal);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const index = this.dataset.index;

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/admin/banner/${CURRENT_SLUG}/delete/${index}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        await Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
                        window.location.reload();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    Swal.fire('Error!', error.message || 'Failed to delete banner', 'error');
                }
            }
        });
    });

    // Validation Functions
    function addRequiredFieldValidation(form) {
        if (!form) return;
        const uploadBtn = form.querySelector('.view-current-image-btn');
        if (uploadBtn) {
            const msg = document.createElement('div');
            msg.className = 'required-message-file';
            msg.textContent = '* Please select an image to upload';
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
            uploadBtn.parentNode.appendChild(msg);
        }

        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                const msg = form.querySelector('.required-message-file');
                if (msg) msg.style.display = 'none';
            });
        }
    }

    function validateForm(form) {
        let isValid = true;
        const fileInput = form.querySelector('input[type="file"]');
        const fileMsg = form.querySelector('.required-message-file');

        if (fileInput && !fileInput.files.length) {
            if (fileMsg) fileMsg.style.display = 'block';
            isValid = false;
        } else {
            if (fileMsg) fileMsg.style.display = 'none';
        }

        return isValid;
    }

    function resetValidation(form) {
        if (!form) return;
        form.querySelectorAll('.required-message-file').forEach(msg => msg.style.display = 'none');
    }

    // Initialize validation
    if (itemForm) {
        addRequiredFieldValidation(itemForm);
    }

    if (itemForm) {
        itemForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!validateForm(this)) {
                return;
            }

            const formData = new FormData(this);
            const index = formData.get('index');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`/admin/banner/${CURRENT_SLUG}/update/${index}`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Banner updated successfully',
                        timer: 1500
                    });
                    window.location.reload();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to update banner'
                });
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const slugSelector = document.getElementById('banner-slug-selector');
    if (slugSelector) {
        slugSelector.addEventListener('change', function () {
            const newSlug = this.value;
            window.location.href = `/admin/banner/${newSlug}/list`;
        });
    }
});
