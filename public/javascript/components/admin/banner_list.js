import $ from 'jquery';
window.$ = window.jQuery = $;
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
        storageKey: 'rowsPerPage_banner'
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
            const bannerData = JSON.parse(this.dataset.banner);
            const index = this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = index;

            // Save original values for change detection
            originalFormData = {
                file: '' // Files are always empty initially
            };

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            const removeBtn = itemForm.querySelector('.remove-current-image-btn');
            const fileInput = itemForm.querySelector('input[type="file"]');

            if (imageBtn && removeBtn && fileInput) {
                if (bannerData.image) {
                    imageBtn.dataset.image = bannerData.image;
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
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/admin/banner/${CURRENT_SLUG}/delete/${index}`,
                        type: 'DELETE',
                        success: function (data) {
                            if (data.success) {
                                Swal.fire(
                                    'Deleted!',
                                    'Banner has been deleted.',
                                    'success'
                                ).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire('Error!', data.message || 'Failed to delete banner', 'error');
                            }
                        },
                        error: function (xhr) {
                            Swal.fire('Error!', xhr.responseText, 'error');
                        }
                    });
                }
            });
        });
    });

    // Validation Functions
    function addRequiredFieldValidation(form) {
        const fileInput = form.querySelector('input[type="file"]');
        if (!fileInput) return;

        // remove old message
        if (fileInput.nextElementSibling?.classList.contains('required-message')) {
            fileInput.nextElementSibling.remove();
        }

        const msg = document.createElement('div');
        msg.className = 'required-message';
        msg.textContent = '* Please select an image to upload';
        msg.style.display = 'none';

        fileInput.after(msg);

        fileInput.addEventListener('change', () => msg.style.display = 'none');
    }

    function validateForm(form) {
        // For banner edits, selecting a new file is handled by isFormChanged
        return true;
    }

    function isFormChanged(form) {
        // For banners, we only check if a new file is selected
        return form.querySelector('input[type="file"]').files.length > 0;
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
                url: `/admin/banner/${CURRENT_SLUG}/update/${index}`,
                type: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Banner updated successfully',
                            timer: 1500
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Error!', data.message || 'Failed to update banner', 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire('Error!', xhr.responseText, 'error');
                },
                complete: function () {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
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