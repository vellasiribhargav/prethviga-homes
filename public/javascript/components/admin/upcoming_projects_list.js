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
    if (parts.length !== 3) return dbDateStr;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
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
        storageKey: 'rowsPerPage_upcoming'
    });

    // Modal Functions
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

    // Close Modal Events
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
            const index = this.dataset.index;

            // Populate Form
            const inputs = itemForm.elements;
            inputs.index.value = index;
            inputs.project_name.value = projectData.project_name || '';
            inputs.project_location.value = projectData.project_location || '';

            // Format date for input[type="date"]
            if (projectData.project_date) {
                const parsedDate = parseFromDB(projectData.project_date);
                if (parsedDate && parsedDate.includes('-')) {
                    inputs.project_date.value = parsedDate;
                } else {
                    const date = new Date(projectData.project_date);
                    if (!isNaN(date)) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        inputs.project_date.value = `${yyyy}-${mm}-${dd}`;
                    } else {
                        inputs.project_date.value = '';
                    }
                }
            } else {
                inputs.project_date.value = '';
            }

            inputs.card_footer_text.value = projectData.card_footer_text || '';

            // Reset validation states
            resetValidation(itemForm);

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

            // Handle Image Link
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

    // Handle Delete
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
                    const response = await fetch(`/admin/upcoming/deleteupcoming/${index}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        await Swal.fire(
                            'Deleted!',
                            'Project has been deleted.',
                            'success'
                        );
                        window.location.reload();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        error.message || 'Failed to delete project',
                        'error'
                    );
                }
            }
        });
    });

    // Handle Preview
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
            { name: 'project_date', message: '* Project date is required' },
            { name: 'card_footer_text', message: '* Project description is required' }
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
        const fieldNames = ['project_name', 'project_location', 'project_date', 'card_footer_text'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const msg = input.nextElementSibling;

            if (input.value.trim() === '') {
                msg.style.display = 'block';
                isValid = false;
            } else {
                msg.style.display = 'none';
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
                    text: 'You have not modified anything.'
                });
                return;
            }

            const formData = new FormData(this);
            if (formData.has('project_date')) {
                formData.set('project_date', formatToDB(formData.get('project_date')));
            }
            const index = formData.get('index');

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`/admin/upcoming/updateupcoming/${index}`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Project updated successfully',
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
                    text: error.message || 'Failed to update project'
                });
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
