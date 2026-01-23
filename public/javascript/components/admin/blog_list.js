import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const previewModal = document.getElementById('previewModal');
    const itemForm = document.getElementById('itemForm');
    const previewImage = document.getElementById('previewImage');
    const closeModalBtns = document.querySelectorAll('.close-modal');

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
                const date = new Date(blogData.date);
                if (!isNaN(date)) {
                    inputs.date.value = date.toISOString().split('T')[0];
                } else {
                    inputs.date.value = '';
                }
            } else {
                inputs.date.value = '';
            }

            inputs.description.value = blogData.description || '';

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
        if (!form) return;
        const conf = [
            { name: 'title', message: '* Blog title is required' },
            { name: 'tag', message: '* Blog tag is required' },
            { name: 'date', message: '* Publication date is required' },
            { name: 'description', message: '* Blog description is required' }
        ];

        conf.forEach(({ name, message }) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            // Remove existing if any
            const existingMsg = input.parentNode.querySelector(`.required-message[data-for="${name}"]`);
            if (existingMsg) existingMsg.remove();

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.dataset.for = name;
            msg.textContent = message;
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';

            input.after(msg);

            input.addEventListener('input', () => {
                msg.style.display = 'none';
            });
            input.addEventListener('change', () => {
                msg.style.display = 'none';
            });
        });
    }

    function validateForm(form) {
        let isValid = true;
        const fieldNames = ['title', 'tag', 'date', 'description'];

        fieldNames.forEach(name => {
            const input = form.querySelector(`[name="${name}"]`);
            if (!input) return;

            const msg = input.parentNode.querySelector(`.required-message[data-for="${name}"]`);
            if (input.value.trim() === '') {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        return isValid;
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

            const formData = new FormData(this);
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
