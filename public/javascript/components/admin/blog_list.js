import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

let originalFormData = {};

function formatToDB(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

function parseFromDB(dbDateStr) {
    if (!dbDateStr) return '';
    const parts = dbDateStr.split('-');
    if (parts.length !== 3) return dbDateStr; // Return as is if not expected format
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
}

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
        storageKey: 'rowsPerPage_blog'
    });

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
            const index = this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = index;
            inputs.title.value = blogData.title || '';
            inputs.tag.value = blogData.tag || '';
            inputs.description.value = blogData.description || '';

            // Format date for input[type="date"]
            if (blogData.date) {
                // Try parsing as DD-MM-YYYY first
                const parsedDate = parseFromDB(blogData.date);
                if (parsedDate && parsedDate.includes('-')) {
                    inputs.date.value = parsedDate;
                } else {
                    // Fallback for legacy data/other formats
                    const date = new Date(blogData.date);
                    if (!isNaN(date)) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        inputs.date.value = `${yyyy}-${mm}-${dd}`;
                    } else {
                        inputs.date.value = '';
                    }
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
                    content: document.getElementById('edit-content-input').value
                };
            }, 0);

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            if (imageBtn) {
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
                try {
                    const response = await fetch(`/admin/blog/${CURRENT_SLUG}/${CURRENT_SECTION}/delete/${index}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        await Swal.fire('Deleted!', 'Blog has been deleted.', 'success');
                        window.location.reload();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    Swal.fire('Error!', error.message || 'Failed to delete blog', 'error');
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

            input.addEventListener('input', () => msg.style.display = 'none');
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

            if (val === '') {
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
            form.title.value.trim() !== originalFormData.title ||
            form.tag.value.trim() !== originalFormData.tag ||
            form.date.value !== originalFormData.date ||
            form.description.value.trim() !== originalFormData.description ||
            (form.read_time && form.read_time.value !== originalFormData.read_time) ||
            (document.getElementById('edit-content-input').value !== originalFormData.content) ||
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
            // Convert date to DB format
            if (formData.has('date')) {
                formData.set('date', formatToDB(formData.get('date')));
            }
            const index = formData.get('index');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`/admin/blog/${CURRENT_SLUG}/${CURRENT_SECTION}/update/${index}`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Blog updated successfully',
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
                    text: error.message || 'Failed to update blog'
                });
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
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

            // If it has data-link, it's a copy button (table)
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
            // Simplified: no tooltip sync for forms as per user request
        }
    });

    // Custom Tooltip Logic to avoid Table Clipping
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-js-tooltip';
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', function (e) {
        const target = e.target.closest('.tooltip-cell');
        if (target) {
            const text = target.getAttribute('data-tooltip');
            if (text && text !== 'No description available...') {
                tooltip.textContent = text;
                tooltip.style.display = 'block'; // Make visible to calculate dims

                const rect = target.getBoundingClientRect();
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;

                // Position to the right of the cell/cursor
                let top = rect.top + (rect.height / 2) - 20; // Aligned roughly with text
                let left = rect.right + 2; // Reduced gap to 2px

                // Check if it goes off screen right
                if (left + tooltipWidth > window.innerWidth) {
                    // Flip to left side
                    // rect.left is the cell edge. Cell has ~24px padding. 
                    // To place it closer to text, we can overlap the padding slightly.
                    left = rect.left - tooltipWidth - 2;
                    tooltip.classList.add('left-side');
                } else {
                    tooltip.classList.remove('left-side');
                }

                // Check vertical bounds
                if (top < 10) top = 10;
                if (top + tooltipHeight > window.innerHeight) {
                    top = window.innerHeight - tooltipHeight - 10;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
            }
        }
    });

    document.addEventListener('mouseout', function (e) {
        const target = e.target.closest('.tooltip-cell');
        if (target) {
            tooltip.style.display = 'none';
        }
    });
});