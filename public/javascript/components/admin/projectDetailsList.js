import { PaginationManager } from '../../utils/pagination.js';

document.addEventListener('DOMContentLoaded', function () {
    const filterSelect = document.getElementById('projectTypeFilter');
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
    // console.log('Setup Filter:', { filterSelect, tbody, manager });
    if (filterSelect && tbody && manager) {
        filterSelect.addEventListener('change', function () {
            // console.log('Filter changed:', this.value);
            const filterValue = this.value;
            const allRows = manager.allRows;

            const filteredRows = allRows.filter(row => {
                const type = row.getAttribute('data-type');
                return filterValue === 'all' || filterValue === type;
            });

            manager.refreshRows(filteredRows);
        });
    }
});
