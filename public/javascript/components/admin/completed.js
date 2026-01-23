import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');

    if (!addMoreBtn || !formContainer || !addedItemsSection || !addedItemsList) {
        console.error('Required DOM elements not found');
        return;
    }

    let formCount = 0;
    let formsCache = [];

    // Add required field validation
    function addRequiredFieldValidation(form) {
        const inputs = [
            { selector: 'input[name="project-name"]', message: '* Project name is required' },
            { selector: 'input[name="project-location"]', message: '* Project location is required' },
            { selector: 'input[name="completion-date"]', message: '* Completion date is required' },
            { selector: 'input[name="project-summary"]', message: '* Project summary is required' }
        ];

        inputs.forEach(({ selector, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const name = selector.match(/name="([^"]+)"/)?.[1] || 'field';

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

        // Image validation message
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn) {
            const msg = document.createElement('div');
            msg.className = 'required-message-file';
            msg.textContent = '* Project image is required';
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
            uploadBtn.parentNode.appendChild(msg);
        }
    }

    function validateForm(form) {
        let isValid = true;
        const conf = [
            { selector: 'input[name="project-name"]', name: 'project-name' },
            { selector: 'input[name="project-location"]', name: 'project-location' },
            { selector: 'input[name="completion-date"]', name: 'completion-date' },
            { selector: 'input[name="project-summary"]', name: 'project-summary' }
        ];

        conf.forEach(({ selector, name }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const msg = input.parentNode.querySelector(`.required-message[data-for="${name}"]`);
            if (input.value.trim() === '') {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        // Image validation
        const fileInput = form.querySelector('input[type="file"]');
        const uploadBtn = form.querySelector('.upload-btn');
        const fileMsg = uploadBtn.parentNode.querySelector('.required-message-file');

        if (!fileInput || !fileInput.files.length) {
            if (!uploadBtn.classList.contains('has-image')) {
                if (fileMsg) fileMsg.style.display = 'block';
                isValid = false;
            } else {
                if (fileMsg) fileMsg.style.display = 'none';
            }
        } else {
            if (fileMsg) fileMsg.style.display = 'none';
        }

        return isValid;
    }

    // Event delegation for upload buttons and navigation
    document.addEventListener('click', function (e) {
        if (e.target.closest('.upload-btn')) {
            const button = e.target.closest('.upload-btn');
            const fileInput = button.nextElementSibling;
            if (fileInput) fileInput.click();
        }

        if (e.target.classList.contains('prev-btn')) {
            window.previousForm();
        }

        if (e.target.classList.contains('next-btn')) {
            window.nextForm();
        }
    });

    // Event delegation for file inputs
    document.addEventListener('change', function (e) {
        if (e.target.type === 'file' && e.target.accept === 'image/*') {
            window.handleProjectImageUpload(e.target);
        }
    });

    // Helper to check if a form is empty
    function isFormEmpty(form) {
        const data = getFormData(form);
        const fileInput = form.querySelector('input[type="file"]');
        const uploadBtn = form.querySelector('.upload-btn');
        const hasImage = uploadBtn && uploadBtn.classList.contains('has-image');

        return !data.projectName.trim() &&
            !data.projectLocation.trim() &&
            !data.completionDate &&
            !data.projectSummary.trim() &&
            !hasImage &&
            (!fileInput || !fileInput.files.length);
    }

    // Handle Add More button click
    addMoreBtn.addEventListener('click', function () {
        const currentForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');

        if (currentForm) {
            // Ensure current form has an ID
            if (!currentForm.dataset.formId) {
                currentForm.dataset.formId = 'form-' + Date.now();
            }

            const formData = getFormData(currentForm);

            // Only add to list if it has some data
            if (formData.projectName || formData.projectLocation) {
                addToProjectsList(formData, currentForm.dataset.formId);
                showAddedItemsSection();
            }
        }

        createNewForm();
    });

    function getFormData(form) {
        const projectNameEl = form.querySelector('input[name="project-name"]');
        const projectLocationEl = form.querySelector('input[name="project-location"]');
        const completionDateEl = form.querySelector('input[name="completion-date"]');
        const projectSummaryEl = form.querySelector('input[name="project-summary"]');

        return {
            projectName: projectNameEl ? projectNameEl.value : '',
            projectLocation: projectLocationEl ? projectLocationEl.value : '',
            completionDate: completionDateEl ? completionDateEl.value : '',
            projectSummary: projectSummaryEl ? projectSummaryEl.value : ''
        };
    }

    function addToProjectsList(data, formId) {
        const addedItem = document.createElement('div');
        addedItem.className = 'added-item';
        if (formId) {
            addedItem.dataset.linkedFormId = formId;
        }

        const formattedDate = data.completionDate ?
            `Completed: ${new Date(data.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` :
            'Completion date not set';

        // Use textContent for user data to prevent XSS
        const itemName = document.createElement('h4');
        itemName.className = 'item-name';
        itemName.textContent = data.projectName || 'Untitled Project';

        const itemLocation = document.createElement('p');
        itemLocation.className = 'item-location';
        itemLocation.textContent = data.projectLocation || 'Location not set';

        const itemDate = document.createElement('p');
        itemDate.className = 'item-date';
        itemDate.textContent = formattedDate;

        addedItem.innerHTML = `
            <div class="item-preview">
                <div class="item-image" style="background-color: var(--stone-200);"></div>
                <div class="item-details"></div>
            </div>
            <div class="item-actions">
                <button class="edit-btn">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-btn">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;

        // Safely append sanitized content
        const itemDetails = addedItem.querySelector('.item-details');
        itemDetails.appendChild(itemName);
        itemDetails.appendChild(itemLocation);
        itemDetails.appendChild(itemDate);

        addedItemsList.appendChild(addedItem);

        // Add event listeners
        const deleteBtn = addedItem.querySelector('.delete-btn');
        const editBtn = addedItem.querySelector('.edit-btn');

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                // Remove linked form from DOM
                if (addedItem.dataset.linkedFormId) {
                    const linkedForm = document.querySelector(`.content-card[data-form-id="${addedItem.dataset.linkedFormId}"]`);
                    if (linkedForm) {
                        linkedForm.remove();
                        updateFormsCache();
                    }
                }

                addedItem.remove();
                if (addedItemsList.children.length === 0) {
                    hideAddedItemsSection();
                }
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', function () {
                // Find linked form
                let linkedForm = null;
                if (addedItem.dataset.linkedFormId) {
                    linkedForm = document.querySelector(`.content-card[data-form-id="${addedItem.dataset.linkedFormId}"]`);
                }

                // Populate current visible form with data
                const currentVisibleForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');

                if (currentVisibleForm && linkedForm) {
                    // Method 1: Copy values
                    const data = getFormData(linkedForm);

                    const nameInput = currentVisibleForm.querySelector('input[name="project-name"]');
                    const locationInput = currentVisibleForm.querySelector('input[name="project-location"]');
                    const dateInput = currentVisibleForm.querySelector('input[name="completion-date"]');
                    const summaryInput = currentVisibleForm.querySelector('input[name="project-summary"]');

                    if (nameInput) nameInput.value = data.projectName || '';
                    if (locationInput) locationInput.value = data.projectLocation || '';
                    if (dateInput) dateInput.value = data.completionDate || '';
                    if (summaryInput) summaryInput.value = data.projectSummary || '';

                    // Handle Image Transfer
                    const linkedUploadBtn = linkedForm.querySelector('.upload-btn');
                    const currentUploadBtn = currentVisibleForm.querySelector('.upload-btn');

                    if (linkedUploadBtn && linkedUploadBtn.classList.contains('has-image') && currentUploadBtn) {
                        const img = linkedUploadBtn.querySelector('img');
                        if (img) {
                            currentUploadBtn.innerHTML = `
                                <div class="uploaded-image">
                                    <img src="${img.src}" alt="Uploaded project image">
                                    <button class="remove-image" onclick="deleteProjectImage(this); event.stopPropagation();">
                                        <span class="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            `;
                            currentUploadBtn.classList.add('has-image');
                        }
                    }

                    // Remove the linked form from DOM since we "pulled" it back
                    linkedForm.remove();
                    updateFormsCache();
                }

                // Remove from added items
                addedItem.remove();
                if (addedItemsList.children.length === 0) {
                    hideAddedItemsSection();
                }
            });
        }
    }

    function createNewForm() {
        formCount++;

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.dataset.formIndex = formCount;
        newForm.dataset.formId = 'form-' + Date.now() + Math.random().toString(36).substr(2, 9); // Unique ID

        newForm.innerHTML = `
            <div class="form-header">
                <span class="form-number">${formCount + 1}</span>
            </div>
            <div class="form-section">
                <div class="form-group">
                    <label class="form-label">Project Image</label>
                    <button class="upload-btn">
                        <div class="upload-icon">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                            </svg>
                        </div>
                        <p class="upload-text">Tap to upload</p>
                        <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
                    </button>
                    <input type="file" accept="image/*" style="display: none;">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Name</label>
                    <input class="form-input" type="text" name="project-name" placeholder="e.g. Downtown Office Complex">
                </div>
                
                <div class="form-group location-group">
                    <label class="form-label">Project Location</label>
                    <div class="input-wrapper">
                        <input class="form-input" type="text" name="project-location" placeholder="e.g. New York, NY">
                        <svg class="icon location-icon" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                        </svg>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Completion Date</label>
                    <input class="form-input" type="date" name="completion-date">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Summary</label>
                    <input class="form-input" type="text" name="project-summary" placeholder="Text area...">
                </div>
            </div>
            
            <div class="submit-section" style="display: none;">
                <button class="submit-btn">Submit</button>
            </div>
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn" ${formCount === 1 ? 'disabled' : ''}>Previous</button>
                <button class="nav-btn next-btn">Next</button>
            </div>
        `;

        // Hide all forms and show new one
        updateFormsCache();
        formsCache.forEach(card => card.style.display = 'none');
        newForm.style.display = 'block';
        formContainer.appendChild(newForm);

        window.currentFormIndex = formCount;
        updateFormsCache(); // Update cache after adding new form
        updateSubmitButtons();
        updateNavigationButtons();
        addRequiredFieldValidation(newForm);
    }

    function updateFormsCache() {
        formsCache = Array.from(document.querySelectorAll('.content-card'));
    }

    function showAddedItemsSection() {
        if (addedItemsSection) {
            addedItemsSection.style.display = 'block';
        }
    }

    function hideAddedItemsSection() {
        if (addedItemsSection) {
            addedItemsSection.style.display = 'none';
        }
    }

    // Initialize current form index to match the first form
    window.currentFormIndex = 0;

    // Update navigation buttons on page load
    setTimeout(() => {
        updateNavigationButtons();
        addSubmitHandlers();
        // Add validation to initial form
        const initialForm = document.querySelector('.content-card');
        if (initialForm) {
            if (!initialForm.dataset.formId) {
                initialForm.dataset.formId = 'form-' + Date.now();
            }
            addRequiredFieldValidation(initialForm);
        }
    }, 100);

    // Add submit button handlers
    function addSubmitHandlers() {
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('submit-btn')) {
                e.preventDefault();
                handleSubmit(e.target);
            }
        });
    }

    async function handleSubmit(submitBtn) {
        updateFormsCache();

        const completedArr = [];
        const formData = new FormData();
        let validFormsCount = 0;

        for (let i = 0; i < formsCache.length; i++) {
            const form = formsCache[i];

            // Skip empty forms, UNLESS it is the only form and it's completely empty
            // If it's the only form, we want to show validation errors appropriately if user tries to submit.
            // But if we have multiple forms, we can ignore the empty tail forms.
            if (isFormEmpty(form)) {
                if (formsCache.length === 1) {
                    // If it's the only form, validate it to show errors
                    if (!validateForm(form)) return;
                } else {
                    // Start of ignoring empty form in multi-form context
                    continue;
                }
            } else {
                // Form has some data, so it MUST be valid
                if (!validateForm(form)) {
                    // If any non-empty form is invalid, stop everything
                    // We should probably switch view to this form so user can see error
                    formsCache.forEach(f => f.style.display = 'none');
                    form.style.display = 'block';
                    window.currentFormIndex = i;
                    updateNavigationButtons();
                    updateSubmitButtons();
                    return;
                }
            }

            const data = getFormData(form);
            const fileInput = form.querySelector('input[type="file"]');

            // Double check (redundant with validateForm but good for safety)
            if (!data.projectName && !data.projectLocation) continue;

            completedArr.push({
                project_name: data.projectName,
                project_location: data.projectLocation,
                completion_date: data.completionDate ? new Date(data.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
                project_summary: data.projectSummary
            });

            if (fileInput && fileInput.files[0]) {
                formData.append(`file_${validFormsCount}`, fileInput.files[0]);
            }

            validFormsCount++;
        }

        console.log('Submitting completedArr:', completedArr);

        if (!completedArr.length) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data!',
                text: 'Please fill at least one project',
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        formData.append('completedArr', JSON.stringify(completedArr));

        try {
            const res = await fetch('/admin/completed/addcompleted', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const result = await res.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            // Success cleanup
            formsCache.forEach(form => form.remove());
            formsCache = [];
            formCount = 0;
            hideAddedItemsSection();
            addedItemsList.innerHTML = '';
            createNewForm(); // Start fresh

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `${completedArr.length} project(s) saved successfully!`,
                confirmButtonColor: '#BC5322'
            });

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Server error occurred',
                confirmButtonColor: '#BC5322'
            });
        }
    }

    function clearForm(form) {
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"]');
        inputs.forEach(input => input.value = '');
        if (form.querySelector('textarea')) form.querySelector('textarea').value = '';

        // Reset upload button
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.deleteProjectImage(uploadBtn.querySelector('.remove-image'));
        }
    }

    function showSuccessMessage(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Navigation functions
    window.previousForm = function () {
        updateFormsCache();
        if (window.currentFormIndex > 0) {
            formsCache[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            formsCache[window.currentFormIndex].style.display = 'block';
            updateSubmitButtons();
            updateNavigationButtons();
        }
    };

    window.nextForm = function () {
        updateFormsCache();
        if (window.currentFormIndex < formsCache.length - 1) {
            formsCache[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex++;
            formsCache[window.currentFormIndex].style.display = 'block';
            updateSubmitButtons();
            updateNavigationButtons();
        }
    };

    function updateNavigationButtons() {
        updateFormsCache();
        formsCache.forEach((form, index) => {
            const prevBtn = form.querySelector('.prev-btn');
            const nextBtn = form.querySelector('.next-btn');

            if (prevBtn) {
                prevBtn.disabled = (window.currentFormIndex === 0);
            }
            if (nextBtn) {
                nextBtn.disabled = (window.currentFormIndex === formsCache.length - 1);
            }
        });
    }

    function updateSubmitButtons() {
        updateFormsCache();
        formsCache.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                submitSection.style.display = index === window.currentFormIndex && index === formsCache.length - 1 ? 'block' : 'none';
            }
        });
    }
});

