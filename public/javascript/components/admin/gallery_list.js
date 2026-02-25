import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

let originalFormData = {};

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
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
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_gallery')) || 5;

    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = rowsPerPage;
    }

    // Filter Logic
    function applyFilters(page = 1) {
        const params = {
            search: getSearchValue(searchInput),
            type: typeFilter ? typeFilter.value : 'all',
            fromDate: fromDateFilter ? fromDateFilter.value : '',
            toDate: toDateFilter ? toDateFilter.value : '',
            page: page,
            limit: rowsPerPage,
            is_filter: true
        };

        $.ajax({
            url: `/admin/gallery/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    renderTable(data.galleryItems);
                    updatePaginationUI(data);

                    // Update filter indicator
                    const filterIndicator = document.getElementById('filterIndicator');
                    if (filterIndicator) {
                        filterIndicator.style.display = data.is_filtered ? 'inline-block' : 'none';
                    }
                } else {
                    Swal.fire('Error!', data.message || 'Failed to fetch gallery items', 'error');
                }
            },
            error(xhr) {
                Swal.fire('Error!', xhr.responseText || 'Failed to fetch gallery items', 'error');
            }
        });
    }

    function renderTable(galleryItems) {
        const tbody = $(".data-table tbody").first();
        tbody.empty();

        if (galleryItems.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        galleryItems.forEach((item) => {
            const row = `
                <tr data-id="${item.id}" data-index="${item.index}">
                    <td>${String(item.index + 1).padStart(2, '0')}</td>
                    <td>
                        <span class="status-badge badge-upcoming">${item.type || '--'}</span>
                    </td>
                    <td class="item-name-cell">${item.projectName || '--'}</td>
                    <td>${item.title || 'No title'}</td>
                    <td>${item.text || 'No description'}</td>
                    <td title="${item.formattedDate}">${item.formattedDate}</td>
                    <td>
                        ${item.coverImage ? `
                            <button class="btn-preview" data-image="${item.coverImage}">
                                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 52 52" xml:space="preserve">
                                    <path d="M51.8,25.1C47.1,15.6,37.3,9,26,9S4.9,15.6,0.2,25.1c-0.3,0.6-0.3,1.3,0,1.8C4.9,36.4,14.7,43,26,43 s21.1-6.6,25.8-16.1C52.1,26.3,52.1,25.7,51.8,25.1z M26,37c-6.1,0-11-4.9-11-11s4.9-11,11-11s11,4.9,11,11S32.1,37,26,37z"></path>
                                    <path d="M26,19c-3.9,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7S29.9,19,26,19z"></path>
                                </svg>
                                <span>Preview</span>
                            </button>
                        ` : '<span>No Image</span>'}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn edit-btn" title="Edit" data-id="${item.id}" data-index="${item.index}" data-gallery='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                                <span class="edit">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button class="icon-action-btn delete-btn delete" title="Delete" data-id="${item.id}" data-index="${item.index}">
                                <span class="delete">
                                    <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
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
        const footerInfoSpan = document.querySelector('.footer-info span');
        if (footerInfoSpan) {
            footerInfoSpan.textContent = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} items`;
        }

        // Update rows per page select value
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let paginationHtml = '';

        // Prev button
        paginationHtml += `
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
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        paginationHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;
    }

    window.changePage = function (page) {
        applyFilters(page);
    };

    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_gallery', rowsPerPage);
        applyFilters(1);
    });

    if (searchInput) searchInput.addEventListener('input', () => applyFilters(1));
    if (typeFilter) typeFilter.addEventListener('change', () => applyFilters(1));
    // if (fromDateFilter) fromDateFilter.addEventListener('change', applyFilters);
    // if (toDateFilter) toDateFilter.addEventListener('change', applyFilters);

    // Date filter Picker Buttons
    const applyDateBtn = document.getElementById('applyDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');

    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', () => {
            const from = fromDateFilter.value;
            const to = toDateFilter.value;

            if (from && to) {
                applyFilters();
            } else if (!from && !to) {
                applyFilters();
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
            applyFilters();
        });
    }


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

    $(document).on('click', '.edit-btn', function () {
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
                            applyFilters(1);
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
