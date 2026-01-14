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

    // Add required field validation
    function addRequiredFieldValidation(form) {
        const inputs = [
            { selector: '#projectType, [id^="projectType"]', message: '* Project type is required' },
            { selector: '#selectProject, [id^="selectProject"]', message: '* Project selection is required' },
            { selector: 'input[placeholder*="Plaza Images Collection"]', message: '* Gallery name is required' }
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
    }

    function validateForm(form) {
        let isValid = true;
        const inputs = [
            { selector: '#projectType, [id^="projectType"]', message: '* Project type is required' },
            { selector: '#selectProject, [id^="selectProject"]', message: '* Project selection is required' },
            { selector: 'input[placeholder*="Plaza Images Collection"]', message: '* Gallery name is required' }
        ];

        inputs.forEach(({ selector }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const msg = input.parentNode.querySelector('.required-message');
            if (input.value.trim() === '') {
                msg.style.display = 'block';
                isValid = false;
            } else {
                msg.style.display = 'none';
            }
        });

        return isValid;
    }

    // Project data will be fetched from API
    let projectData = {
        upcoming: [],
        completed: []
    };

    // Fetch projects from backend using AJAX
    function fetchProjects() {
        const xhr1 = new XMLHttpRequest();
        const xhr2 = new XMLHttpRequest();

        xhr1.open('GET', '/admin/upcoming/getupcoming', true);
        xhr1.onreadystatechange = function () {
            if (xhr1.readyState === 4 && xhr1.status === 200) {
                const upcomingData = JSON.parse(xhr1.responseText);
                projectData.upcoming = upcomingData.data?.map((project, index) => {
                    const name = project.project_name || 'Untitled Project';
                    const location = project.project_location || 'Location not specified';
                    const project_id = project.project_id || index + 1;
                    return { id: project_id, name, location };
                }) || [];
            }
        };

        xhr2.open('GET', '/admin/completed/getcompleted', true);
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                const completedData = JSON.parse(xhr2.responseText);
                projectData.completed = completedData.data?.map((project, index) => {
                    const name = project.project_name || 'Untitled Project';
                    const location = project.project_location || 'Location not specified';
                    const project_id = project.project_id || index + 1;
                    return { id: project_id, name, location };
                }) || [];
            }
        };

        xhr1.send();
        xhr2.send();
    }

    // Initialize the first dropdown - hide project dropdown initially
    function initializeFirstDropdown() {
        if (projectTypeSelect && selectProjectSelect) {
            // Hide project dropdown initially
            const projectGroup = selectProjectSelect.closest('.form-group');
            if (projectGroup) {
                projectGroup.style.display = 'none';
            }

            // Reset project type to empty
            projectTypeSelect.value = '';
            selectProjectSelect.innerHTML = '<option value="">Select a project</option>';
            selectProjectSelect.disabled = true;
        }
    }

    // Helper function to populate project dropdown
    function populateProjectDropdown(selectElement, projectType) {
        const projectGroup = selectElement.closest('.form-group');

        selectElement.innerHTML = '<option value="">Select a project</option>';

        if (projectType && (projectType === 'upcoming' || projectType === 'completed') && projectData[projectType]) {
            // Show project dropdown
            if (projectGroup) {
                projectGroup.style.display = 'block';
            }
            selectElement.disabled = false;

            projectData[projectType].forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.name} - ${project.location}`;
                selectElement.appendChild(option);
            });
        } else {
            // Hide project dropdown
            if (projectGroup) {
                projectGroup.style.display = 'none';
            }
            selectElement.disabled = true;
        }
    }

    // Handle project type dropdown change for initial form
    function setupDropdownHandlers(projectTypeSelect, selectProjectSelect) {
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', function () {
                const selectedType = this.value;
                populateProjectDropdown(selectProjectSelect, selectedType);
            });
        }
    }

    // Initialize data and setup
    fetchProjects();
    initializeFirstDropdown();

    // Setup initial form dropdowns
    setupDropdownHandlers(projectTypeSelect, selectProjectSelect);

    // Setup image upload for initial form
    setupImageUpload(document.querySelector('.content-card'));
    addRequiredFieldValidation(document.querySelector('.content-card'));

    // Image upload functionality
    function setupImageUpload(formCard) {
        const imageGrid = formCard.querySelector('.image-grid');
        const uploadSlot = formCard.querySelector('.image-slot.empty');
        const fileInput = formCard.querySelector('.image-upload');

        if (uploadSlot && fileInput) {
            uploadSlot.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                handleImageUpload(files, imageGrid, uploadSlot);
            });
        }
    }

    function handleImageUpload(files, imageGrid, uploadSlot) {
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Max size is 5MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageSlot = document.createElement('div');
                imageSlot.className = 'image-slot filled';
                imageSlot.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image">`;

                imageGrid.insertBefore(imageSlot, uploadSlot);
                uploadSlot.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    window.removeImage = function (button) {
        const imageGrid = button.closest('.image-grid');
        const uploadSlot = imageGrid.querySelector('.image-slot.empty');

        button.parentElement.remove();

        // Show upload slot if no images remain
        const remainingImages = imageGrid.querySelectorAll('.image-slot.filled');
        if (remainingImages.length === 0) {
            uploadSlot.style.display = 'block';
        }
    };

    // Handle Add More button click
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function () {
            const currentForm = document.querySelector('.content-card:last-of-type');
            if (currentForm) {
                const formData = getFormData(currentForm);

                if (formData.galleryName || formData.description || (formData.images && formData.images.length > 0)) {
                    addToGalleryList(formData);
                    clearCurrentForm(currentForm);
                    showAddedItemsSection();
                }
            }

            createNewForm();
        });
    }

    // Initialize currentFormIndex properly
    window.currentFormIndex = 0;

    // Make sure the first form is visible and properly indexed
    const initialForm = document.querySelector('.content-card');
    if (initialForm) {
        initialForm.style.display = 'block';
        // Set data attribute to track form index
        initialForm.setAttribute('data-form-index', '0');
    }

    // Global navigation functions
    window.previousForm = function () {
        const forms = document.querySelectorAll('.content-card');
        // console.log('Previous - Current index:', window.currentFormIndex, 'Total forms:', forms.length);

        if (forms.length <= 1) return;

        if (window.currentFormIndex > 0) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            forms[window.currentFormIndex].style.display = 'block';
            // console.log('Moved to form:', window.currentFormIndex);
            updateSubmitButtonVisibility();
        }
    };

    window.nextForm = function () {
        const forms = document.querySelectorAll('.content-card');
        // console.log('Next - Current index:', window.currentFormIndex, 'Total forms:', forms.length);

        if (forms.length <= 1) return;

        if (window.currentFormIndex < forms.length - 1) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex++;
            forms[window.currentFormIndex].style.display = 'block';
            // console.log('Moved to form:', window.currentFormIndex);
            updateSubmitButtonVisibility();
        }
    };

    // Handle Submit button click and navigation
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();

            // Collect data from all forms
            const allForms = document.querySelectorAll('.content-card');
            const allFormData = [];

            // Validate all forms first
            let allValid = true;
            allForms.forEach((form, index) => {
                if (!validateForm(form)) {
                    allValid = false;
                }
            });

            if (!allValid) return;

            allForms.forEach(form => {
                const formData = getFormData(form);
                if (formData.galleryName || formData.description || formData.projectType || formData.selectedProject || formData.images) {
                    if (!formData.images || formData.images.length === 0) {
                        alert('Please upload at least one image for each gallery');
                        return;
                    }
                    allFormData.push(formData);
                }
            });

            if (allFormData.length > 0) {
                // Add all items to gallery list
                allFormData.forEach(data => {
                    addToGalleryList(data);
                });

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `${allFormData.length} gallery item(s) saved successfully!`,
                    confirmButtonColor: '#BC5322'
                });

                // Clear all forms first
                allForms.forEach(form => {
                    clearCurrentForm(form);
                    clearFormImages(form);
                });

                showAddedItemsSection();

                // Reset to first form and hide others
                allForms.forEach((form, index) => {
                    if (index === 0) {
                        form.style.display = 'block';
                        // Re-setup image upload for the first form after clearing
                        setupImageUpload(form);
                        addRequiredFieldValidation(form);
                    } else {
                        form.remove();
                    }
                });

                // Reset counters
                formCount = 0;
                window.currentFormIndex = 0;
                updateSubmitButtonVisibility();
            }
        }

        if (e.target.classList.contains('prev-btn')) {
            e.preventDefault();
            // console.log('Previous button clicked');
            window.previousForm();
        }

        if (e.target.classList.contains('next-btn')) {
            e.preventDefault();
            // console.log('Next button clicked');
            window.nextForm();
        }

        if (e.target.classList.contains('prev-btn')) {
            e.preventDefault();
            // console.log('Previous button clicked');
            window.previousForm();
        }

        if (e.target.classList.contains('next-btn')) {
            e.preventDefault();
            // console.log('Next button clicked');
            window.nextForm();
        }
    });

    function getFormData(form) {
        const projectType = form.querySelector('#projectType, [id^="projectType"]')?.value || '';
        const selectedProject = form.querySelector('#selectProject, [id^="selectProject"]')?.value || '';
        const galleryName = form.querySelector('input[placeholder*="Plaza Images Collection"]').value;
        const description = form.querySelector('textarea[placeholder*="Describe the content"]').value;

        // Get uploaded images - filter out non-data URLs
        const images = [];
        const imageSlots = form.querySelectorAll('.image-slot.filled img');
        imageSlots.forEach(img => {
            // Only include data URLs (base64 images), exclude other URLs like icons
            if (img.src && img.src.startsWith('data:image/')) {
                images.push(img.src);
            }
        });

        return {
            projectType,
            selectedProject,
            galleryName,
            description,
            images
        };
    }

    function addToGalleryList(data) {
        const selectedProjectData = getSelectedProjectData(data.projectType, data.selectedProject);

        const formData = new FormData();
        formData.append('project_id', data.selectedProject);
        formData.append('projectType', data.projectType);
        formData.append('projectName', selectedProjectData?.name || 'No project selected');
        formData.append('projectLocation', selectedProjectData?.location || '');
        formData.append('title', data.galleryName || 'Untitled Gallery');
        formData.append('text', data.description || 'No description');

        // Convert base64 images to files and append
        if (data.images && data.images.length > 0) {
            data.images.forEach((imageDataUrl, index) => {
                const blob = dataURLtoBlob(imageDataUrl);
                if (blob) {
                    formData.append('file', blob, `image_${index}.jpg`);
                }
            });
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/admin/gallery/addgallery', true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        const item = {
                            id: Date.now(),
                            project_id: data.selectedProject,
                            projectType: data.projectType,
                            projectName: selectedProjectData?.name || 'No project selected',
                            projectLocation: selectedProjectData?.location || '',
                            galleryName: data.galleryName || 'Untitled Gallery',
                            description: data.description || 'No description',
                            images: data.images || []
                        };
                        galleryArr.push(item);
                        updateAddedItemsDisplay();
                    }
                } else {
                    console.error('Error adding gallery:', xhr.status, xhr.statusText);
                }
            }
        };

        xhr.send(formData);
    }

    function dataURLtoBlob(dataURL) {
        try {
            if (!dataURL || !dataURL.includes(',')) {
                console.warn('Invalid data URL:', dataURL);
                return null;
            }

            const arr = dataURL.split(',');
            if (arr.length < 2) {
                console.warn('Invalid data URL format:', dataURL);
                return null;
            }

            const mimeMatch = arr[0].match(/:(.*?);/);
            if (!mimeMatch) {
                console.warn('Could not extract MIME type from:', dataURL);
                return null;
            }

            const mime = mimeMatch[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        } catch (error) {
            console.error('Error converting data URL to blob:', error);
            return null;
        }
    }

    function getSelectedProjectData(projectType, projectId) {
        if (!projectType || !projectId || !projectData[projectType]) return null;
        return projectData[projectType].find(project => project.id == projectId);
    }

    function clearCurrentForm(form) {
        const projectTypeSelect = form.querySelector('#projectType, [id^="projectType"]');
        const selectProjectSelect = form.querySelector('#selectProject, [id^="selectProject"]');
        const nameInput = form.querySelector('input[placeholder*="Plaza Images Collection"]');
        const descInput = form.querySelector('textarea[placeholder*="Describe the content"]');

        if (projectTypeSelect) projectTypeSelect.value = '';
        if (selectProjectSelect) {
            const projectGroup = selectProjectSelect.closest('.form-group');
            if (projectGroup) {
                projectGroup.style.display = 'none';
            }
            selectProjectSelect.innerHTML = '<option value="">Select a project</option>';
            selectProjectSelect.disabled = true;
        }
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
    }

    function clearFormImages(form) {
        const imageGrid = form.querySelector('.image-grid');
        const uploadSlot = form.querySelector('.image-slot.empty');
        const filledSlots = form.querySelectorAll('.image-slot.filled');

        filledSlots.forEach(slot => slot.remove());
        if (uploadSlot) uploadSlot.style.display = 'block';

        const fileInput = form.querySelector('.image-upload');
        if (fileInput) fileInput.value = '';
    }

    function updateAddedItemsDisplay() {
        addedItemsList.innerHTML = '';

        galleryArr.forEach(item => {
            const addedItem = document.createElement('div');
            addedItem.className = 'added-item';
            addedItem.dataset.id = item.id;

            const imageCount = item.images ? item.images.length : 0;
            const imageCountText = imageCount > 1 ? `+${imageCount - 1}` : '';

            addedItem.innerHTML = `
                <div class="item-preview">
                    <div class="item-image" ${item.images && item.images.length > 0 ? `style="background-image: url('${item.images[0]}')"` : ''}>
                        ${item.images && item.images.length > 0 ? '' : '<div class="no-image">No Image</div>'}
                        ${imageCount > 1 ? `<span class="image-count" style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${imageCountText}</span>` : ''}
                    </div>
                    <div class="item-details">
                        <h4 class="item-name">${item.galleryName}</h4>
                        <p class="item-description">${item.description}</p>
                        <p class="item-project"><strong>Project:</strong> ${item.projectName}${item.projectLocation ? ' - ' + item.projectLocation : ''}</p>
                        <p class="item-images"><strong>Images:</strong> ${imageCount} uploaded</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editItem(${item.id})">
                        <img class="icon" src="assets/icons/edit.svg" alt="">
                    </button>
                    <button class="delete-btn" onclick="deleteItem(${item.id})">
                        <img class="icon" src="assets/icons/delete.svg" alt="">
                    </button>
                </div>
            `;

            addedItemsList.appendChild(addedItem);
        });

        if (galleryArr.length === 0) {
            hideAddedItemsSection();
        } else {
            showAddedItemsSection();
        }
    }

    window.deleteItem = function (id) {
        galleryArr = galleryArr.filter(item => item.id !== id);
        updateAddedItemsDisplay();
    };

    window.editItem = function (id) {
        const item = galleryArr.find(i => i.id === id);
        if (!item) return;

        const currentForm = document.querySelector('.content-card:last-of-type');
        const projectTypeSelect = currentForm.querySelector('#projectType');
        const selectProjectSelect = currentForm.querySelector('#selectProject');
        const nameInput = currentForm.querySelector('input[placeholder*="Plaza Images Collection"]');
        const descInput = currentForm.querySelector('textarea[placeholder*="Describe the content"]');

        if (projectTypeSelect) projectTypeSelect.value = item.projectType;
        if (selectProjectSelect && item.projectType) {
            // Trigger change event to populate project dropdown
            projectTypeSelect.dispatchEvent(new Event('change'));
            setTimeout(() => {
                selectProjectSelect.value = item.selectedProject;
            }, 100);
        }
        nameInput.value = item.galleryName;
        descInput.value = item.description;

        deleteItem(id);
    };

    function createNewForm() {
        formCount++;

        // Remove submit button from all existing forms
        document.querySelectorAll('.content-card .submit-section').forEach(section => {
            section.style.display = 'none';
        });

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.setAttribute('data-form-index', formCount.toString());
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
                    <div class="image-grid">
                        <div class="image-slot empty">
                            <input class="image-upload" type="file" accept="image/*" multiple style="display: none;">
                            <div class="upload-icon">
                                <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                    <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                                </svg>
                            </div>
                            <span class="upload-text">Upload</span>
                        </div>
                    </div>
                    <p class="upload-hint">Supported formats: JPG, PNG. Max 5MB.</p>
                </div>
            </div>
            
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn" onclick="previousForm()">Previous</button>
                <button class="nav-btn next-btn" onclick="nextForm()">Next</button>
            </div>
            
            <div class="submit-section">
                <button class="submit-btn">Submit</button>
            </div>
        `;

        // Hide all forms
        document.querySelectorAll('.content-card').forEach(card => {
            card.style.display = 'none';
        });

        // Show new form
        newForm.style.display = 'block';
        formContainer.appendChild(newForm);

        // Add dropdown functionality to new form
        const newProjectTypeSelect = newForm.querySelector(`#projectType${formCount}`);
        const newSelectProjectSelect = newForm.querySelector(`#selectProject${formCount}`);

        setupDropdownHandlers(newProjectTypeSelect, newSelectProjectSelect);

        // Setup image upload for new form
        setupImageUpload(newForm);
        addRequiredFieldValidation(newForm);

        // Update current form index to the new form (forms are 0-indexed)
        window.currentFormIndex = formCount;

        // Add direct event listeners to navigation buttons
        const prevBtn = newForm.querySelector('.prev-btn');
        const nextBtn = newForm.querySelector('.next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // console.log('Previous clicked');
                window.previousForm();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // console.log('Next clicked');
                window.nextForm();
            });
        }
    }
    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }
    function hideAddedItemsSection() {
        addedItemsSection.style.display = 'none';
    }

    window.previousForm = function () {
        const forms = document.querySelectorAll('.content-card');
        // console.log('Previous - Current index:', window.currentFormIndex, 'Total forms:', forms.length);

        if (forms.length <= 1) return;

        // Check if we can go to previous form
        if (window.currentFormIndex > 0) {
            // Hide current form
            if (forms[window.currentFormIndex]) {
                forms[window.currentFormIndex].style.display = 'none';
            }
            // Move to previous form
            window.currentFormIndex--;
            // Show previous form
            if (forms[window.currentFormIndex]) {
                forms[window.currentFormIndex].style.display = 'block';
            }
            // console.log('Moved to form:', window.currentFormIndex);
            updateSubmitButtonVisibility();
        }
    };

    window.nextForm = function () {
        const forms = document.querySelectorAll('.content-card');
        // console.log('Next - Current index:', window.currentFormIndex, 'Total forms:', forms.length);

        if (forms.length <= 1) return;

        // Check if we can go to next form
        if (window.currentFormIndex < forms.length - 1) {
            // Hide current form
            if (forms[window.currentFormIndex]) {
                forms[window.currentFormIndex].style.display = 'none';
            }
            // Move to next form
            window.currentFormIndex++;
            // Show next form
            if (forms[window.currentFormIndex]) {
                forms[window.currentFormIndex].style.display = 'block';
            }
            // console.log('Moved to form:', window.currentFormIndex);
            updateSubmitButtonVisibility();
        }
    };

    function updateSubmitButtonVisibility() {
        const forms = document.querySelectorAll('.content-card');
        const lastFormIndex = forms.length - 1;

        forms.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                submitSection.style.display = index === lastFormIndex ? 'block' : 'none';
            }
        });
    }
});