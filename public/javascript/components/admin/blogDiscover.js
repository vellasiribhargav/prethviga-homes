document.addEventListener('DOMContentLoaded', function() {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');
    
    let formCount = 0;
    let blogArr = [];

    setupImageUpload(document.querySelector('.content-card'));
    loadExistingBlogs();

    addMoreBtn.addEventListener('click', function() {
        const currentForm = document.querySelector('.content-card:last-of-type');
        const formData = getFormData(currentForm);
        
        if (formData.blogTag || formData.blogTitle || formData.blogDescription) {
            addToBlogList(formData);
            clearCurrentForm(currentForm);
            showAddedItemsSection();
        }
        
        createNewForm();
    });

    function setupImageUpload(formCard) {
        const uploadBtn = formCard.querySelector('.upload-btn');
        const fileInput = formCard.querySelector('.image-upload');
        
        if (uploadBtn && fileInput) {
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
    }
    
    function handleImageUpload(file, uploadBtn) {
        if (file.size > 2 * 1024 * 1024) {
            alert(`${file.name} is too large. Max size is 2MB.`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadBtn.innerHTML = `
                <div class="uploaded-image">
                    <img src="${e.target.result}" alt="Uploaded cover">
                    <button class="remove-image" onclick="removeImage(this)">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            `;
            uploadBtn.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
    
    window.removeImage = function(button) {
        const uploadBtn = button.closest('.upload-btn');
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
        uploadBtn.classList.remove('has-image');
        setupImageUpload(uploadBtn.closest('.content-card'));
    };

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();
            
            const allForms = document.querySelectorAll('.content-card');
            const allFormData = [];
            
            allForms.forEach(form => {
                const formData = getFormData(form);
                if (formData.blogTag || formData.blogTitle || formData.blogDescription) {
                    allFormData.push(formData);
                }
            });
            
            if (allFormData.length > 0) {
                submitAllBlogs(allFormData);
            }
        }
    });
    
    function getFormData(form) {
        const blogTag = form.querySelector('input[placeholder*="About Us"]').value;
        const publicationDate = form.querySelector('input[name="publication-date"]').value;
        const blogTitle = form.querySelector('input[placeholder*="Discover Our Story"]').value;
        const blogDescription = form.querySelector('textarea[placeholder*="discover us blog content"]').value;
        
        const uploadedImage = form.querySelector('.uploaded-image img');
        const coverImage = uploadedImage ? uploadedImage.src : null;
        
        return {
            blogTag,
            publicationDate,
            blogTitle,
            blogDescription,
            coverImage
        };
    }

    async function submitAllBlogs(allFormData) {
        try {
            const formData = new FormData();
            formData.append('blogArr', JSON.stringify(allFormData));

            const allForms = document.querySelectorAll('.content-card');
            allForms.forEach((form, index) => {
                const fileInput = form.querySelector('.image-upload');
                if (fileInput && fileInput.files[0]) {
                    formData.append(`file_${index}`, fileInput.files[0]);
                }
            });

            const response = await fetch('/admin/blogDiscover/addblogdiscover', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                
                allFormData.forEach(data => {
                    addToBlogList(data);
                });
                
                allForms.forEach(form => {
                    clearCurrentForm(form);
                });
                
                showAddedItemsSection();
                
                allForms.forEach((form, index) => {
                    if (index === 0) {
                        form.style.display = 'block';
                    } else {
                        form.remove();
                    }
                });
                
                formCount = 0;
                window.currentFormIndex = 0;
                
                loadExistingBlogs();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting blogs:', error);
            alert('Error submitting blogs. Please try again.');
        }
    }

    function addToBlogList(data) {
        const item = {
            id: Date.now(),
            blogTag: data.blogTag || 'No tag',
            publicationDate: data.publicationDate ? new Date(data.publicationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            blogTitle: data.blogTitle || 'Untitled Blog',
            blogDescription: data.blogDescription || 'No description',
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
        const uploadBtn = form.querySelector('.upload-btn');
        
        if (tagInput) tagInput.value = '';
        if (dateInput) dateInput.value = '';
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        
        if (uploadBtn && uploadBtn.classList.contains('has-image')) {
            window.removeImage(uploadBtn.querySelector('.remove-image'));
        }
    }

    async function loadExistingBlogs() {
        try {
            const response = await fetch('/admin/blogDiscover/getblogdiscover');
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                blogArr = result.data.map((blog, index) => ({
                    id: blog.blog_id || index,
                    blogTag: blog.badge_text || 'No tag',
                    publicationDate: blog.blog_date ? new Date(blog.blog_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'No date',
                    blogTitle: blog.blog_text || 'Untitled Blog',
                    blogDescription: blog.blog_description || 'No description',
                    coverImage: blog.inner_img || null,
                    index: index
                }));
                updateAddedItemsDisplay();
            }
        } catch (error) {
            console.error('Error loading existing blogs:', error);
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
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editItem(${item.id})">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="delete-btn" onclick="deleteItem(${item.id}, ${item.index || -1})">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
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

    window.deleteItem = async function(id, index) {
        if (index >= 0) {
            try {
                const response = await fetch(`/admin/blogDiscover/deleteblogdiscover/${index}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                
                if (result.success) {
                    alert(result.message);
                    loadExistingBlogs();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting blog:', error);
                alert('Error deleting blog. Please try again.');
            }
        } else {
            blogArr = blogArr.filter(item => item.id !== id);
            updateAddedItemsDisplay();
        }
    };

    window.editItem = function(id) {
        const item = blogArr.find(i => i.id === id);
        if (!item) return;
        
        const currentForm = document.querySelector('.content-card:last-of-type');
        const tagInput = currentForm.querySelector('input[placeholder*="About Us"]');
        const dateInput = currentForm.querySelector('input[name="publication-date"]');
        const titleInput = currentForm.querySelector('input[placeholder*="Discover Our Story"]');
        const descInput = currentForm.querySelector('textarea[placeholder*="discover us blog content"]');
        
        tagInput.value = item.blogTag;
        dateInput.value = item.publicationDate;
        titleInput.value = item.blogTitle;
        descInput.value = item.blogDescription;
        
        if (item.coverImage) {
            const uploadBtn = currentForm.querySelector('.upload-btn');
            uploadBtn.innerHTML = `
                <div class="uploaded-image">
                    <img src="${item.coverImage}" alt="Uploaded cover">
                    <button class="remove-image" onclick="removeImage(this)">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            `;
            uploadBtn.classList.add('has-image');
        }
        
        deleteItem(id, item.index || -1);
    };

    function createNewForm() {
        formCount++;
        
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
                    <label class="form-label">Blog Tag</label>
                    <input class="form-input" type="text" placeholder="e.g. About Us, Company, Team">
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
                
                <div class="form-group">
                    <label class="form-label">Publication Date</label>
                    <input class="form-input" type="date" name="publication-date">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Blog Title</label>
                    <input class="form-input" type="text" placeholder="e.g. Discover Our Story and Mission">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Blog Description</label>
                    <textarea class="form-textarea" placeholder="Write your discover us blog content here..."></textarea>
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