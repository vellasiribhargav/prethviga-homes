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
        rowsPerPage: 5
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

            inputs.description.value = blogData.description || '';

            // Reset validation states
            resetValidation(itemForm);

            openModal(itemModal);

            // Save original values for change detection - Captured AFTER modal opens and values are set
            setTimeout(() => {
                originalFormData = {
                    title: inputs.title.value.trim(),
                    tag: inputs.tag.value.trim(),
                    date: inputs.date.value,
                    description: inputs.description.value.trim()
                };
            }, 0);

            const imageBtn = itemForm.querySelector('.view-current-image-btn');
            if (imageBtn) {
                if (blogData.image) {
                    imageBtn.dataset.image = blogData.image;
                    imageBtn.style.display = 'inline-flex';
                } else {
                    imageBtn.style.display = 'none';
                }
            }

            // Remove existing listener to avoid duplicates if any (though typically this runs once per load, but safe to be sure or just attach once outside)
            // Better approach: The listener for .view-current-image-btn should be attached once outside this loop, but we need to make sure we don't attach it multiple times.
            // Actually, we can attach it once in the DOMContentLoaded scope.

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
            { name: 'description', message: '* Blog description is required' }
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

            input.addEventListener('input', () => msg.style.display = 'none');
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['title', 'tag', 'date', 'description'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const msg = input.nextElementSibling;
            if (input.value.trim() === '') {
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
});
