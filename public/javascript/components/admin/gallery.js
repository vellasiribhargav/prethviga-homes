import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');
    const projectTypeSelect = document.getElementById('projectType');
    const selectProjectSelect = document.getElementById('selectProject');

    let formCount = 0;
    let galleryArr = [];
    let formsCache = [];

    // Add required field validation
    function addRequiredFieldValidation(form) {
        const inputs = [
            { selector: '#projectType, [id^="projectType"]', message: '* Project type is required' },
            { selector: '#selectProject, [id^="selectProject"]', message: '* Project selection is required' },
            { selector: 'input[placeholder*="Plaza Images Collection"]', message: '* Gallery name is required' },
            { selector: 'textarea[placeholder*="Describe the content"]', message: '* Image description is required' }
        ];

        inputs.forEach(({ selector, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.textContent = message;
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';

            input.parentNode.appendChild(msg);

            input.addEventListener('input', () => {
                msg.style.display = 'none';
            });
            input.addEventListener('change', () => {
                msg.style.display = 'none';
            });
        });

        // Image validation message
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn) {
            const msg = document.createElement('div');
            msg.className = 'required-message-file';
            msg.textContent = '* image is required';
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
            uploadBtn.parentNode.appendChild(msg);
        }
    }

    function validateForm(form) {
        let isValid = true;
        const inputs = [
            { selector: '#projectType, [id^="projectType"]' },
            { selector: '#selectProject, [id^="selectProject"]' },
            { selector: 'input[placeholder*="Plaza Images Collection"]' },
            { selector: 'textarea[placeholder*="Describe the content"]' }
        ];

        inputs.forEach(({ selector }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const msg = input.parentNode.querySelector('.required-message');
            if (input.value.trim() === '') {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        // Image validation
        const uploadBtn = form.querySelector('.upload-btn');
        const fileMsg = uploadBtn.parentNode.querySelector('.required-message-file');
        const hasImage = uploadBtn.classList.contains('has-image');

        if (!hasImage) {
            if (fileMsg) fileMsg.style.display = 'block';
            isValid = false;
        } else {
            if (fileMsg) fileMsg.style.display = 'none';
        }

        return isValid;
    }

    // Project data fetched from API
    let projectData = {
        upcoming: [],
        completed: []
    };

    async function fetchProjects() {
        try {
            const [upcomingRes, completedRes] = await Promise.all([
                fetch('/admin/upcoming/getupcoming'),
                fetch('/admin/completed/getcompleted')
            ]);

            const upcomingData = await upcomingRes.json();
            const completedData = await completedRes.json();

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
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    function initializeFirstDropdown() {
        if (projectTypeSelect && selectProjectSelect) {
            const projectGroup = selectProjectSelect.closest('.form-group');
            if (projectGroup) projectGroup.style.display = 'none';
            projectTypeSelect.value = '';
            selectProjectSelect.innerHTML = '<option value="">Select a project</option>';
            selectProjectSelect.disabled = true;
        }
    }

    function populateProjectDropdown(selectElement, projectType) {
        const projectGroup = selectElement.closest('.form-group');
        selectElement.innerHTML = '<option value="">Select a project</option>';

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

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file, uploadBtn);
            }
        });
    }

    function handleImageUpload(file, uploadBtn) {
        if (file.size > 5 * 1024 * 1024) {
            alert(`${file.name} is too large. Max size is 5MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Find and hide the existing file input instead of removing it
            const fileInput = uploadBtn.querySelector('.image-upload');
            if (fileInput) {
                fileInput.style.display = 'none';
            }

            // Remove old preview if exists
            const oldPreview = uploadBtn.querySelector('.uploaded-image');
            if (oldPreview) {
                oldPreview.remove();
            }

            // Create and insert the preview
            const previewDiv = document.createElement('div');
            previewDiv.className = 'uploaded-image';
            previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Uploaded image">
                <button class="remove-image" onclick="removeImage(this)">
                    <span class="material-symbols-outlined">close</span>
                </button>
            `;

            // Insert preview before the file input
            uploadBtn.insertBefore(previewDiv, fileInput);

            // Hide other elements
            const uploadIcon = uploadBtn.querySelector('.upload-icon');
            const uploadText = uploadBtn.querySelector('.upload-text');
            const uploadSubtext = uploadBtn.querySelector('.upload-subtext');
            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadText) uploadText.style.display = 'none';
            if (uploadSubtext) uploadSubtext.style.display = 'none';

            uploadBtn.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = function (button) {
        const uploadBtn = button.closest('.upload-btn');

        // Remove the preview
        const preview = uploadBtn.querySelector('.uploaded-image');
        if (preview) {
            preview.remove();
        }

        // Show the upload elements again
        const uploadIcon = uploadBtn.querySelector('.upload-icon');
        const uploadText = uploadBtn.querySelector('.upload-text');
        const uploadSubtext = uploadBtn.querySelector('.upload-subtext');
        const fileInput = uploadBtn.querySelector('.image-upload');

        if (uploadIcon) uploadIcon.style.display = '';
        if (uploadText) uploadText.style.display = '';
        if (uploadSubtext) uploadSubtext.style.display = '';
        if (fileInput) {
            fileInput.value = ''; // Clear the file input
            fileInput.style.display = 'none'; // Keep it hidden
        }

        uploadBtn.classList.remove('has-image');
    };

    // Form Data Collection
    function getFormData(form) {
        const projectType = form.querySelector('#projectType, [id^="projectType"]')?.value || '';
        const selectedProject = form.querySelector('#selectProject, [id^="selectProject"]')?.value || '';
        const galleryName = form.querySelector('input[placeholder*="Plaza Images Collection"]')?.value || '';
        const description = form.querySelector('textarea[placeholder*="Describe the content"]')?.value || '';

        const uploadedImage = form.querySelector('.uploaded-image img');
        const imageSrc = uploadedImage ? uploadedImage.src : null;
        const fileInput = form.querySelector('.image-upload');
        const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;


        return { projectType, selectedProject, galleryName, description, imageSrc, file };
    }

    // Add More Button
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function () {
            const currentForm = document.querySelector('.content-card:last-of-type');
            if (currentForm) {
                const data = getFormData(currentForm);
                if (data.galleryName || data.imageSrc) {
                    addToUIList(data);
                    showAddedItemsSection();
                }
            }
            createNewForm();
        });
    }

    function addToUIList(data) {
        const selectedProjectData = getSelectedProjectData(data.projectType, data.selectedProject);
        const item = {
            id: Date.now(),
            galleryName: data.galleryName || 'Untitled Gallery',
            description: data.description || '',
            projectName: selectedProjectData?.name || 'No project selected',
            projectLocation: selectedProjectData?.location || '',
            images: data.imageSrc ? [data.imageSrc] : []
        };
        galleryArr.push(item);
        updateAddedItemsDisplay();
    }

    function createNewForm() {
        formCount++;
        updateFormsCache();

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.dataset.formIndex = formCount;
        newForm.innerHTML = `
            <div class="form-header">
                <span class="form-number">${formCount + 1}</span>
            </div>
            <div class="form-section">
                <div class="form-group">
                    <label class="form-label">Type of Project</label>
                    <select class="form-select" id="projectType${formCount}">
                        <option value="">Select project type</option>
                        <option value="upcoming">Upcoming Projects</option>
                        <option value="completed">Completed Projects</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Project</label>
                    <select class="form-select" id="selectProject${formCount}" disabled>
                        <option value="">Select a project</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Gallery Name</label>
                    <input class="form-input" type="text" placeholder="e.g. Plaza Images Collection">
                </div>
                <div class="form-group">
                    <label class="form-label">Image Description</label>
                    <textarea class="form-textarea" placeholder="Describe the content of this gallery..."></textarea>
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
                        <p class="upload-subtext">JPG, PNG (max. 5MB)</p>
                        <input class="image-upload" type="file" accept="image/*" style="display: none;">
                    </button>
                    <p class="upload-hint">Supported formats: JPG, PNG. Max 5MB.</p>
                </div>
            </div>
            <div class="submit-section" style="display: none;">
                <button class="submit-btn">Submit</button>
            </div>
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn">Previous</button>
                <button class="nav-btn next-btn">Next</button>
            </div>
        `;

        formsCache.push(newForm);
        formContainer.appendChild(newForm);

        // Setup functionality for new form
        setupDropdownHandlers(newForm.querySelector(`[id^="projectType"]`), newForm.querySelector(`[id^="selectProject"]`));
        setupImageUpload(newForm);
        addRequiredFieldValidation(newForm);

        // Hide old forms and show new one
        window.currentFormIndex = formCount;
        showForm(window.currentFormIndex);
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
            if (prevBtn) prevBtn.disabled = (window.currentFormIndex === 0);
            if (nextBtn) nextBtn.disabled = (window.currentFormIndex === formsCache.length - 1);
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

        for (let i = 0; i < formsCache.length; i++) {
            const form = formsCache[i];
            if (!validateForm(form)) return;

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
                formData.append(`gallery_${i}_file_0`, data.file);
            }
        }

        formData.append('galleryArr', JSON.stringify(finalGalleryArr));

        try {
            const res = await fetch('/admin/gallery/addgallery', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (!res.ok) {
                console.error('Server error:', result);
                throw new Error(result.message || `HTTP ${res.status}`);
            }

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `${finalGalleryArr.length} gallery item(s) saved successfully!`,
                    confirmButtonColor: '#BC5322'
                });

                // Clear and reset
                formsCache.forEach((form, index) => {
                    if (index === 0) {
                        clearCurrentForm(form);
                        form.style.display = 'block';
                    } else {
                        form.remove();
                    }
                });
                formCount = 0;
                window.currentFormIndex = 0;
                galleryArr = [];
                updateAddedItemsDisplay();
                updateFormsCache();
                updateSubmitButtons();
                updateNavigationButtons();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: result.message || 'Failed to save gallery',
                    confirmButtonColor: '#BC5322'
                });
            }
        } catch (error) {
            console.error('Error submitting gallery:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Server error occurred',
                confirmButtonColor: '#BC5322'
            });
        }
    }

    // Initial setup calls
    fetchProjects();
    updateFormsCache();
    window.currentFormIndex = 0;
    if (formsCache[0]) {
        setupDropdownHandlers(formsCache[0].querySelector('#projectType'), formsCache[0].querySelector('#selectProject'));
        setupImageUpload(formsCache[0]);
        addRequiredFieldValidation(formsCache[0]);
        updateSubmitButtons();
        updateNavigationButtons();
    }

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
        const projectGroup = form.querySelector('#selectProject')?.closest('.form-group') || form.querySelector('[id^="selectProject"]')?.closest('.form-group');
        if (projectGroup) projectGroup.style.display = 'none';

        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.removeImage(uploadBtn.querySelector('.remove-image'));
        }
    }

    function updateAddedItemsDisplay() {
        addedItemsList.innerHTML = '';
        galleryArr.forEach(item => {
            const div = document.createElement('div');
            div.className = 'added-item';
            div.innerHTML = `
                <div class="item-preview">
                    <div class="item-image" style="background-image: url('${item.images[0]}')"></div>
                    <div class="item-details">
                        <h4 class="item-name">${item.galleryName}</h4>
                        <p class="item-project"><strong>Project:</strong> ${item.projectName} - ${item.projectLocation}</p>
                        <p class="item-images"><strong>Images:</strong> ${item.images.length} uploaded</p>
                    </div>
                </div>
            `;
            addedItemsList.appendChild(div);
        });
        addedItemsSection.style.display = galleryArr.length > 0 ? 'block' : 'none';
    }

    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }
});