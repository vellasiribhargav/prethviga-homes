import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Pagination
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
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_reviews')) || 5;

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
            url: `/admin/reviews/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    renderTable(data.reviews);
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
                Swal.fire('Error!', xhr.responseJSON?.message || 'Failed to fetch reviews', 'error');
            }
        });
    }

    function renderTable(reviews) {
        const tbody = $(".data-table tbody:not(#noResultsTbody)");
        tbody.empty();

        if (reviews.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        reviews.forEach((review) => {
            const row = `
                <tr>
                    <td>${String(review.index + 1).padStart(2, '0')}</td>
                    <td class="item-name-cell">${review.reviewer_name}</td>
                    <td>${review.review_text}</td>
                    <td><b>${review.formattedDate}</b></td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn delete-btn" title="Delete" data-index="${review.id}">
                                <span class="delete">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 19.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
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
            footerInfoSpan.textContent = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} reviews`;
        }

        // Update rows per page select value
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let reviewHtml = '';

        // Prev button
        reviewHtml += `
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
            reviewHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        reviewHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = reviewHtml;
    }

    window.changePage = function (page) {
        applyFilters(page);
    };

    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_reviews', rowsPerPage);
        applyFilters(1);
    });

    if (searchInput) searchInput.addEventListener('input', () => applyFilters(1));

    // Date filter Logic
    const applyDateBtn = document.getElementById('applyDateBtn');
    const clearDateBtn = document.getElementById('clearDateBtn');

    // When fromDate changes, restrict toDate to be >= fromDate
    if (fromDateFilter && toDateFilter) {
        fromDateFilter.addEventListener('change', () => {
            toDateFilter.min = fromDateFilter.value;
            if (toDateFilter.value && toDateFilter.value < fromDateFilter.value) {
                toDateFilter.value = '';
            }
        });
    }

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

    // Remove old listeners that triggered on change
    // if (fromDateFilter) fromDateFilter.addEventListener('change', applyFilters);
    // if (toDateFilter) toDateFilter.addEventListener('change', applyFilters);




    // Handle Delete Button Click
    $(document).on('click', '.delete-btn', async function () {
        const index = $(this).data('index');

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c1834e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/reviews/delete/${index}`,
                type: 'DELETE',
                success: function (res) {
                    if (res.success) {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Review has been deleted.',
                            icon: 'success',
                            confirmButtonColor: '#c1834e'
                        }).then(() => {
                            applyFilters(window.currentPage || 1);
                        });
                    } else {
                        Swal.fire('Error!', res.message || 'Failed to delete review', 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire('Error!', 'Server error', 'error');
                }
            });
        }
    });
});
