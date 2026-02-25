import Swal from 'sweetalert2';
import { showFieldError, hideFieldError } from '../../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewTitleInput = document.getElementById('review-title');
    const addReviewBtn = document.getElementById('add-review-btn');
    const saveAllBtn = document.getElementById('save-all-btn');
    const reviewTemplate = document.getElementById('review-template');

    let originalData = null;

    // Fetch initial data
    async function fetchReviews() {
        try {
            const response = await fetch('/admin/reviews/get');
            const result = await response.json();

            if (result.success) {
                originalData = result.data;
                populateForm(result.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Fetch Failed',
                    text: result.message || 'Failed to fetch reviews',
                    confirmButtonColor: '#c1834e'
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while fetching reviews.',
                confirmButtonColor: '#c1834e'
            });
        }
    }

    const populateForm = (data) => {
        reviewsContainer.innerHTML = '';
        const content = data.page_content || [];
        let reviewCount = 0;

        content.forEach(item => {
            if (item['review-title']) {
                reviewTitleInput.value = item['review-title'];
            } else {
                addReviewRow(item);
                reviewCount++;
            }
        });

        if (reviewCount === 0) {
            addReviewRow();
        }
    };

    const addReviewRow = (data = {}) => {
        const clone = reviewTemplate.content.cloneNode(true);
        const reviewItem = clone.querySelector('.review-item');

        const textArea = reviewItem.querySelector('.review-text');
        const nameInput = reviewItem.querySelector('.client-name');
        const roleInput = reviewItem.querySelector('.client-role');
        const footerInput = reviewItem.querySelector('.review-footer');
        const removeBtn = reviewItem.querySelector('.remove-review');

        textArea.value = data.review_text || data['review-text'] || '';
        nameInput.value = data.reviewer_name || data['client-name'] || '';
        roleInput.value = data.reviewer_role || data['client-role'] || '';
        if (footerInput) footerInput.value = data.review_footer || data['review-footer'] || '';

        // Remove placeholder if it exists
        const placeholder = reviewsContainer.querySelector('.empty-reviews-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        removeBtn.addEventListener('click', () => {
            reviewItem.remove();
            // Check if we need to add an empty row again
            if (reviewsContainer.querySelectorAll('.review-item').length === 0) {
                addReviewRow();
            }
        });

        // Add event listeners for real-time validation and char limit
        setupReviewItemEvents(reviewItem);

        if (data && Object.keys(data).length > 0) {
            reviewsContainer.appendChild(clone);
        } else {
            reviewsContainer.prepend(clone);
        }
    };

    const REQUIRED_REVIEW_FIELDS = [
        { selector: '.review-text', message: '* Review text is required' },
        { selector: '.client-name', message: '* Client name is required' },
        { selector: '.client-role', message: '* Role is required' },
        { selector: '.review-footer', message: '* Footer is required' }
    ];

    const setupReviewItemEvents = (item) => {
        const inputs = item.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Clear error on input
            input.addEventListener('input', () => {
                hideFieldError(input);

                if (input.tagName === 'TEXTAREA') {
                    const container = input.closest('.form-group') || input.parentNode;
                    let charLimitMsg = container.querySelector('.char-limit-msg');
                    const limit = input.maxLength || 200;
                    if (charLimitMsg) {
                        charLimitMsg.style.display = input.value.length >= limit ? 'block' : 'none';
                        charLimitMsg.textContent = `* Characters are more than ${limit}`;
                    }
                }
            });

            // Show error on blur for required fields
            input.addEventListener('blur', () => {
                const fieldDef = REQUIRED_REVIEW_FIELDS.find(f => input.matches(f.selector));
                if (fieldDef && !input.value.trim()) {
                    showFieldError(input, fieldDef.message);
                }
            });
        });
    };

    // For the header title — clear on input, validate on blur
    if (reviewTitleInput) {
        reviewTitleInput.addEventListener('input', () => {
            hideFieldError(reviewTitleInput);
        });
        reviewTitleInput.addEventListener('blur', () => {
            if (!reviewTitleInput.value.trim()) {
                showFieldError(reviewTitleInput, '* Section title is required');
            }
        });
    }

    addReviewBtn.addEventListener('click', () => {
        addReviewRow();
    });

    saveAllBtn.addEventListener('click', async () => {
        const page_content = [];
        let hasError = false;

        // Clear previous errors
        document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

        // Validate section title
        const sectionTitle = reviewTitleInput.value.trim();
        if (!sectionTitle) {
            showFieldError(reviewTitleInput, '* Section title is required');
            hasError = true;
        }

        // Add header title
        page_content.push({ 'review-title': sectionTitle });

        // Validate and Add review items
        const reviewItems = reviewsContainer.querySelectorAll('.review-item');

        if (reviewItems.length === 0) {
            let noReviewMsg = document.getElementById('no-reviews-msg');
            if (!noReviewMsg) {
                noReviewMsg = document.createElement('div');
                noReviewMsg.id = 'no-reviews-msg';
                noReviewMsg.className = 'no-reviews-error';
                noReviewMsg.textContent = '* Please add at least one review.';
                saveAllBtn.parentNode.insertBefore(noReviewMsg, saveAllBtn);
            }
            noReviewMsg.classList.add('show');
            return;
        } else {
            const noReviewMsg = document.getElementById('no-reviews-msg');
            if (noReviewMsg) noReviewMsg.classList.remove('show');
        }

        reviewItems.forEach((item, index) => {
            const reviewText = item.querySelector('.review-text')?.value.trim() || '';
            const clientName = item.querySelector('.client-name')?.value.trim() || '';
            const clientRole = item.querySelector('.client-role')?.value.trim() || '';
            const reviewFooter = item.querySelector('.review-footer')?.value.trim() || '';

            // Validate required fields
            REQUIRED_REVIEW_FIELDS.forEach(({ selector, message }) => {
                const input = item.querySelector(selector);
                if (input && !input.value.trim()) {
                    showFieldError(input, message);
                    hasError = true;
                }
            });

            page_content.push({
                review_text: reviewText,
                reviewer_name: clientName,
                reviewer_role: clientRole,
                review_footer: reviewFooter
            });
        });

        if (hasError) {
            // Swal.fire removed as per user request for inline validation
            return;
        }

        // Change detection — compare current form state against original loaded data
        const originalContent = (originalData?.page_content || []);
        const currentJson = JSON.stringify(page_content);
        const originalJson = JSON.stringify(
            originalContent.map(item => {
                if (item['review-title']) return { 'review-title': item['review-title'] };
                return {
                    review_text: item.review_text || item['review-text'] || '',
                    reviewer_name: item.reviewer_name || item['client-name'] || '',
                    reviewer_role: item.reviewer_role || item['client-role'] || '',
                    review_footer: item.review_footer || item['review-footer'] || ''
                };
            })
        );
        if (currentJson === originalJson) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes detected',
                confirmButtonColor: '#c1834e'
            });
            return;
        }

        try {
            saveAllBtn.disabled = true;
            const originalText = saveAllBtn.textContent;
            saveAllBtn.textContent = 'Saving...';

            const response = await fetch('/admin/reviews/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page_content })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Content updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = `/admin/reviews/list`;
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Save Failed',
                    text: result.message || 'Unknown error occurred.',
                    confirmButtonColor: '#c1834e'
                });
            }
        } catch (error) {
            console.error('Error saving reviews:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred while saving.',
                confirmButtonColor: '#c1834e'
            });
        } finally {
            saveAllBtn.disabled = false;
            saveAllBtn.textContent = 'Save All Changes';
        }
    });

    async function fetchReviews() {
        try {
            const response = await fetch('/admin/reviews/get');
            const result = await response.json();
            if (result.success) {
                originalData = result.data;
                populateForm(result.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Fetch Failed',
                    text: result.message,
                    confirmButtonColor: '#c1834e'
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Connection failed while fetching reviews.',
                confirmButtonColor: '#c1834e'
            });
        }
    }
    fetchReviews();
});
