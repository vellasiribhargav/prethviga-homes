import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { isValidDate, showFieldError, hideFieldError, initCharLimitHighlight } from '../../utils/validation.js';

document.addEventListener('DOMContentLoaded', function () {
    initCharLimitHighlight();
    const addMoreBtn = document.getElementById('addMoreBtn');
    const formContainer = document.querySelector('.form-container');
    const submitBtn = document.querySelector('.submit-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentFormIndex = 0;
    const formsData = [];

    function updateNavigation() {
        const cards = document.querySelectorAll('.content-card');
        const count = cards.length;

        cards.forEach((card, index) => {
            const isCurrent = index === currentFormIndex;
            card.style.display = isCurrent ? 'block' : 'none';

            if (isCurrent) {
                const pBtn = card.querySelector('.prev-btn');
                const nBtn = card.querySelector('.next-btn');
                const sSec = card.querySelector('.submit-section');

                if (pBtn) pBtn.disabled = (currentFormIndex === 0);
                if (nBtn) {
                    nBtn.disabled = (currentFormIndex === count - 1);
                    nBtn.textContent = 'Next';
                }
                if (sSec) sSec.style.display = (currentFormIndex === count - 1) ? 'block' : 'none';
            }
        });

        const contentTitle = document.querySelector('.content-title');
        if (contentTitle) contentTitle.textContent = `Add Project (${currentFormIndex + 1}/${count})`;
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function () {
            const firstCard = document.querySelector('.content-card');
            const newCard = firstCard.cloneNode(true);
            const formNumber = document.querySelectorAll('.content-card').length + 1;

            newCard.querySelector('.form-number').textContent = formNumber;
            newCard.querySelector('.delete-form-btn').style.display = 'block';

            // Clear inputs
            newCard.querySelectorAll('input, textarea').forEach(input => {
                input.value = '';
                if (input.type === 'file') input.style.display = 'none';
            });

            // Reset upload btn
            const uploadBtn = newCard.querySelector('.upload-btn');
            uploadBtn.innerHTML = `
                <div class="upload-icon">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"></path>
                    </svg>
                </div>
                <p class="upload-text">Tap to upload</p>
                <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
            `;
            uploadBtn.className = 'upload-btn';

            formContainer.appendChild(newCard);
            attachUploadListeners(newCard);
            attachDeleteListener(newCard);
            setupFormEvents(newCard);

            currentFormIndex = formNumber - 1;
            updateNavigation();
        });
    }

    function attachUploadListeners(card) {
        const uploadBtn = card.querySelector('.upload-btn');
        const fileInput = card.querySelector('input[type="file"]');

        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadBtn.innerHTML = `
                        <div class="uploaded-image">
                            <img src="${e.target.result}" alt="Preview">
                            <button type="button" class="remove-image">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="white">
                                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                                </svg>
                            </button>
                        </div>
                    `;
                    uploadBtn.classList.add('has-image');
                    const removeBtn = uploadBtn.querySelector('.remove-image');
                    if (removeBtn) {
                        removeBtn.onclick = (event) => {
                            event.stopPropagation();
                            fileInput.value = '';
                            uploadBtn.classList.remove('has-image');
                            uploadBtn.innerHTML = `
                                <div class="upload-icon">
                                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"></path>
                                    </svg>
                                </div>
                                <p class="upload-text">Tap to upload</p>
                                <p class="upload-subtext">SVG, PNG, JPG (max. 5MB)</p>
                            `;
                        };
                    }

                    // Hide validation message
                    const msg = uploadBtn.parentNode.querySelector('.required-message-file');
                    if (msg) msg.style.display = 'none';
                    uploadBtn.style.borderColor = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-form-btn');
        if (deleteBtn) {
            e.preventDefault();
            const formCard = deleteBtn.closest('.content-card');
            const cards = document.querySelectorAll('.content-card');

            if (cards.length <= 1) {
                Swal.fire({
                    icon: 'warning',
                    text: 'You cannot delete the only form.',
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            if (formCard) {
                formCard.remove();
                const remainingCards = document.querySelectorAll('.content-card');
                remainingCards.forEach((form, index) => {
                    const numberSpan = form.querySelector('.form-number');
                    if (numberSpan) numberSpan.textContent = index + 1;
                });

                if (currentFormIndex >= remainingCards.length) {
                    currentFormIndex = remainingCards.length - 1;
                }
                updateNavigation();
            }
        }
    });

    function attachDeleteListener(card) {
        const deleteBtn = card.querySelector('.delete-form-btn');
        deleteBtn.addEventListener('click', function () {
            card.remove();
            const cards = document.querySelectorAll('.content-card');
            cards.forEach((c, i) => c.querySelector('.form-number').textContent = i + 1);
            if (currentFormIndex >= cards.length) currentFormIndex = cards.length - 1;
            updateNavigation();
        });
    }

    // Navigation Event Delegation
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('prev-btn')) {
            if (currentFormIndex > 0) {
                currentFormIndex--;
                updateNavigation();
            }
        }

        if (e.target.classList.contains('next-btn')) {
            const cards = document.querySelectorAll('.content-card');
            if (currentFormIndex < cards.length - 1) {
                if (validateForm(cards[currentFormIndex])) {
                    currentFormIndex++;
                    updateNavigation();
                }
            }
        }

        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();
            const cards = document.querySelectorAll('.content-card');
            if (validateForm(cards[currentFormIndex])) {
                handleFinalSubmit();
            }
        }
    });

    // Remove the individual button listeners

    function validateForm(card) {
        let isValid = true;
        const typeInput = card.querySelector('[name="project-type"]');
        const nameInput = card.querySelector('[name="project-name"]');
        const locInput = card.querySelector('[name="project-location"]');
        const dateInput = card.querySelector('[name="timeline-date"]');
        const descInput = card.querySelector('[name="project-description"]');
        const fileInput = card.querySelector('input[type="file"]');

        const markInvalid = (input, name, message) => {
            isValid = false;
            showFieldError(input, message);
        };

        const markValid = (input) => {
            hideFieldError(input);
        }

        if (!typeInput || !typeInput.value || typeInput.value === '') markInvalid(typeInput, 'project-type', '* Project type is required');
        else markValid(typeInput);

        if (!nameInput.value.trim()) markInvalid(nameInput, 'project-name', '* Project name is required');
        else markValid(nameInput);

        if (!locInput.value.trim()) markInvalid(locInput, 'project-location', '* Project location is required');
        else markValid(locInput);

        if (!dateInput.value || !isValidDate(dateInput.value)) markInvalid(dateInput, 'timeline-date', '* Date/Timeline is required');
        else markValid(dateInput);

        if (!descInput.value.trim()) markInvalid(descInput, 'project-description', '* Description is required');
        else markValid(descInput);

        if (!fileInput.files.length) {
            isValid = false;
            const uploadBtn = card.querySelector('.upload-btn');
            if (uploadBtn) {
                uploadBtn.style.borderColor = '#e74c3c';
                let msg = uploadBtn.parentNode.querySelector('.required-message-file');
                if (!msg) {
                    msg = document.createElement('div');
                    msg.className = 'required-message-file';
                    msg.textContent = '* Project image is required';
                    msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;font-style:italic';
                    uploadBtn.parentNode.appendChild(msg);
                }
                msg.style.display = 'block';
            }
        } else {
            const uploadBtn = card.querySelector('.upload-btn');
            if (uploadBtn) {
                uploadBtn.style.borderColor = '';
                const msg = uploadBtn.parentNode.querySelector('.required-message-file');
                if (msg) msg.style.display = 'none';
            }
        }

        return isValid;
    }

    // Add real-time validation clearing and char limits
    function setupFormEvents(card) {
        card.querySelectorAll('input, textarea, select').forEach(input => {
            const handler = () => {
                hideFieldError(input);
            };
            input.addEventListener('input', handler);
            input.addEventListener('change', handler);
        });

        // Fix date input display
        const dateInput = card.querySelector('[name="timeline-date"]');
        if (dateInput) {
            dateInput.addEventListener('change', function() {
                this.setAttribute('value', this.value);
            });
        }
    }

    function handleFinalSubmit() {
        const cards = document.querySelectorAll('.content-card');
        if (!validateForm(cards[currentFormIndex])) return;

        const formData = new FormData();
        const projectsArr = [];

        cards.forEach((card, index) => {
            const fileInput = card.querySelector('input[type="file"]');
            if (fileInput.files[0]) {
                formData.append(`file_${index}`, fileInput.files[0]);
            }

            projectsArr.push({
                type: card.querySelector('[name="project-type"]').value,
                project_name: card.querySelector('[name="project-name"]').value,
                project_location: card.querySelector('[name="project-location"]').value,
                project_date: card.querySelector('[name="timeline-date"]').value,
                card_footer_text: card.querySelector('[name="project-description"]').value
            });
        });

        formData.append('projectsArr', JSON.stringify(projectsArr));

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        $.ajax({
            url: '/admin/projects/add',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.success && data.projects && data.projects.length > 0) {
                    Swal.fire('Success', 'Projects added successfully', 'success').then(() => {
                        const project = data.projects[0];
                        window.location.href = `/admin/projectDetails?projectId=${project.id}&type=${project.type}`;
                    });
                } else if (data.success && data.projectIds && data.projectIds.length > 0) {
                    Swal.fire('Success', 'Projects added successfully', 'success').then(() => {
                        window.location.href = '/admin/projectDetails/details';
                    });
                } else {
                    Swal.fire('Error', data.message || 'Unknown error', 'error');
                }
            },
            error: function (xhr) {
                Swal.fire('Error', xhr.responseJSON?.message || 'Submission failed', 'error');
            },
            complete: function () {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
        });
    }

    // Initial setup
    document.querySelectorAll('.content-card').forEach(card => {
        attachUploadListeners(card);
        attachDeleteListener(card);
        setupFormEvents(card);
    });
    updateNavigation();
});
