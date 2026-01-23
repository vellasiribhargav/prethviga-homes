import $ from 'jquery';
import Swal from 'sweetalert2';
window.jQuery = window.$ = $;

document.addEventListener('DOMContentLoaded', function () {
    console.log('[BannerJS] Initializing...');

    const imageGrid = document.querySelector('.image-upload-grid');
    const addMoreBtn = document.querySelector('.add-image-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const pageSlugEl = document.getElementById('page_slug');
    const slugSelector = document.getElementById('banner-slug-selector');

    const slug = pageSlugEl ? pageSlugEl.value : 'home';
    let selectedImages = [];
    let existingBanners = [];

    // Initialize UI
    if (slugSelector) {
        slugSelector.value = slug;
        slugSelector.addEventListener('change', () => window.location.href = `?slug=${slugSelector.value}`);
    }

    // Handle all add buttons (header and grid)
    document.querySelectorAll('.add-image-btn').forEach(btn => {
        btn.addEventListener('click', addImageSlot);
    });

    const api = {
        get: `/admin/banner/${slug}/get`,
        add: `/admin/banner/${slug}/add`,
        del: (i) => `/admin/banner/${slug}/delete/${i}`
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
            tempInput.onchange = (ev) => handleImageProcess(ev.target.files[0], slot);
            tempInput.click();
        }
    });

    imageGrid.addEventListener('change', function (e) {
        if (e.target.type === 'file' && e.target.classList.contains('image-upload')) {
            handleImageProcess(e.target.files[0], e.target.closest('.image-upload-slot'));
        }
    });

    // --- FUNCTIONS ---

    function handleImageProcess(file, slot) {
        if (!file) return;

        // Hide required message if it exists
        const msg = document.getElementById('banner-required-msg');
        if (msg) msg.style.display = 'none';

        // Find if this slot already has a selected image being replaced
        const index = Array.from(imageGrid.children).indexOf(slot);
        const selectedIndex = index - existingBanners.length;

        if (selectedIndex >= 0) {
            selectedImages[selectedIndex] = file;
        } else {
            selectedImages.push(file);
        }

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
            // Hide "Add More" if this is discoverUs and we now have an image
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

            // Re-show "Add More" if discoverUs and count became 0
            if (slug === 'discoverUs' && (existingBanners.length + selectedImages.length) === 0) {
                const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
                if (addMoreSlot) addMoreSlot.style.display = 'flex';
                addImageSlot(); // Add back the initial upload button
            }
        }
    }

    function addImageSlot() {
        // Prevent adding more slots for discoverUs if we already have one (existing or new)
        if (slug === 'discoverUs' && (existingBanners.length + selectedImages.length + document.querySelectorAll('.image-upload-slot:not(.add-more)').length) > 0) {
            const currentSlots = document.querySelectorAll('.image-upload-slot:not(.add-more)');
            if (currentSlots.length > 0) return; // Already has a slot
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
            <input type="file" class="image-upload" accept="image/*" style="display: none;">
        `;
        const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
        imageGrid.insertBefore(newSlot, addMoreSlot);
    }

    function loadExistingBanners() {
        console.log('[BannerJS] Fetching banners from:', api.get);
        $.get(api.get).done(data => {
            console.log('[BannerJS] Fetch response:', data);
            if (data.success) {
                existingBanners = data.data;
                displayExistingBanners();
            } else {
                console.error('[BannerJS] API returned failure:', data);
                imageGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Error: ${data.message || 'Unknown error'}</div>`;
            }
        }).fail((xhr, status, error) => {
            console.error('[BannerJS] AJAX failed:', { status, error, xhr });
            imageGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Failed to load banners. Check console for details.</div>';
        });
    }

    function displayExistingBanners() {
        const addMoreSlot = document.querySelector('.image-upload-slot.add-more');
        document.querySelectorAll('.image-upload-slot:not(.add-more)').forEach(n => n.remove());

        existingBanners.forEach((banner, index) => {
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

        // --- SINGLE IMAGE RESTRICTION FOR DISCOVER US ---
        if (slug === 'discoverUs') {
            if (existingBanners.length >= 1) {
                addMoreSlot.style.display = 'none';
            } else {
                addMoreSlot.style.display = 'flex';
                if (existingBanners.length === 0 && selectedImages.length === 0) {
                    addImageSlot();
                }
            }
        } else {
            addMoreSlot.style.display = 'flex';
            // Add one empty slot if none exist (standard behavior)
            if (existingBanners.length === 0) addImageSlot();
        }
    }

    function uploadBanners() {
        const formData = new FormData();
        selectedImages.forEach(file => formData.append('banners', file));

        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Saving...';
        submitBtn.disabled = true;

        $.ajax({
            url: api.add,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done(data => {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
                selectedImages = [];
                loadExistingBanners();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
            }
        }).fail(() => {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Server error during upload',
                confirmButtonColor: '#BC5322'
            });
        });
    }

    addMoreBtn && addMoreBtn.addEventListener('click', () => {
        if (slug === 'discoverUs' && (existingBanners.length + selectedImages.length) >= 1) {
            return Swal.fire({
                icon: 'warning',
                title: 'Restriction',
                text: 'Discover Us page only supports a single banner image.',
                confirmButtonColor: '#BC5322'
            });
        }
        addImageSlot();
    });
    submitBtn && submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = document.getElementById('banner-required-msg');
        if (selectedImages.length > 0) {
            if (msg) msg.style.display = 'none';
            uploadBanners();
        } else {
            if (msg) {
                msg.style.display = 'block';
            } else {
                // const newMsg = document.createElement('div');
                // newMsg.id = 'banner-required-msg';
                // newMsg.textContent = '* Please select at least one image to upload';
                // newMsg.style.cssText = 'font-size:14px;color:#e74c3c;margin-top:10px;text-align:center;font-style:italic';
                // submitBtn.parentNode.insertBefore(newMsg, submitBtn);
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Please select at least one image to upload',
                    showConfirmButton: true,
                    confirmButtonColor: '#BC5322'
                });
            }
        }
    });

    // Initial Load
    loadExistingBanners();
});