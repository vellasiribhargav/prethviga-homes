import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';
import { getSearchValue, getDateValue, matchesSearch, matchesDate } from '../../utils/searchUtils.js';

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_contacts'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = getSearchValue(searchInput);
        const dateValue = getDateValue(dateFilter);

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by name, email and phone)
            const name = row.querySelector('.item-name-cell')?.textContent || '';
            const email = row.cells[2]?.textContent || '';
            const phone = row.cells[3]?.textContent || '';

            if (!matchesSearch(searchValue, name, email, phone)) return false;

            // Date check (by Creation Date)
            const createdAtValue = row.cells[5]?.textContent.trim() || '';
            if (!matchesDate(dateValue, createdAtValue, ['DD MMM YYYY', 'DD-MM-YYYY'])) return false;

            return true;
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

    // // Handle Delete Contact
    // $(document).on('click', '.delete-btn', function (e) {
    //     const id = $(this).data('id');

    //     Swal.fire({
    //         title: 'Are you sure?',
    //         text: "You won't be able to revert this!",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#BC5322',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, delete it!'
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             $.ajax({
    //                 url: `/admin/contacts/delete/${id}`,
    //                 type: 'DELETE',
    //                 success: function (data) {
    //                     if (data.success) {
    //                         Swal.fire(
    //                             'Deleted!',
    //                             'Contact has been deleted.',
    //                             'success'
    //                         ).then(() => {
    //                             window.location.reload();
    //                         });
    //                     } else {
    //                         Swal.fire(
    //                             'Error!',
    //                             data.message || 'Failed to delete contact',
    //                             'error'
    //                         );
    //                     }
    //                 },
    //                 error: function (xhr) {
    //                     Swal.fire(
    //                         'Error!',
    //                         xhr.responseJSON?.message || 'Server error occurred',
    //                         'error'
    //                     );
    //                 }
    //             });
    //         }
    //     });
    // });
});
