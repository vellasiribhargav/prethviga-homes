import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange } from '../../utils/validation.js';

let originalFormData = {};

function formatToDB(dateStr) {
    if (!dateStr) return '';
    return dayjs(dateStr).format('DD-MM-YYYY');
}

function formatForDisplay(dbDateStr) {
    if (!dbDateStr) return 'No date';
    return dayjs(dbDateStr).format('MMMM YYYY');
}

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_completed'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by project name)
            const projectName = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const searchMatch = !searchValue || projectName.includes(searchValue);
            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), PROJECT NAME(1), DESCRIPTION(2), LOCATION(3), TIMELINE(4), CREATED DATE(5), PREVIEW(6), ACTIONS(7)
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
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Set date constraints on modal open
            const dateInput = modal.querySelector('input[type="date"]');
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
            const projectData = JSON.parse(this.dataset.project);
            const id = this.dataset.id || this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = id;
            inputs.project_name.value = projectData.project_name || '';
            inputs.project_location.value = projectData.project_location || '';

            // Format date for input[type="date"]
            if (projectData.project_date) {
                const date = dayjs(projectData.project_date);
                if (date.isValid()) {
                    inputs.project_date.value = date.format('YYYY-MM-DD');
                } else {
                    inputs.project_date.value = '';
                }
            } else {
                inputs.project_date.value = '';
            }

            inputs.card_footer_text.value = projectData.card_footer_text || '';

            // Reset validation states
            resetValidation(itemForm);

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            const removeBtn = itemForm.querySelector('.remove-current-image-btn');
            const fileInput = itemForm.querySelector('input[type="file"]');

            if (imageBtn && removeBtn && fileInput) {
                if (projectData.coverImage) {
                    imageBtn.dataset.image = projectData.coverImage;
                    imageBtn.style.display = 'inline-flex';
                    removeBtn.style.display = 'inline-flex';
                    fileInput.style.display = 'none';
                } else {
                    imageBtn.style.display = 'none';
                    removeBtn.style.display = 'none';
                    fileInput.style.display = 'block';
                }
            }

            openModal(itemModal);

            // Save original values for change detection - Captured AFTER modal opens and values are set
            setTimeout(() => {
                originalFormData = {
                    project_name: inputs.project_name.value.trim(),
                    project_location: inputs.project_location.value.trim(),
                    project_date: inputs.project_date.value,
                    card_footer_text: inputs.card_footer_text.value.trim()
                };
            }, 0);
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
            const id = this.dataset.id || this.dataset.index;

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
                    url: `/admin/completed/delete/${id}`,
                    type: 'DELETE',
                    success: function (data) {
                        if (data.success) {
                            Swal.fire(
                                'Deleted!',
                                'Project has been deleted.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error!', data.message, 'error');
                        }
                    },
                    error: function (xhr) {
                        Swal.fire('Error!', xhr.responseText || 'Failed to delete project', 'error');
                    }
                });
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
            { name: 'project_name', message: '* Project name is required' },
            { name: 'project_location', message: '* Project location is required' },
            { name: 'project_date', message: '* Completion date is required' },
            { name: 'card_footer_text', message: '* Project summary is required' }
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

            // Special validation for Date
            if (name === 'project_date') {
                input.addEventListener('input', () => {
                    if (input.value && !isValidDate(input.value)) {
                        msg.textContent = '* Invalid date (Year 1998-' + (dayjs().year() + 3) + ')';
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
        const fieldNames = ['project_name', 'project_location', 'project_date', 'card_footer_text'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const msg = input.nextElementSibling;
            let isFieldValid = true;

            if (input.value.trim() === '') {
                isFieldValid = false;
                if (msg && name === 'project_date') msg.textContent = '* Completion date is required';
            } else if (name === 'project_date' && !isValidDate(input.value)) {
                isFieldValid = false;
                if (msg) msg.textContent = '* Invalid date (Year 1998-' + (dayjs().year() + 3) + ')';
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
            form.project_name.value.trim() !== originalFormData.project_name ||
            form.project_location.value.trim() !== originalFormData.project_location ||
            form.project_date.value !== originalFormData.project_date ||
            form.card_footer_text.value.trim() !== originalFormData.card_footer_text ||
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

    // Handle Form Submit
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
            if (formData.has('project_date')) {
                formData.set('project_date', formatToDB(formData.get('project_date')));
            }
            const id = formData.get('index');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            $.ajax({
                url: `/admin/completed/update/${id}`,
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
                        Swal.fire('Error!', data.message || 'Failed to update', 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: xhr.responseJSON?.message || 'Failed to update project'
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
