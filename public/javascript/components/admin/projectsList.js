import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange, showFieldError, hideFieldError, initCharLimitHighlight } from '../../utils/validation.js';
import { getSearchValue, getDateValue, matchesSearch, matchesDate } from '../../utils/searchUtils.js';

initCharLimitHighlight();

let originalFormData = {};

function formatToDB(dateStr) {
    if (!dateStr) return '';
    return dayjs(dateStr).format('DD-MM-YYYY');
}

function parseFromDB(dbDateStr) {
    if (!dbDateStr) return '';

    // Handle dash-separated formats like DD-MM-YYYY or D-M-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dbDateStr)) {
        const [day, month, year] = dbDateStr.split('-');
        const paddedDay = day.padStart(2, '0');
        const paddedMonth = month.padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
    }

    const date = dayjs(dbDateStr);
    if (!date.isValid()) return '';
    return date.format('YYYY-MM-DD');
}

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_inventory'
    });

    // Filter Logic
    function applyFilters() {
        const statusValue = statusFilter ? statusFilter.value : 'all';
        const searchValue = getSearchValue(searchInput);
        const dateValue = getDateValue(dateFilter);

        // Get all project rows
        const allRows = Array.from(document.querySelectorAll('.data-table tbody tr[data-id]'));

        const filteredRows = allRows.filter(row => {
            // Status check
            const type = row.dataset.type;
            if (statusValue !== 'all' && type !== statusValue) return false;

            // Search check (by project name and location)
            const projectName = row.querySelector('.item-name-cell')?.textContent || '';
            const projectLocation = row.cells[4]?.textContent || '';

            if (!matchesSearch(searchValue, projectName, projectLocation)) return false;

            // Date check
            const createdAtValue = row.cells[7]?.textContent.trim() || '';
            if (!matchesDate(dateValue, createdAtValue, ['DD ddd MMM YYYY HH:mm', 'DD-MM-YYYY'])) return false;

            return true;
        });

        // Update S.NO
        filteredRows.forEach((row, idx) => {
            if (row.cells && row.cells.length > 0) {
                row.cells[0].textContent = String(idx + 1).padStart(2, '0');
            }
        });

        // Handle "No data found" logic
        const noResultsRow = document.getElementById('noResultsRow');

        if (filteredRows.length === 0) {
            if (noResultsRow) {
                noResultsRow.style.display = '';
            }
        } else {
            if (noResultsRow) {
                noResultsRow.style.display = 'none';
            }
        }

        pagination.refreshRows(filteredRows);
    }

    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);

    // Modal Functions
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
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

    // Handle Edit
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const projectData = JSON.parse(this.dataset.project);
            const id = this.dataset.id || this.dataset.index; // Use ID
            const type = this.dataset.type;

            const inputs = itemForm.elements;
            inputs.index.value = id; // Store ID in hidden input (name="index" but holds ID)
            inputs.type.value = type;
            inputs.project_name.value = projectData.name || projectData.project_name || '';
            inputs.project_location.value = projectData.location || projectData.project_location || '';
            inputs.new_type.value = type;

            inputs.project_date.value = parseFromDB(projectData.project_date) || '';

            inputs.card_footer_text.value = projectData.description || projectData.card_footer_text || '';

            resetValidation(itemForm);

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            const removeBtn = itemForm.querySelector('.remove-current-image-btn');
            const fileInput = itemForm.querySelector('input[type="file"]');

            if (imageBtn && removeBtn && fileInput) {
                const imageUrl = projectData.coverImage || projectData.card_image;
                if (imageUrl) {
                    imageBtn.dataset.image = imageUrl;
                    imageBtn.style.display = 'inline-flex';
                    removeBtn.style.display = 'inline-flex';
                    fileInput.style.display = 'none';
                } else {
                    imageBtn.style.display = 'none';
                    removeBtn.style.display = 'none';
                    fileInput.style.display = 'block';
                }

                // Hide validation message on change
                fileInput.addEventListener('change', function () {
                    if (this.files.length > 0) {
                        const fileGroup = this.closest('.form-group');
                        const msgFile = fileGroup.querySelector('.required-message-file');
                        if (msgFile) msgFile.style.display = 'none';
                    }
                });
            }

            openModal(itemModal);

            setTimeout(() => {
                originalFormData = {
                    project_name: inputs.project_name.value.trim(),
                    project_location: inputs.project_location.value.trim(),
                    project_date: inputs.project_date.value,
                    card_footer_text: inputs.card_footer_text.value.trim(),
                    type: inputs.new_type.value
                };
            }, 0);
        });
    });

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
                fileInput.value = '';
            }
        });
    }

    // Handle Delete
    $('.delete-btn').on('click', function () {
        const id = $(this).data('id') || $(this).data('index'); // Use ID
        const type = $(this).data('type');

        Swal.fire({
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
                    url: `/admin/projects/${type}/delete/${id}`, // Fixed URL
                    type: 'DELETE',
                    success: function (data) {
                        if (data.success) {
                            Swal.fire('Deleted!', 'Project has been deleted.', 'success').then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error!', data.message, 'error');
                        }
                    },
                    error(xhr) {
                        Swal.fire('Error!', xhr.responseJSON?.message || 'Failed to delete project', 'error');
                    }
                });
            }
        });
    });

    // Preview image in table
    $(document).on('click', '.btn-preview', function () {
        const imageUrl = $(this).data('image');
        if (!imageUrl) return;
        $('#previewImage').attr('src', imageUrl);
        openModal(previewModal);
    });

    // Validation
    function addRequiredFieldValidation(form) {
        const conf = [
            { name: 'project_name', message: '* Project name is required' },
            { name: 'project_location', message: '* Project location is required' },
            { name: 'project_date', message: '* Date/Timeline is required' },
            { name: 'card_footer_text', message: '* Description is required' }
        ];

        conf.forEach(({ name, message }) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            if (name === 'project_date') {
                input.addEventListener('input', () => {
                    if (input.value && !isValidDate(input.value)) {
                        showFieldError(input, '* Invalid date (Year 1998-' + (dayjs().year() + 3) + ')');
                    } else {
                        hideFieldError(input);
                    }
                });
            } else {
                input.addEventListener('input', () => {
                    hideFieldError(input);
                });
            }
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['project_name', 'project_location', 'project_date', 'card_footer_text'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const confItem = [
                { name: 'project_name', message: '* Project name is required' },
                { name: 'project_location', message: '* Project location is required' },
                { name: 'project_date', message: '* Date/Timeline is required' },
                { name: 'card_footer_text', message: '* Description is required' }
            ].find(c => c.name === name);

            let isFieldValid = true;
            let errorMsg = confItem ? confItem.message : '* Required field';

            if (input.tagName === 'SELECT') {
                if (!input.value) isFieldValid = false;
            } else if (input.value.trim() === '') {
                isFieldValid = false;
            } else if (name === 'project_date' && !isValidDate(input.value)) {
                isFieldValid = false;
                errorMsg = '* Invalid date content';
            }

            if (!isFieldValid) {
                showFieldError(input, errorMsg);
                isValid = false;
            } else {
                hideFieldError(input);
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
            const fileGroup = fileInput ? fileInput.closest('.form-group') : null;
            if (fileGroup) {
                let msgFile = fileGroup.querySelector('.required-message-file');
                if (!msgFile) {
                    msgFile = document.createElement('div');
                    msgFile.className = 'required-message-file';
                    msgFile.textContent = '* Project image is required';
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
            form.project_name.value.trim() !== originalFormData.project_name ||
            form.project_location.value.trim() !== originalFormData.project_location ||
            form.project_date.value !== originalFormData.project_date ||
            form.card_footer_text.value.trim() !== originalFormData.card_footer_text ||
            form.new_type.value !== originalFormData.type ||
            (form.file && form.file.files.length > 0)
        );
    }

    function resetValidation(form) {
        if (!form) return;
        form.querySelectorAll('input, textarea, select').forEach(input => hideFieldError(input));
    }

    if (itemForm) {
        addRequiredFieldValidation(itemForm);
        itemForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!validateForm(this)) return;
            if (!isFormChanged(this)) {
                Swal.fire({ icon: 'info', title: 'No Changes', text: 'no changes is detected' });
                return;
            }

            const formData = new FormData(this);
            if (formData.has('project_date')) {
                formData.set('project_date', formatToDB(formData.get('project_date')));
            }
            const id = formData.get('index'); // This is actually the ID
            const type = formData.get('type');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            $.ajax({
                url: `/admin/projects/${type}/update/${id}`, // Fixed URL
                type: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Updated', text: 'content updated', timer: 1500, showConfirmButton: false }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire('Error', xhr.responseJSON?.message || 'Failed to update', 'error');
                },
                complete: function () {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }
});
