import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange, showFieldError, hideFieldError, initCharLimitHighlight } from '../../utils/validation.js';
import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

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
    const fromDateFilter = document.getElementById('fromDateFilter');
    const toDateFilter = document.getElementById('toDateFilter');
    const dateRangeToggle = document.getElementById('dateRangeToggle');
    const dateRangeMenu = document.getElementById('dateRangeMenu');

    if (dateRangeToggle && dateRangeMenu) {
        dateRangeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dateRangeMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dateRangeMenu.contains(e.target) && !dateRangeToggle.contains(e.target)) {
                dateRangeMenu.classList.remove('show');
            }
        });

        dateRangeMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Rows per page handling
    const rowsPerPageSelect = document.getElementById('rowsPerPageSelect');
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_projects')) || 5;
    window.currentPage = 1;

    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = rowsPerPage;
    }

    // Filter Logic
    // function applyFilters(params) {
    // const statusValue = statusFilter ? statusFilter.value : 'all';
    // const searchValue = getSearchValue(searchInput);
    // const { fromDate, toDate } = getDateRangeValues(fromDateFilter, toDateFilter);

    // // Get all project rows
    // const allRows = pagination.allRows;

    // const filteredRows = allRows.filter(row => {
    //     // Status check
    //     const type = row.dataset.type;
    //     if (statusValue !== 'all' && type !== statusValue) return false;

    //     // Search check (by project name and location)
    //     const projectName = row.querySelector('.item-name-cell')?.textContent || '';
    //     const projectLocation = row.cells[4]?.textContent || '';

    //     if (!matchesSearch(searchValue, projectName, projectLocation)) return false;

    //     // Date check
    //     const createdAtValue = row.cells[7]?.textContent.trim() || '';
    //     if (!matchesDateRange(fromDate, toDate, createdAtValue, ['DD MMM YYYY', 'DD-MM-YYYY', 'DD ddd MMM YYYY HH:mm', 'DD-MMM-YYYY'])) return false;

    //     return true;
    // });

    // // Update S.NO
    // filteredRows.forEach((row, idx) => {
    //     if (row.cells && row.cells.length > 0) {
    //         row.cells[0].textContent = String(idx + 1).padStart(2, '0');
    //     }
    // });

    // // Handle "No data found" logic
    // const noResultsRow = document.getElementById('noResultsRow');

    // if (filteredRows.length === 0) {
    //     if (noResultsRow) {
    //         noResultsRow.style.display = '';
    //     }
    // } else {
    //     if (noResultsRow) {
    //         noResultsRow.style.display = 'none';
    //     }
    // }

    // pagination.refreshRows(filteredRows);
    function applyFilters(page = 1) {
        const params = {
            status: statusFilter ? statusFilter.value : 'all',
            search: getSearchValue(searchInput),
            fromDate: fromDateFilter ? fromDateFilter.value : '',
            toDate: toDateFilter ? toDateFilter.value : '',
            page: page,
            limit: rowsPerPage,
            is_filter: true
        };

        $.ajax({
            url: `/admin/projects/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    window.currentPage = data.pagination.currentPage;
                    renderTable(data.projects);
                    updatePaginationUI(data);

                    // Update filter indicator
                    const filterIndicator = document.getElementById('filterIndicator');
                    if (filterIndicator) {
                        filterIndicator.style.display = data.is_filtered ? 'inline-block' : 'none';
                    }
                } else {
                    Swal.fire('Error!', data.message, 'error');
                }
            },
            error(xhr) {
                Swal.fire('Error!', xhr.responseJSON?.message || 'Failed to fetch projects', 'error');
            }
        });
    }

    function renderTable(projects) {
        const tbody = $("#projectsTableBody");
        tbody.empty();

        if (projects.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        projects.forEach((project) => {
            const row = `
                <tr data-id="${project.id}" data-type="${project.type}">
                    <td>${String(project.index + 1).padStart(2, '0')}</td>
                    <td class="item-name-cell">${project.name}</td>
                    <td>${project.type}</td>
                    <td>${project.description || "No description..."}</td>
                    <td>${project.location}</td>
                    <td>${project.timeline}</td>
                    <td>
                        ${project.coverImage ? `
                            <button class="btn-preview" data-image="${project.coverImage}">
                                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 52 52" xml:space="preserve">
                                    <path d="M51.8,25.1C47.1,15.6,37.3,9,26,9S4.9,15.6,0.2,25.1c-0.3,0.6-0.3,1.3,0,1.8C4.9,36.4,14.7,43,26,43 s21.1-6.6,25.8-16.1C52.1,26.3,52.1,25.7,51.8,25.1z M26,37c-6.1,0-11-4.9-11-11s4.9-11,11-11s11,4.9,11,11S32.1,37,26,37z"></path>
                                    <path d="M26,19c-3.9,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7S29.9,19,26,19z"></path>
                                </svg>
                                <span>Preview</span>
                            </button>
                        ` : '<span>No Image</span>'}
                    </td>
                    <td><b>${project.formattedDate}</b></td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn edit-btn" title="Edit" 
                                data-id="${project.id}" 
                                data-type="${project.type}" 
                                data-project='${JSON.stringify(project).replace(/'/g, "&apos;")}'>
                                <span class="edit">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button class="icon-action-btn delete-btn" title="Delete" data-id="${project.id}" data-type="${project.type}">
                                <span class="delete">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 19.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    function updatePaginationUI(data) {
        const { totalItems, totalPages, currentPage, start, end } = data.pagination;

        // Update info text
        const footerInfo = document.querySelector('.footer-info');
        if (footerInfo) {
            footerInfo.innerHTML = `<span>Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} projects</span>`;
        }

        // Update rows per page select value
        const rowsPerPageSelect = document.getElementById('rowsPerPageSelect');
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let projectHtml = '';

        // Prev button
        projectHtml += `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M17.2 23.7 L5.4 12 L17.2 0.3 L18.5 1.7 L8.4 12 L18.5 22.3 Z"></path>
                </svg>
            </button>
        `;

        // Page numbers
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        if (endPage - startPage + 1 < maxPages) startPage = Math.max(1, endPage - maxPages + 1);

        for (let i = startPage; i <= endPage; i++) {
            projectHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        projectHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = projectHtml;
    }

    // Event delegation for Rows Per Page Select
    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_projects', rowsPerPage);
        applyFilters(1);
    });

    window.changePage = function (page) {
        applyFilters(page);
    };

    if (statusFilter) statusFilter.addEventListener('change', () => applyFilters(window.currentPage || 1));
    if (searchInput) searchInput.addEventListener('input', () => applyFilters(1));

    // Date filter Logic
    const applyDateBtn = document.getElementById('applyDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');

    // When fromDate changes, restrict toDate to be >= fromDate
    if (fromDateFilter && toDateFilter) {
        fromDateFilter.addEventListener('change', () => {
            toDateFilter.min = fromDateFilter.value;
            if (toDateFilter.value && toDateFilter.value < fromDateFilter.value) {
                toDateFilter.value = '';
            }
        });
    }

    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', () => {
            const from = fromDateFilter.value;
            const to = toDateFilter.value;

            if (from && to) {
                applyFilters(1);
                if (dateRangeMenu) dateRangeMenu.classList.remove('show');
            } else if (!from && !to) {
                applyFilters(1);
                if (dateRangeMenu) dateRangeMenu.classList.remove('show');
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Incomplete Date filter',
                    text: 'Please select both From and To dates to filter, or clear both to reset.'
                });
            }
        });
    }

    if (clearDateBtn) {
        clearDateBtn.addEventListener('click', () => {
            if (fromDateFilter) fromDateFilter.value = '';
            if (toDateFilter) toDateFilter.value = '';
            applyFilters(window.currentPage || 1);
        });
    }

    // Remove old listeners that triggered on change
    // if (fromDateFilter) fromDateFilter.addEventListener('change', () => applyFilters(1));
    // if (toDateFilter) toDateFilter.addEventListener('change', () => applyFilters(1));


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
    $(document).on('click', '.edit-btn', function () {
        const projectData = JSON.parse(this.dataset.project);
        const id = this.dataset.id;
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
    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
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
                                applyFilters(1);
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
                            applyFilters(window.currentPage || 1);
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
