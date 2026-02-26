import $ from 'jquery';
window.$ = window.jQuery = $;
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { isValidDate, getDateRange } from '../../utils/validation.js';

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

function formatToDB(dateStr) {
    if (!dateStr) return '';
    return dayjs(dateStr).format('DD-MM-YYYY');
}
// displaying date in form 
function getTodayDate() {
    return dayjs().format('YYYY-MM-DD');
}

document.addEventListener('DOMContentLoaded', function () {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');

    const pageSlugEl = document.getElementById('page_slug');
    const pageSectionEl = document.getElementById('page_section');
    const slugSelector = document.getElementById('blog-slug-selector');

    const slug = pageSlugEl ? pageSlugEl.value : (getCookie('admin_blog_slug') || 'discoverUs');
    const section = pageSectionEl ? pageSectionEl.value : (getCookie('admin_blog_section') || 'blogs-card');

    if (slugSelector) {
        slugSelector.value = slug;
        slugSelector.addEventListener('change', () => {
            const newSlug = slugSelector.value;
            const newSection = 'blogs-card';
            setCookie('admin_blog_slug', newSlug);
            setCookie('admin_blog_section', newSection);
            window.location.href = '/admin/blog';
        });
    }

    let formCount = 0;

    // Character limit message handler for all textareas
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('form-textarea')) {
            const textarea = e.target;
            const container = textarea.closest('.form-group') || textarea.parentNode;
            let charLimitMsg = container.querySelector('.char-limit-msg');
            const limit = textarea.maxLength || 200;

            if (charLimitMsg) {
                if (textarea.value.length >= limit) {
                    charLimitMsg.style.display = 'block';
                    charLimitMsg.textContent = `* Characters are more than ${limit}`;
                } else {
                    charLimitMsg.style.display = 'none';
                }
            }
        }
    });

    // Initialize
    updateDeleteButtonsVisibility();
    let blogArr = [];

    const firstForm = document.querySelector('.content-card');
    if (firstForm) {
        if (!firstForm.dataset.formId) {
            firstForm.dataset.formId = 'form-' + Date.now();
        }
        setupImageUpload(firstForm);
        initQuill(firstForm);
        addRequiredFieldValidation(firstForm);
        updateSubmitButtonsVisibility();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();

        // Set default date for the first form 
        // displaying date in form
        const dateInput = firstForm.querySelector('input[name="publication-date"]');
        if (dateInput && !dateInput.value) {
            dateInput.value = getTodayDate();
        }
    }

    function initQuill(formCard) {
        const editorContainer = formCard.querySelector('.quill-editor');
        if (!editorContainer) return;

        const quill = new Quill(editorContainer, {
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
        const contentInput = formCard.querySelector('.content-input');
        quill.on('text-change', function () {
            contentInput.value = quill.root.innerHTML;
            // Hide validation message if content exists
            const msg = formCard.querySelector('.required-message[data-for="blog_content"]');
            if (msg && quill.getText().trim().length > 0) {
                msg.style.display = 'none';
            }
        });

        // Store quill instance on the form for easy access
        formCard.quill = quill;
    }
    // loadExistingBlogs();

    addMoreBtn.addEventListener('click', function () {
        const allForms = document.querySelectorAll('.content-card');
        const currentForm = allForms[allForms.length - 1];

        const formData = getFormData(currentForm);
        const hasData = formData.blogTag || formData.blogTitle || formData.blogDescription || (currentForm.querySelector('.uploaded-image img') !== null);

        if (hasData) {
            // Hide current form submit section
            const submitSection = currentForm.querySelector('.submit-section');
            if (submitSection) submitSection.style.display = 'none';

            addToBlogList(formData, currentForm.dataset.formId);
            showAddedItemsSection();
        }

        createNewForm();
    });

    function setupImageUpload(formCard) {
        const uploadBtn = formCard.querySelector('.upload-btn');
        const fileInput = formCard.querySelector('.image-upload');

        if (!uploadBtn || !fileInput) return;

        // Create required message for file
        let msg = uploadBtn.parentNode.querySelector('.required-message-file');
        if (msg) msg.remove();

        msg = document.createElement('div');
        msg.className = 'required-message-file';
        msg.textContent = '* Cover image is required';
        msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
        uploadBtn.parentNode.appendChild(msg);

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                msg.style.display = 'none';
            }
        });
    }

    // Character limit message handler
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('form-textarea')) {
            const msg = e.target.parentNode.querySelector('.char-limit-msg');
            if (msg) {
                if (e.target.value.length >= 200) {
                    msg.style.display = 'block';
                    msg.textContent = '* Characters are more than 200';
                } else {
                    msg.style.display = 'none';
                }
            }
        }
    });

    function handleImageUpload(file, uploadBtn) {
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                text: `${file.name} is too large. Max size is 2MB.`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        // Store the File object on the button so it survives innerHTML replacement
        uploadBtn._file = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadBtn.innerHTML = `
                <div class="uploaded-image">
                    <img src="${e.target.result}" alt="Uploaded cover">
                    <button class="remove-image" onclick="removeImage(this, event)">
                        <span class="material-symbols-outlined">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#ffffff"/>
                            </svg>
                        </span>
                    </button>
                </div>
            `;
            uploadBtn.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = function (button, event) {
        if (event) event.stopPropagation();
        const uploadBtn = button.closest('.upload-btn');
        uploadBtn._file = null; // Clear stored file
        uploadBtn.classList.remove('has-image');
        uploadBtn.innerHTML = `
            <div class="upload-icon">
                <span class="material-symbols-outlined">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                    </svg>
                </span>
            </div>
            <p class="upload-text">Tap to upload cover image</p>
            <p class="upload-subtext">JPG, PNG (max. 2MB)</p>
            <input class="image-upload" type="file" accept="image/*" style="display: none;">
        `;
    };

    document.addEventListener('click', function (e) {
        // Event delegation for upload buttons to avoid multiple stacking listeners
        const uploadBtn = e.target.closest('.upload-btn');
        if (uploadBtn && !e.target.closest('.remove-image')) {
            if (!uploadBtn.classList.contains('has-image')) {
                const fileInput = uploadBtn.parentNode.querySelector('.image-upload') || uploadBtn.querySelector('.image-upload');
                if (fileInput) fileInput.click();
            }
        }

        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();

            const allForms = document.querySelectorAll('.content-card');
            const invalidFormIndices = [];
            for (let i = 0; i < allForms.length; i++) {
                const form = allForms[i];
                if (!validateForm(form)) {
                    invalidFormIndices.push(i);
                }
            }

            if (invalidFormIndices.length > 0) {
                const firstInvalid = invalidFormIndices[0];
                window.currentFormIndex = firstInvalid;
                allForms.forEach(f => f.style.display = 'none');
                allForms[firstInvalid].style.display = 'block';
                updateSubmitButtonsVisibility();
                updateNavigationButtons();
                return;
            }

            const allFormData = [];
            for (let i = 0; i < allForms.length; i++) {
                const form = allForms[i];
                const tempFormData = getFormData(form);
                allFormData.push(tempFormData);
            }

            if (allFormData.length > 0) {
                submitAllBlogs(allFormData);
            }
        }

        if (e.target.classList.contains('prev-btn')) {
            e.preventDefault();
            window.previousForm();
        }

        if (e.target.classList.contains('next-btn')) {
            e.preventDefault();
            window.nextForm();
        }

        const deleteBtn = e.target.closest('.delete-form-btn');
        if (deleteBtn) {
            e.preventDefault();
            const allForms = document.querySelectorAll('.content-card');

            if (allForms.length <= 1) {
                Swal.fire({
                    icon: 'warning',
                    text: 'You cannot delete the only form.',
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            const formCard = deleteBtn.closest('.content-card');
            if (formCard) {
                const formId = formCard.dataset.formId;
                if (formId) {
                    const indexInArr = blogArr.findIndex(i => i.formId === formId);
                    if (indexInArr !== -1) {
                        blogArr.splice(indexInArr, 1);
                        updateAddedItemsDisplay();
                    }
                }

                formCard.remove();

                // Renumber and updating
                const forms = document.querySelectorAll('.content-card');
                forms.forEach((f, i) => {
                    f.querySelector('.form-number').textContent = i + 1;
                    f.setAttribute('data-form-index', i.toString());
                });

                if (window.currentFormIndex >= forms.length) {
                    window.currentFormIndex = forms.length - 1;
                }

                forms.forEach(f => f.style.display = 'none');
                if (forms[window.currentFormIndex]) {
                    forms[window.currentFormIndex].style.display = 'block';
                }

                updateSubmitButtonsVisibility();
                updateNavigationButtons();
                updateDeleteButtonsVisibility();
            }
        }
    });

    function getFormData(form) {
        const blogTagEl = form.querySelector('input[name="blog_tag"]');
        const publicationDateEl = form.querySelector('input[name="publication-date"]');
        const blogTitleEl = form.querySelector('input[name="blog_title"]');
        const blogDescriptionEl = form.querySelector('textarea[name="blog_description"]');
        const readTimeEl = form.querySelector('select[name="read_time"]');
        const linkEl = form.querySelector('input[name="link"]');

        const blogTag = blogTagEl ? blogTagEl.value : '';
        const publicationDate = publicationDateEl ? publicationDateEl.value : '';
        const blogTitle = blogTitleEl ? blogTitleEl.value : '';
        const blogDescription = blogDescriptionEl ? blogDescriptionEl.value : '';
        const readTime = readTimeEl ? readTimeEl.value : '';
        const blogContent = form.quill ? form.quill.root.innerHTML : '';

        const uploadedImage = form.querySelector('.uploaded-image img');
        const coverImage = uploadedImage ? uploadedImage.src : null;
        const uploadBtn = form.querySelector('.upload-btn');
        const file = uploadBtn?._file || null;

        return {
            blogTag,
            publicationDate,
            blogTitle,
            blogDescription,
            readTime,
            blogContent,
            coverImage,
            file
        };
    }

    function addRequiredFieldValidation(form) {
        // Set Date Constraints
        const dateInput = form.querySelector('input[name="publication-date"]');
        if (dateInput) {
            const { min, max } = getDateRange();
            dateInput.min = min;
            dateInput.max = max;
        }

        const conf = [
            { selector: 'input[name="blog_tag"]', name: 'blog_tag', message: '* Blog tag is required' },
            { selector: 'input[name="publication-date"]', name: 'publication-date', message: '* Publication date is required' },
            { selector: 'input[name="blog_title"]', name: 'blog_title', message: '* Blog title is required' },
            { selector: 'textarea[name="blog_description"]', name: 'blog_description', message: '* Blog description is required' },
            { selector: 'select[name="read_time"]', name: 'read_time', message: '* Read time is required' },
            { selector: '.content-input', name: 'blog_content', message: '* Blog content is required' }
        ];

        conf.forEach(({ selector, name, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;

            // Remove existing if any
            const existingMsg = container.querySelector(`.required-message[data-for="${name}"]`);
            if (existingMsg) existingMsg.remove();

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.dataset.for = name;
            msg.textContent = message;
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';

            container.appendChild(msg);

            // Special validation for Date
            if (name === 'publication-date') {
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

            input.addEventListener('change', () => {
                const isDate = name === 'publication-date';
                if (isDate && input.value && !isValidDate(input.value)) {
                    msg.textContent = '* Invalid date (Year 1998-' + (dayjs().year() + 3) + ')';
                    msg.style.display = 'block';
                } else {
                    msg.style.display = 'none';
                    if (isDate) msg.textContent = message;
                }
            });
        });
    }

    function validateForm(form) {
        let isValid = true;

        const conf = [
            { selector: 'input[name="blog_tag"]', name: 'blog_tag' },
            { selector: 'input[name="publication-date"]', name: 'publication-date' },
            { selector: 'input[name="blog_title"]', name: 'blog_title' },
            { selector: 'textarea[name="blog_description"]', name: 'blog_description' },
            { selector: 'select[name="read_time"]', name: 'read_time' },
            { selector: '.content-input', name: 'blog_content' }
        ];

        conf.forEach(({ selector, name }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;
            const msg = container.querySelector(`.required-message[data-for="${name}"]`);

            let val = input.value.trim();
            if (name === 'blog_content' && form.quill) {
                val = form.quill.getText().trim();
            }

            let isFieldValid = true;

            if (val === '') {
                isFieldValid = false;
                if (msg && name === 'publication-date') msg.textContent = '* Publication date is required';
            } else if (name === 'publication-date' && !isValidDate(input.value)) {
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

        // Image Validation
        const uploadBtn = form.querySelector('.upload-btn');
        const hasImage = uploadBtn && uploadBtn.classList.contains('has-image');
        const msgFile = form.querySelector('.required-message-file');

        if (!hasImage) {
            if (msgFile) msgFile.style.display = 'block';
            isValid = false;
        } else {
            if (msgFile) msgFile.style.display = 'none';
        }

        return isValid;
    }

    async function submitAllBlogs(allFormData) {
        const formData = new FormData();

        // Remove file objects from JSON data to avoid circular reference issues or unnecessary data transfer
        const blogsData = allFormData.map(data => {
            const { file, ...rest } = data;
            return rest;
        });

        const blogsToSubmit = blogsData.map(blog => ({
            ...blog,
            publicationDate: formatToDB(blog.publicationDate)
        }));
        formData.append('blogArr', JSON.stringify(blogsToSubmit));

        // Append files with correct indexing ensuring 1:1 mapping
        allFormData.forEach((data, index) => {
            if (data.file) {
                formData.append(`file_${index}`, data.file);
            }
        });

        $.ajax({
            url: `/admin/blog/add?slug=${slug}&section=${section}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: async function (data) {
                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'content saved',
                        confirmButtonColor: '#BC5322'
                    }).then(() => {
                        window.location.href = `/admin/blog/list`;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message,
                        confirmButtonColor: '#BC5322'
                    });
                }
            },
            error: function (xhr) {
                console.error('Error submitting blogs:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error submitting blogs. Please try again.',
                    confirmButtonColor: '#BC5322'
                });
            }
        });
    }

    function formatDateForPreview(dateStr) {
        if (!dateStr) return 'No date';
        return dayjs(dateStr).format('MMMM D, YYYY');
    }

    function addToBlogList(data, formId) {
        const item = {
            id: Date.now(),
            formId: formId,
            blogTag: data.blogTag || 'No tag',
            publicationDate: formatDateForPreview(data.publicationDate),

            blogTitle: data.blogTitle || 'Untitled Blog',
            blogDescription: data.blogDescription || 'No description',
            readTime: data.readTime || '',
            blogContent: data.blogContent || '',
            coverImage: data.coverImage || null
        };

        blogArr.push(item);
        updateAddedItemsDisplay();
    }

    function clearCurrentForm(form) {
        const tagInput = form.querySelector('input[placeholder*="About Us"]');
        const dateInput = form.querySelector('input[name="publication-date"]');
        const titleInput = form.querySelector('input[placeholder*="Discover Our Story"]');
        const descInput = form.querySelector('textarea[placeholder*="discover us blog content"]');
        const readTimeInput = form.querySelector('select[name="read_time"]');
        const linkInput = form.querySelector('input[name="link"]');
        const uploadBtn = form.querySelector('.upload-btn');

        if (tagInput) tagInput.value = '';
        if (dateInput) dateInput.value = '';
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (readTimeInput) readTimeInput.value = '';
        if (form.quill) {
            form.quill.setContents([]);
        }

        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.removeImage(uploadBtn.querySelector('.remove-image'));
        }
    }

    function updateAddedItemsDisplay() {
        addedItemsList.innerHTML = '';

        blogArr.forEach(item => {
            const addedItem = document.createElement('div');
            addedItem.className = 'added-item';
            addedItem.dataset.id = item.id;

            const imagePreview = item.coverImage
                ? `<img src="${item.coverImage}" alt="Blog cover">`
                : '<div class="no-image">No Image</div>';

            addedItem.innerHTML = `
                <div class="item-preview">
                    <div class="item-image">
                        ${imagePreview}
                    </div>
                    <div class="item-details">
                        <h4 class="item-name">${item.blogTitle}</h4>
                        <p class="item-description">${item.blogDescription}</p>
                        <p class="item-tag"><strong>Tag:</strong> ${item.blogTag}</p>
                        <p class="item-date"><strong>Publication Date:</strong> ${item.publicationDate}</p>
                        <p class="item-read-time"><strong>Read Time:</strong> ${item.readTime || 'N/A'} min</p>
                    </div>
                </div>
            `;

            addedItemsList.appendChild(addedItem);
        });

        if (blogArr.length === 0) {
            hideAddedItemsSection();
        } else {
            showAddedItemsSection();
        }
    }

    function createNewForm() {
        // Reset formCount based on current number of forms to ensure sequential numbering
        const currentForms = document.querySelectorAll('.content-card');
        formCount = currentForms.length;

        document.querySelectorAll('.content-card .submit-section').forEach(section => {
            section.style.display = 'none';
        });

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.setAttribute('data-form-index', formCount.toString());
        newForm.dataset.formId = 'form-' + Date.now();
        newForm.innerHTML = `
            <div class="form-header">
                <span class="form-number">${formCount + 1}</span>
                <button class="delete-form-btn" type="button" title="Delete this form">
                    <span class="material-symbols-outlined">
                        <svg width='17' height='17' viewbox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
                            <path d='M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z'/>
                        </svg>
                    </span>
                </button>
            </div>
            <div class="form-section">
                <div class="form-group">
                    <label class="form-label">Blog Tag</label>
                    <input class="form-input" type="text" name="blog_tag" placeholder="e.g. About Us, Company, Team">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Blog Cover Image</label>
                    <button class="upload-btn">
                        <div class="upload-icon">
                            <span class="material-symbols-outlined">
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                    <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                                </svg>
                            </span>
                        </div>
                        <p class="upload-text">Tap to upload cover image</p>
                        <p class="upload-subtext">JPG, PNG (max. 2MB)</p>
                        <input class="image-upload" type="file" accept="image/*" style="display: none;">
                    </button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Publication Date</label>
                        <input class="form-input" type="date" name="publication-date" value="${getTodayDate()}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Time to read(Minutes)</label>
                        <select class="form-select" name="read_time">
                            <option value="" disabled selected>Select time</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Blog Title</label>
                    <input class="form-input" type="text" name="blog_title" placeholder="e.g. Discover Our Story and Mission">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Blog Description</label>
                    <textarea name="blog_description" class="form-textarea" placeholder="blog description..." rows="3" maxlength="200"></textarea>
                    <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic">* Characters are more than 200</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <div class="quill-editor" style="height: 300px;">
                        <p></p>
                    </div>
                    <input class="content-input" type="hidden" name="blog_content">
                </div>
            </div>
            
            <div class="submit-section">
                <button class="submit-btn">Submit</button>
            </div>
            
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn">Previous</button>
                <button class="nav-btn next-btn">Next</button>
            </div>
        `;

        document.querySelectorAll('.content-card').forEach(card => {
            card.style.display = 'none';
        });

        newForm.style.display = 'block';
        formContainer.appendChild(newForm);

        initQuill(newForm);
        setupImageUpload(newForm);
        addRequiredFieldValidation(newForm);

        window.currentFormIndex = formCount;
        updateSubmitButtonsVisibility();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();
    }
    function updateDeleteButtonsVisibility() {
        const forms = document.querySelectorAll('.content-card');
        const deleteBtns = document.querySelectorAll('.delete-form-btn');
        if (forms.length <= 1) {
            deleteBtns.forEach(btn => btn.style.display = 'none');
        } else {
            deleteBtns.forEach(btn => btn.style.display = 'flex');
        }
    }

    function updateSubmitButtonsVisibility() {
        const forms = document.querySelectorAll('.content-card');
        const lastFormIndex = forms.length - 1;

        forms.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                submitSection.style.display = index === lastFormIndex ? 'flex' : 'none';
                submitSection.style.justifyContent = 'center';
            }
        });
    }

    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }

    function hideAddedItemsSection() {
        addedItemsSection.style.display = 'none';
    }

    window.currentFormIndex = 0;

    window.previousForm = function () {
        const forms = document.querySelectorAll('.content-card');
        if (window.currentFormIndex > 0) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            forms[window.currentFormIndex].style.display = 'block';
            updateSubmitButtonsVisibility();
            updateNavigationButtons();
        }
    };

    window.nextForm = function () {
        const forms = document.querySelectorAll('.content-card');
        if (window.currentFormIndex < forms.length - 1) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex++;
            forms[window.currentFormIndex].style.display = 'block';
            updateSubmitButtonsVisibility();
            updateNavigationButtons();
        }
    };

    function updateNavigationButtons() {
        const forms = document.querySelectorAll('.content-card');
        forms.forEach((form, index) => {
            const prevBtn = form.querySelector('.prev-btn');
            const nextBtn = form.querySelector('.next-btn');
            if (prevBtn) prevBtn.disabled = window.currentFormIndex === 0;
            if (nextBtn) nextBtn.disabled = window.currentFormIndex === forms.length - 1;
        });
    }

    // Event delegation for file inputs
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('image-upload')) {
            const file = e.target.files[0];
            if (file) {
                const uploadBtn = e.target.closest('.upload-btn') || e.target.parentNode.querySelector('.upload-btn');
                handleImageUpload(file, uploadBtn);
            }
        }
    });
});