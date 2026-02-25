import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import { PaginationManager } from '../../utils/pagination.js';
import { getSearchValue, getDateValue, getDateRangeValues, matchesSearch, matchesDate, matchesDateRange } from '../../utils/searchUtils.js';

document.addEventListener('DOMContentLoaded', function () {
    const filterSelect = document.getElementById('projectTypeFilter');
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
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage_projectDetails')) || 5;
    window.currentPage = 1;

    if (rowsPerPageSelect) {
        rowsPerPageSelect.value = rowsPerPage;
    }

    // Filter functionality
    function applyFilters(page = 1) {
        const params = {
            search: getSearchValue(searchInput),
            type: filterSelect ? filterSelect.value : 'all',
            fromDate: fromDateFilter ? fromDateFilter.value : '',
            toDate: toDateFilter ? toDateFilter.value : '',
            page: page,
            limit: rowsPerPage,
            is_filter: true
        };

        $.ajax({
            url: `/admin/projectDetails/list`,
            type: 'GET',
            data: params,
            success: function (data) {
                if (data.success) {
                    window.currentPage = data.pagination.currentPage;
                    renderTable(data.projects);
                    updatePaginationUI(data);
                } else {
                    Swal.fire('Error!', data.message || 'Failed to fetch projects', 'error');
                }
            },
            error(xhr) {
                Swal.fire('Error!', xhr.responseJSON?.message || 'Failed to fetch projects', 'error');
            }
        });
    }

    function renderTable(projects) {
        const tbody = $("#projectDetailsTableBody");
        tbody.empty();

        if (projects.length === 0) {
            $("#noResultsTbody").show();
            return;
        } else {
            $("#noResultsTbody").hide();
        }

        projects.forEach((project) => {
            const row = `
                <tr data-id="${project.id}" data-type="${project.type}">
                    <td>${String(project.index + 1).padStart(2, '0')}</td>
                    <td class="item-name-cell">${project.project_name}</td>
                    <td>${project.type === 'upcoming' ? 'Upcoming' : 'Completed'}</td>
                    <td>${project.location}</td>
                    <td><b>${project.formattedDate}</b></td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-action-btn edit-btn" title="Manage Details" onclick="window.location.href='/admin/projectDetails/details?projectId=${project.id}&type=${project.type}'">
                                <span class="edit">
                                    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"></path>
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
            footerInfoSpan.textContent = `Showing ${totalItems === 0 ? 0 : start} to ${end} of ${totalItems} projects`;
        }

        // Update rows per page select value
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = data.rowsPerPage || rowsPerPage;
        }

        // Update pagination buttons
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let paginationHtml = '';

        // Prev button
        paginationHtml += `
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
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>`;
        }

        // Next button
        paginationHtml += `
            <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <svg fill="#000000" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                  <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                </svg>
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;
    }

    window.changePage = function (page) {
        applyFilters(page);
    };

    $(document).on('change', '#rowsPerPageSelect', function () {
        rowsPerPage = parseInt(this.value);
        localStorage.setItem('rowsPerPage_projectDetails', rowsPerPage);
        applyFilters(1);
    });

    if (filterSelect) filterSelect.addEventListener('change', () => applyFilters(window.currentPage || 1));
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
            applyFilters(window.currentPage || 1);
        });
    }
});
