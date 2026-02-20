import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import { PaginationManager } from '../../utils/pagination.js';
import { getSearchValue, getDateValue, matchesSearch, matchesDate } from '../../utils/searchUtils.js';

document.addEventListener('DOMContentLoaded', function () {
    const filterSelect = document.getElementById('projectTypeFilter');
    const searchInput = document.getElementById('searchInput'); // Add this
    const dateFilter = document.getElementById('dateFilter'); // Add this
    const tbody = document.querySelector('.data-table tbody');

    // Initialize Pagination
    const manager = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 10,
        storageKey: 'rowsPerPage_projectDetails'
    });

    // Filter functionality
    function applyFilters() {
        const typeValue = filterSelect ? filterSelect.value : 'all';
        const searchValue = getSearchValue(searchInput);
        const dateValue = getDateValue(dateFilter);

        const allRows = manager.allRows;

        const filteredRows = allRows.filter(row => {
            // Type check
            const type = row.getAttribute('data-type');
            if (typeValue !== 'all' && type !== typeValue) return false;

            // Search check (by Project Name and Location)
            const projectName = row.querySelector('.item-name-cell')?.textContent || '';
            const projectLocation = row.cells[3]?.textContent || '';

            if (!matchesSearch(searchValue, projectName, projectLocation)) return false;

            // Date check (by Creation Date)
            const createdAtValue = row.cells[4]?.textContent.trim() || '';
            if (!matchesDate(dateValue, createdAtValue, ['DD MMM YYYY', 'DD-MM-YYYY'])) return false;

            return true;
        });

        // Update S.NO
        filteredRows.forEach((row, idx) => {
            if (row.cells && row.cells.length > 0) {
                row.cells[0].textContent = String(idx + 1).padStart(2, '0');
            }
        });

        manager.refreshRows(filteredRows);
    }

    if (filterSelect) filterSelect.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
});
