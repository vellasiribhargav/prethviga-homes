import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

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
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by name, email and phone)
            const name = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const email = row.cells[2] ? row.cells[2].textContent.toLowerCase() : '';
            const phone = row.cells[3] ? row.cells[3].textContent.toLowerCase() : '';

            const searchMatch = !searchValue ||
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                phone.includes(searchValue);

            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), NAME(1), EMAIL(2), PHONE(3), ADDRESS(4), CREATED DATE(5)
            const createdAtCell = row.cells[5];
            const createdAtValue = createdAtCell ? createdAtCell.textContent.trim() : '';

            let dateMatch = true;
            if (dateValue && createdAtValue) {
                const rowDate = dayjs(createdAtValue, 'DD MMM...');
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
