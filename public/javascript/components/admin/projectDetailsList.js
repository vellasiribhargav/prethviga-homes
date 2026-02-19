import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import { PaginationManager } from '../../utils/pagination.js';

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
    // Filter functionality
    function applyFilters() {
        const typeValue = filterSelect ? filterSelect.value : 'all';
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = manager.allRows;

        const filteredRows = allRows.filter(row => {
            // Type check
            const type = row.getAttribute('data-type');
            const typeMatch = typeValue === 'all' || type === typeValue;
            if (!typeMatch) return false;

            // Search check (by Project Name and Location)
            const projectName = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const projectLocation = row.cells[3] ? row.cells[3].textContent.toLowerCase() : ''; // Column 3: Location

            const searchMatch = !searchValue ||
                projectName.includes(searchValue) ||
                projectLocation.includes(searchValue);
            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), PROJECT NAME(1), TYPE(2), LOCATION(3), CREATED DATE(4), ACTIONS(5)
            const createdAtCell = row.cells[4];
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

        manager.refreshRows(filteredRows);
    }

    if (filterSelect) filterSelect.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
});
