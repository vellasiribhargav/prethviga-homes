import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange } from '../../utils/validation.js';
import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return '';
}

let originalFormData = {};

function formatForDisplay(dbDateStr) {
    if (!dbDateStr) return 'No date';
    return dayjs(dbDateStr).format('MMMM D, YYYY');
}

// Function to convert YYYY-MM-DD to DB format
function formatToDB(dateStr) {
    return dateStr;
}

// Function to parse date from DB for input[type="date"]
function parseFromDB(dateStr) {
    return dateStr;
}

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');
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
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_blog')) || 5;

    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = rowsPerPage;
    }

    // Filter Logic
    function applyFilters(page = 1) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentSlug = urlParams.get('slug') || getCookie('admin_blog_slug') || (typeof CURRENT_SLUG !== 'undefined' ? CURRENT_SLUG : 'discoverUs');
        const currentSection = urlParams.get('section') || getCookie('admin_blog_section') || (typeof CURRENT_SECTION !== 'undefined' ? CURRENT_SECTION : 'blogs-card');

        const params = {
            search: getSearchValue(searchInput),
            fromDate: fromDateFilter ? fromDateFilter.value : '',
            toDate: toDateFilter ? toDateFilter.value : '',
            page: page,
            limit: rowsPerPage,
            is_filter: true,
            slug: currentSlug,
            section: currentSection
        };

        $.ajax({
            url: `/admin/blog/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    renderTable(data.blogs);
                    updatePaginationUI(data);

                    // Update filter indicator
                    const filterIndicator = document.getElementById('filterIndicator');
                    if (filterIndicator) {
                        filterIndicator.style.display = data.is_filtered ? 'inline-block' : 'none';
                    }
                } else {
                    Swal.fire('Error!', data.message || 'Failed to fetch blogs', 'error');
                }
            },
            error(xhr) {
                Swal.fire('Error!', xhr.responseText || 'Failed to fetch blogs', 'error');
            }
        });
    }

    function renderTable(blogs) {
        const tbody = $(".data-table tbody").first();
        tbody.empty();

        if (blogs.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        blogs.forEach((blog) => {
            const row = `
                <tr>
                    <td>${String(blog.index + 1).padStart(2, '0')}</td>
                    <td>
                        <span class="status-badge badge-upcoming">${blog.tag}</span>
                    </td>
                    <td class="item-name-cell">${blog.title}</td>
                    <td>${blog.description}</td>
                    <td title=${blog.cleanContent}>${blog.contentSnippet}</td>
                    <td>${blog.formattedPublicationDate}</td>
                    <td>${blog.timeToRead} min read</td>
                    <td>
                        ${blog.image
                    ? `
                            <button class="btn-preview" data-image="${blog.image}">
                                <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 52 52">
                                    <path d="M51.8,25.1C47.1,15.6,37.3,9,26,9S4.9,15.6,0.2,25.1c-0.3,0.6-0.3,1.3,0,1.8C4.9,36.4,14.7,43,26,43 s21.1-6.6,25.8-16.1C52.1,26.3,52.1,25.7,51.8,25.1z M26,37c-6.1,0-11-4.9-11-11s4.9-11,11-11s11,4.9,11,11S32.1,37,26,37z"></path>
                                    <path d="M26,19c-3.9,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7S29.9,19,26,19z"></path>
                                </svg>
                                <span>Preview</span>
                            </button>
                            `
                    : `<span>No Image</span>`
                }
                    </td>
                    <td>
                       <b>${blog.formattedDate}</b>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn edit-btn" title="Edit" data-id="${blog.id}" data-blog='${JSON.stringify(blog).replace(/'/g, "&apos;")}'>
                                <span class="edit">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button class="icon-action-btn delete-btn" title="Delete" data-id="${blog.id}">
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
        const footerInfoSpan = document.querySelector('.footer-info span');
        if (footerInfoSpan) {
            footerInfoSpan.textContent = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} blogs`;
        }

        // Update rows per page select value
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let blogHtml = '';

        // Prev button
        blogHtml += `
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
            blogHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        blogHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = blogHtml;
    }

    window.changePage = function (page) {
        applyFilters(page);
    };

    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_blog', rowsPerPage);
        applyFilters(1);
    });

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
            applyFilters(1);
        });
    }

    // Initialize Quill for Edit Modal
    const quill = new Quill('#edit-quill-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });

    // Sync with hidden input
    quill.on('text-change', function () {
        document.getElementById('edit-content-input').value = quill.root.innerHTML;
        // Hide validation message
        const msg = document.querySelector('.required-message[data-for="content"]');
        if (msg && quill.getText().trim().length > 0) {
            msg.style.display = 'none';
        }
    });

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Set date constraints on modal open
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
        const blogData = JSON.parse(this.dataset.blog);
        const id = this.dataset.id || this.dataset.index;

        const inputs = itemForm.elements;
        inputs.index.value = id;
        inputs.title.value = blogData.title || '';
        inputs.tag.value = blogData.tag || '';
        inputs.description.value = blogData.description || '';

        // Format date for input[type="date"]
        const rawDate = blogData.blog_date || blogData.date;
        if (rawDate) {
            // Try to parse different possible formats
            const parsedDate = dayjs(rawDate, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MMMM D, YYYY']);
            if (parsedDate.isValid()) {
                inputs.date.value = parsedDate.format('YYYY-MM-DD');
            } else {
                inputs.date.value = '';
            }
        } else {
            inputs.date.value = '';
        }

        if (inputs.read_time) {
            let timeVal = blogData.timeToRead || blogData.blog_time || '';
            // If it's a string like "4 min read", extract just the "4"
            if (typeof timeVal === 'string' && timeVal.includes(' ')) {
                const match = timeVal.match(/\d+/);
                if (match) timeVal = match[0];
            }
            inputs.read_time.value = timeVal;
        }

        // Populate Quill content
        const content = blogData.blog_content || blogData.content || '';
        if (content) {
            quill.root.innerHTML = content;
            document.getElementById('edit-content-input').value = content;
        } else {
            quill.setContents([]);
            document.getElementById('edit-content-input').value = '';
        }

        // Reset validation states
        resetValidation(itemForm);

        openModal(itemModal);

        // Save original values for change detection - Captured AFTER modal opens and values are set
        setTimeout(() => {
            originalFormData = {
                title: inputs.title.value.trim(),
                tag: inputs.tag.value.trim(),
                date: inputs.date.value,
                description: inputs.description.value.trim(),
                read_time: inputs.read_time ? inputs.read_time.value : '',
                content: document.getElementById('edit-content-input').value,
                remove_image: 'false'
            };
        }, 0);

        const imageBtn = itemForm.querySelector('.view-current-image-btn');
        const removeBtn = itemForm.querySelector('.remove-current-image-btn');
        const fileInput = itemForm.querySelector('input[type="file"]');

        if (imageBtn && removeBtn && fileInput) {
            if (blogData.image) {
                imageBtn.dataset.image = blogData.image;
                imageBtn.style.display = 'inline-flex';
                removeBtn.style.display = 'inline-flex';
                fileInput.style.display = 'none';
            } else {
                imageBtn.style.display = 'none';
                removeBtn.style.display = 'none';
                fileInput.style.display = 'block';
            }
        }

        // Hide validation message if it exists
        const fileInputEl = itemForm.querySelector('input[type="file"]');
        if (fileInputEl) {
            fileInputEl.addEventListener('change', () => {
                const msg = fileInputEl.closest('.form-group').querySelector('.required-message-file');
                if (msg && fileInputEl.files.length > 0) msg.style.display = 'none';
            });
        }

        // Reset removal flag
        if (inputs.remove_image) inputs.remove_image.value = 'false';

        // Reset validation states
        resetValidation(itemForm);
    });

    // Listener for separate View Current Image button inside the form
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
            const removeImageInput = form.querySelector('input[name="remove_image"]');

            this.style.display = 'none';
            if (viewBtn) viewBtn.style.display = 'none';
            if (fileInput) {
                fileInput.style.display = 'block';
                fileInput.value = ''; // Reset file input
            }
            if (removeImageInput) {
                removeImageInput.value = 'true';
            }
        });
    }

    $(document).on('click', '.delete-btn', async function () {
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
            const currentSlug = getCookie('admin_blog_slug') || (typeof CURRENT_SLUG !== 'undefined' ? CURRENT_SLUG : 'discoverUs');
            const currentSection = getCookie('admin_blog_section') || (typeof CURRENT_SECTION !== 'undefined' ? CURRENT_SECTION : 'blogs-card');
            $.ajax({
                url: `/admin/blog/delete/${id}?slug=${currentSlug}&section=${currentSection}`,
                type: 'DELETE',
                success: function (data) {
                    if (data.success) {
                        Swal.fire(
                            'Deleted!',
                            'Blog has been deleted.',
                            'success'
                        ).then(() => {
                            applyFilters(1);
                        });
                    } else {
                        Swal.fire('Error!', data.message || 'Failed to delete blog', 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire('Error!', xhr.responseText, 'error');
                }
            });
        }
    });

    $(document).on('click', '.btn-preview', function () {
        const imageUrl = this.dataset.image;
        if (imageUrl) {
            previewImage.src = imageUrl;
            openModal(previewModal);
        }
    });

    // Validation Functions
    function addRequiredFieldValidation(form) {
        const conf = [
            { name: 'title', message: '* Blog title is required' },
            { name: 'tag', message: '* Blog tag is required' },
            { name: 'date', message: '* Publication date is required' },
            { name: 'description', message: '* Blog description is required' },
            { name: 'read_time', message: '* Read time is required' },
            { name: 'content', message: '* Blog content is required' }
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
            msg.dataset.for = name;
            msg.textContent = message;
            msg.style.display = 'none';

            container.appendChild(msg);

            // Special validation for Date
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
            input.addEventListener('change', () => msg.style.display = 'none');
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['title', 'tag', 'date', 'description', 'read_time', 'content'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;
            const msg = container.querySelector(`.required-message[data-for="${name}"]`);

            let val = input.value.trim();
            if (name === 'content') {
                val = quill.getText().trim();
            }

            let isFieldValid = true;

            if (val === '') {
                isFieldValid = false;
                if (msg && name === 'date') msg.textContent = '* Publication date is required';
            } else if (name === 'date' && !isValidDate(input.value)) {
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

        // Image Validation
        const removeImageInput = form.querySelector('input[name="remove_image"]');
        const fileInput = form.querySelector('input[name="file"]');
        const viewBtn = form.querySelector('.view-current-image-btn');
        const hasExistingImage = viewBtn && viewBtn.style.display !== 'none';
        const isRemoving = removeImageInput && removeImageInput.value === 'true';
        const hasNewFile = fileInput && fileInput.files.length > 0;

        let msgFile = form.querySelector('.required-message-file');
        if (!msgFile) {
            msgFile = document.createElement('div');
            msgFile.className = 'required-message-file';
            msgFile.textContent = '* Blog cover image is required';
            msgFile.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
            const fileGroup = (fileInput ? fileInput.closest('.form-group') : null) || (viewBtn ? viewBtn.parentNode : null);
            if (fileGroup) fileGroup.appendChild(msgFile);
        }

        if ((isRemoving || !hasExistingImage) && !hasNewFile) {
            if (msgFile) msgFile.style.display = 'block';
            isValid = false;
        } else {
            if (msgFile) msgFile.style.display = 'none';
        }

        return isValid;
    }

    function isFormChanged(form) {
        const inputs = form.elements;
        return (
            inputs.title.value.trim() !== originalFormData.title ||
            inputs.tag.value.trim() !== originalFormData.tag ||
            inputs.date.value !== originalFormData.date ||
            inputs.description.value.trim() !== originalFormData.description ||
            (inputs.read_time && inputs.read_time.value !== originalFormData.read_time) ||
            (document.getElementById('edit-content-input').value !== originalFormData.content) ||
            (inputs.remove_image && inputs.remove_image.value !== originalFormData.remove_image) ||
            (inputs.file && inputs.file.files.length > 0)
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
            const id = formData.get('index');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const currentSlug = getCookie('admin_blog_slug') || (typeof CURRENT_SLUG !== 'undefined' ? CURRENT_SLUG : 'discoverUs');
            const currentSection = getCookie('admin_blog_section') || (typeof CURRENT_SECTION !== 'undefined' ? CURRENT_SECTION : 'blogs-card');
            $.ajax({
                url: `/admin/blog/update/${id}?slug=${currentSlug}&section=${currentSection}`,
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
                    Swal.fire('Error!', xhr.responseText, 'error');
                },
                complete: function () {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        });
    }

    const slugSelector = document.getElementById('blog-slug-selector');
    if (slugSelector) {
        // Initialize from cookie if exists
        const savedSlug = getCookie('admin_blog_slug');
        if (savedSlug) {
            slugSelector.value = savedSlug;
        }

        slugSelector.addEventListener('change', function () {
            const newSlug = this.value;
            const section = 'blogs-card';
            setCookie('admin_blog_slug', newSlug);
            setCookie('admin_blog_section', section);

            // Update Add button link
            const addBtn = document.getElementById('addBtn');
            if (addBtn) {
                addBtn.setAttribute('onclick', `window.location.href='/admin/blog'`);
            }

            applyFilters(1);
        });
    }

    // Add copy functionality
    document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.paste-btn');
        if (copyBtn) {
            const link = copyBtn.dataset.link;
            if (link) {
                try {
                    await navigator.clipboard.writeText(link);
                    Swal.fire({
                        icon: 'success',
                        title: 'Copied!',
                        text: 'Link copied to clipboard',
                        timer: 1000,
                        showConfirmButton: false
                    });
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
                return;
            }
        }
    });

    // Update title on input change
    document.addEventListener('input', (e) => {
        if (e.target.name === 'link') {
            // Simplified
        }
    });
});