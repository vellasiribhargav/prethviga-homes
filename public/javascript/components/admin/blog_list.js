import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { isValidDate, getDateRange } from '../../utils/validation.js';
import { getSearchValue, getDateValue, matchesSearch, matchesDate } from '../../utils/searchUtils.js';

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
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_blog'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = getSearchValue(searchInput);
        const dateValue = getDateValue(dateFilter);

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by blog title and tag)
            const blogTitle = row.querySelector('.item-name-cell')?.textContent || '';
            const blogTag = row.cells[1]?.textContent || '';

            if (!matchesSearch(searchValue, blogTitle, blogTag)) return false;

            // Date check (by Creation Date)
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

        pagination.refreshRows(filteredRows);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);

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

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const blogData = JSON.parse(this.dataset.blog);
            const id = this.dataset.id || this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = id;
            inputs.title.value = blogData.title || '';
            inputs.tag.value = blogData.tag || '';
            inputs.description.value = blogData.description || '';

            // Format date for input[type="date"]
            if (blogData.date) {
                const parsedDate = dayjs(blogData.date, ['DD-MM-YYYY', 'YYYY-MM-DD']);
                if (parsedDate.isValid()) {
                    inputs.date.value = parsedDate.format('YYYY-MM-DD');
                } else {
                    inputs.date.value = '';
                }
            } else {
                inputs.date.value = '';
            }

            if (inputs.read_time) {
                let timeVal = blogData.timeToRead || '';
                // If it's a string like "4 min read", extract just the "4"
                if (typeof timeVal === 'string' && timeVal.includes(' ')) {
                    const match = timeVal.match(/\d+/);
                    if (match) timeVal = match[0];
                }
                inputs.read_time.value = timeVal;
            }

            // Populate Quill content
            if (blogData.content) {
                quill.root.innerHTML = blogData.content;
                document.getElementById('edit-content-input').value = blogData.content;
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
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/admin/blog/${CURRENT_SLUG}/${CURRENT_SECTION}/delete/${id}`,
                        type: 'DELETE',
                        success: function (data) {
                            if (data.success) {
                                Swal.fire(
                                    'Deleted!',
                                    'Blog has been deleted.',
                                    'success'
                                ).then(() => {
                                    window.location.reload();
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

            $.ajax({
                url: `/admin/blog/${CURRENT_SLUG}/${CURRENT_SECTION}/update/${id}`,
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
        slugSelector.addEventListener('change', function () {
            const newSlug = this.value;
            let section = 'blogs-card'; // Default for all now

            window.location.href = `/admin/blog/${newSlug}/${section}/list`;
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
