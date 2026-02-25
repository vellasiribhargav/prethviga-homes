import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

let originalFormData = {};

document.addEventListener('DOMContentLoaded', function () {
    const itemModal = document.getElementById('itemModal');
    const itemForm = document.getElementById('itemForm');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('searchInput');
    const fromDateFilter = document.getElementById('fromDateFilter');
    const toDateFilter = document.getElementById('toDateFilter');
    const dateRangeToggle = document.getElementById('dateRangeToggle');
    const dateRangeMenu = document.getElementById('dateRangeMenu');

    if (dateRangeToggle && dateRangeMenu) {
        dateRangeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dateRangeMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dateRangeMenu.contains(e.target) && !dateRangeToggle.contains(e.target)) {
                dateRangeMenu.classList.remove('show');
            }
        });

        dateRangeMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Rows per page handling
    const rowsPerPageSelect = document.getElementById('rowsPerPageSelect');
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_faq')) || 5;

    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = rowsPerPage;
    }

    // Filter Logic
    function applyFilters(page = 1) {
        const params = {
            search: getSearchValue(searchInput),
            fromDate: fromDateFilter ? fromDateFilter.value : '',
            toDate: toDateFilter ? toDateFilter.value : '',
            page: page,
            limit: rowsPerPage,
            is_filter: true
        };

        $.ajax({
            url: `/admin/faq/${CURRENT_SLUG}/${CURRENT_SECTION}/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    renderTable(data.faqs);
                    updatePaginationUI(data);

                    // Update filter indicator
                    const filterIndicator = document.getElementById('filterIndicator');
                    if (filterIndicator) {
                        filterIndicator.style.display = data.is_filtered ? 'inline-block' : 'none';
                    }
                } else {
                    Swal.fire('Error!', data.message, 'error');
                }
            },
            error(xhr) {
                Swal.fire('Error!', xhr.responseText || 'Failed to fetch FAQs', 'error');
            }
        });
    }

    function renderTable(faqs) {
        const tbody = $(".data-table tbody:not(#noResultsTbody)");
        tbody.empty();

        if (faqs.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        faqs.forEach((faq) => {
            const row = `
                <tr>
                    <td>${String(faq.index + 1).padStart(2, '0')}</td>
                    <td class="item-name-cell">
                        <div class="faq-qa-container">
                            <div class="faq-question">
                                <strong>Q: </strong>
                                <span class="cell-text" title="${faq.question || ''}">${faq.question || 'No question available...'}</span>
                            </div>
                            <div class="faq-answer">
                                <strong>A: </strong>
                                <span class="cell-text" title="${faq.answer || ''}">${faq.answer || 'No answer available...'}</span>
                            </div>
                        </div>
                    </td>
                    <td><b>${faq.formattedDate}</b></td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn edit-btn" title="Edit" 
                                data-id="${faq.id}" 
                                data-index="${faq.id}"
                                data-faq='${JSON.stringify(faq).replace(/'/g, "&apos;")}'>
                                <span class="edit">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"></path>
                                    </svg>
                                </span>
                            </button>
                            <button class="icon-action-btn delete-btn" title="Delete" data-id="${faq.id}" data-index="${faq.id}">
                                <span class="delete">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    function updatePaginationUI(data) {
        const { totalItems, totalPages, currentPage, start, end } = data.pagination;

        // Update info text
        const footerInfoSpan = document.querySelector('.footer-info span');
        if (footerInfoSpan) {
            footerInfoSpan.textContent = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} FAQs`;
        }

        // Update rows per page select value
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let faqHtml = '';

        // Prev button
        faqHtml += `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M17.2 23.7 L5.4 12 L17.2 0.3 L18.5 1.7 L8.4 12 L18.5 22.3 Z"></path>
                </svg>
            </button>
        `;

        // Page numbers
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        if (endPage - startPage + 1 < maxPages) startPage = Math.max(1, endPage - maxPages + 1);

        for (let i = startPage; i <= endPage; i++) {
            faqHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        faqHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = faqHtml;
    }

    window.changePage = function (page) {
        applyFilters(page);
    };

    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_faq', rowsPerPage);
        applyFilters(1);
    });

    if (searchInput) searchInput.addEventListener('input', () => applyFilters(1));

    // When fromDate changes, restrict toDate to be >= fromDate
    if (fromDateFilter && toDateFilter) {
        fromDateFilter.addEventListener('change', () => {
            toDateFilter.min = fromDateFilter.value;
            if (toDateFilter.value && toDateFilter.value < fromDateFilter.value) {
                toDateFilter.value = '';
            }
        });
    }

    // Date filter Picker Buttons
    const applyDateBtn = document.getElementById('applyDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');

    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', () => {
            const from = fromDateFilter.value;
            const to = toDateFilter.value;

            if (from && to) {
                applyFilters(1);
                if (dateRangeMenu) dateRangeMenu.classList.remove('show');
            } else if (!from && !to) {
                applyFilters(1);
                if (dateRangeMenu) dateRangeMenu.classList.remove('show');
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Incomplete Date filter',
                    text: 'Please select both From and To dates to filter, or clear both to reset.'
                });
            }
        });
    }

    if (clearDateBtn) {
        clearDateBtn.addEventListener('click', () => {
            if (fromDateFilter) fromDateFilter.value = '';
            if (toDateFilter) toDateFilter.value = '';
            applyFilters(1);
        });
    }


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
                                    applyFilters(window.currentPage || 1);
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
                            applyFilters(window.currentPage || 1);
                            closeModal(itemModal);
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
});
