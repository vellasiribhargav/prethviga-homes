import { PaginationManager } from '../../utils/pagination.js';

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Pagination
    new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5
    });
});