import $ from 'jquery';
import Swal from 'sweetalert2';
window.jQuery = window.$ = $;

document.addEventListener('DOMContentLoaded', function () {
    // console.log('[BannerJS] Initializing...');

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
        });
    });


    const api = {
        get: `/admin/banner/${slug}/get`,
        add: `/admin/banner/${slug}/add`,
        updateText: `/admin/banner/${slug}/update-text`,
        del: (i) => `/admin/banner/${slug}/delete/${i}`,
        reviews: {
            get: `/admin/banner/home-reviews/get`,
            update: `/admin/banner/home-reviews/update-text`
        }
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
        displayImageInSlot(firstFile, slot);

        // Find if this slot already has a selected image being replaced
        const index = Array.from(imageGrid.children).indexOf(slot);
        const selectedIndex = index - existingBanners.length;

        if (selectedIndex >= 0) {
            selectedImages[selectedIndex] = firstFile;
        }

        if (index >= existingBanners.length) {
            if (selectedIndex < selectedImages.length) {
                selectedImages[selectedIndex] = firstFile;
            } else {
                selectedImages.push(firstFile);
            }
        }

        // Process remaining files (only if we are NOT editing an existing saved banner)
        if (index >= existingBanners.length && fileArray.length > 1) {
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
        if (index < existingBanners.length) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "Delete this banner permanently from the website?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#BC5322',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                $.ajax({ url: api.del(index), method: 'DELETE' })
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
            const selectedIndex = index - existingBanners.length;
            selectedImages.splice(selectedIndex, 1);
            slot.remove();

            if (slug === 'discoverUs' && (existingBanners.length + selectedImages.length) === 0) {
                const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
                if (addMoreSlot) addMoreSlot.style.display = 'flex';
            }
            if ((existingBanners.length + selectedImages.length) === 0) {
                addImageSlot();
            }
        }
    }

    function addImageSlot() {
        if (slug === 'discoverUs' && (existingBanners.length + selectedImages.length + document.querySelectorAll('.image-upload-slot:not(.add-more)').length) > 0) {
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
                <p class="upload-subtext">JPG, PNG (max. 5MB)</p>
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
        }
    }

    function displayExistingBanners() {
        const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
        document.querySelectorAll('.image-upload-slot:not(.add-more)').forEach(n => n.remove());

        existingBanners.forEach((banner, index) => {
            if (!banner.image) return; // Skip text-only objects for the grid
            const slot = document.createElement('div');
            slot.className = 'image-upload-slot';
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
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message,
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
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                }).then(() => {
                    window.location.href = `/admin/banner/${slug}/list`;
                })
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
        saveTextData();
    });

    uploadImagesBtn && uploadImagesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedImages.length > 0) {
            uploadBanners();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Please select at least one image to upload',
                showConfirmButton: true,
                confirmButtonColor: '#BC5322'
            });
        }
    });

    async function saveReviewsData() {
        const formData = new FormData();
        const reviews = [];

        document.querySelectorAll('.review-item').forEach((item, index) => {
            const fileName = `review_image_${index}`;
            reviews.push({
                user_name: item.querySelector('.review-name').value,
                user_role: item.querySelector('.review-role').value,
                reviewer: item.querySelector('.review-text').value,
                profile_image: item.querySelector('.review-pimg').src.includes('home-profile.webp') ? '' : (reviewData[index]?.profile_image || '')
            });

            // Add file if selected
            const fileInput = item.querySelector('.review-file-input');
            if (fileInput && fileInput.files[0]) {
                formData.append(fileName, fileInput.files[0]);
            }
        });

        formData.append('reviews', JSON.stringify(reviews));

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
                    text: 'Reviews updated successfully!',
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

    function populateReviewFields() {
        const reviewItems = document.querySelectorAll('.review-item');
        reviewData.forEach((review, index) => {
            if (index < reviewItems.length) {
                const item = reviewItems[index];
                item.querySelector('.review-name').value = review.user_name || '';
                item.querySelector('.review-role').value = review.user_role || '';
                item.querySelector('.review-text').value = review.reviewer || '';
                if (review.profile_image) {
                    item.querySelector('.review-pimg').src = review.profile_image;
                    item.querySelector('.remove-review-img').style.display = 'flex';
                }
            }
        });
    }

    // --- EVENT LISTENERS FOR REVIEWS ---
    document.querySelectorAll('.review-image-slot').forEach((slot, index) => {
        slot.addEventListener('click', () => {
            slot.querySelector('.review-file-input').click();
        });
    });

    document.querySelectorAll('.review-file-input').forEach((input, index) => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const slot = input.closest('.review-image-slot');
                    slot.querySelector('.review-pimg').src = ev.target.result;
                    slot.querySelector('.remove-review-img').style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    });

    document.querySelectorAll('.remove-review-img').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = btn.closest('.review-image-slot');
            slot.querySelector('.review-pimg').src = "/assets/images/home-profile.webp";
            slot.querySelector('.review-file-input').value = '';
            btn.style.display = 'none';
        });
    });

    const saveReviewsBtn = document.querySelector('.save-reviews-btn');
    saveReviewsBtn && saveReviewsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveReviewsData();
    });

    // Initial Load
    loadExistingBanners();
    if (slug === 'home') loadReviews();
});