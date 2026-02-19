import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
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
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_gallery'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const typeValue = typeFilter ? typeFilter.value : 'all';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Type check
            const rowType = row.cells[1] ? row.cells[1].textContent.trim().toLowerCase() : '';
            const typeMatch = typeValue === 'all' || rowType === typeValue;
            if (!typeMatch) return false;

            // Search check (by project name)
            const projectName = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const searchMatch = !searchValue || projectName.includes(searchValue);
            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), TYPE(1), PROJECT NAME(2), TITLE(3), DESCRIPTION(4), CREATED DATE(5)
            const createdAtCell = row.cells[5];
            const createdAtValue = createdAtCell ? createdAtCell.textContent.trim() : '';

            let dateMatch = true;
            if (dateValue && createdAtValue) {
                const rowDate = dayjs(createdAtValue, 'MMMM D, YYYY');
                const filterDate = dayjs(dateValue);
                dateMatch = rowDate.isValid() && rowDate.isSame(filterDate, 'day');
            }

            return dateMatch;
        });

        // Update S.NO
        filteredRows.forEach((row, idx) => {
            if (row.cells && row.cells.length > 0) {
                row.cells[0].textContent = String(idx + 1).padStart(2, '0');
            }
        });

        pagination.refreshRows(filteredRows);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);

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
            const id = this.dataset.id || this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = id; // This hidden input will now hold the ID
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

    $(document).on('click', '.delete-btn', async function () {
        const id = $(this).data('id') || $(this).data('index');

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
                url: `/admin/gallery/deletegallery/${id}`,
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
                    Swal.fire('Error!', xhr.responseText || 'Failed to delete gallery item', 'error');
                }
            });
        }
    });

    $(document).on('click', '.btn-preview', function () {
        const imageUrl = $(this).data('image');
        if (imageUrl) {
            previewImage.src = imageUrl;
            openModal(previewModal);
        }
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

            input.addEventListener('input', () => msg.style.display = 'none');
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
            }

            if (!isFieldValid) {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        // Image Validation
        const removeImageBtn = form.querySelector('.remove-current-image-btn');
        const viewBtn = form.querySelector('.view-current-image-btn');
        const fileInput = form.querySelector('input[type="file"]');
        const hasExistingImage = viewBtn && viewBtn.style.display !== 'none';
        const isRemoving = removeImageBtn && removeImageBtn.style.display === 'none' && viewBtn && viewBtn.style.display === 'none';
        const hasNewFile = fileInput && fileInput.files.length > 0;

        if ((isRemoving || !hasExistingImage) && !hasNewFile) {
            // Using a hidden element for showFieldError or passing the group
            const fileGroup = fileInput ? fileInput.closest('.form-group') : null;
            if (fileGroup) {
                let msgFile = fileGroup.querySelector('.required-message-file');
                if (!msgFile) {
                    msgFile = document.createElement('div');
                    msgFile.className = 'required-message-file';
                    msgFile.textContent = '* Gallery image is required';
                    msgFile.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;font-style:italic';
                    fileGroup.appendChild(msgFile);
                }
                msgFile.style.display = 'block';
            }
            isValid = false;
        } else {
            const fileGroup = fileInput ? fileInput.closest('.form-group') : null;
            if (fileGroup) {
                const msgFile = fileGroup.querySelector('.required-message-file');
                if (msgFile) msgFile.style.display = 'none';
            }
        }

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
                    text: 'no changes is detected'
                });
                return;
            }

            const formData = new FormData(this);
            const id = formData.get('index'); // This hidden input now holds the ID

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            $.ajax({
                url: `/admin/gallery/updategallery/${id}`,
                type: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'content updated',
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
