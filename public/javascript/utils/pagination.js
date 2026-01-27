export class PaginationManager {
    constructor(options) {
        this.tableBody = document.querySelector(options.tableBodySelector);
        this.paginationContainer = document.querySelector(options.paginationContainerSelector);
        this.footerInfo = document.querySelector(options.footerInfoSelector);
        this.rowsPerPage = options.rowsPerPage || 5;

        // Ensure elements exist
        if (!this.tableBody || !this.paginationContainer) {
            console.warn('PaginationManager: Required elements not found', options);
            return;
        }

        this.rows = Array.from(this.tableBody.querySelectorAll('tr'));
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.rows.length / this.rowsPerPage);

        // Check if table is empty or has "No data" row
        // Assuming "No data" row usually has a colspan or specific class, 
        // but for now, if 1 row and text implies empty, we might skip, 
        // or just let it be 1 page.

        this.init();
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

    render() {
        // 1. Toggle visibility of rows
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;

        this.rows.forEach((row, index) => {
            if (index >= start && index < end) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
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

        // If only 1 page, maybe hide controls? Or just show disabled. 
        // User requested limit 5, so if <=5 items, 1 page.

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
        this.paginationContainer.appendChild(prevBtn);

        // Page Numbers
        // To avoid too many buttons, we can show: 1, 2, ..., Last
        // For simplicity in this task, let's show all if < 7, else with ellipsis logic?
        // Let's stick to simple all-buttons for now unless list is huge, 
        // as per typical admin panel requirements in this context.

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
            this.paginationContainer.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.innerHTML = `<i>
                                <svg fill="#000000" height="18" width="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
                                    <path d="M6.8 23.7 L5.4 22.3 L15.7 12 L5.4 1.7 L6.8 0.3 L18.5 12 Z"></path>
                                </svg>
                            </i>`;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        this.paginationContainer.appendChild(nextBtn);
    }

    changePage(newPage) {
        if (newPage < 1 || newPage > this.totalPages) return;
        this.currentPage = newPage;
        this.render();
    }
}