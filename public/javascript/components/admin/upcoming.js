import Swal from 'sweetalert2';

function formatToDB(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

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

    // Character limit message handler
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('form-textarea') && e.target.maxLength === 200) {
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

    // Initialize
    updateFormsCache();
    updateDeleteButtonsVisibility();

    // Add required field validation
    function addRequiredFieldValidation(form) {
        const conf = [
            { selector: 'input[name="project-name"]', name: 'project-name', message: '* Project name is required' },
            { selector: 'input[name="project-location"]', name: 'project-location', message: '* Project location is required' },
            { selector: 'input[name="timeline-date"]', name: 'timeline-date', message: '* Timeline date is required' },
            { selector: '.form-textarea[name="project-description"]', name: 'project-description', message: '* Project description is required' }
        ];

        conf.forEach(({ selector, name, message }) => {
            const input = form.querySelector(selector);
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

        // Image validation message
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn) {
            // Remove existing if any
            const existingMsg = uploadBtn.parentNode.querySelector('.required-message-file');
            if (existingMsg) existingMsg.remove();

            const msg = document.createElement('div');
            msg.className = 'required-message-file';
            msg.textContent = '* Project image is required';
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';
            uploadBtn.parentNode.appendChild(msg);
        }
    }

    function isFormEmpty(form) {
        const formData = getFormData(form);
        const hasText = formData.projectName || formData.projectLocation || formData.timelineDate || formData.projectDescription;
        const hasImage = form.querySelector('.upload-btn.has-image');
        const hasFile = form.querySelector('input[type="file"]').files.length > 0;

        return !hasText && !hasImage && !hasFile;
    }

    function validateForm(form) {
        let isValid = true;
        const conf = [
            { selector: 'input[name="project-name"]', name: 'project-name' },
            { selector: 'input[name="project-location"]', name: 'project-location' },
            { selector: 'input[name="timeline-date"]', name: 'timeline-date' },
            { selector: '.form-textarea[name="project-description"]', name: 'project-description' }
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
        if (e.target.closest('.upload-btn') && !e.target.closest('.remove-image')) {
            const button = e.target.closest('.upload-btn');
            if (button.classList.contains('has-image')) return;
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

    // Handle Form Deletion
    document.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-form-btn');
        if (deleteBtn) {
            e.preventDefault();
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
                updateNavigationButtons();
                updateSubmitButtons();
                updateDeleteButtonsVisibility();
            }
        }
    });

    // Handle Add More button click
    addMoreBtn.addEventListener('click', function () {
        updateFormsCache();
        const currentForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');

        if (!currentForm) return;

        // Ensure current form has an ID
        if (!currentForm.dataset.formId) {
            currentForm.dataset.formId = 'form_' + Date.now();
        }

        const formData = getFormData(currentForm);

        // Add to visual list if it has basic data
        if (formData.projectName || formData.projectLocation) {
            // Pass the form ID to link them
            addToProjectsList(formData, currentForm.dataset.formId);
            showAddedItemsSection();
        }

        // Hide current submit section
        const submitSection = currentForm.querySelector('.submit-section');
        if (submitSection) submitSection.style.display = 'none';

        createNewForm();
    });

    function getFormData(form) {
        const projectNameEl = form.querySelector('input[name="project-name"]');
        const projectLocationEl = form.querySelector('input[name="project-location"]');
        const timelineDateEl = form.querySelector('input[name="timeline-date"]');
        const projectDescriptionEl = form.querySelector('.form-textarea[name="project-description"]');

        return {
            projectName: projectNameEl ? projectNameEl.value : '',
            projectLocation: projectLocationEl ? projectLocationEl.value : '',
            timelineDate: timelineDateEl ? timelineDateEl.value : '',
            projectDescription: projectDescriptionEl ? projectDescriptionEl.value : ''
        };
    }

    function formatDateForPreview(dateStr) {
        if (!dateStr) return 'Timeline not set';
        const [year, month, day] = dateStr.split('-');
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = months[parseInt(month) - 1];
        return `Timeline: ${monthName} ${year}`;
    }

    function addToProjectsList(data, formId) {
        const addedItem = document.createElement('div');
        addedItem.className = 'added-item';
        // Store the linked form ID
        addedItem.dataset.linkedFormId = formId;

        const formattedDate = formatDateForPreview(data.timelineDate);

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
        `;

        const itemDetails = addedItem.querySelector('.item-details');
        itemDetails.appendChild(itemName);
        itemDetails.appendChild(itemLocation);
        itemDetails.appendChild(itemDate);

        addedItemsList.appendChild(addedItem);

        // --- Delete Button Logic ---
        const deleteBtn = addedItem.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                // Remove the visual item
                addedItem.remove();

                // Also remove the linked form from DOM
                if (formId) {
                    const linkedForm = document.querySelector(`.content-card[data-form-id="${formId}"]`);
                    if (linkedForm) {
                        linkedForm.remove();
                        updateFormsCache();
                    }
                }

                if (addedItemsList.children.length === 0) {
                    hideAddedItemsSection();
                }
            });
        }

        // --- Edit Button Logic ---
        const editBtn = addedItem.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                updateFormsCache();
                // Find the linked form
                const linkedForm = document.querySelector(`.content-card[data-form-id="${formId}"]`);
                // Find the currently active (visible) form to hide it
                const currentVisibleForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');

                if (linkedForm) {
                    // Hide current form
                    if (currentVisibleForm) {
                        currentVisibleForm.style.display = 'none';
                    }

                    // Show linked form
                    linkedForm.style.display = 'block';

                    // Update current index
                    window.currentFormIndex = formsCache.indexOf(linkedForm);

                    // Update buttons
                    updateNavigationButtons();
                    updateSubmitButtons();

                    // Remove from added items list as it is now "active"
                    addedItem.remove();
                    if (addedItemsList.children.length === 0) {
                        hideAddedItemsSection();
                    }
                }
            });
        }
    }

    function createNewForm() {
        // Reset formCount based on current number of forms to ensure sequential numbering
        const currentForms = document.querySelectorAll('.content-card');
        formCount = currentForms.length;

        const uniqueId = 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Hide existing forms
        updateFormsCache();
        formsCache.forEach(card => card.style.display = 'none');

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.dataset.formIndex = formCount;
        newForm.dataset.formId = uniqueId;
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
                    <input class="form-input" type="text" name="project-name" placeholder="e.g. New Office Tower Build">
                </div>
                
                <div class="form-group location-group">
                    <label class="form-label">Project Location</label>
                    <div class="input-wrapper">
                        <input class="form-input" type="text" name="project-location" placeholder="e.g. Chicago, IL">
                        <svg class="icon location-icon" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                        </svg>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Timeline</label>
                    <input class="form-input" type="date" name="timeline-date">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Description</label>
                    <textarea class="form-textarea" name="project-description" placeholder="project description..." rows="3" maxlength="200"></textarea>
                    <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic">* Characters are more than 200</div>
                </div>
            </div>
            
            <div class="submit-section">
                <button class="submit-btn">Submit</button>
            </div>
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn">Previous</button>
                <button class="nav-btn next-btn" disabled>Next</button>
            </div>
        `;

        formContainer.appendChild(newForm);

        window.currentFormIndex = Array.from(document.querySelectorAll('.content-card')).length - 1;

        updateFormsCache();
        updateSubmitButtons();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();
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

    // Initialize
    window.currentFormIndex = 0;

    setTimeout(() => {
        updateFormsCache();
        const initialForm = document.querySelector('.content-card');
        if (initialForm) {
            if (!initialForm.dataset.formId) {
                initialForm.dataset.formId = 'form_' + Date.now();
            }
            addRequiredFieldValidation(initialForm);
        }
        updateNavigationButtons();
        addSubmitHandlers();
    }, 100);

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

        // STEP 1: Validate ALL forms first before processing
        let firstInvalidFormIndex = -1;
        const nonEmptyForms = [];

        const invalidFormIndices = [];

        for (let i = 0; i < formsCache.length; i++) {
            const form = formsCache[i];



            nonEmptyForms.push({ form, index: i });

            // Validate this form
            if (!validateForm(form)) {
                invalidFormIndices.push(i);
                if (firstInvalidFormIndex === -1) {
                    firstInvalidFormIndex = i;
                }
            }
        }

        // If any form failed validation, navigate to the first invalid form and stop
        if (firstInvalidFormIndex !== -1) {
            formsCache.forEach(f => f.style.display = 'none');
            formsCache[firstInvalidFormIndex].style.display = 'block';
            window.currentFormIndex = firstInvalidFormIndex;
            updateNavigationButtons();
            updateSubmitButtons();

            const invalidNumbers = invalidFormIndices.map(i => i + 1).join(', ');
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: `Please check the following forms for missing fields: ${invalidNumbers}`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        // STEP 2: All forms are valid, now collect data
        const upcomingArr = [];
        const formData = new FormData();
        let validFormsCount = 0;

        for (let i = 0; i < nonEmptyForms.length; i++) {
            const { form } = nonEmptyForms[i];
            const data = getFormData(form);
            const fileInput = form.querySelector('input[type="file"]');

            upcomingArr.push({
                project_name: data.projectName,
                project_location: data.projectLocation,
                project_date: formatToDB(data.timelineDate),
                card_footer_text: data.projectDescription
            });

            if (fileInput.files[0]) {
                formData.append(`file_${validFormsCount}`, fileInput.files[0]);
            }
            validFormsCount++;
        }

        if (!upcomingArr.length) {
            Swal.fire({
                icon: 'warning',
                title: 'No Data!',
                text: 'Please fill at least one project',
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        formData.append('upcomingArr', JSON.stringify(upcomingArr));

        try {
            const res = await fetch('/admin/upcoming/addupcoming', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const result = await res.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `${upcomingArr.length} project(s) saved successfully!`,
                confirmButtonColor: '#BC5322'
            });

            window.location.reload();

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
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => input.value = '');

        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.deleteProjectImage(uploadBtn.querySelector('.remove-image'));
        }
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

    // Navigation functions (updated to use DOM visibility for safety)
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

            if (prevBtn) prevBtn.disabled = (index === 0);
            if (nextBtn) nextBtn.disabled = (index === formsCache.length - 1);
        });
    }

    function updateSubmitButtons() {
        updateFormsCache();
        formsCache.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                // Show submit button only on the last form
                submitSection.style.display = (index === formsCache.length - 1) ? 'block' : 'none';
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
window.handleProjectImageUpload = function (input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        input.value = '';
        return;
    }

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
