import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function() {
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
            { selector: 'input[name="completion-date"]', message: '* Completion date is required' }
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
        });
    }

    function validateForm(form) {
        let isValid = true;
        const inputs = [
            { selector: 'input[name="project-name"]', message: '* Project name is required' },
            { selector: 'input[name="project-location"]', message: '* Project location is required' },
            { selector: 'input[name="completion-date"]', message: '* Completion date is required' }
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

    // Event delegation for upload buttons and navigation
    document.addEventListener('click', function(e) {
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
    document.addEventListener('change', function(e) {
        if (e.target.type === 'file' && e.target.accept === 'image/*') {
            window.handleProjectImageUpload(e.target);
        }
    });

    // Handle Add More button click
    addMoreBtn.addEventListener('click', function() {
        const currentForm = document.querySelector('.content-card:last-of-type');
        if (!currentForm) return;
        
        const formData = getFormData(currentForm);
        
        if (formData.projectName || formData.projectLocation) {
            addToProjectsList(formData);
            showAddedItemsSection();
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

    function addToProjectsList(data) {
        const addedItem = document.createElement('div');
        addedItem.className = 'added-item';
        
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
            deleteBtn.addEventListener('click', function() {
                addedItem.remove();
                if (addedItemsList.children.length === 0) {
                    hideAddedItemsSection();
                }
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                // Populate form with existing data
                const currentForm = document.querySelector('.content-card[style*="block"], .content-card:not([style*="none"])');
                if (currentForm) {
                    const nameInput = currentForm.querySelector('input[name="project-name"]');
                    const locationInput = currentForm.querySelector('input[name="project-location"]');
                    const dateInput = currentForm.querySelector('input[name="completion-date"]');
                    const summaryInput = currentForm.querySelector('input[name="project-summary"]');
                    
                    if (nameInput) nameInput.value = data.projectName || '';
                    if (locationInput) locationInput.value = data.projectLocation || '';
                    if (dateInput) dateInput.value = data.completionDate || '';
                    if (summaryInput) summaryInput.value = data.projectSummary || '';
                    
                    // Hide form number and navigation, show save button
                    const formHeader = currentForm.querySelector('.form-header');
                    const navButtons = currentForm.querySelector('.navigation-buttons');
                    const submitSection = currentForm.querySelector('.submit-section');
                    const submitBtn = currentForm.querySelector('.submit-btn');
                    const addMoreBtn = document.querySelector('.add-more-btn');
                    
                    if (formHeader) formHeader.style.display = 'none';
                    if (navButtons) navButtons.style.display = 'none';
                    if (submitSection) submitSection.style.display = 'block';
                    if (submitBtn) submitBtn.textContent = 'Save';
                    if (addMoreBtn) addMoreBtn.style.display = 'none';
                    
                    // Mark form as in edit mode
                    currentForm.setAttribute('data-edit-mode', 'true');
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
                    <input class="form-input" type="text" name="project-summary" placeholder="Enter project summary or notes...">
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
            addRequiredFieldValidation(initialForm);
        }
    }, 100);
    
    // Add submit button handlers
    function addSubmitHandlers() {
        document.addEventListener('click', function(e) {
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
    
    for (let i = 0; i < formsCache.length; i++) {
        const form = formsCache[i];
        
        if (!validateForm(form)) {
            return;
        }
        
        const data = getFormData(form);
        const fileInput = form.querySelector('input[type="file"]');
        
        if (!data.projectName && !data.projectLocation) continue;
        
        if (!fileInput || !fileInput.files.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Image!',
                text: `Project image required for form ${i + 1}`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }
        
        completedArr.push({
            project_name: data.projectName,
            project_location: data.projectLocation,
            project_date: data.completionDate ? new Date(data.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
            card_footer_text: data.projectSummary
        });
        
        formData.append(`file_${i}`, fileInput.files[0]);
    }
    
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

        formsCache.forEach(form => clearForm(form));
        
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
        
        // Reset upload button if image was uploaded
        const uploadBtn = form.querySelector('.upload-btn');
        if (uploadBtn && uploadBtn.style.backgroundImage) {
            uploadBtn.style.backgroundImage = '';
            uploadBtn.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                    </svg>
                </div>
                <p class="upload-text">Tap to upload</p>
                <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
            `;
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
    window.previousForm = function() {
        updateFormsCache();
        if (window.currentFormIndex > 0) {
            formsCache[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            formsCache[window.currentFormIndex].style.display = 'block';
            updateSubmitButtons();
            updateNavigationButtons();
        }
    };

    window.nextForm = function() {
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
window.selectProjectImage = function(button) {
    const fileInput = button.nextElementSibling;
    if (fileInput) {
        fileInput.click();
    }
};

// Handle project image upload with validation and error handling
window.handleProjectImageUpload = function(input) {
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
    reader.onload = function(e) {
        const uploadBtn = input.previousElementSibling;
        if (uploadBtn && e.target.result) {
            // Validate that result is a data URL
            if (e.target.result.startsWith('data:image/')) {
                uploadBtn.style.backgroundImage = `url(${e.target.result})`;
                uploadBtn.style.backgroundSize = 'cover';
                uploadBtn.style.backgroundPosition = 'center';
                uploadBtn.innerHTML = `
                    <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
                        <button class="image-action-btn edit-image-btn" onclick="editProjectImage(this)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(59, 130, 246, 0.9); color: white; cursor: pointer;">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </button>
                        <button class="image-action-btn delete-image-btn" onclick="deleteProjectImage(this)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(239, 68, 68, 0.9); color: white; cursor: pointer;">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                        </button>
                    </div>
                `;
            }
        }
    };
    reader.onerror = function() {
        alert('Error reading file');
        input.value = '';
    };
    reader.readAsDataURL(file);
};

// Edit project image
window.editProjectImage = function(button) {
    const formGroup = button.closest('.form-group');
    if (formGroup) {
        const fileInput = formGroup.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.click();
        }
    }
};

// Delete project image
window.deleteProjectImage = function(button) {
    const formGroup = button.closest('.form-group');
    if (formGroup) {
        const uploadBtn = formGroup.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.style.backgroundImage = '';
            uploadBtn.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                    </svg>
                </div>
                <p class="upload-text">Tap to upload</p>
                <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
            `;
        }
    }
    }

    // Global submit handler for Pug template
    window.handleSubmitClick = function(submitBtn) {
        handleSubmit(submitBtn);
    };

// Handle project image selection
window.selectProjectImage = function(button) {
    const fileInput = button.nextElementSibling;
    if (fileInput) {
        fileInput.click();
    }
};

// Handle project image upload with validation and error handling
window.handleProjectImageUpload = function(input) {
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
    reader.onload = function(e) {
        const uploadBtn = input.previousElementSibling;
        if (uploadBtn && e.target.result) {
            // Validate that result is a data URL
            if (e.target.result.startsWith('data:image/')) {
                uploadBtn.style.backgroundImage = `url(${e.target.result})`;
                uploadBtn.style.backgroundSize = 'cover';
                uploadBtn.style.backgroundPosition = 'center';
                uploadBtn.innerHTML = `
                    <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
                        <button class="image-action-btn edit-image-btn" onclick="editProjectImage(this)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(59, 130, 246, 0.9); color: white; cursor: pointer;">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </button>
                        <button class="image-action-btn delete-image-btn" onclick="deleteProjectImage(this)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(239, 68, 68, 0.9); color: white; cursor: pointer;">
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                        </button>
                    </div>
                `;
            }
        }
    };
    reader.onerror = function() {
        alert('Error reading file');
        input.value = '';
    };
    reader.readAsDataURL(file);
};

// Edit project image
window.editProjectImage = function(button) {
    const formGroup = button.closest('.form-group');
    if (formGroup) {
        const fileInput = formGroup.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.click();
        }
    }
};

// Delete project image
window.deleteProjectImage = function(button) {
    const formGroup = button.closest('.form-group');
    if (formGroup) {
        const uploadBtn = formGroup.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.style.backgroundImage = '';
            uploadBtn.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                    </svg>
                </div>
                <p class="upload-text">Tap to upload</p>
                <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
            `;
        }
    }
};