import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const addMoreBtn = document.querySelector('.add-more-btn');
    const formContainer = document.querySelector('.form-container');
    const addedItemsSection = document.querySelector('.added-items-section');
    const addedItemsList = document.querySelector('.added-items-list');

    const pageSlugEl = document.getElementById('page_slug');
    const pageSectionEl = document.getElementById('page_section');
    const slugSelector = document.getElementById('faq-slug-selector');

    const slug = pageSlugEl ? pageSlugEl.value : 'project';
    const section = pageSectionEl ? pageSectionEl.value : 'faq-section-header';

    if (slugSelector) {
        slugSelector.value = slug;
        slugSelector.addEventListener('change', () => {
            const sectionMap = {
                'project': 'faq-section-header',
                'ongoing': 'faq-items-container'
            };
            const newSection = sectionMap[slugSelector.value] || 'faq-section-header';
            window.location.href = `?slug=${slugSelector.value}&section=${newSection}`;
        });
    }

    let faqArr = [];

    const firstForm = document.querySelector('.content-card');
    if (firstForm) {
        if (!firstForm.dataset.formId) {
            firstForm.dataset.formId = 'form-' + Date.now();
        }
        addRequiredFieldValidation(firstForm);
        updateSubmitButtonsVisibility();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();
    }

    addMoreBtn.addEventListener('click', function () {
        const allForms = document.querySelectorAll('.content-card');
        const currentForm = allForms[allForms.length - 1];

        const formData = getFormData(currentForm);
        const hasData = formData.question || formData.answer;

        if (hasData) {
            const submitSection = currentForm.querySelector('.submit-section');
            if (submitSection) submitSection.style.display = 'none';

            addToFaqList(formData, currentForm.dataset.formId);
            showAddedItemsSection();
        }

        createNewForm();
    });

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('submit-btn')) {
            e.preventDefault();

            const allForms = document.querySelectorAll('.content-card');
            const invalidFormIndices = [];
            for (let i = 0; i < allForms.length; i++) {
                const form = allForms[i];
                if (!validateForm(form)) {
                    invalidFormIndices.push(i);
                }
            }

            if (invalidFormIndices.length > 0) {
                const firstInvalid = invalidFormIndices[0];
                window.currentFormIndex = firstInvalid;
                allForms.forEach(f => f.style.display = 'none');
                allForms[firstInvalid].style.display = 'block';
                updateSubmitButtonsVisibility();
                updateNavigationButtons();

                const invalidNumbers = invalidFormIndices.map(i => i + 1).join(', ');
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Error',
                    text: `Please check the following forms for missing fields: ${invalidNumbers}`,
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            const allFormData = [];
            for (let i = 0; i < allForms.length; i++) {
                const form = allForms[i];
                const tempFormData = getFormData(form);
                allFormData.push(tempFormData);
            }

            if (allFormData.length > 0) {
                submitAllFaqs(allFormData);
            }
        }

        if (e.target.classList.contains('prev-btn')) {
            e.preventDefault();
            window.previousForm();
        }

        if (e.target.classList.contains('next-btn')) {
            e.preventDefault();
            window.nextForm();
        }

        const deleteBtn = e.target.closest('.delete-form-btn');
        if (deleteBtn) {
            e.preventDefault();
            const allForms = document.querySelectorAll('.content-card');

            if (allForms.length <= 1) {
                Swal.fire({
                    icon: 'warning',
                    text: 'You cannot delete the only form.',
                    confirmButtonColor: '#BC5322'
                });
                return;
            }

            const formCard = deleteBtn.closest('.content-card');
            if (formCard) {
                const formId = formCard.dataset.formId;
                if (formId) {
                    const indexInArr = faqArr.findIndex(i => i.formId === formId);
                    if (indexInArr !== -1) {
                        faqArr.splice(indexInArr, 1);
                        updateAddedItemsDisplay();
                    }
                }

                formCard.remove();

                const forms = document.querySelectorAll('.content-card');
                forms.forEach((f, i) => {
                    f.querySelector('.form-number').textContent = i + 1;
                    f.setAttribute('data-form-index', i.toString());
                });

                if (window.currentFormIndex >= forms.length) {
                    window.currentFormIndex = forms.length - 1;
                }

                forms.forEach(f => f.style.display = 'none');
                if (forms[window.currentFormIndex]) {
                    forms[window.currentFormIndex].style.display = 'block';
                }

                updateSubmitButtonsVisibility();
                updateNavigationButtons();
                updateDeleteButtonsVisibility();
            }
        }
    });

    function getFormData(form) {
        const questionEl = form.querySelector('input[name="faq_question"]');
        const answerEl = form.querySelector('textarea[name="faq_answer"]');

        const question = questionEl ? questionEl.value : '';
        const answer = answerEl ? answerEl.value : '';

        return { question, answer };
    }

    function addRequiredFieldValidation(form) {
        const conf = [
            { selector: 'input[name="faq_question"]', name: 'faq_question', message: '* Question is required' },
            { selector: 'textarea[name="faq_answer"]', name: 'faq_answer', message: '* Answer is required' }
        ];

        conf.forEach(({ selector, name, message }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;

            const existingMsg = container.querySelector(`.required-message[data-for="${name}"]`);
            if (existingMsg) existingMsg.remove();

            const msg = document.createElement('div');
            msg.className = 'required-message';
            msg.dataset.for = name;
            msg.textContent = message;
            msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';

            container.appendChild(msg);

            input.addEventListener('input', () => msg.style.display = 'none');
            input.addEventListener('change', () => msg.style.display = 'none');
        });
    }

    function validateForm(form) {
        let isValid = true;

        const conf = [
            { selector: 'input[name="faq_question"]', name: 'faq_question' },
            { selector: 'textarea[name="faq_answer"]', name: 'faq_answer' }
        ];

        conf.forEach(({ selector, name }) => {
            const input = form.querySelector(selector);
            if (!input) return;

            const container = input.closest('.form-group') || input.parentNode;
            const msg = container.querySelector(`.required-message[data-for="${name}"]`);

            let val = input.value.trim();

            if (val === '') {
                if (msg) msg.style.display = 'block';
                isValid = false;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        return isValid;
    }

    async function submitAllFaqs(allFormData) {
        const faqsToSubmit = allFormData.map(faq => ({
            question: faq.question,
            answer: faq.answer
        }));

        $.ajax({
            url: `/admin/faq/${slug}/${section}/add`,
            type: 'POST',
            data: {
                faqArr: JSON.stringify(faqsToSubmit),
                projectId: currentProjectId
            },
            dataType: 'json',
            success: async function (data) {
                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: data.message,
                        confirmButtonColor: '#BC5322'
                    }).then(() => {
                        window.location.href = `/admin/faq/${slug}/${section}/list${currentProjectId ? '?projectId=' + currentProjectId : ''}`;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message,
                        confirmButtonColor: '#BC5322'
                    });
                }
            },
            error: function (xhr) {
                console.error('Error submitting FAQs:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error submitting FAQs. Please try again.',
                    confirmButtonColor: '#BC5322'
                });
            }
        });
    }

    function addToFaqList(data, formId) {
        const item = {
            id: Date.now(),
            formId: formId,
            question: data.question || 'No question',
            answer: data.answer || 'No answer'
        };

        faqArr.push(item);
        updateAddedItemsDisplay();
    }

    function updateAddedItemsDisplay() {
        addedItemsList.innerHTML = '';

        faqArr.forEach(item => {
            const addedItem = document.createElement('div');
            addedItem.className = 'added-item';
            addedItem.dataset.id = item.id;

            addedItem.innerHTML = `
                <div class="item-preview">
                    <div class="item-details">
                        <h4 class="item-name">${item.question}</h4>
                        <p class="item-description">${item.answer}</p>
                    </div>
                </div>
            `;

            addedItemsList.appendChild(addedItem);
        });

        if (faqArr.length === 0) {
            hideAddedItemsSection();
        } else {
            showAddedItemsSection();
        }
    }

    function createNewForm() {
        const currentForms = document.querySelectorAll('.content-card');
        const formCount = currentForms.length;

        document.querySelectorAll('.content-card .submit-section').forEach(section => {
            section.style.display = 'none';
        });

        const newForm = document.createElement('div');
        newForm.className = 'content-card';
        newForm.setAttribute('data-form-index', formCount.toString());
        newForm.dataset.formId = 'form-' + Date.now();
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
                    <label class="form-label">Question</label>
                    <input class="form-input" type="text" name="faq_question" placeholder="Enter your question">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Answer</label>
                    <textarea name="faq_answer" class="form-textarea" placeholder="Enter your answer..." rows="5"></textarea>
                </div>
            </div>
            
            <div class="submit-section">
                <button class="submit-btn">Submit</button>
            </div>
            
            <div class="navigation-buttons">
                <button class="nav-btn prev-btn">Previous</button>
                <button class="nav-btn next-btn">Next</button>
            </div>
        `;

        document.querySelectorAll('.content-card').forEach(card => {
            card.style.display = 'none';
        });

        newForm.style.display = 'block';
        formContainer.appendChild(newForm);

        addRequiredFieldValidation(newForm);

        window.currentFormIndex = formCount;
        updateSubmitButtonsVisibility();
        updateNavigationButtons();
        updateDeleteButtonsVisibility();
    }

    function updateDeleteButtonsVisibility() {
        const forms = document.querySelectorAll('.content-card');
        const deleteBtns = document.querySelectorAll('.delete-form-btn');
        if (forms.length <= 1) {
            deleteBtns.forEach(btn => btn.style.display = 'none');
        } else {
            deleteBtns.forEach(btn => btn.style.display = 'flex');
        }
    }

    function updateSubmitButtonsVisibility() {
        const forms = document.querySelectorAll('.content-card');
        const lastFormIndex = forms.length - 1;

        forms.forEach((form, index) => {
            const submitSection = form.querySelector('.submit-section');
            if (submitSection) {
                submitSection.style.display = index === lastFormIndex ? 'flex' : 'none';
                submitSection.style.justifyContent = 'center';
            }
        });
    }

    function showAddedItemsSection() {
        addedItemsSection.style.display = 'block';
    }

    function hideAddedItemsSection() {
        addedItemsSection.style.display = 'none';
    }

    window.currentFormIndex = 0;

    window.previousForm = function () {
        const forms = document.querySelectorAll('.content-card');
        if (window.currentFormIndex > 0) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex--;
            forms[window.currentFormIndex].style.display = 'block';
            updateSubmitButtonsVisibility();
            updateNavigationButtons();
        }
    };

    window.nextForm = function () {
        const forms = document.querySelectorAll('.content-card');
        if (window.currentFormIndex < forms.length - 1) {
            forms[window.currentFormIndex].style.display = 'none';
            window.currentFormIndex++;
            forms[window.currentFormIndex].style.display = 'block';
            updateSubmitButtonsVisibility();
            updateNavigationButtons();
        }
    };

    function updateNavigationButtons() {
        const forms = document.querySelectorAll('.content-card');
        forms.forEach((form, index) => {
            const prevBtn = form.querySelector('.prev-btn');
            const nextBtn = form.querySelector('.next-btn');
            if (prevBtn) prevBtn.disabled = window.currentFormIndex === 0;
            if (nextBtn) nextBtn.disabled = window.currentFormIndex === forms.length - 1;
        });
    }
});