// Handle project image selection
window.selectProjectImage = function (button) {
    const fileInput = button.nextElementSibling;
    if (fileInput) {
        fileInput.click();
    }
};

// Handle project image upload with validation and error handling
// Handle project image upload with validation and error handling
window.handleProjectImageUpload = function (input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        input.value = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const uploadBtn = input.previousElementSibling;
        if (uploadBtn && e.target.result) {
            // Hide required message if it exists
            const msg = uploadBtn.parentNode.querySelector('.required-message-file');
            if (msg) msg.style.display = 'none';

            uploadBtn.innerHTML = `
                <div class="uploaded-image">
                    <img src="${e.target.result}" alt="Uploaded project image">
                    <button class="remove-image" onclick="deleteProjectImage(this); event.stopPropagation();">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            `;
            uploadBtn.classList.add('has-image');
        }
    };
    reader.onerror = function () {
        alert('Error reading file');
        input.value = '';
    };
    reader.readAsDataURL(file);
};

// Delete project image
window.deleteProjectImage = function (button) {
    const uploadBtn = button.closest('.upload-btn');
    if (uploadBtn) {
        uploadBtn.classList.remove('has-image');
        uploadBtn.innerHTML = `
            <div class="upload-icon">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                    <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                </svg>
            </div>
            <p class="upload-text">Tap to upload</p>
            <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
        `;
        const fileInput = uploadBtn.nextElementSibling;
        if (fileInput) fileInput.value = '';
    }
};

function clearForm(form) {
    const inputs = form.querySelectorAll('input[type="text"], input[type="date"]');
    inputs.forEach(input => input.value = '');

    // Reset upload button
    const uploadBtn = form.querySelector('.upload-btn');
    if (uploadBtn && uploadBtn.classList.contains('has-image')) {
        window.deleteProjectImage(uploadBtn.querySelector('.remove-image'));
    }
}
