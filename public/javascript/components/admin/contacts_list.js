import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Pagination
    new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_contacts'
    });

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