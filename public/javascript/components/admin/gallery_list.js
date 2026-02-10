import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange } from '../../utils/validation.js';

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

            const dateInput = modal.querySelector('input[name="date"]');
            if (dateInput) {
                const { min, max } = getDateRange();
                dateInput.min = min;
                dateInput.max = max;
            }
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
            const removeBtn = itemForm.querySelector('.remove-current-image-btn');
            const fileInput = itemForm.querySelector('input[type="file"]');

            if (imageBtn && removeBtn && fileInput) {
                if (galleryData.coverImage) {
                    imageBtn.dataset.image = galleryData.coverImage;
                    imageBtn.style.display = 'inline-flex';
                    removeBtn.style.display = 'inline-flex';
                    fileInput.style.display = 'none';
                } else {
                    imageBtn.style.display = 'none';
                    removeBtn.style.display = 'none';
                    fileInput.style.display = 'block';
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

    // Listener for Remove Current Image button
    const removeCurrentImageBtn = document.querySelector('.remove-current-image-btn');
    if (removeCurrentImageBtn) {
        removeCurrentImageBtn.addEventListener('click', function () {
            const form = this.closest('form');
            const viewBtn = form.querySelector('.view-current-image-btn');
            const fileInput = form.querySelector('input[type="file"]');

            this.style.display = 'none';
            if (viewBtn) viewBtn.style.display = 'none';
            if (fileInput) {
                fileInput.style.display = 'block';
                fileInput.value = ''; // Reset file input
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
                $.ajax({
                    url: `/admin/gallery/deletegallery/${index}`,
                    type: 'DELETE',
                    success: function (data) {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                'Gallery has been deleted.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                'An error occurred while deleting the gallery.',
                                'error'
                            );
                        }
                    },
                    error: function (xhr) {
                        Swal.fire('Error!', xhr.responseText, 'error');
                    }
                });
            }
        })
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

            const container = input.closest('.form-group') || input.parentNode;

            // remove old message
            if (container.querySelector(`.required-message[data-for="${name}"]`)) {
                container.querySelector(`.required-message[data-for="${name}"]`).remove();
            }

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.textContent = message;
            msg.dataset.for = name;
            msg.style.display = 'none';

            container.appendChild(msg);

            // Special validation for Date if it exists
            if (name === 'date') {
                input.addEventListener('input', () => {
                    if (input.value && !isValidDate(input.value)) {
                        msg.textContent = '* Invalid date (Year 1998-' + (new Date().getFullYear() + 3) + ')';
                        msg.style.display = 'block';
                    } else {
                        msg.style.display = 'none';
                        msg.textContent = message;
                    }
                });
            } else {
                input.addEventListener('input', () => msg.style.display = 'none');
            }
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['projectType', 'projectName', 'title', 'text'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;
            const msg = container.querySelector(`.required-message[data-for="${name}"]`); // Ensure we select the right message

            let isFieldValid = true;

            if (input.value.trim() === '') {
                isFieldValid = false;
                // if (msg && name === 'date') msg.textContent = '* Date is required';
            }
            // Date validation if added
            else if (name === 'date' && !isValidDate(input.value)) {
                isFieldValid = false;
                if (msg) msg.textContent = '* Invalid date (Year 1998-' + (new Date().getFullYear() + 3) + ')';
            }

            if (!isFieldValid) {
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

            $.ajax({
                url: `/admin/gallery/updategallery/${index}`,
                type: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Gallery item updated successfully',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'Failed to update gallery item',
                            timer: 1500
                        });
                    }
                },
                error: function (xhr) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: xhr.responseJSON?.message || 'Failed to update gallery item',
                    });
                },
                complete: function () {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }
});