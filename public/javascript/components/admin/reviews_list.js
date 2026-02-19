import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import $ from 'jquery';
import Swal from 'sweetalert2';
import { PaginationManager } from '../../utils/pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Pagination
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    // Initialize Pagination
    const pagination = new PaginationManager({
        tableBodySelector: '.data-table tbody',
        paginationContainerSelector: '.pagination',
        footerInfoSelector: '.footer-info span',
        rowsPerPage: 5,
        storageKey: 'rowsPerPage_reviews'
    });

    // Filter Logic
    function applyFilters() {
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        const allRows = pagination.allRows;

        const filteredRows = allRows.filter(row => {
            // Search check (by client name)
            const clientName = row.querySelector('.item-name-cell') ? row.querySelector('.item-name-cell').textContent.toLowerCase() : '';
            const searchMatch = !searchValue || clientName.includes(searchValue);
            if (!searchMatch) return false;

            // Date check (by Creation Date)
            // Column indices: S.NO(0), CLIENT NAME(1), REVIEW PREVIEW(2), CREATED DATE(3), ACTIONS(4)
            const createdAtCell = row.cells[3];
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

        // Handle "No data found" logic
        const noResultsRow = document.getElementById('noResultsRow');

        if (filteredRows.length === 0) {
            if (noResultsRow) {
                noResultsRow.style.display = '';
            }
        } else {
            if (noResultsRow) {
                noResultsRow.style.display = 'none';
            }
        }

        pagination.refreshRows(filteredRows);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);


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
                            window.location.reload();
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
