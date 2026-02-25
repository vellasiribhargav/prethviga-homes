import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import $ from 'jquery';
import { showFieldError, hideFieldError, initCharLimitHighlight } from '../../utils/validation.js';

document.addEventListener('DOMContentLoaded', function () {
    initCharLimitHighlight();
    const projectTypeSelect = document.getElementById('projectType');
    if (!projectTypeSelect) return;
    const selectProjectSelect = document.getElementById('selectProject');
    const sectionTabsContainer = document.querySelector('.section-tabs');
    const detailsFormContainer = document.getElementById('detailsFormContainer');
    const sectionTabs = document.querySelectorAll('.tab-btn');
    const sectionForms = document.querySelectorAll('.section-form');

    // Hide forms and tabs initially until a project is selected
    if (detailsFormContainer) detailsFormContainer.style.display = 'none';
    if (sectionTabsContainer) sectionTabsContainer.style.display = 'none';

    let amenitiesTags = [];
    let dirtySections = new Set();
    let projectData = { upcoming: [], completed: [] };
    let currentProjectId = null;
    let currentProjectType = null;
    let galleryItems = [];
    let activeGalleryIndex = -1;

    let dynamicAmenities = [];

    // Fetch unique amenities from DB
    async function fetchUniqueAmenities() {
        try {
            const response = await fetch('/admin/projectDetails/amenities/unique');
            const res = await response.json();
            if (res.success) {
                dynamicAmenities = res.amenities;
                // If the user wants to keep the default sorted list as a fallback, we can merge them
                // but for now let's just use what's in the DB.
            }
        } catch (err) {
            console.error('Error fetching unique amenities:', err);
        }
    }

    fetchUniqueAmenities();

    const saveAllBtn = document.getElementById('saveAllBtn');
    if (saveAllBtn) saveAllBtn.style.display = 'none';

    // Initialize Tags Input
    initializeTagsInput('amenitiesTags', 'amenitiesTagInput', 'amenitiesHiddenInput', amenitiesTags);

    function initializeTagsInput(tagsListId, inputId, hiddenInputId, tagsArray) {
        const tagsList = document.getElementById(tagsListId);
        const input = document.getElementById(inputId);
        const hiddenInput = document.getElementById(hiddenInputId);
        const suggestionsBox = document.getElementById('amenitiesSuggestions');
        const container = input?.closest('.amenities-dropdown-container');

        if (!tagsList || !input || !hiddenInput) return;

        function addTag(text) {
            const trimmed = text.trim();
            if (!trimmed || tagsArray.includes(trimmed)) return;

            tagsArray.push(trimmed);
            renderTags();
            updateHiddenInput();
            input.value = '';
            hideSuggestions();
            dirtySections.add('amenities-list');

            // Hide validation message if it exists
            hideFieldError(input);

            checkSaveAllVisibility();
        }

        function removeTag(index) {
            tagsArray.splice(index, 1);
            renderTags();
            updateHiddenInput();
            dirtySections.add('amenities-list');

            // Show validation message if no tags left and message element exists
            if (tagsArray.length === 0) {
                const msg = document.querySelector('#form-amenities-list .required-container-message');
                if (msg) msg.style.display = 'block';
            }

            checkSaveAllVisibility();
        }

        function renderTags() {
            tagsList.innerHTML = '';
            tagsArray.forEach((tag, index) => {
                const tagEl = document.createElement('div');
                tagEl.className = 'tag';
                tagEl.innerHTML = `
                    <span class="tag-text">${tag}</span>
                    <button type="button" class="tag-remove" data-index="${index}">×</button>
                `;
                tagsList.appendChild(tagEl);
            });
        }

        function updateHiddenInput() {
            hiddenInput.value = JSON.stringify(tagsArray);
        }

        function showSuggestions(filtered) {
            if (!suggestionsBox) return;
            if (filtered.length === 0) {
                hideSuggestions();
                return;
            }

            suggestionsBox.innerHTML = '';
            filtered.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = item;
                div.addEventListener('click', () => {
                    addTag(item);
                    hideSuggestions();
                });
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block';
            container?.classList.add('active');
        }

        function hideSuggestions() {
            if (suggestionsBox) suggestionsBox.style.display = 'none';
            container?.classList.remove('active');
        }

        input.addEventListener('focus', () => {
            const val = input.value.toLowerCase();
            const filtered = dynamicAmenities?.filter(item =>
                (val === '' || item.toLowerCase().includes(val)) && !tagsArray.includes(item)
            );
            showSuggestions(filtered);
        });

        input.addEventListener('input', () => {
            const val = input.value.toLowerCase();
            const filtered = dynamicAmenities?.filter(item =>
                (val === '' || item.toLowerCase().includes(val)) && !tagsArray.includes(item)
            );
            showSuggestions(filtered);

            // Clear validation on input
            hideFieldError(input);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeSuggestion = suggestionsBox?.querySelector('.suggestion-item.active');
                if (activeSuggestion) {
                    addTag(activeSuggestion.textContent);
                } else if (input.value.trim()) {
                    addTag(input.value);
                }
            } else if (e.key === 'Backspace' && !input.value && tagsArray.length > 0) {
                removeTag(tagsArray.length - 1);
            } else if (e.key === 'ArrowDown' && suggestionsBox?.style.display === 'block') {
                e.preventDefault();
                const items = suggestionsBox.querySelectorAll('.suggestion-item');
                if (items.length === 0) return;
                let activeIdx = Array.from(items).findIndex(i => i.classList.contains('active'));
                items.forEach(i => i.classList.remove('active'));
                activeIdx = (activeIdx + 1) % items.length;
                items[activeIdx].classList.add('active');
                items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp' && suggestionsBox?.style.display === 'block') {
                e.preventDefault();
                const items = suggestionsBox.querySelectorAll('.suggestion-item');
                if (items.length === 0) return;
                let activeIdx = Array.from(items).findIndex(i => i.classList.contains('active'));
                items.forEach(i => i.classList.remove('active'));
                activeIdx = (activeIdx - 1 + items.length) % items.length;
                items[activeIdx].classList.add('active');
                items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Escape') {
                hideSuggestions();
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!container?.contains(e.target)) {
                hideSuggestions();
            }
        });

        tagsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                const index = parseInt(e.target.dataset.index);
                removeTag(index);
            }
        });
    }



    function checkSaveAllVisibility() {
        if (currentProjectId && dirtySections.size >= 2) {
            if (saveAllBtn) {
                saveAllBtn.style.display = 'flex';
                saveAllBtn.innerHTML = 'Save All';
            }
        } else {
            if (saveAllBtn) saveAllBtn.style.display = 'none';
        }

        // Always show individual save buttons if a project is selected
        if (currentProjectId) {
            document.querySelectorAll('.submit-btn');
        }
    }

    // Initialize validation clearing for all forms
    document.addEventListener('input', function (e) {
        const target = e.target;
        if (!target.closest('.section-form')) return;

        const container = target.closest('.form-group') || target.parentNode;

        // Mark section as dirty
        const form = target.closest('form.section-form');
        if (form) {
            const section = form.id.replace('form-', '');
            dirtySections.add(section);
            checkSaveAllVisibility();
        }

        // Clear validation messages
        hideFieldError(target);

        // Character limit message handler for 200 char textareas
        if (target.tagName === 'TEXTAREA' && target.maxLength === 200) {
            const container = target.closest('.form-group') || target.parentNode;
            let msg = container.querySelector('.char-limit-msg');

            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'char-limit-msg';
                msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;';
                container.appendChild(msg);
            }

            if (target.value.length >= 200) {
                msg.style.display = 'block';
                msg.textContent = '* Characters are more than 200';
            } else {
                msg.style.display = 'none';
            }
        }
    });
    sectionForms.forEach(form => setupValidation(form));
    function getSectionConfig(formId) {
        if (formId === 'form-hero-section') {
            return [
                { selector: 'input[name="title"]', name: 'title', message: '* Hero title is required' },
                { selector: 'input[name="buiding_name"]', name: 'buiding_name', message: '* Building name is required' },
                { selector: 'input[name="date"]', name: 'date', message: '* Date is required' },
                { selector: 'input[name="location"]', name: 'location', message: '* Location is required' }
            ];
        } else if (formId === 'form-floor-image') {
            return [
                { selector: 'input[name="title"]', name: 'title', message: '* Floor plan title is required' },
                { selector: 'input[name="floorImage"]', name: 'floorImage', message: '* Floor plan image is required', isFile: true }
            ];
        } else if (formId === 'form-amenities-list') {
            return [
                { selector: '#amenitiesDescription', name: 'amenitiesDescription', message: '* Amenities description is required' }
            ];
        } else if (formId === 'form-location-container') {
            return [
                { selector: '#locationDescription', name: 'locationDescription', message: '* Location description is required' },
                { selector: 'input[name="address_text"]', name: 'address_text', message: '* Address is required' },
                { selector: 'input[name="connectivity_text"]', name: 'connectivity_text', message: '* Connectivity is required' },
                { selector: 'input[name="locationImage"]', name: 'locationImage', message: '* Location image is required', isFile: true }
            ];
        } else if (formId === 'form-gallery-wrapper') {
            return [
                { selector: '#galleryDescription', name: 'galleryDescription', message: '* Gallery description is required' }
            ];
        }
        return [];
    }

    function setupValidation(form) {
        const conf = getSectionConfig(form.id);
        conf.forEach(({ selector, name, message, isFile }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            input.addEventListener('input', () => {
                hideFieldError(input);
                checkSaveAllVisibility();
            });

            if (isFile) {
                const fileInput = input.querySelector('input[type="file"]') || input;
                if (fileInput && fileInput !== input) {
                    fileInput.addEventListener('change', () => {
                        hideFieldError(input);
                        checkSaveAllVisibility();
                    });
                }
            }
        });
    }

    function validateForm(form) {
        let isValid = true;
        let firstInvalidElement = null;

        function markInvalid(element, msgSelector, show = true) {
            if (show) {
                isValid = false;
                if (element.classList.contains('invalid-input')) element.classList.remove('invalid-input');
                const container = element.closest('.form-group') || element.parentNode;
                const msg = container.querySelector(msgSelector);
                if (msg) msg.style.display = 'block';
                if (!firstInvalidElement) firstInvalidElement = element;
            } else {

                const container = element.closest('.form-group') || element.parentNode;
                const msg = container.querySelector(msgSelector);
                if (msg) msg.style.display = 'none';
            }
        }

        // 1. Check fields defined in configuration
        const conf = getSectionConfig(form.id);
        conf.forEach(({ selector, name, message, isFile }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            if (isFile) {
                const uploadBtn = input.classList.contains('upload-btn') ? input : input.closest('.form-group')?.querySelector('.upload-btn');
                if (uploadBtn && !uploadBtn.classList.contains('has-image')) {
                    showFieldError(uploadBtn, message);
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = uploadBtn;
                } else if (uploadBtn) {
                    hideFieldError(uploadBtn);
                }
            } else {
                if (!input.value.trim()) {
                    showFieldError(input, message);
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = input;
                } else {
                    hideFieldError(input);
                }
            }
        });

        const allRequired = form.querySelectorAll('input[required]:not([readonly]), textarea[required]:not([readonly]), select[required]:not([disabled])');
        allRequired.forEach(input => {
            // Skip config fields already handled
            const hasName = input.hasAttribute('name');
            if (hasName) {
                const confMatch = conf.find(c => c.name === input.getAttribute('name'));
                if (confMatch) return;
            }

            if (!input.value.trim()) {
                markInvalid(input, '.required-message');
            } else {
                markInvalid(input, '.required-message', false);
            }
        });

        const checkContainer = (containerId, formElement, message) => {
            const container = document.getElementById(containerId);
            const target = container || formElement;

            if (container && container.children.length === 0) {
                showFieldError(target, message || '* At least one item is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = target;
            } else {
                hideFieldError(target);
            }
        };

        if (form.id === 'form-features-grid') {
            checkContainer('featuresContainer', form, '* At least one feature is required');
            const titles = form.querySelectorAll('.feature-title');
            titles.forEach(t => {
                if (!t.value.trim()) {
                    showFieldError(t, '* Feature title is required');
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = t;
                } else {
                    hideFieldError(t);
                }
            });
            const texts = form.querySelectorAll('.feature-text');
            texts.forEach(t => {
                if (!t.value.trim()) {
                    showFieldError(t, '* Feature text is required');
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = t;
                } else {
                    hideFieldError(t);
                }
            });
        }
        if (form.id === 'form-amenities-list') {
            const tagsList = document.getElementById('amenitiesTags');
            if (amenitiesTags.length === 0) {
                showFieldError(tagsList, '* At least one amenity is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = tagsList;
            } else {
                hideFieldError(tagsList);
            }
            const descField = form.querySelector('#amenitiesDescription');
            if (descField && !descField.value.trim()) {
                showFieldError(descField, '* Amenities description is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = descField;
            } else if (descField) {
                hideFieldError(descField);
            }
        }
        if (form.id === 'form-location-container') {
            checkContainer('landmarksContainer', form, '* At least one landmark is required');
            const landmarks = form.querySelectorAll('.landmark-text');
            landmarks.forEach(l => {
                if (!l.value.trim()) {
                    showFieldError(l, '* Landmark text is required');
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = l;
                } else {
                    hideFieldError(l);
                }
            });
            const locDesc = form.querySelector('#locationDescription');
            if (locDesc && !locDesc.value.trim()) {
                showFieldError(locDesc, '* Location description is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = locDesc;
            } else if (locDesc) {
                hideFieldError(locDesc);
            }
        }
        if (form.id === 'form-faq-items-container') {
            checkContainer('faqContainer', form);
            const questions = form.querySelectorAll('.faq-question');
            questions.forEach(q => {
                if (!q.value.trim()) {
                    showFieldError(q, '* Question is required');
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = q;
                } else {
                    hideFieldError(q);
                }
            });
            const answers = form.querySelectorAll('.faq-answer');
            answers.forEach(a => {
                if (!a.value.trim()) {
                    showFieldError(a, '* Answer is required');
                    isValid = false;
                    if (!firstInvalidElement) firstInvalidElement = a;
                } else {
                    hideFieldError(a);
                }
            });
        }

        // 4. Comprehensive Gallery Validation
        if (form.id === 'form-gallery-wrapper') {
            const galleryLayout = form.querySelector('.gallery-layout');
            const galleryDesc = form.querySelector('#galleryDescription');

            if (galleryDesc && !galleryDesc.value.trim()) {
                showFieldError(galleryDesc, '* Gallery description is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = galleryDesc;
            } else if (galleryDesc) {
                hideFieldError(galleryDesc);
            }

            if (galleryItems.length === 0) {
                showFieldError(galleryLayout, '* At least one gallery item is required');
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = galleryLayout;
            } else {
                hideFieldError(galleryLayout);

                // Check EVERY item in galleryItems
                let firstInvalidGalleryIndex = -1;

                galleryItems.forEach((item, idx) => {
                    let itemValid = true;
                    if (!item.title.trim()) itemValid = false;
                    if (!item.text.trim()) itemValid = false;
                    if (!item.coverImage && !item.file) itemValid = false;

                    if (!itemValid && firstInvalidGalleryIndex === -1) {
                        firstInvalidGalleryIndex = idx;
                    }
                });

                if (firstInvalidGalleryIndex !== -1) {
                    isValid = false;
                    // Switch to the first invalid gallery item
                    showGalleryItem(firstInvalidGalleryIndex);

                    // Now highlight fields in the active card (which is now the invalid one)
                    const activeCard = form.querySelector('.gallery-card');
                    if (activeCard) {
                        const title = activeCard.querySelector('.gallery-title');
                        const text = activeCard.querySelector('.gallery-text');
                        const uploadBtn = activeCard.querySelector('.upload-btn');

                        if (!title.value.trim()) showFieldError(title, '* Gallery name is required');
                        if (!text.value.trim()) showFieldError(text, '* Gallery text is required');
                        if (!uploadBtn.classList.contains('has-image')) {
                            showFieldError(uploadBtn, '* Image is required');
                            if (!firstInvalidElement) firstInvalidElement = uploadBtn;
                        }
                    }
                }
            }
        }

        if (!isValid) {
            // Switch to this form's tab
            const section = form.id.replace('form-', '');
            const tab = document.querySelector(`.tab-btn[data-section="${section}"]`);
            if (tab && !tab.classList.contains('active')) {
                sectionTabs.forEach(t => t.classList.remove('active'));
                sectionForms.forEach(f => f.classList.remove('active'));
                tab.classList.add('active');
                form.classList.add('active');
            }

            // Scroll to the first invalid element
            if (firstInvalidElement) {
                firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidElement.focus();
            }
        }
        return isValid;
    }




    async function fetchProjects() {
        try {
            const [upcomingRes, completedRes] = await Promise.all([
                fetch('/admin/upcoming/getupcoming').then(res => res.json()),
                fetch('/admin/completed/getcompleted').then(res => res.json())
            ]);

            // Extract data from response - API returns { data: [...] }
            projectData.upcoming = upcomingRes.data?.map((project, index) => ({
                ...project,
                id: (project.project_id || project._id).toString(),
                project_name: project.project_name || 'Untitled Project',
                project_location: project.project_location || 'Location not specified',
                project_status: project.project_status || project.project_date || '',
                pimage: project.pimage || project.card_image || '',
                isSeeded: !!project.isSeeded
            })) || [];

            projectData.completed = completedRes.data?.map((project, index) => ({
                ...project,
                id: (project.project_id || project._id).toString(),
                project_name: project.project_name || 'Untitled Project',
                project_location: project.project_location || 'Location not specified',
                project_status: project.project_status || project.project_date || '',
                pimage: project.pimage || project.card_image || '',
                isSeeded: !!project.isSeeded
            })) || [];
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    projectTypeSelect.addEventListener('change', function () {
        const type = this.value;
        selectProjectSelect.disabled = false;
        selectProjectSelect.innerHTML = '<option value="" disabled selected>Select Project</option>';

        const projects = projectData[type] || [];
        projects.forEach(proj => {
            const opt = document.createElement('option');
            opt.value = proj.id || proj.project_id;
            opt.textContent = `${proj.project_name} - ${proj.project_location}`;
            selectProjectSelect.appendChild(opt);
        });

        // Hide forms and clear state when type changes
        if (detailsFormContainer) detailsFormContainer.style.display = 'none';
        if (sectionTabsContainer) sectionTabsContainer.style.display = 'none';
        currentProjectId = null;
        currentProjectType = null;
    });

    selectProjectSelect.addEventListener('change', function () {
        const projectId = this.value;
        const type = projectTypeSelect.value;
        if (projectId && type) {
            handleProjectSelection(projectId, type);
        }
    });

    sectionTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetSection = this.dataset.section;
            sectionTabs.forEach(t => t.classList.remove('active'));
            sectionForms.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            const targetForm = document.getElementById(`form-${targetSection}`);
            if (targetForm) targetForm.classList.add('active');
        });
    });

    async function handleProjectSelection(projectId, type) {
        currentProjectId = projectId;
        currentProjectType = type;

        if (sectionTabsContainer) sectionTabsContainer.style.display = 'flex';
        if (detailsFormContainer) detailsFormContainer.style.display = 'block';

        sectionTabs.forEach(t => t.classList.remove('active'));
        sectionForms.forEach(f => f.classList.remove('active'));

        const firstTab = document.querySelector('.tab-btn[data-section="hero-section"]');
        const firstForm = document.getElementById('form-hero-section');
        if (firstTab) firstTab.classList.add('active');
        if (firstForm) firstForm.classList.add('active');

        activeGalleryIndex = -1;
        loadProjectDetails(projectId, true);
        dirtySections.clear();
        checkSaveAllVisibility();
    }

    function getSelectedProjectData(type, id) {
        if (!type || !id || !projectData[type]) return null;
        return projectData[type].find(p => (p.id || p.project_id) == id);
    }

    async function loadProjectDetails(projectId, isFullReload = false) {
        try {
            if (isFullReload) {
                dirtySections.clear();
                checkSaveAllVisibility();
            }
            fetchUniqueAmenities();
            const response = await fetch(`/admin/projectDetails/getdetails/${projectId}`);
            const res = await response.json();
            if (res.success) {
                populateAllForms(res.data, isFullReload);
            }
        } catch (error) {
            console.error('Error loading project details:', error);
        }
    }

    function populateAllForms(data, isFullReload = false) {
        // Show Tabs and Form Container (Reinforce visibility)
        if (sectionTabsContainer) sectionTabsContainer.style.display = 'flex';
        if (detailsFormContainer) detailsFormContainer.style.display = 'block';
        sectionTabs.forEach(tab => tab.style.display = 'block');

        // Hero Form
        const heroSection = 'hero-section';
        if (!isFullReload && dirtySections.has(heroSection)) {
        } else {
            const form = document.getElementById('form-' + heroSection);
            const project = getSelectedProjectData(currentProjectType, currentProjectId);

            if (data.hero && Object.keys(data.hero).length > 0) {
                const titleInput = form.querySelector('[name="title"]');
                const buildingInput = form.querySelector('[name="buiding_name"]');
                const dateInput = form.querySelector('[name="date"]');
                const locationInput = form.querySelector('[name="location"]');

                if (titleInput) titleInput.value = data.hero.title || (project ? project.project_name : '');
                if (buildingInput) buildingInput.value = data.hero.buiding_name || (project ? project.project_name : '');
                if (dateInput) {
                    const fallbackDate = project ? (project.project_date || project.project_status || '') : '';
                    dateInput.value = formatDateForInput(data.hero.date) || formatDateForInput(fallbackDate);
                }
                if (locationInput) locationInput.value = data.hero.location || (project ? project.project_location : '');
                updatePreview(form, data.hero.pimage);
            } else if (project) {
                // Pre-fill ONLY readonly identity fields. Clear editable fields.
                const titleInput = form.querySelector('[name="title"]');
                const buildingInput = form.querySelector('[name="buiding_name"]');
                const dateInput = form.querySelector('[name="date"]');
                const locationInput = form.querySelector('[name="location"]');

                if (titleInput) titleInput.value = ''; // Clear title
                if (buildingInput) buildingInput.value = project.project_name || '';
                if (dateInput) {
                    const d = project ? (project.project_date || project.project_status || '') : '';
                    dateInput.value = formatDateForInput(d);
                }
                if (locationInput) locationInput.value = project.project_location || '';
                updatePreview(form, project.pimage || project.card_image || null);
            }

            // Disable Hero Section Image Upload
            const heroUploadBtn = document.getElementById('heroImageBtn');
            if (heroUploadBtn) {
                heroUploadBtn.classList.add('disabled');
                const fileInput = heroUploadBtn.querySelector('input[type="file"]');
                if (fileInput) fileInput.disabled = true;
            }
        }

        // Floor Image Form
        const floorSection = 'floor-image';
        if (!isFullReload && dirtySections.has(floorSection)) {
        } else {
            const floorForm = document.getElementById('form-' + floorSection);
            if (data.floor && Object.keys(data.floor).length > 0) {
                const titleInput = floorForm.querySelector('[name="title"]');
                if (titleInput) titleInput.value = data.floor.title || '';
                updatePreview(floorForm, data.floor.image || data.floor.floor_image);
            } else {
                const titleInput = floorForm.querySelector('[name="title"]');
                if (titleInput) titleInput.value = '';

                updatePreview(floorForm, null);
            }
        }

        // Features Grid Form
        const featuresSection = 'features-grid';
        if (!isFullReload && dirtySections.has(featuresSection)) {
        } else {
            const featuresContainer = document.getElementById('featuresContainer');
            featuresContainer.innerHTML = '';
            if (data.features && data.features.length > 0) {
                data.features.forEach(feat => {
                    const title = feat.feature || feat.title || '';
                    const text = feat.description || feat.text || '';
                    const row = createFeatureRow(title, text);
                    featuresContainer.appendChild(row);
                });
            } else {
                featuresContainer.appendChild(createFeatureRow());
            }
        }

        // Amenities List Form
        const amenitiesSection = 'amenities-list';
        if (!isFullReload && dirtySections.has(amenitiesSection)) {
        } else {
            const amenitiesForm = document.getElementById('form-' + amenitiesSection);
            const descField = amenitiesForm.querySelector('#amenitiesDescription');

            if (data.amenities && data.amenities.length > 0) {
                amenitiesTags.length = 0; // Clear without breaking reference

                data.amenities.forEach(am => {
                    if (am.features_Description) {
                        if (descField) descField.value = am.features_Description;
                    } else {
                        const text = am.feature || am.text || am.title;
                        if (text && !amenitiesTags.includes(text)) {
                            amenitiesTags.push(text);
                        }
                    }
                });

                // Re-render tags
                const tagsList = document.getElementById('amenitiesTags');
                const hiddenInput = document.getElementById('amenitiesHiddenInput');
                if (tagsList) {
                    tagsList.innerHTML = '';
                    amenitiesTags.forEach((tag, index) => {
                        const tagEl = document.createElement('div');
                        tagEl.className = 'tag';
                        tagEl.innerHTML = `
                            <span class="tag-text">${tag}</span>
                            <button type="button" class="tag-remove" data-index="${index}">×</button>
                        `;
                        tagsList.appendChild(tagEl);
                    });
                }
                if (hiddenInput) hiddenInput.value = JSON.stringify(amenitiesTags);

                // Hide validation message when data is loaded
                const msg = amenitiesForm.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            } else {
                // Clear Amenities Form
                if (descField) descField.value = '';

                amenitiesTags.length = 0;

                // Re-render empty tags
                const tagsList = document.getElementById('amenitiesTags');
                const hiddenInput = document.getElementById('amenitiesHiddenInput');
                if (tagsList) tagsList.innerHTML = '';
                if (hiddenInput) hiddenInput.value = JSON.stringify(amenitiesTags);

                // Validation message will be handled by validateForm or next user action
                const msg = amenitiesForm.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            }
        }

        // Location Container Form
        const locationSection = 'location-container';
        if (!isFullReload && dirtySections.has(locationSection)) {
        } else {
            const locationForm = document.getElementById('form-' + locationSection);
            if (data.location && data.location.length > 0) {
                const descField = locationForm.querySelector('#locationDescription');
                if (descField && data.location[0].location_Description) {
                    descField.value = data.location[0].location_Description;
                }
                if (data.location[1] && data.location[1].image) {
                    updatePreview(locationForm, data.location[1].image);
                }
                if (data.location[2] && data.location[2].details) {
                    const details = data.location[2].details;
                    const addressDetail = details.find(d => d.type === 'address');
                    const connectivityDetail = details.find(d => d.type === 'connectivity');
                    const landmarksDetail = details.find(d => d.type === 'landmarks');

                    if (addressDetail) locationForm.querySelector('[name="address_text"]').value = addressDetail.text || '';
                    if (connectivityDetail) locationForm.querySelector('[name="connectivity_text"]').value = connectivityDetail.text || '';

                    const landmarksContainer = document.getElementById('landmarksContainer');
                    landmarksContainer.innerHTML = '';
                    if (landmarksDetail && landmarksDetail.list) {
                        landmarksDetail.list.forEach(landmark => {
                            const row = createLandmarkRow(landmark);
                            landmarksContainer.appendChild(row);
                        });
                    }
                }
            } else {
                // Clear Location Form
                const descField = locationForm.querySelector('#locationDescription');
                if (descField) descField.value = '';

                updatePreview(locationForm, null);

                locationForm.querySelector('[name="address_text"]').value = '';
                locationForm.querySelector('[name="connectivity_text"]').value = '';

                const landmarksContainer = document.getElementById('landmarksContainer');
                if (landmarksContainer) {
                    landmarksContainer.innerHTML = '';
                    // Default to one empty row for new/empty projects
                    landmarksContainer.appendChild(createLandmarkRow());
                }
            }
        }

        // Gallery Form
        const gallerySection = 'gallery-wrapper';
        if (!isFullReload && dirtySections.has(gallerySection)) {
        } else {
            const galleryForm = document.getElementById('form-' + gallerySection);
            if (data.gallery && data.gallery.length > 0) {
                const descField = galleryForm.querySelector('#galleryDescription');
                if (descField && data.gallery[0].gallery_Description) {
                    descField.value = data.gallery[0].gallery_Description;
                }

                // Re-populate galleryItems from data (skip description header at index 0 if it exists)
                galleryItems = [];
                const items = data.gallery.slice(1); // Assuming index 0 is the gallery_Description record
                items.forEach((gal, idx) => {
                    galleryItems.push({
                        id: 'gal_' + Date.now() + '_' + idx,
                        title: gal.title || '',
                        text: gal.text || '',
                        coverImage: gal.coverImage || '',
                        file: null
                    });
                });

                renderGalleryList();
                if (galleryItems.length > 0) {
                    showGalleryItem(0);
                } else {
                    showNoItemsPlaceholder();
                }
                checkSaveAllVisibility();
            } else {
                const descField = galleryForm.querySelector('#galleryDescription');
                if (descField) descField.value = '';

                galleryItems = [];

                // Default to one empty gallery item
                const newItem = {
                    id: 'gal_' + Date.now(),
                    title: '',
                    text: '',
                    coverImage: '',
                    file: null
                };
                galleryItems.push(newItem);

                renderGalleryList();

                // If activeGalleryIndex is valid (e.g. after save), use it. Otherwise default to 0.
                if (activeGalleryIndex >= 0 && activeGalleryIndex < galleryItems.length) {
                    showGalleryItem(activeGalleryIndex);
                } else if (galleryItems.length > 0) {
                    showGalleryItem(0);
                } else {
                    showGalleryItem(0); // Should have at least one item from above check
                }

                checkSaveAllVisibility();
            }
        }

        // FAQ Form
        const faqSection = 'faq-items-container';
        if (!isFullReload && dirtySections.has(faqSection)) {
        } else {
            const faqContainer = document.getElementById('faqContainer');
            faqContainer.innerHTML = '';
            if (data.faq && data.faq.length > 0) {
                data.faq.forEach(faqItem => {
                    const question = faqItem.question || '';
                    const answer = faqItem.answer || '';
                    const row = createFaqRow(question, answer);
                    faqContainer.appendChild(row);
                });
            } else {
                // Default to one empty row for new/empty projects
                faqContainer.appendChild(createFaqRow());
            }
        }
    }

    function formatDateForInput(dateString) {
        if (!dateString) return '';

        // Handle dash-separated formats like DD-MM-YYYY or D-M-YYYY
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split('-');
            const paddedDay = day.padStart(2, '0');
            const paddedMonth = month.padStart(2, '0');
            return `${year}-${paddedMonth}-${paddedDay}`;
        }

        const d = dayjs(dateString);
        if (!d.isValid()) return '';
        return d.format('YYYY-MM-DD');
    }

    function updatePreview(form, src) {
        const uploadBtn = form.querySelector('.upload-btn');
        if (!uploadBtn) return;

        const fileInput = uploadBtn.querySelector('.image-upload');
        const uploadIcon = uploadBtn.querySelector('.upload-icon');
        const uploadText = uploadBtn.querySelector('.upload-text');
        const uploadSubtext = uploadBtn.querySelector('.upload-subtext');
        let preview = uploadBtn.querySelector('.uploaded-image');

        if (src) {
            // SHOW IMAGE
            const previewHTML = `
                <div class="uploaded-image">
                    <img src="${src}" alt="Uploaded image">
                    <button class="remove-image" type="button">
                        <span class="material-symbols-outlined">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#ffffff"/>
                            </svg>
                        </span>
                    </button>
                </div>
            `;

            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadText) uploadText.style.display = 'none';
            if (uploadSubtext) uploadSubtext.style.display = 'none';

            if (preview) {
                preview.querySelector('img').src = src;
            } else {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = previewHTML;
                fileInput.parentNode.insertBefore(tempDiv.firstElementChild, fileInput);
            }

            uploadBtn.classList.add('has-image');

            // Add event listener to new remove button
            const removeBtn = uploadBtn.querySelector('.remove-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', (event) => {
                    removeImage(removeBtn, event);
                });
            }

        } else {
            // CLEAR IMAGE
            if (preview) preview.remove();

            if (uploadIcon) uploadIcon.style.display = '';
            if (uploadText) uploadText.style.display = 'block';
            if (uploadSubtext) uploadSubtext.style.display = 'block';

            uploadBtn.classList.remove('has-image');
            if (fileInput) fileInput.value = ''; // Reset file input
        }
    }

    function createFeatureRow(title = '', text = '') {
        const div = document.createElement('div');
        div.className = 'feature-row';
        div.innerHTML = `
            <div class="form-group">
                <input type="text" class="feature-title" placeholder="Feature Title" value="${title}" required>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Feature title is required</div>
            </div>
            <div class="form-group">
                <textarea class="feature-text" placeholder="Feature Text" rows="3" maxlength="200" required>${text}</textarea>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Feature text is required</div>
                <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Characters are more than 200</div>
            </div>
            <button type="button" class="delete-row-btn">
                <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                    </svg>
            </button>
        `;
        // Add listeners to clear validation on input
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', function () {
                const container = this.closest('.form-group');
                const msg = container.querySelector('.required-message');
                if (msg) msg.style.display = 'none';
            });
        });

        div.querySelector('.delete-row-btn').addEventListener('click', function () {
            const container = this.closest('#featuresContainer');
            this.parentElement.remove();
            if (container && container.children.length > 0) {
                const msg = container.closest('form')?.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            }
            dirtySections.add('features-grid');
            checkSaveAllVisibility();
        });
        return div;
    }

    function createAmenityRow(text = '') {
        const div = document.createElement('div');
        div.className = 'amenity-row';
        div.innerHTML = `
            <div class="form-group" style="flex: 1;">
                <input type="text" class="amenity-text" placeholder="Amenity Text" value="${text}" required>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Amenity text is required</div>
            </div>
            <button type="button" class="delete-row-btn">
                <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                    </svg>
            </button>
        `;
        // Add listeners to clear validation on input
        const input = div.querySelector('input');
        input.addEventListener('input', function () {
            const container = this.closest('.form-group');
            const msg = container.querySelector('.required-message');
            if (msg) msg.style.display = 'none';
        });

        div.querySelector('.delete-row-btn').addEventListener('click', function () {
            const container = this.closest('#amenitiesContainer');
            this.parentElement.remove();
            if (container && container.children.length > 0) {
                const msg = container.closest('form')?.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            }
            checkSaveAllVisibility();
        });
        return div;
    }

    function createLandmarkRow(text = '') {
        const div = document.createElement('div');
        div.className = 'landmark-row';
        div.innerHTML = `
            <div class="form-group" style="flex: 1;">
                <input type="text" class="landmark-text" placeholder="Landmark" value="${text}" required>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Landmark is required</div>
            </div>
            <button type="button" class="delete-row-btn">
                <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                    </svg>
            </button>
        `;
        // Add listeners to clear validation on input
        const input = div.querySelector('input');
        input.addEventListener('input', function () {
            const container = this.closest('.form-group');
            const msg = container.querySelector('.required-message');
            if (msg) msg.style.display = 'none';
        });

        div.querySelector('.delete-row-btn').addEventListener('click', function () {
            const container = this.closest('#landmarksContainer');
            this.parentElement.remove();
            if (container && container.children.length > 0) {
                const msg = container.closest('form')?.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            }
            dirtySections.add('location-container');
            checkSaveAllVisibility();
        });
        return div;
    }

    function createFaqRow(question = '', answer = '') {
        const div = document.createElement('div');
        div.className = 'faq-row';
        div.innerHTML = `
            <div class="form-group">
                <input type="text" class="faq-question" placeholder="Question" value="${question}" required>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Question is required</div>
            </div>
            <div class="form-group">
                <textarea class="faq-answer" placeholder="Answer" rows="3" maxlength="200" required>${answer}</textarea>
                <div class="required-message" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Answer is required</div>
                <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Characters are more than 200</div>
            </div>
            <button type="button" class="delete-row-btn">
                <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                    </svg>
            </button>
        `;
        // Add listeners to clear validation on input
        div.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', function () {
                const container = this.closest('.form-group');
                const msg = container.querySelector('.required-message');
                if (msg) msg.style.display = 'none';
            });
        });

        div.querySelector('.delete-row-btn').addEventListener('click', function () {
            const container = this.closest('#faqContainer');
            this.parentElement.remove();
            if (container && container.children.length > 0) {
                const msg = container.closest('form')?.querySelector('.required-container-message');
                if (msg) msg.style.display = 'none';
            }
            dirtySections.add('faq-items-container');
            checkSaveAllVisibility();
        });
        return div;
    }

    function createGalleryCard(item, index) {
        const div = document.createElement('div');
        div.className = 'gallery-card';
        div.dataset.index = index;

        const uniqueId = item.id;
        const fileInputName = `gallery_${uniqueId}`;

        // Preview HTML if image exists
        let previewHTML = '';
        let hasImageClass = '';
        let uploadContentStyle = '';

        const displayImage = item.coverImage || '';

        if (displayImage) {
            hasImageClass = 'has-image';
            uploadContentStyle = 'display: none;';
            previewHTML = `
                <div class="uploaded-image">
                    <img src="${displayImage}" alt="Uploaded image">
                    <button class="remove-image" type="button">
                        <span class="material-symbols-outlined">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="#ffffff"/>
                            </svg>
                        </span>
                    </button>
                </div>
            `;
        }

        div.innerHTML = `
            <button type="button" class="delete-card-btn">
                <span class="material-symbols-outlined" style="font-size: 18px;">
                    <svg width="17" height="17" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                    </svg>
                </span>
            </button>
            
            <div class="form-group">
                <label class="form-label">Gallery Item Name</label>
                <input type="text" class="form-input gallery-title" placeholder="e.g. Living Room View" value="${item.title || ''}" required>
                <div class="required-message" data-for="title" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Gallery item name is required</div>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea gallery-text" placeholder="Explain this image..." rows="3" maxlength="200" required>${item.text || ''}</textarea>
                <div class="required-message" data-for="text" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Description is required</div>
                <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Characters are more than 200</div>
            </div>

            <div class="form-group">
                <label class="form-label">Image</label>
                <div class="upload-btn ${hasImageClass}">
                    <div class="upload-icon" style="${uploadContentStyle}">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                        </svg>
                    </div>
                    <p class="upload-text" style="${uploadContentStyle}">Upload Image</p>
                    <p class="upload-subtext" style="${uploadContentStyle}">JPG, PNG (max. 2MB)</p>
                    <input type="file" class="image-upload gallery-file" name="${fileInputName}" accept="image/*" style="display: none;">
                    ${previewHTML}
                </div>
                <div class="required-message-file" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;">* Image is required</div>
            </div>
        `;

        // Sync inputs back to state
        div.querySelector('.gallery-title').addEventListener('input', function () {
            galleryItems[activeGalleryIndex].title = this.value;
            const container = this.closest('.form-group');
            if (container) {
                const msg = container.querySelector('.required-message');
                if (msg) msg.style.display = 'none';
            }
            renderGalleryList();
            dirtySections.add('gallery-wrapper');
            checkSaveAllVisibility();
        });

        div.querySelector('.gallery-text').addEventListener('input', function () {
            galleryItems[activeGalleryIndex].text = this.value;
            const container = this.closest('.form-group');
            if (container) {
                const msg = container.querySelector('.required-message');
                if (msg) msg.style.display = 'none';
                const charLimitMsg = container.querySelector('.char-limit-msg');
                if (charLimitMsg) {
                    if (this.value.length >= 200) {
                        charLimitMsg.style.display = 'block';
                    } else {
                        charLimitMsg.style.display = 'none';
                    }
                }
            }
            dirtySections.add('gallery-wrapper');
            checkSaveAllVisibility();
        });

        div.querySelector('.delete-card-btn').addEventListener('click', () => {
            deleteGalleryItem(activeGalleryIndex);
        });

        // Add event listener to the existing remove button if it exists
        const removeBtn = div.querySelector('.remove-image');
        if (removeBtn) {
            removeBtn.addEventListener('click', (event) => {
                removeImage(removeBtn, event);
            });
        }

        return div;
    }

    function renderGalleryList() {
        const list = document.getElementById('gallerySidebarList');
        if (!list) return;
        list.innerHTML = '';

        galleryItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `added-item ${index === activeGalleryIndex ? 'active' : ''}`;
            div.innerHTML = `
                <div class="item-preview">
                    <div class="item-image" style="background-image: url('${item.coverImage || ''}')"></div>
                    <div class="item-details">
                        <p class="item-name">${item.title || '(No name)'}</p>
                        <p class="item-project">Gallery Item ${index + 1}</p>
                    </div>
                </div>
            `;
            div.addEventListener('click', () => showGalleryItem(index));
            list.appendChild(div);
        });
    }

    function showGalleryItem(index) {
        activeGalleryIndex = index;
        const container = document.getElementById('galleryCardContainer');
        container.innerHTML = '';
        const card = createGalleryCard(galleryItems[index], index);
        container.appendChild(card);
        renderGalleryList();
    }

    function showNoItemsPlaceholder() {
        activeGalleryIndex = -1;
        const container = document.getElementById('galleryCardContainer');
        container.innerHTML = `
            <div class="no-items-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999;">
                <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 10px;">photo_library</span>
                <p>Select an item or click "Add Item" to begin.</p>
            </div>
        `;
    }

    function deleteGalleryItem(index) {
        Swal.fire({
            title: 'Delete this item?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                galleryItems.splice(index, 1);
                if (galleryItems.length > 0) {
                    showGalleryItem(0);
                } else {
                    showNoItemsPlaceholder();
                }
                renderGalleryList();
                dirtySections.add('gallery-wrapper');
                checkSaveAllVisibility();
            }
        });
    }

    document.getElementById('addFeatureBtn')?.addEventListener('click', () => {
        const container = document.getElementById('featuresContainer');
        const newRow = createFeatureRow();
        container.appendChild(newRow);
        const msg = container.closest('form')?.querySelector('.required-container-message');
        if (msg) msg.style.display = 'none';
        dirtySections.add('features-grid');
        checkSaveAllVisibility();
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('addLandmarkBtn')?.addEventListener('click', () => {
        const container = document.getElementById('landmarksContainer');
        const newRow = createLandmarkRow();
        container.appendChild(newRow);
        const msg = container.closest('form')?.querySelector('.required-container-message');
        if (msg) msg.style.display = 'none';
        dirtySections.add('location-container');
        checkSaveAllVisibility();
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('addGalleryBtn')?.addEventListener('click', () => {
        const newItem = {
            id: 'gal_' + Date.now(),
            title: '',
            text: '',
            coverImage: '',
            file: null
        };
        galleryItems.push(newItem);
        showGalleryItem(galleryItems.length - 1);
        const msg = document.getElementById('form-gallery-wrapper')?.querySelector('.required-container-message');
        if (msg) msg.style.display = 'none';
        dirtySections.add('gallery-wrapper');
        checkSaveAllVisibility();

        // Scroll the card into view
        const card = document.querySelector('#galleryCardContainer .form-group');
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    document.getElementById('addFaqBtn')?.addEventListener('click', () => {
        const container = document.getElementById('faqContainer');
        const newRow = createFaqRow();
        container.appendChild(newRow);
        const msg = container.closest('form')?.querySelector('.required-container-message');
        if (msg) msg.style.display = 'none';
        dirtySections.add('faq-items-container');
        checkSaveAllVisibility();
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    async function submitSectionForm(form, quiet = false) {
        const section = form.id.replace('form-', '');
        const formData = new FormData();
        formData.append('projectId', currentProjectId);
        formData.append('projectType', currentProjectType);
        formData.append('section', section);

        let pageContent = [];

        if (section === 'hero-section') {
            const titleVal = form.querySelector('[name="title"]')?.value || '';
            const bnameVal = form.querySelector('[name="buiding_name"]')?.value || '';
            const dateVal = form.querySelector('[name="date"]')?.value || '';
            const locVal = form.querySelector('[name="location"]')?.value || '';
            const existingHero = form.querySelector('.uploaded-image img')?.src;

            pageContent.push({
                title: titleVal,
                buiding_name: bnameVal,
                date: dateVal,
                location: locVal,
                pimage: existingHero || ''
            });
            const heroInput = form.querySelector('[name="heroImage"]');
            const heroFile = heroInput ? heroInput.files[0] : null;
            if (heroFile) formData.append('heroImage', heroFile);
        } else if (section === 'floor-image') {
            const titleVal = form.querySelector('[name="title"]')?.value || '';
            const existingFloor = form.querySelector('.uploaded-image img')?.src;
            pageContent.push({ title: titleVal, floor_image: existingFloor || '' });
            const floorInput = form.querySelector('[name="floorImage"]');
            const floorFile = floorInput ? floorInput.files[0] : null;
            if (floorFile) formData.append('floorImage', floorFile);
        } else if (section === 'features-grid') {
            const rows = Array.from(document.querySelectorAll('#featuresContainer .feature-row'));
            rows.forEach(row => {
                const titleEl = row.querySelector('.feature-title');
                const textEl = row.querySelector('.feature-text');
                if (titleEl && textEl) {
                    pageContent.push({
                        feature: titleEl.value,
                        description: textEl.value
                    });
                }
            });
        } else if (section === 'amenities-list') {
            const desc = document.getElementById('amenitiesDescription')?.value;
            pageContent.push({ features_Description: desc });
            amenitiesTags.forEach(tag => {
                pageContent.push({ feature: tag });
            });
        } else if (section === 'location-container') {
            const desc = document.getElementById('locationDescription').value;
            pageContent.push({ location_Description: desc });

            const locInput = form.querySelector('.image-upload');
            const locFile = locInput ? locInput.files[0] : null;
            const existingLoc = form.querySelector('.uploaded-image img')?.src;
            pageContent.push({ image: existingLoc || '' }); // Placeholder or existing

            pageContent.push({
                details: [
                    { type: 'address', title: 'Address', text: form.querySelector('[name="address_text"]').value, svg: { path: ["M17 9C17 13.993 11.461 19.193 9.601 20.799M9 12C10.6569 12 12 10.6569 12 9"], viewBox: "0 0 18 22" } },
                    { type: 'connectivity', title: 'Connectivity', text: form.querySelector('[name="connectivity_text"]').value, svg: { path: ["M17 1L6 12L1 7"], viewBox: "0 0 18 13" } },
                    { type: 'landmarks', title: 'Nearby Landmarks', list: Array.from(document.querySelectorAll('#landmarksContainer .landmark-text')).map(i => i.value), svg: { path: ["M5 21V3"], viewBox: "0 0 22 22" } }
                ]
            });
            if (locFile) formData.append('locationImage', locFile);
        }
        else if (section === 'gallery-wrapper') {
            const desc = document.getElementById('galleryDescription').value;
            pageContent.push({ gallery_Description: desc });
            galleryItems.forEach((item, idx) => {
                const fieldName = `gallery_item_${idx}`;
                pageContent.push({
                    title: item.title,
                    text: item.text,
                    coverImage: item.coverImage,
                    fieldName: fieldName
                });
                if (item.file) {
                    formData.append(fieldName, item.file);
                }
            });
        }
        else if (section === 'faq-items-container') {
            const rows = Array.from(document.querySelectorAll('#faqContainer .faq-row'));
            rows.forEach(row => {
                const questionEl = row.querySelector('.faq-question');
                const answerEl = row.querySelector('.faq-answer');
                if (questionEl && answerEl) {
                    pageContent.push({
                        question: questionEl.value,
                        answer: answerEl.value
                    });
                }
            });
        }

        formData.append('pageContent', JSON.stringify(pageContent));

        try {
            const response = await fetch('/admin/projectDetails/save', {
                method: 'POST',
                body: formData
            });
            const res = await response.json();

            if (res.success) {
                dirtySections.delete(section);
                checkSaveAllVisibility();
                if (!quiet) {
                    Swal.fire('Success', res.message || 'content saved', 'success');
                    loadProjectDetails(currentProjectId);
                }
            }
            return res;
        } catch (error) {
            console.error(`Error saving section ${section}:`, error);
            if (!quiet) {
                Swal.fire('Error', res?.message || 'An error occurred while saving.', 'error');
            }
            throw error;
        }
    }

    async function saveAllSections() {
        // Validate ALL modified sections
        let firstInvalidForm = null;
        for (const form of sectionForms) {
            if (!validateForm(form)) {
                if (!firstInvalidForm) firstInvalidForm = form;
            }
        }

        if (firstInvalidForm) {
            // Re-validate to focus/scroll to error
            validateForm(firstInvalidForm);
            return;
        }

        // Identify which forms need saving
        const formsToSave = Array.from(sectionForms).filter(form => {
            const section = form.id.replace('form-', '');
            return dirtySections.has(section);
        });

        if (formsToSave.length === 0) {
            Swal.fire('No Changes', 'no changes is detected', 'info');
            return;
        }

        Swal.fire({
            title: 'Saving Modified Sections',
            text: 'Please wait...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const savePromises = formsToSave.map(form => submitSectionForm(form, true));
            const results = await Promise.all(savePromises);

            // Determine if any operation was a "save" (new content)
            const hasNewContent = results.some(res => res.message === 'Content saved');
            const successMessage = hasNewContent ? 'Content saved' : 'Content updated';

            Swal.fire('Success', successMessage, 'success');

            // Clear dirty flags after successful save
            dirtySections.clear();
            checkSaveAllVisibility(); // Hide button

            // Reload to refresh data
            loadProjectDetails(currentProjectId);
        } catch (error) {
            console.error('Error saving sections:', error);
            Swal.fire('Error', 'An error occurred while saving the sections.', 'error');
        }
    }

    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllSections);
    }

    document.querySelectorAll('.section-form').forEach(form => {
        form.onsubmit = async function (e) {
            e.preventDefault();

            // Validate first
            if (!validateForm(this)) {
                return;
            }

            const section = this.id.replace('form-', '');
            if (!dirtySections.has(section)) {
                Swal.fire('No Changes', 'no changes is detected', 'info');
                return;
            }

            await submitSectionForm(this);
        };
    });

    // Image Upload Handler (Standard pattern from gallery.js)
    function handleImageUpload(file, uploadBtn) {
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                text: `${file.name} is too large. Max size is 2MB.`,
                confirmButtonColor: '#BC5322'
            });
            return;
        } else {
            const sizeMsg = uploadBtn.parentNode.querySelector('.file-size-error');
            if (sizeMsg) sizeMsg.style.display = 'none';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
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

            const uploadIcon = uploadBtn.querySelector('.upload-icon');
            const uploadText = uploadBtn.querySelector('.upload-text');
            const uploadSubtext = uploadBtn.querySelector('.upload-subtext');

            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadText) uploadText.style.display = 'none';
            if (uploadSubtext) uploadSubtext.style.display = 'none';

            // Hide the file error message if it exists
            const fileMsg = uploadBtn.parentNode.querySelector('.required-message-file');
            if (fileMsg) fileMsg.style.display = 'none';

            // Add or update preview
            let preview = uploadBtn.querySelector('.uploaded-image');
            if (preview) {
                preview.querySelector('img').src = e.target.result;
            } else {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = previewHTML;
                fileInput.parentNode.insertBefore(tempDiv.firstElementChild, fileInput);
            }

            uploadBtn.classList.add('has-image');

            const sectionForm = uploadBtn.closest('form');
            if (sectionForm) {
                dirtySections.add(sectionForm.id.replace('form-', ''));
            }
            checkSaveAllVisibility();

            if (sectionForm && sectionForm.id === 'form-hero-section') {
                const bgPreview = document.getElementById('preview-hero-bg');
                if (bgPreview) bgPreview.src = e.target.result;
            }

            // If this is a gallery item, update its state
            if (uploadBtn.closest('.gallery-card')) {
                const item = galleryItems[activeGalleryIndex];
                item.file = file;
                item.coverImage = e.target.result;
                renderGalleryList();
            }

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

    // Remove Image Handler (Standard pattern from gallery.js)
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

        // Also clear hero preview if this is the hero form
        const sectionForm = uploadBtn.closest('form');
        if (sectionForm && sectionForm.id === 'form-hero-section') {
            const bgPreview = document.getElementById('preview-hero-bg');
            if (bgPreview) bgPreview.src = '';
        }

        // If this is a gallery item, update its state
        if (uploadBtn.closest('.gallery-card')) {
            const item = galleryItems[activeGalleryIndex];
            item.file = null;
            item.coverImage = '';
            renderGalleryList();
        }

        if (sectionForm) {
            dirtySections.add(sectionForm.id.replace('form-', ''));
            checkSaveAllVisibility();
        }
    };

    // Event delegation for upload buttons
    document.addEventListener('click', function (e) {
        // If clicking the file input itself, do nothing (let default behavior happen)
        if (e.target.classList.contains('image-upload')) {
            return;
        }

        // If clicking the remove button, do nothing (handled by other listener)
        if (e.target.closest('.remove-image')) {
            return;
        }

        const uploadBtn = e.target.closest('.upload-btn');
        if (uploadBtn && !uploadBtn.classList.contains('has-image')) {
            e.preventDefault();
            const fileInput = uploadBtn.querySelector('.image-upload');
            if (fileInput) {
                fileInput.click();
            }
        }
    });

    // Event delegation for file input changes
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('image-upload')) {
            const file = e.target.files[0];
            if (file) {
                const uploadBtn = e.target.closest('.upload-btn');
                handleImageUpload(file, uploadBtn);
            }
        }
    });

    // Check for URL parameters and auto-load project
    async function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');
        const type = urlParams.get('type');

        if (projectId && type) {
            // Wait for projects to be fetched first
            await fetchProjects();

            // Set the project type dropdown
            projectTypeSelect.value = type;
            projectTypeSelect.dispatchEvent(new Event('change'));

            // Wait a bit for the project list to populate
            setTimeout(() => {
                // Set the project dropdown
                if (projectId) {
                    selectProjectSelect.value = projectId;
                    selectProjectSelect.dispatchEvent(new Event('change'));
                }
            }, 500); // Increased timeout significantly
        } else {
            // Just fetch projects normally
            fetchProjects();
        }
    }

    checkUrlParams();
});
