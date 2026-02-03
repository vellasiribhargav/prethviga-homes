import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

let originalFormData = {};

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Initialize Pagination
    new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_gallery'
    });

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
            const galleryData = JSON.parse(this.dataset.gallery);
            const index = this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = index;
            inputs.projectName.value = galleryData.projectName || '';
            inputs.projectType.value = galleryData.projectType || '';
            inputs.title.value = galleryData.title || '';
            inputs.text.value = galleryData.text || '';

            // Reset validation states
            resetValidation(itemForm);

            openModal(itemModal);

            // Save original values for change detection - Captured AFTER modal opens and values are set
            setTimeout(() => {
                originalFormData = {
                    projectName: inputs.projectName.value,
                    projectType: inputs.projectType.value,
                    title: inputs.title.value.trim(),
                    text: inputs.text.value.trim()
                };
            }, 0);

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            if (imageBtn) {
                if (galleryData.coverImage) {
                    imageBtn.dataset.image = galleryData.coverImage;
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
                    const response = await fetch(`/admin/gallery/deletegallery/${index}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        await Swal.fire('Deleted!', 'Gallery item has been deleted.', 'success');
                        window.location.reload();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    Swal.fire('Error!', error.message || 'Failed to delete gallery item', 'error');
                }
            }
        });
    });

    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.addEventListener('click', function () {
            const imageUrl = this.dataset.image;
            if (imageUrl) {
                previewImage.src = imageUrl;
                openModal(previewModal);
            }
        });
    });

    // Validation Functions
    function addRequiredFieldValidation(form) {
        const conf = [
            { name: 'projectType', message: '* Project type is required' },
            { name: 'projectName', message: '* Project selection is required' },
            { name: 'title', message: '* Gallery name is required' },
            { name: 'text', message: '* Image description is required' }
        ];

        conf.forEach(({ name, message }) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            // remove old message
            if (input.nextElementSibling?.classList.contains('required-message')) {
                input.nextElementSibling.remove();
            }

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.textContent = message;
            msg.style.display = 'none';

            input.after(msg);

            input.addEventListener('input', () => msg.style.display = 'none');
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['projectType', 'projectName', 'title', 'text'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const msg = input.nextElementSibling;
            if (input.value.trim() === '') {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        return isValid;
    }

    function isFormChanged(form) {
        return (
            form.projectName.value !== originalFormData.projectName ||
            form.projectType.value !== originalFormData.projectType ||
            form.title.value.trim() !== originalFormData.title ||
            form.text.value.trim() !== originalFormData.text ||
            (form.file && form.file.files.length > 0)
        );
    }

    function resetValidation(form) {
        if (!form) return;
        form.querySelectorAll('.required-message').forEach(msg => msg.style.display = 'none');
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

            if (!isFormChanged(this)) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Changes Detected',
                    text: 'You have not modified anything.'
                });
                return;
            }

            const formData = new FormData(this);
            const index = formData.get('index');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`/admin/gallery/updategallery/${index}`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Gallery item updated successfully',
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
                    text: error.message || 'Failed to update gallery item'
                });
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
