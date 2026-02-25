import $ from 'jquery';
import Swal from 'sweetalert2';
import { initCharLimitHighlight } from '../../utils/validation.js';
window.jQuery = window.$ = $;

document.addEventListener('DOMContentLoaded', function () {
    initCharLimitHighlight();

    const imageGrid = document.querySelector('.image-upload-grid');
    const saveTextBtn = document.querySelector('.save-text-btn');
    const uploadImagesBtn = document.querySelector('.upload-images-btn');
    const pageSlugEl = document.getElementById('page_slug');
    const slugSelector = document.getElementById('banner-slug-selector');

    const slug = pageSlugEl ? pageSlugEl.value : 'home';
    let selectedImages = [];
    let existingBanners = [];
    let reviewData = [];
    let reviewSelectedImages = [null, null, null];
    let originalTextData = null;

    // Real-time phone input validation
    const phoneInputRealTime = document.getElementById('banner-number');
    if (phoneInputRealTime) {
        phoneInputRealTime.addEventListener('input', function () {
            this.value = this.value.replace(/[^\d+]/g, '');
        });
    }

    // Initialize UI
    if (slugSelector) {
        slugSelector.value = slug;
        slugSelector.addEventListener('change', () => window.location.href = `?slug=${slugSelector.value}`);
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');

            // Update tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update sections
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `section-${targetSection}`) {
                    s.classList.add('active');
                }
            });

            // Handle Add Review button visibility
            checkReviewLimit();
        });
    });




    let dynamicAmenities = [];

    async function fetchUniqueAmenities() {
        try {
            const response = await fetch('/admin/projectDetails/amenities/unique');
            const res = await response.json();
            if (res.success) {
                dynamicAmenities = res.amenities;
            }
        } catch (err) {
            console.error('Error fetching unique amenities:', err);
        }
    }

    fetchUniqueAmenities();

    const api = {
        get: `/admin/banner/${slug}/get`,
        add: `/admin/banner/${slug}/add`,
        updateText: `/admin/banner/${slug}/update-text`,
        del: (i) => `/admin/banner/${slug}/delete/${i}`,
        reviews: {
            get: `/admin/banner/home-reviews/get`,
            update: `/admin/banner/home-reviews/update-text`
        },
    };

    // --- EVENT DELEGATION ---
    imageGrid.addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('upload-btn')) {
            const slot = target.closest('.image-upload-slot');
            const input = slot.querySelector('input[type="file"]');
            if (input) input.click();
        }

        if (target.classList.contains('delete-image-btn')) {
            const slot = target.closest('.image-upload-slot');
            const index = Array.from(imageGrid.children).indexOf(slot);
            deleteImageSlot(slot, index);
        }

        if (target.classList.contains('edit-image-btn')) {
            const slot = target.closest('.image-upload-slot');
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.accept = 'image/*';
            tempInput.onchange = (ev) => handleImageProcess(ev.target.files, slot);
            tempInput.click();
        }
    });

    imageGrid.addEventListener('change', function (e) {
        if (e.target.type === 'file' && e.target.classList.contains('image-upload')) {
            handleImageProcess(e.target.files, e.target.closest('.image-upload-slot'));
        }
    });

    // --- FUNCTIONS ---

    function handleImageProcess(files, slot) {
        if (!files || files.length === 0) return;

        // Hide required message if it exists
        const msg = document.getElementById('banner-required-msg');
        if (msg) msg.style.display = 'none';

        // Convert FileList to Array
        const fileArray = Array.from(files);

        // Process the first file in the CURRENT slot
        const firstFile = fileArray[0];

        if (firstFile.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                text: `${firstFile.name} is too large. Max size is 2MB.`,
                confirmButtonColor: '#BC5322'
            });
            return;
        }

        displayImageInSlot(firstFile, slot);

        // Find if this slot already has a selected image being replaced
        const index = Array.from(imageGrid.children).indexOf(slot);
        const existingImageCount = existingBanners.filter(b => b.image).length;
        const selectedIndex = index - existingImageCount;

        if (selectedIndex >= 0) {
            selectedImages[selectedIndex] = firstFile;
        }

        if (index >= existingImageCount) {
            if (selectedIndex < selectedImages.length) {
                selectedImages[selectedIndex] = firstFile;
            } else {
                selectedImages.push(firstFile);
            }
        }

        // Process remaining files (only if we are NOT editing an existing saved banner)
        if (index >= existingImageCount && fileArray.length > 1) {
            for (let i = 1; i < fileArray.length; i++) {
                // Create a new slot
                const newSlot = addImageSlot();
                if (newSlot) {
                    displayImageInSlot(fileArray[i], newSlot);
                    selectedImages.push(fileArray[i]);
                }
            }
        }
    }

    function displayImageInSlot(file, slot) {
        const reader = new FileReader();
        reader.onload = (e) => {
            slot.innerHTML = `
                <img src="${e.target.result}" alt="Banner Image" class="uploaded-image">
                <div class="image-overlay">
                    <button class="image-action-btn edit-image-btn" type="button">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                        </svg>
                    </button>
                    <button class="image-action-btn delete-image-btn" type="button">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            `;
            if (slug === 'discoverUs') {
                const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
                if (addMoreSlot) addMoreSlot.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    async function deleteImageSlot(slot, index) {
        const bannerId = slot.dataset.id;

        if (bannerId) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "Delete this banner permanently from the website?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#BC5322',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                $.ajax({ url: api.del(bannerId), method: 'DELETE' })
                    .done(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: data.message,
                                confirmButtonColor: '#BC5322'
                            });
                            loadExistingBanners();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: data.message,
                                confirmButtonColor: '#BC5322'
                            });
                        }
                    });
            }
        } else {
            // New unsaved slot
            const existingImageCount = existingBanners.filter(b => b.image).length;
            const selectedIndex = index - existingImageCount;
            selectedImages.splice(selectedIndex, 1);
            slot.remove();

            if (slug === 'discoverUs' && (existingImageCount + selectedImages.length) === 0) {
                const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
                if (addMoreSlot) addMoreSlot.style.display = 'flex';
            }
            if ((existingImageCount + selectedImages.length) === 0) {
                addImageSlot();
            }
        }
    }

    function addImageSlot() {
        const existingImageCount = existingBanners.filter(b => b.image).length;
        if (slug === 'discoverUs' && (existingImageCount + selectedImages.length + document.querySelectorAll('.image-upload-slot:not(.add-more)').length) > 0) {
            const currentSlots = document.querySelectorAll('.image-upload-slot:not(.add-more)');
            if (currentSlots.length > 0) return;
        }

        const newSlot = document.createElement('div');
        newSlot.className = 'image-upload-slot';
        newSlot.innerHTML = `
            <button class="upload-btn" type="button">
                <div class="upload-icon">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                    </svg>
                </div>
                <p class="upload-text">Upload Image</p>
                <p class="upload-subtext">JPG, PNG (max. 2MB)</p>
            </button>
            <input type="file" class="image-upload" accept="image/*" style="display: none;" multiple>
        `;
        const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
        imageGrid.insertBefore(newSlot, addMoreSlot);
        return newSlot;
    }

    function loadExistingBanners() {
        $.get(api.get).done(data => {
            if (data.success) {
                existingBanners = data.data;
                displayExistingBanners();
                populateTextFields();
            } else {
                console.error('[BannerJS] API returned failure:', data);
                imageGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Error: ${data.message || 'Unknown error'}</div>`;
            }
        }).fail((xhr, status, error) => {
            console.error('[BannerJS] AJAX failed:', { status, error, xhr });
            imageGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Failed to load banners. Check console for details.</div>';
        });
    }

    function populateTextFields() {
        // Find the first banner that has at least one text field
        const textBanner = existingBanners.find(b => b.Heading || b.subHeading || b.description || b.number);
        if (textBanner) {
            const headingEl = document.getElementById('banner-heading');
            const subHeadingEl = document.getElementById('banner-subheading');
            const descriptionEl = document.getElementById('banner-description');
            const numberEl = document.getElementById('banner-number');

            if (headingEl) headingEl.value = textBanner.Heading || '';
            if (subHeadingEl) subHeadingEl.value = textBanner.subHeading || '';
            if (descriptionEl) descriptionEl.value = textBanner.description || '';
            if (numberEl) numberEl.value = textBanner.number || '';

            // Snapshot for change detection
            originalTextData = {
                Heading: textBanner.Heading || '',
                subHeading: textBanner.subHeading || '',
                description: textBanner.description || '',
                number: textBanner.number || ''
            };
        }
    }

    function displayExistingBanners() {
        const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
        document.querySelectorAll('.image-upload-slot:not(.add-more)').forEach(n => n.remove());

        existingBanners.forEach((banner, index) => {
            if (!banner.image) return; // Skip text-only objects for the grid
            const slot = document.createElement('div');
            slot.className = 'image-upload-slot';
            slot.dataset.id = banner.id;
            slot.innerHTML = `
                <img src="${banner.image}" alt="Banner Image" class="uploaded-image">
                <div class="image-overlay">
                    <button class="image-action-btn delete-image-btn" type="button">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                        </svg>
                    </button>
                </div>
            `;
            imageGrid.insertBefore(slot, addMoreSlot);
        });

        if (slug === 'discoverUs') {
            if (existingBanners.filter(b => b.image).length >= 1) {
                if (addMoreSlot) addMoreSlot.style.display = 'none';
            } else {
                if (addMoreSlot) addMoreSlot.style.display = 'flex';
                if (existingBanners.filter(b => b.image).length === 0 && selectedImages.length === 0) {
                    addImageSlot();
                }
            }
        } else {
            if (addMoreSlot) addMoreSlot.style.display = 'flex';
            if (existingBanners.filter(b => b.image).length === 0) addImageSlot();
        }
    }

    async function saveTextData() {
        const payload = {
            Heading: document.getElementById('banner-heading')?.value || '',
            subHeading: document.getElementById('banner-subheading')?.value || '',
            description: document.getElementById('banner-description')?.value || '',
            number: document.getElementById('banner-number')?.value || ''
        };

        // Change detection
        if (originalTextData !== null &&
            payload.Heading === originalTextData.Heading &&
            payload.subHeading === originalTextData.subHeading &&
            payload.description === originalTextData.description &&
            payload.number === originalTextData.number) {
            Swal.fire('No Changes', 'no changes is detected', 'info');
            return;
        }

        const originalBtnText = saveTextBtn.innerText;
        saveTextBtn.innerText = 'Saving...';
        saveTextBtn.disabled = true;

        $.ajax({
            url: api.updateText,
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'application/json'
        }).done(data => {
            saveTextBtn.innerText = originalBtnText;
            saveTextBtn.disabled = false;
            if (data.success) {
                originalTextData = { ...payload };
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'content updated',
                    confirmButtonColor: '#BC5322'
                }).then(() => {
                    if (slug === 'home') {
                        const reviewsTab = document.querySelector('.tab-btn[data-section="banner-reviews"]');
                        if (reviewsTab) reviewsTab.click();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
            }
        }).fail(() => {
            saveTextBtn.innerText = originalBtnText;
            saveTextBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Server error during update',
                confirmButtonColor: '#BC5322'
            });
        });
    }

    async function uploadBanners() {
        const formData = new FormData();
        selectedImages.forEach(file => formData.append('banners', file));

        // Add text fields (optional but kept for compatibility with existing addBanners endpoint)
        formData.append('Heading', document.getElementById('banner-heading')?.value || '');
        formData.append('subHeading', document.getElementById('banner-subheading')?.value || '');
        formData.append('description', document.getElementById('banner-description')?.value || '');
        formData.append('number', document.getElementById('banner-number')?.value || '');

        const originalBtnText = uploadImagesBtn.innerText;
        uploadImagesBtn.innerText = 'Saving...';
        uploadImagesBtn.disabled = true;

        $.ajax({
            url: api.add,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done(data => {
            uploadImagesBtn.innerText = originalBtnText;
            uploadImagesBtn.disabled = false;
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'content saved',
                    confirmButtonColor: '#BC5322'
                }).then(() => {
                    // Switch to Banner Text Content tab after successful image upload
                    const textTab = document.querySelector('.tab-btn[data-section="banner-text"]');
                    if (textTab) textTab.click();

                    // Clear selected images since they are uploaded
                    selectedImages = [];
                    // Refresh existing banners to show the newly uploaded ones
                    loadExistingBanners();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
            }
        }).fail(() => {
            uploadImagesBtn.innerText = originalBtnText;
            uploadImagesBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Server error during upload',
                confirmButtonColor: '#BC5322'
            });
        });
    }

    // Unified 'Add More' button handling
    document.querySelectorAll('.add-image-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (slug === 'discoverUs' && (existingBanners.filter(b => b.image).length + selectedImages.length) >= 1) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Restriction',
                    text: 'Discover Us page only supports a single banner image.',
                    confirmButtonColor: '#BC5322'
                });
            }
            addImageSlot();
        });
    });

    saveTextBtn && saveTextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateBannerText()) {
            saveTextData();
        }
    });

    uploadImagesBtn && uploadImagesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateBannerImages()) {
            uploadBanners();
        }
    });

    function validateBannerText() {
        let isValid = true;
        const heading = document.getElementById('banner-heading');
        const subheading = document.getElementById('banner-subheading');
        const description = document.getElementById('banner-description');
        const number = document.getElementById('banner-number');

        const fields = [
            { el: heading, name: 'Heading' },
            { el: description, name: 'Description' }
        ];

        if (slug === 'home') {
            fields.push({ el: subheading, name: 'Sub Heading' });
            fields.push({ el: number, name: 'Contact Number' });
        } else if (slug === 'project') {
            fields.push({ el: number, name: 'Contact Number' });
        }

        fields.forEach(field => {
            if (!field.el) return;
            const container = field.el.closest('.form-group');
            let msg = container.querySelector('.required-message');

            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'required-message';
                msg.style.cssText = 'display: none; color: #ef4444; font-size: 11px; margin-top: 5px; font-style: italic;';
                msg.textContent = `* ${field.name} is required`;
                container.appendChild(msg);

                field.el.addEventListener('input', () => {
                    msg.style.display = 'none';
                    field.el.classList.remove('invalid-input');
                });
            }

            if (!field.el.value.trim()) {
                msg.textContent = `* ${field.name} is required`;
                msg.style.display = 'block';
                field.el.classList.add('invalid-input');
                isValid = false;
            } else if (field.el === number) {
                // Detailed phone validation logic
                const phone = field.el.value.replace(/[\s-]/g, '');
                const showError = (msgText) => {
                    msg.textContent = msgText;
                    msg.style.display = 'block';
                    field.el.classList.add('invalid-input');
                    isValid = false;
                };

                msg.style.display = 'none';
                field.el.classList.remove('invalid-input');

                // +91 (India)
                if (phone.startsWith('+91')) {
                    const numPart = phone.slice(3);
                    if (!/^[6-9]\d{9}$/.test(numPart)) {
                        showError('* Indian numbers must be 10 digits starting with 6–9');
                    }
                }
                // Other international numbers
                else if (phone.startsWith('+')) {
                    const numPart = phone.slice(1);
                    if (!/^\d{7,15}$/.test(numPart)) {
                        showError('* International numbers must be 7–15 digits');
                    }
                }
                // No country code
                else {
                    if (!/^\d{10,15}$/.test(phone)) {
                        showError('* Number must be 10–15 digits');
                    }
                }
            } else {
                msg.style.display = 'none';
                field.el.classList.remove('invalid-input');
            }
        });

        if (!isValid) {
        }
        return isValid;
    }

    function validateBannerImages() {
        const existingImageCount = existingBanners.filter(b => b.image).length;
        const hasExisting = existingImageCount > 0;
        const hasNew = selectedImages.length > 0;

        let msg = document.getElementById('banner-required-msg');
        if (!msg) {
            msg = document.createElement('div');
            msg.id = 'banner-required-msg';
            msg.className = 'required-message-file';
            msg.style.cssText = 'color: #ef4444; font-size: 13px; margin-top: 5px; font-style: italic; display: none;';
            uploadImagesBtn.parentNode.insertBefore(msg, uploadImagesBtn);
        }

        if (!hasExisting && !hasNew) {
            msg.textContent = '* Please select at least one image to upload';
            msg.style.display = 'block';
            return false;
        }

        if (!hasNew && hasExisting) {
            msg.textContent = '* No new images selected for upload.';
            msg.style.display = 'block';
            return false;
        }

        msg.style.display = 'none';
        return true;
    }

    function validateReviews() {
        let isValid = true;
        const reviewItems = document.querySelectorAll('.review-item');

        reviewItems.forEach(item => {
            const name = item.querySelector('.review-name');
            const role = item.querySelector('.review-role');
            const text = item.querySelector('.review-text');
            const pimg = item.querySelector('.review-pimg');
            const fileInput = item.querySelector('.review-file-input');
            const placeholderVisible = item.querySelector('.placeholder-icon').style.display === 'flex';

            const fields = [
                { el: name, name: 'Name' },
                { el: role, name: 'Role' },
                { el: text, name: 'Review text' }
            ];

            fields.forEach(f => {
                const msg = f.el.parentNode.querySelector('.required-message');
                if (!f.el.value.trim()) {
                    if (msg) msg.style.display = 'block';
                    f.el.classList.add('invalid-input');
                    isValid = false;
                } else {
                    if (msg) msg.style.display = 'none';
                    f.el.classList.remove('invalid-input');
                }
            });

            // Image validation
            const hasImage = !placeholderVisible || (fileInput && fileInput.files.length > 0);
            const imgMsg = item.querySelector('.required-message-file');
            if (!hasImage) {
                if (imgMsg) imgMsg.style.display = 'block';
                isValid = false;
            } else {
                if (imgMsg) imgMsg.style.display = 'none';
            }
        });

        return isValid;
    }

    async function saveReviewsData() {
        const formData = new FormData();
        const reviews = [];

        document.querySelectorAll('.review-item').forEach((item, index) => {
            const fileName = `review_image_${index}`;
            const placeholderVisible = item.querySelector('.placeholder-icon').style.display === 'flex';

            reviews.push({
                id: item.dataset.id,
                user_name: item.querySelector('.review-name').value,
                user_role: item.querySelector('.review-role').value,
                reviewer: item.querySelector('.review-text').value,
                profile_image: placeholderVisible ? '' : (item.querySelector('.review-pimg').src.startsWith('data:') ? '' : item.querySelector('.review-pimg').src)
            });

            // Add file if selected
            const fileInput = item.querySelector('.review-file-input');
            if (fileInput && fileInput.files[0]) {
                formData.append(fileName, fileInput.files[0]);
            }
        });

        formData.append('reviews', JSON.stringify(reviews));

        // Change detection for reviews
        const currentReviewJson = JSON.stringify(reviews.map(r => ({
            user_name: r.user_name,
            user_role: r.user_role,
            reviewer: r.reviewer,
            profile_image: r.profile_image
        })));
        const originalReviewJson = JSON.stringify((reviewData || []).map(r => ({
            user_name: r.user_name || '',
            user_role: r.user_role || '',
            reviewer: r.reviewer || '',
            profile_image: r.profile_image || ''
        })));
        // Also check if any new image files were selected
        const hasNewImages = document.querySelectorAll('.review-item .review-file-input')
            ? Array.from(document.querySelectorAll('.review-item .review-file-input')).some(f => f.files.length > 0)
            : false;
        const countChanged = document.querySelectorAll('.review-item').length !== (reviewData || []).length;
        if (!hasNewImages && !countChanged && currentReviewJson === originalReviewJson) {
            Swal.fire('No Changes', 'no changes is detected', 'info');
            return;
        }

        const saveReviewsBtn = document.querySelector('.save-reviews-btn');
        const originalBtnText = saveReviewsBtn.innerText;
        saveReviewsBtn.innerText = 'Saving...';
        saveReviewsBtn.disabled = true;

        $.ajax({
            url: api.reviews.update,
            method: 'PUT',
            data: formData,
            processData: false,
            contentType: false
        }).done(data => {
            saveReviewsBtn.innerText = originalBtnText;
            saveReviewsBtn.disabled = false;
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'content updated',
                    confirmButtonColor: '#BC5322'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
            }
        }).fail(() => {
            saveReviewsBtn.innerText = originalBtnText;
            saveReviewsBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Server error during update',
                confirmButtonColor: '#BC5322'
            });
        });
    }

    function loadReviews() {
        if (slug !== 'home') return;
        $.get(api.reviews.get).done(data => {
            if (data.success) {
                reviewData = data.data;
                populateReviewFields();
            }
        });
    }

    function renderReviewCard(review = {}, index) {
        const container = document.getElementById('reviews-container');
        const cardCount = container.querySelectorAll('.review-item').length;

        const cardHtml = `
            <div class="review-item" data-id="${review.id || ''}" data-index="${index}">
                <div class="review-card-header">
                    <h4>Review ${cardCount + 1}</h4>
                    <button type="button" class="remove-card-btn">
                        <svg width="24" height="24" viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg" fill='currentColor'>
                            <path d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z"/>
                        </svg>
                    </button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Profile Image</label>
                        <div class="review-image-wrapper">
                            <div class="review-image-slot">
                                <img class="review-pimg" src="${review.profile_image || ''}" style="${review.profile_image ? 'display: block;' : 'display: none;'}">
                                <div class="placeholder-icon" style="${review.profile_image ? 'display: none;' : 'display: flex;'}">
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" fill='#ffffff'></path>
                                    </svg>
                                </div>
                                <input class="review-file-input" type="file" accept="image/*" style="display: none;">
                            </div>
                            <button class="remove-review-img" type="button" style="${review.profile_image ? 'display: flex;' : 'display: none;'}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <p class="upload-subtext">Click to change profile image</p>
                        <div class="required-message-file" style="display: none; color: #ef4444; font-size: 11px; margin-top: 5px;">* Profile image is required</div>
                    </div>
                    <div class="form-side">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input class="review-name form-input" type="text" placeholder="Enter reviewer name" value="${review.user_name || ''}">
                            <div class="required-message" style="display: none; font-style: italic;color: #ef4444; font-size: 11px; margin-top: 5px;">* Name is required</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <input class="review-role form-input" type="text" placeholder="Enter reviewer role" value="${review.user_role || ''}">
                            <div class="required-message" style="display: none; font-style: italic;color: #ef4444; font-size: 11px; margin-top: 5px;">* Role is required</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Review / Quote</label>
                    <textarea class="review-text form-input" rows="3" placeholder="Enter the review text" maxlength="200">${review.reviewer || ''}</textarea>
                    <div class="char-limit-msg" style="display: none; font-style: italic;color: #ef4444; font-size: 11px; margin-top: 5px;">* Characters are more than 200</div>
                    <div class="required-message" style="display: none; font-style: italic;color: #ef4444; font-size: 11px; margin-top: 5px;">* Review text is required</div>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', cardHtml);

        const card = container.lastElementChild;
        // Add auto-hiding listeners for validation messages
        card.querySelectorAll('.review-name, .review-role, .review-text').forEach(input => {
            input.addEventListener('input', () => {
                const msg = input.parentNode.querySelector('.required-message');
                if (msg) msg.style.display = 'none';
                input.classList.remove('invalid-input');
            });
        });

        const fileInput = card.querySelector('.review-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', () => {
                const msg = card.querySelector('.required-message-file');
                if (msg) msg.style.display = 'none';
            });
        }
        checkReviewLimit();
    }

    function populateReviewFields() {
        const container = document.getElementById('reviews-container');
        if (!container) return;
        container.innerHTML = '';

        // If no review data, render one empty card
        if (!reviewData || reviewData.length === 0) {
            renderReviewCard({}, 0);
        } else {
            reviewData.forEach((review, index) => {
                renderReviewCard(review, index);
            });
        }
        checkReviewLimit();
    }

    function checkReviewLimit() {
        const container = document.getElementById('reviews-container');
        if (!container) return;
        const count = container.querySelectorAll('.review-item').length;
        const addBtnContainer = document.querySelector('.reviews-header-actions');

        // Find if reviews tab is active
        const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-section');
        const isReviewsTab = activeTab === 'banner-reviews';

        if (addBtnContainer) {
            addBtnContainer.style.display = (isReviewsTab && count < 3) ? 'flex' : 'none';
        }
    }

    // --- EVENT LISTENERS FOR REVIEWS ---
    const reviewsContainer = document.getElementById('reviews-container');
    const addReviewBtn = document.querySelector('.add-review-btn');

    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', () => {
            const container = document.getElementById('reviews-container');
            if (container.querySelectorAll('.review-item').length < 3) {
                renderReviewCard({}, container.querySelectorAll('.review-item').length);
            }
        });
    }

    if (reviewsContainer) {
        reviewsContainer.addEventListener('click', (e) => {
            const slot = e.target.closest('.review-image-slot');
            if (slot && !e.target.closest('.review-file-input')) {
                slot.querySelector('.review-file-input').click();
            }

            const removeImgBtn = e.target.closest('.remove-review-img');
            if (removeImgBtn) {
                e.stopPropagation();
                const wrapper = removeImgBtn.closest('.review-image-wrapper');
                const slot = wrapper.querySelector('.review-image-slot');
                slot.querySelector('.review-pimg').style.display = 'none';
                slot.querySelector('.review-pimg').src = '';
                slot.querySelector('.placeholder-icon').style.display = 'flex';
                slot.querySelector('.review-file-input').value = '';
                removeImgBtn.style.display = 'none';
            }

            const removeCardBtn = e.target.closest('.remove-card-btn');
            if (removeCardBtn) {
                Swal.fire({
                    title: 'Delete this review?',
                    text: 'This will remove the review card. You will need to save to persist this change.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#BC5322',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it'
                }).then((result) => {
                    if (result.isConfirmed) {
                        removeCardBtn.closest('.review-item').remove();
                        // Update numbering
                        reviewsContainer.querySelectorAll('.review-item').forEach((item, idx) => {
                            item.querySelector('h4').textContent = `Review ${idx + 1}`;
                        });
                        checkReviewLimit();
                    }
                });
            }
        });

        reviewsContainer.addEventListener('change', (e) => {
            const input = e.target.closest('.review-file-input');
            if (input) {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        Swal.fire({
                            icon: 'warning',
                            text: `${file.name} is too large. Max size is 2MB.`,
                            confirmButtonColor: '#BC5322'
                        });
                        input.value = '';
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const slot = input.closest('.review-image-slot');
                        const img = slot.querySelector('.review-pimg');
                        const placeholder = slot.querySelector('.placeholder-icon');
                        img.src = ev.target.result;
                        img.style.display = 'block';
                        placeholder.style.display = 'none';
                        slot.closest('.review-image-wrapper').querySelector('.remove-review-img').style.display = 'flex';
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    const saveReviewsBtn = document.querySelector('.save-reviews-btn');
    saveReviewsBtn && saveReviewsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateReviews()) {
            saveReviewsData();
        }
    });

    function validateReviews() {
        let isValid = true;
        const items = document.querySelectorAll('.review-item');
        let validationMsg = document.getElementById('reviews-validation-msg');

        if (!validationMsg) {
            validationMsg = document.createElement('div');
            validationMsg.id = 'reviews-validation-msg';
            validationMsg.className = 'required-container-message';
            validationMsg.style.cssText = 'display: none; color: #ef4444; margin-bottom: 20px; font-weight: 500; font-size: 14px; font-style: italic;';
            validationMsg.textContent = '* At least one review is required';
            const container = document.getElementById('reviews-container');
            if (container) container.before(validationMsg);
        }

        // Check if at least one review exists
        if (items.length === 0) {
            if (validationMsg) validationMsg.style.display = 'block';
            return false;
        } else if (validationMsg) {
            validationMsg.style.display = 'none';
        }

        items.forEach((item, index) => {
            const name = item.querySelector('.review-name');
            const role = item.querySelector('.review-role');
            const text = item.querySelector('.review-text');
            const slot = item.querySelector('.review-image-slot');
            const hasImage = slot.querySelector('.review-pimg').style.display !== 'none';
            const fileInput = slot.querySelector('.review-file-input');

            const nameMsg = item.querySelector('.review-name + .required-message');
            const roleMsg = item.querySelector('.review-role + .required-message');
            const textMsg = item.querySelector('.review-text ~ .required-message');
            const imageMsg = item.querySelector('.required-message-file');

            // Name validation
            if (!name.value.trim()) {
                if (nameMsg) nameMsg.style.display = 'block';
                name.classList.add('invalid-input');
                isValid = false;
            } else {
                if (nameMsg) nameMsg.style.display = 'none';
                name.classList.remove('invalid-input');
            }

            // Role validation
            if (!role.value.trim()) {
                if (roleMsg) roleMsg.style.display = 'block';
                role.classList.add('invalid-input');
                isValid = false;
            } else {
                if (roleMsg) roleMsg.style.display = 'none';
                role.classList.remove('invalid-input');
            }

            // Text validation
            if (!text.value.trim()) {
                if (textMsg) textMsg.style.display = 'block';
                text.classList.add('invalid-input');
                isValid = false;
            } else {
                if (textMsg) textMsg.style.display = 'none';
                text.classList.remove('invalid-input');
            }

            // Image validation
            if (!hasImage && (!fileInput.files || fileInput.files.length === 0)) {
                if (imageMsg) imageMsg.style.display = 'block';
                isValid = false;
            } else {
                if (imageMsg) imageMsg.style.display = 'none';
            }
        });

        return isValid;
    }

    // Initial Load
    loadExistingBanners();
    if (slug === 'home') loadReviews();
});