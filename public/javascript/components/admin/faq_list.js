import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

let originalFormData = {};

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const itemForm = document.getElementById('itemForm');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10],
        storageKey: 'rowsPerPage_faq'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by question)
            const questionText = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const searchMatch = !searchValue || questionText.includes(searchValue);
            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), Q/A(1), CREATED DATE(2)
            const createdAtCell = row.cells[2];
            const createdAtValue = createdAtCell ? createdAtCell.textContent.trim() : '';

            let dateMatch = true;
            if (dateValue && createdAtValue) {
                const rowDate = dayjs(createdAtValue, 'DD ddd MMM YYYY HH:mm');
                const filterDate = dayjs(dateValue);
                dateMatch = rowDate.isValid() && rowDate.isSame(filterDate, 'day');
            }

            return dateMatch;
        });

        // Update S.NO
        filteredRows.forEach((row, idx) => {
            if (row.cells && row.cells.length > 0) {
                row.cells[0].textContent = String(idx + 1).padStart(2, '0');
            }
        });

        pagination.refreshRows(filteredRows);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);

    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const faqData = JSON.parse(this.dataset.faq);
            const id = this.dataset.id || this.dataset.index;

            const inputs = itemForm.elements;
            inputs.index.value = id;
            inputs.question.value = faqData.question || '';
            inputs.answer.value = faqData.answer || '';

            // Reset validation states
            resetValidation(itemForm);

            openModal(itemModal);

            // Save original values for change detection
            setTimeout(() => {
                originalFormData = {
                    question: inputs.question.value.trim(),
                    answer: inputs.answer.value.trim()
                };
            }, 0);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.dataset.id || this.dataset.index;

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/admin/faq/${CURRENT_SLUG}/${CURRENT_SECTION}/delete/${id}`,
                        type: 'DELETE',
                        success: function (data) {
                            if (data.success) {
                                Swal.fire(
                                    'Deleted!',
                                    'FAQ has been deleted.',
                                    'success'
                                ).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire('Error!', data.message || 'Failed to delete FAQ', 'error');
                            }
                        },
                        error: function (xhr) {
                            Swal.fire('Error!', xhr.responseText, 'error');
                        }
                    });
                }
            });
        });
    });

    const slugSelector = document.getElementById('faq-slug-selector');
    if (slugSelector) {
        slugSelector.addEventListener('change', function () {
            const newSlug = this.value;
            const sectionMap = {
                'project': 'faq-section-header',
                'ongoing': 'faq-items-container'
            };
            const section = sectionMap[newSlug] || 'faq-section-header';

            window.location.href = `/admin/faq/${newSlug}/${section}/list`;
        });
    }
});

// Validation Functions
function addRequiredFieldValidation(form) {
    const conf = [
        { name: 'question', message: '* Question is required' },
        { name: 'answer', message: '* Answer is required' }
    ];

    conf.forEach(({ name, message }) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (!input) return;

        const container = input.closest('.form-group') || input.parentNode;

        // remove old message
        if (container.querySelector(`.required-message[data-for="${name}"]`)) {
            container.querySelector(`.required-message[data-for="${name}"]`).remove();
        }

        const msg = document.createElement('div');
        msg.className = 'required-message';
        msg.dataset.for = name;
        msg.textContent = message;
        msg.style.display = 'none';

        container.appendChild(msg);

        input.addEventListener('input', () => msg.style.display = 'none');
        input.addEventListener('change', () => msg.style.display = 'none');
    });
}

function validateForm(form) {
    let isValid = true;
    const fieldNames = ['question', 'answer'];

    fieldNames.forEach(name => {
        const input = form.querySelector(`[name="${name}"]`);
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

function isFormChanged(form) {
    return (
        form.question.value.trim() !== originalFormData.question ||
        form.answer.value.trim() !== originalFormData.answer
    );
}

function resetValidation(form) {
    if (!form) return;
    form.querySelectorAll('.required-message').forEach(msg => msg.style.display = 'none');
}

// Initialize validation
if (itemForm) {
    addRequiredFieldValidation(itemForm);
}

if (itemForm) {
    itemForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validateForm(this)) {
            return;
        }

        if (!isFormChanged(this)) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes Detected',
                text: 'no changes is detected'
            });
            return;
        }

        const formData = new FormData(this);
        const id = formData.get('index');

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        $.ajax({
            url: `/admin/faq/${CURRENT_SLUG}/${CURRENT_SECTION}/update/${id}`,
            type: 'PUT',
            data: {
                question: formData.get('question'),
                answer: formData.get('answer')
            },
            success: function (data) {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'content updated',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Failed to update FAQ',
                        timer: 1500
                    });
                }
            },
            error: function (xhr) {
                Swal.fire('Error!', xhr.responseText, 'error');
            },
            complete: function () {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
}
