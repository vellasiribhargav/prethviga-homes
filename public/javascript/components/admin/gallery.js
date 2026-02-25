import Swal from 'sweetalert2';
import { showFieldError, hideFieldError } from '../../utils/validation.js';

document.addEventListener('DOMContentLoaded', function () {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');
    const projectTypeSelect = document.getElementById('projectType');
    const selectProjectSelect = document.getElementById('selectProject');

    let formsCache = [];
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

    let formCount = 0;
    const VALIDATION_CONF = [
        { selector: '#projectType, [id^="projectType"]', name: 'projectType', message: '* Project type is required' },
        { selector: '#selectProject, [id^="selectProject"]', name: 'selectProject', message: '* Project selection is required' },
        { selector: 'input[placeholder*="Plaza Images Collection"]', name: 'title', message: '* Gallery name is required' },
        { selector: 'textarea.form-textarea', name: 'text', message: '* Image description is required' }
    ];

    // Initialize
    updateFormsCache();
    updateDeleteButtonsVisibility();

    // Add required field validation
    function addRequiredFieldValidation(form) {
        VALIDATION_CONF.forEach(({ selector, name, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            input.addEventListener('input', () => hideFieldError(input));
            input.addEventListener('change', () => hideFieldError(input));
        });

        // Image validation listener
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn) {
            const fileInput = form.querySelector('.image-upload');
            if (fileInput) {
                fileInput.addEventListener('change', () => hideFieldError(uploadBtn));
            }
        }
    }

    function isFormEmpty(form) {
        const formData = getFormData(form);
        const hasText = formData.projectType || formData.selectedProject || formData.galleryName || formData.description;
        const hasImage = formData.imageSrc || formData.file;
        return !hasText && !hasImage;
    }

    function validateForm(form) {
        let isValid = true;
        VALIDATION_CONF.forEach(({ selector, name, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            if (input.value.trim() === '' || input.value === '-1') {
                showFieldError(input, message);
                isValid = false;
            } else {
                hideFieldError(input);
            }
        });

        // Image validation
        const uploadBtn = form.querySelector('.upload-btn');
        const hasImage = uploadBtn.classList.contains('has-image');

        if (!hasImage) {
            showFieldError(uploadBtn, '* Image is required');
            isValid = false;
        } else {
            hideFieldError(uploadBtn);
        }

        return isValid;
    }

    // Project data fetched from API
    let projectData = {
        upcoming: [],
        completed: []
    };

    async function fetchProjects() {
        $.when(
            $.ajax({
                url: '/admin/upcoming/getupcoming',
                type: 'GET',
                dataType: 'json'
            }),
            $.ajax({
                url: '/admin/completed/getcompleted',
                type: 'GET',
                dataType: 'json'
            })
        )

            .done(function (upcomingRes, completedRes) {
                // jQuery returns [data, statusText, xhr]
                const upcomingData = upcomingRes[0];
                const completedData = completedRes[0];

                projectData.upcoming = upcomingData.data?.map((project, index) => ({
                    id: project.id || project.project_id || index + 1,
                    name: project.project_name || 'Untitled Project',
                    location: project.project_location || 'Location not specified'
                })) || [];

                projectData.completed = completedData.data?.map((project, index) => ({
                    id: project.id || project.project_id || index + 1,
                    name: project.project_name || 'Untitled Project',
                    location: project.project_location || 'Location not specified'
                })) || [];

                // Initialize first dropdown after data is fetched
                initializeFirstDropdown();
            })
            .fail(function (xhr, status, error) {
                console.error('Error fetching projects:', error);
            });
    }

    function initializeFirstDropdown() {
        if (projectTypeSelect && selectProjectSelect) {
            const projectGroup = selectProjectSelect.closest('.form-group');
            if (projectGroup) projectGroup.style.display = 'none';
            projectTypeSelect.value = '';
            selectProjectSelect.innerHTML = '<option value="" disabled selected>Select a project</option>';
            selectProjectSelect.disabled = true;
        }
    }

    function populateProjectDropdown(selectElement, projectType) {
        const projectGroup = selectElement.closest('.form-group');
        selectElement.innerHTML = '<option value="" disabled selected>Select a project</option>';

        if (projectType && projectData[projectType]) {
            if (projectGroup) projectGroup.style.display = 'block';
            selectElement.disabled = false;

            projectData[projectType].forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.name} - ${project.location}`;
                selectElement.appendChild(option);
            });
        } else {
            if (projectGroup) projectGroup.style.display = 'none';
            selectElement.disabled = true;
        }
    }

    function setupDropdownHandlers(typeSelect, projSelect) {
        if (typeSelect) {
            typeSelect.addEventListener('change', function () {
                populateProjectDropdown(projSelect, this.value);
            });
        }
    }

    // Image Upload Helpers
    function setupImageUpload(formCard) {
        const uploadBtn = formCard.querySelector('.upload-btn');
        const fileInput = formCard.querySelector('.image-upload');

        if (!uploadBtn || !fileInput) return;

        /*
        uploadBtn.addEventListener('click', () => {
            if (uploadBtn.classList.contains('has-image')) return;
            fileInput.click();
        });
        */

        /*
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Hide required message if it exists
                const msg = uploadBtn.parentNode.querySelector('.required-message-file');
                if (msg) msg.style.display = 'none';

                handleImageUpload(file, uploadBtn);
            }
        });
        */
    }

    function handleImageUpload(file, uploadBtn) {
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                text: `${file.name} is too large. Max size is 2MB.`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Clear current content except the file input
            const fileInput = uploadBtn.querySelector('.image-upload');

            // Create preview container
            const previewHTML = `
                <div class="uploaded-image">
                    <img src="${e.target.result}" alt="Uploaded image">
                    <button class="remove-image" type="button">
                        <span class="material-symbols-outlined">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#ffffff"/>
                            </svg>
                        </span>
                    </button>
                </div>
            `;

            // Hide the upload placeholder content
            const uploadIcon = uploadBtn.querySelector('.upload-icon');
            const uploadText = uploadBtn.querySelector('.upload-text');
            const uploadSubtext = uploadBtn.querySelector('.upload-subtext');

            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadText) uploadText.style.display = 'none';
            if (uploadSubtext) uploadSubtext.style.display = 'none';

            // Add or update preview
            let preview = uploadBtn.querySelector('.uploaded-image');
            if (preview) {
                preview.querySelector('img').src = e.target.result;
            } else {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = previewHTML;
                uploadBtn.insertBefore(tempDiv.firstElementChild, fileInput);
            }

            uploadBtn.classList.add('has-image');

            // Add event listener to the new remove button
            const removeBtn = uploadBtn.querySelector('.remove-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', (event) => {
                    removeImage(removeBtn, event);
                });
            }
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = function (button, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const uploadBtn = button.closest('.upload-btn');
        if (!uploadBtn) return;

        uploadBtn.classList.remove('has-image');

        // Remove preview
        const preview = uploadBtn.querySelector('.uploaded-image');
        if (preview) preview.remove();

        // Restore placeholder content
        const uploadIcon = uploadBtn.querySelector('.upload-icon');
        const uploadText = uploadBtn.querySelector('.upload-text');
        const uploadSubtext = uploadBtn.querySelector('.upload-subtext');

        if (uploadIcon) uploadIcon.style.display = '';
        if (uploadText) uploadText.style.display = 'block';
        if (uploadSubtext) uploadSubtext.style.display = 'block';

        // Clear file input
        const fileInput = uploadBtn.querySelector('.image-upload');
        if (fileInput) fileInput.value = '';
    };

    // Form Data Collection
    function getFormData(form) {
        const projectType = form.querySelector('#projectType, [id^="projectType"]')?.value || '';
        const selectedProject = form.querySelector('#selectProject, [id^="selectProject"]')?.value || '';
        const galleryName = form.querySelector('input[placeholder*="Plaza Images Collection"]')?.value || '';
        const description = form.querySelector('textarea.form-textarea')?.value || '';

        const uploadedImage = form.querySelector('.uploaded-image img');
        const imageSrc = uploadedImage ? uploadedImage.src : null;
        const fileInput = form.querySelector('.image-upload');
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

        return { projectType, selectedProject, galleryName, description, imageSrc, file };
    }

    // Add More Button
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function () {
            updateFormsCache();
            const currentForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');

            if (currentForm) {
                // Ensure unique ID
                if (!currentForm.dataset.formId) {
                    currentForm.dataset.formId = 'form_' + Date.now();
                }

                const data = getFormData(currentForm);
                if (data.galleryName || data.imageSrc) {
                    addToUIList(data, currentForm.dataset.formId);
                    showAddedItemsSection();
                }
            }
            createNewForm();
        });
    }

    function addToUIList(data, formId) {
        const selectedProjectData = getSelectedProjectData(data.projectType, data.selectedProject);
        const div = document.createElement('div');
        div.className = 'added-item';
        div.dataset.linkedFormId = formId;

        const projectName = selectedProjectData?.name || 'No project selected';
        const projectLoc = selectedProjectData?.location || '';
        const imgUrl = data.images && data.images[0] ? data.images[0] : (data.imageSrc || '');

        div.innerHTML = `
            <div class="item-preview">
                <div class="item-image" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>
                <div class="item-details">
                    <h4 class="item-name">${data.galleryName || 'Untitled Gallery'}</h4>
                    <p class="item-project"><strong>Project:</strong> ${projectName} - ${projectLoc}</p>
                </div>
            </div>
        `;

        addedItemsList.appendChild(div);

        // Delete Logic
        const deleteBtn = div.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                div.remove();

                // Remove linked form
                if (formId) {
                    const linkedForm = document.querySelector(`.content-card[data-form-id="${formId}"]`);
                    if (linkedForm) {
                        linkedForm.remove();
                        updateFormsCache();
                    }
                }

                if (addedItemsList.children.length === 0) {
                    if (addedItemsSection) addedItemsSection.style.display = 'none';
                }
            });
        }
    }

    function createNewForm() {
        updateFormsCache();
        const formNumber = formsCache.length + 1;
        // Updating formCount just in case, but relying on local variables
        formCount = formsCache.length;

        const uniqueId = 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const typeId = `projectType_${uniqueId}`;
        const selectId = `selectProject_${uniqueId}`;

        formsCache.forEach(f => f.style.display = 'none');

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.dataset.formIndex = formNumber;
        newForm.dataset.formId = uniqueId;
        newForm.innerHTML = `
            <div class="form-header">
                <span class="form-number">${formNumber}</span>
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
                    <label class="form-label">Type of Project</label>
                    <select class="form-select" id="${typeId}">
                        <option disabled selected value=''>Select project type</option>
                        <option value="upcoming">Upcoming Projects</option>
                        <option value="completed">Completed Projects</option>
                    </select>
                </div>
                <div class="form-group" style="display: none;">
                    <label class="form-label">Select Project</label>
                    <select class="form-select" id="${selectId}" disabled>
                        <option disabled selected value=''>Select a project</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Gallery Name</label>
                    <input class="form-input" type="text" placeholder="e.g. Plaza Images Collection">
                </div>
                <div class="form-group">
                    <label class="form-label">Image Description</label>
                    <textarea class="form-textarea" name="text" placeholder="gallery description..." rows="3" maxlength="200"></textarea>
                    <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic">* Characters are more than 200</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Upload Images</label>
                    <button class="upload-btn">
                        <div class="upload-icon">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                            </svg>
                        </div>
                        <p class="upload-text">Upload Images</p>
                        <p class="upload-subtext">JPG, PNG (max. 2MB)</p>
                        <input class="image-upload" type="file" accept="image/*" style="display: none;">
                    </button>
                    <p class="upload-hint">Supported formats: JPG, PNG. Max 2MB.</p>
                </div>
            </div>
            <div class="submit-section" style="display: none;">
                <button class="submit-btn">Submit</button>
            </div>
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn">Previous</button>
                <button class="nav-btn next-btn" disabled>Next</button>
            </div>
        `;

        formContainer.appendChild(newForm);

        window.currentFormIndex = Array.from(document.querySelectorAll('.content-card')).length - 1;

        // Setup functionality for new form
        setupDropdownHandlers(newForm.querySelector(`[id^="projectType"]`), newForm.querySelector(`[id^="selectProject"]`));
        setupImageUpload(newForm);
        addRequiredFieldValidation(newForm);

        updateFormsCache();
        updateSubmitButtons();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();
    }

    function updateDeleteButtonsVisibility() {
        updateFormsCache();
        const deleteBtns = document.querySelectorAll('.delete-form-btn');
        if (formsCache.length <= 1) {
            deleteBtns.forEach(btn => btn.style.display = 'none');
        } else {
            deleteBtns.forEach(btn => btn.style.display = 'flex');
        }
    }

    function updateFormsCache() {
        formsCache = Array.from(document.querySelectorAll('.content-card'));
    }

    function showForm(index) {
        updateFormsCache();
        formsCache.forEach((form, i) => {
            form.style.display = (i === index) ? 'block' : 'none';
        });
        updateNavigationButtons();
        updateSubmitButtons();
    }

    // Navigation
    window.previousForm = function () {
        if (window.currentFormIndex > 0) {
            window.currentFormIndex--;
            showForm(window.currentFormIndex);
        }
    };

    window.nextForm = function () {
        updateFormsCache();
        if (window.currentFormIndex < formsCache.length - 1) {
            window.currentFormIndex++;
            showForm(window.currentFormIndex);
        }
    };

    function updateNavigationButtons() {
        updateFormsCache();
        formsCache.forEach((form, index) => {
            const prevBtn = form.querySelector('.prev-btn');
            const nextBtn = form.querySelector('.next-btn');
            if (prevBtn) prevBtn.disabled = (index === 0);
            if (nextBtn) nextBtn.disabled = (index === formsCache.length - 1);
        });
    }

    function updateSubmitButtons() {
        updateFormsCache();
        formsCache.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                submitSection.style.display = (index === formsCache.length - 1) ? 'block' : 'none';
            }
        });
    }

    // Consolidated Submit Handler
    document.addEventListener('click', function (e) {
        // Event delegation for upload buttons to avoid multiple stacking listeners
        const uploadBtn = e.target.closest('.upload-btn');
        if (uploadBtn && !e.target.closest('.remove-image')) {
            if (!uploadBtn.classList.contains('has-image')) {
                const fileInput = uploadBtn.parentNode.querySelector('.image-upload') || uploadBtn.querySelector('.image-upload');
                if (fileInput) fileInput.click();
            }
        }

        const deleteBtn = e.target.closest('.delete-form-btn');
        if (deleteBtn) {
            e.preventDefault();

            const contentCards = document.querySelectorAll('.content-card');
            if (contentCards.length <= 1) {
                Swal.fire({
                    icon: 'warning',
                    text: 'You cannot delete the only form.',
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            const formCard = deleteBtn.closest('.content-card');

            updateFormsCache();
            if (formsCache.length <= 1) {
                Swal.fire({
                    icon: 'warning',
                    text: 'You cannot delete the only form.',
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            if (formCard) {
                // Remove linked list item if exists
                const formId = formCard.dataset.formId;
                if (formId) {
                    const listItem = document.querySelector(`.added-item[data-linked-form-id="${formId}"]`);
                    if (listItem) {
                        listItem.remove();
                        const addedItemsList = document.querySelector('.added-items-list');
                        const addedItemsSection = document.querySelector('.added-items-section');
                        if (addedItemsList && addedItemsList.children.length === 0 && addedItemsSection) {
                            addedItemsSection.style.display = 'none';
                        }
                    }
                }

                formCard.remove();
                updateFormsCache();

                formsCache.forEach((form, index) => {
                    const numberSpan = form.querySelector('.form-number');
                    if (numberSpan) numberSpan.textContent = index + 1;
                });

                let newIndex = window.currentFormIndex;
                if (newIndex >= formsCache.length) {
                    newIndex = formsCache.length - 1;
                }

                window.currentFormIndex = newIndex;
                formsCache.forEach(f => f.style.display = 'none');
                if (formsCache[newIndex]) {
                    formsCache[newIndex].style.display = 'block';
                }

                updateNavigationButtons();
                updateSubmitButtons();
                updateDeleteButtonsVisibility();
            }
        }

        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.target.classList.contains('prev-btn')) {
            e.preventDefault();
            window.previousForm();
        }
        if (e.target.classList.contains('next-btn')) {
            e.preventDefault();
            window.nextForm();
        }
    });

    async function handleSubmit() {
        updateFormsCache();
        const formData = new FormData();
        const finalGalleryArr = [];
        let validFormsCount = 0;

        // 1. Validate all forms first
        const invalidFormIndices = [];
        for (let i = 0; i < formsCache.length; i++) {
            if (!validateForm(formsCache[i])) {
                invalidFormIndices.push(i);
            }
        }

        // 2. If any are invalid, show alert and navigate to the first one
        if (invalidFormIndices.length > 0) {
            const firstInvalid = invalidFormIndices[0];
            showForm(firstInvalid);
            window.currentFormIndex = firstInvalid;

            const invalidNumbers = invalidFormIndices.map(i => i + 1).join(', ');
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: `Please check the following forms for missing fields: ${invalidNumbers}`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        // 3. Collect data if all are valid
        for (let i = 0; i < formsCache.length; i++) {
            const form = formsCache[i];
            const data = getFormData(form);
            const selectedProjectData = getSelectedProjectData(data.projectType, data.selectedProject);

            if (!data.file && !data.imageSrc) continue;

            finalGalleryArr.push({
                project_id: data.selectedProject,
                projectType: data.projectType,
                projectName: selectedProjectData?.name || 'No project selected',
                projectLocation: selectedProjectData?.location || '',
                title: data.galleryName,
                text: data.description,
                imageCount: 1
            });

            if (data.file) {
                formData.append(`gallery_${validFormsCount}_file_0`, data.file);
            }
            validFormsCount++;
        }

        if (!finalGalleryArr.length) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data!',
                text: 'Please fill at least one gallery item',
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        formData.append('galleryArr', JSON.stringify(finalGalleryArr));

        $.ajax({
            url: '/admin/gallery/addgallery',
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
                        window.location.href = '/admin/gallery/list';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.message || 'Failed to save gallery',
                        confirmButtonColor: '#BC5322'
                    });
                }
            },

            error: function (xhr) {
                console.error('Server error:', xhr.responseText);

                let message = 'Server error occurred';
                if (xhr.responseJSON?.message) {
                    message = xhr.responseJSON.message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: message,
                    confirmButtonColor: '#BC5322'
                });
            }
        });
    }

    // Initial setup calls
    fetchProjects();

    // Safety check for initial form ID
    setTimeout(() => {
        updateFormsCache();
        const initialForm = document.querySelector('.content-card');
        if (initialForm && !initialForm.dataset.formId) {
            initialForm.dataset.formId = 'form_' + Date.now();
            if (formsCache[0]) {
                setupDropdownHandlers(formsCache[0].querySelector('#projectType'), formsCache[0].querySelector('#selectProject'));
                setupImageUpload(formsCache[0]);
                addRequiredFieldValidation(formsCache[0]);
                updateSubmitButtons();
                updateNavigationButtons();
            }
        }
        window.currentFormIndex = 0;
        updateDeleteButtonsVisibility();
    }, 100);

    // Helper utilities
    function getSelectedProjectData(type, id) {
        if (!type || !id || !projectData[type]) return null;
        return projectData[type].find(p => p.id == id);
    }

    function clearCurrentForm(form) {
        const selects = form.querySelectorAll('select');
        const inputs = form.querySelectorAll('input[type="text"]');
        const textareas = form.querySelectorAll('textarea');
        selects.forEach(s => s.value = '');
        inputs.forEach(i => i.value = '');
        textareas.forEach(t => t.value = '');

        const selectProject = form.querySelector('#selectProject') || form.querySelector('[id^="selectProject"]');
        if (selectProject) {
            selectProject.innerHTML = '<option value="" disabled selected>Select a project</option>';
            selectProject.disabled = true;
            const projectGroup = selectProject.closest('.form-group');
            if (projectGroup) projectGroup.style.display = 'none';
        }

        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.removeImage(uploadBtn.querySelector('.remove-image'));
        }
    }

    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }

    // Event delegation for file inputs
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('image-upload')) {
            const file = e.target.files[0];
            if (file) {
                const uploadBtn = e.target.closest('.upload-btn');
                // Hide required message if it exists
                const msg = uploadBtn.parentNode.querySelector('.required-message-file');
                if (msg) msg.style.display = 'none';
                handleImageUpload(file, uploadBtn);
            }
        }
    });
});
