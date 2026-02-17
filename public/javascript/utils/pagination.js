export class PaginationManager {
    constructor(options) {
        this.tableBody = document.querySelector(options.tableBodySelector);
        this.paginationContainer = document.querySelector(options.paginationContainerSelector);
        this.footerInfo = document.querySelector(options.footerInfoSelector);
        this.rowsPerPageOptions = options.rowsPerPageOptions || [5, 10];
        this.storageKey = options.storageKey || 'adminRowsPerPage';
        this.rowsPerPage = parseInt(localStorage.getItem(this.storageKey)) || options.rowsPerPage || 5;

        // Ensure elements exist
        if (!this.tableBody || !this.paginationContainer) {
            console.warn('PaginationManager: Required elements not found', options);
            return;
        }

        this.rows = Array.from(this.tableBody.querySelectorAll('tr'));
        this._allRows = [...this.rows]; // Cache all rows internally
        this.calculateTotalPages();

        // Always start from page 1 on refresh/navigation
        this.currentPage = 1;

        this.init();
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.rows.length / this.rowsPerPage);
    }

    init() {
        // If no rows, clear info
        if (this.rows.length === 0) {
            if (this.footerInfo) this.footerInfo.textContent = 'No entries found';
            this.paginationContainer.innerHTML = '';
            return;
        }

        this.render();
    }

    get allRows() {
        return this._allRows;
    }

    refreshRows(newRows) {
        this.rows = newRows;
        this.currentPage = 1;
        this.calculateTotalPages();
        this.render();
    }

    render() {
        if (this._allRows) {
            this._allRows.forEach(row => row.style.display = 'none');
        } else {
            this.rows.forEach(row => row.style.display = 'none');
        }

        // 2. Show visible rows for current page
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;

        this.rows.forEach((row, index) => {
            if (index >= start && index < end) {
                row.style.display = '';
            }
        });

        // 2. Update Info Text
        if (this.footerInfo) {
            const currentCount = Math.min(end, this.rows.length);
            this.footerInfo.textContent = `Showing ${start + 1} to ${currentCount} of ${this.rows.length} entries`;
        }

        // 3. Update Controls
        this.updateControls();
    }

    updateControls() {
        this.paginationContainer.innerHTML = '';

        // Rows Per Page Selector
        const rowsSelectorWrapper = document.createElement('div');
        rowsSelectorWrapper.className = 'rows-per-page-wrapper';
        rowsSelectorWrapper.innerHTML = `
            <span class="rows-label">Rows per page:</span>
            <select class="rows-select">
                ${this.rowsPerPageOptions.map(opt => `<option value="${opt}" ${opt === this.rowsPerPage ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
        `;

        const select = rowsSelectorWrapper.querySelector('select');
        select.onchange = (e) => {
            this.rowsPerPage = parseInt(e.target.value);
            localStorage.setItem(this.storageKey, this.rowsPerPage);
            this.currentPage = 1;
            this.calculateTotalPages();
            this.render();
        };

        this.paginationContainer.appendChild(rowsSelectorWrapper);

        // Pagination Buttons Wrapper
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.className = 'pagination-buttons';

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.innerHTML = `<i>
                                <svg fill="#000000" height="18" width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M17.2 23.7 L5.4 12 L17.2 0.3 L18.5 1.7 L8.4 12 L18.5 22.3 Z"></path>
                                </svg>
                            </i>`;
        prevBtn.onclick = () => this.changePage(this.currentPage - 1);
        buttonsWrapper.appendChild(prevBtn);

        // Page Numbers
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => this.changePage(i);
            buttonsWrapper.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        nextBtn.innerHTML = `<i>
                                <svg fill="#000000" height="18" width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                                    <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                                </svg>
                            </i>`;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        buttonsWrapper.appendChild(nextBtn);

        this.paginationContainer.appendChild(buttonsWrapper);
    }

    changePage(newPage) {
        if (newPage < 1 || newPage > this.totalPages) return;
        this.currentPage = newPage;
        this.render();
    }
}