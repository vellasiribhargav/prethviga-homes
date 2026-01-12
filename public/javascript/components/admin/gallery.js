document.addEventListener('DOMContentLoaded', function() {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');
    const projectTypeSelect = document.getElementById('projectType');
    const selectProjectSelect = document.getElementById('selectProject');
    
    let formCount = 0;
    let galleryItems = [];

    // Project data will be fetched from API
    let projectData = {
        upcoming: [],
        completed: []
    };

    // Fetch projects from backend
    async function fetchProjects() {
        try {
            // Replace with your actual API endpoints
            const [upcomingResponse, completedResponse] = await Promise.all([
                fetch('/api/projects/upcoming'),
                fetch('/api/projects/completed')
            ]);
            
            const upcomingProjects = await upcomingResponse.json();
            const completedProjects = await completedResponse.json();
            
            projectData.upcoming = upcomingProjects;
            projectData.completed = completedProjects;
            
            // Initialize the first dropdown after data is loaded
            initializeFirstDropdown();
            
        } catch (error) {
            console.error('Error fetching projects:', error);
            // Fallback to sample data if API fails
            projectData = {
                upcoming: [
                    { id: 1, name: 'New Office Tower Build', location: 'Chicago, IL' },
                    { id: 2, name: 'Residential Complex Phase 2', location: 'Austin, TX' },
                    { id: 3, name: 'Shopping Mall Renovation', location: 'Miami, FL' }
                ],
                completed: [
                    { id: 4, name: 'Downtown Office Complex', location: 'New York, NY' },
                    { id: 5, name: 'Luxury Apartments', location: 'Los Angeles, CA' },
                    { id: 6, name: 'Corporate Headquarters', location: 'Seattle, WA' }
                ]
            };
            initializeFirstDropdown();
        }
    }

    // Initialize the first dropdown with default selection
    function initializeFirstDropdown() {
        if (projectTypeSelect && selectProjectSelect) {
            // Trigger change event for the default selected option
            const defaultType = projectTypeSelect.value || 'upcoming';
            projectTypeSelect.value = defaultType;
            
            // Populate the project dropdown
            populateProjectDropdown(selectProjectSelect, defaultType);
        }
    }

    // Helper function to populate project dropdown
    function populateProjectDropdown(selectElement, projectType) {
        selectElement.innerHTML = '';
        
        if (projectType && projectData[projectType]) {
            selectElement.disabled = false;
            projectData[projectType].forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.name} - ${project.location}`;
                selectElement.appendChild(option);
            });
        } else {
            selectElement.disabled = true;
        }
    }

    // Handle project type dropdown change for initial form
    function setupDropdownHandlers(projectTypeSelect, selectProjectSelect) {
        if (projectTypeSelect) {
            projectTypeSelect.addEventListener('change', function() {
                const selectedType = this.value;
                populateProjectDropdown(selectProjectSelect, selectedType);
            });
        }
    }
    
    // Initialize data and setup
    fetchProjects();
    
    // Setup initial form dropdowns
    setupDropdownHandlers(projectTypeSelect, selectProjectSelect);
    
    // Setup image upload for initial form
    setupImageUpload(document.querySelector('.content-card'));
    
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
                    <img src="${e.target.result}" alt="Uploaded image">
                    <button class="remove-image" onclick="removeImage(this)">
                        <img class="icon" src="assets/icons/close.svg" alt="Remove">
                    </button>
                `;
                
                imageGrid.insertBefore(imageSlot, uploadSlot);
            };
            reader.readAsDataURL(file);
        });
    }
    
    window.removeImage = function(button) {
        button.parentElement.remove();
    };

    // Handle Add More button click
    addMoreBtn.addEventListener('click', function() {
        const currentForm = document.querySelector('.content-card:last-of-type');
        const formData = getFormData(currentForm);
        
        if (formData.galleryName || formData.description) {
            addToGalleryList(formData);
            clearCurrentForm(currentForm);
            showAddedItemsSection();
        }
        
        createNewForm();
    });

    // Handle Submit button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('submit-btn')) {
            const currentForm = e.target.closest('.content-card');
            const formData = getFormData(currentForm);
            
            if (formData.galleryName || formData.description) {
                addToGalleryList(formData);
                clearCurrentForm(currentForm);
                showAddedItemsSection();
                createNewForm();
            }
        }
    });

    function getFormData(form) {
        const projectType = form.querySelector('#projectType, [id^="projectType"]')?.value || '';
        const selectedProject = form.querySelector('#selectProject, [id^="selectProject"]')?.value || '';
        const galleryName = form.querySelector('input[placeholder*="Plaza Images Collection"]').value;
        const description = form.querySelector('textarea[placeholder*="Describe the content"]').value;
        
        // Get uploaded images
        const images = [];
        const imageSlots = form.querySelectorAll('.image-slot.filled img');
        imageSlots.forEach(img => {
            images.push(img.src);
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
        
        const item = {
            id: Date.now(),
            projectType: data.projectType,
            projectName: selectedProjectData?.name || 'No project selected',
            projectLocation: selectedProjectData?.location || '',
            galleryName: data.galleryName || 'Untitled Gallery',
            description: data.description || 'No description',
            images: data.images || []
        };
        
        galleryItems.push(item);
        updateAddedItemsDisplay();
    }

    function getSelectedProjectData(projectType, projectId) {
        if (!projectType || !projectId || !projectData[projectType]) return null;
        return projectData[projectType].find(project => project.id == projectId);
    }

    function clearCurrentForm(form) {
        const projectTypeSelect = form.querySelector('#projectType');
        const selectProjectSelect = form.querySelector('#selectProject');
        const nameInput = form.querySelector('input[placeholder*="Plaza Images Collection"]');
        const descInput = form.querySelector('textarea[placeholder*="Describe the content"]');
        
        if (projectTypeSelect) projectTypeSelect.value = '';
        if (selectProjectSelect) {
            selectProjectSelect.innerHTML = '';
            selectProjectSelect.disabled = true;
        }
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
    }

    function updateAddedItemsDisplay() {
        addedItemsList.innerHTML = '';
        
        galleryItems.forEach(item => {
            const addedItem = document.createElement('div');
            addedItem.className = 'added-item';
            addedItem.dataset.id = item.id;
            
            const imagePreview = item.images && item.images.length > 0 
                ? `<img src="${item.images[0]}" alt="Gallery preview">` 
                : '<div class="no-image">No Image</div>';
            
            const imageCount = item.images ? item.images.length : 0;
            const imageCountText = imageCount > 1 ? `+${imageCount - 1} more` : '';
            
            addedItem.innerHTML = `
                <div class="item-preview">
                    <div class="item-image">
                        ${imagePreview}
                        ${imageCount > 1 ? `<span class="image-count">${imageCountText}</span>` : ''}
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
        
        if (galleryItems.length === 0) {
            hideAddedItemsSection();
        } else {
            showAddedItemsSection();
        }
    }

    window.deleteItem = function(id) {
        galleryItems = galleryItems.filter(item => item.id !== id);
        updateAddedItemsDisplay();
    };

    window.editItem = function(id) {
        const item = galleryItems.find(i => i.id === id);
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
        
        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.innerHTML = `
            <div class="form-header">
                <span class="form-number">${formCount + 1}</span>
            </div>
            
            <div class="form-section">
                <div class="form-group">
                    <label class="form-label">Type of Project</label>
                    <select class="form-select" id="projectType${formCount}">
                        <option value="upcoming">Upcoming Projects</option>
                        <option value="completed">Completed Projects</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Select Project</label>
                    <select class="form-select" id="selectProject${formCount}" disabled>
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
                                <img class="icon" src="assets/icons/add_photo_alternate.svg" alt="">
                            </div>
                            <span class="upload-text">Upload</span>
                        </div>
                    </div>
                    <p class="upload-hint">Supported formats: JPG, PNG. Max 5MB.</p>
                </div>
            </div>
            
            <div class="submit-section">
                <button class="submit-btn">Submit</button>
            </div>
            
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn" onclick="previousForm()">Previous</button>
                <button class="nav-btn next-btn" onclick="nextForm()">Next</button>
            </div>
        `;
        
        document.querySelectorAll('.content-card').forEach(card => {
            card.style.display = 'none';
        });
        
        newForm.style.display = 'block';
        formContainer.appendChild(newForm);
        
        // Add dropdown functionality to new form
        const newProjectTypeSelect = newForm.querySelector(`#projectType${formCount}`);
        const newSelectProjectSelect = newForm.querySelector(`#selectProject${formCount}`);
        
        setupDropdownHandlers(newProjectTypeSelect, newSelectProjectSelect);
        
        // Setup image upload for new form
        setupImageUpload(newForm);
        
        window.currentFormIndex = formCount;
    }

    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }

    function hideAddedItemsSection() {
        addedItemsSection.style.display = 'none';
    }
    
    window.currentFormIndex = 0;

    window.previousForm = function() {
        const forms = document.querySelectorAll('.content-card');
        if (window.currentFormIndex > 0) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            forms[window.currentFormIndex].style.display = 'block';
        }
    };

    window.nextForm = function() {
        const forms = document.querySelectorAll('.content-card');
        
        if (window.currentFormIndex < forms.length - 1) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex++;
            forms[window.currentFormIndex].style.display = 'block';
        }
    };
});