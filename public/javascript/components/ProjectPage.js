
// Tab switching functionality
const completedContainer = document.getElementById('completed-title');
const ongoingContainer = document.getElementById('ongoing-title');

// Initial state handling: hide ongoing if both exist
if (completedContainer && ongoingContainer) {
    ongoingContainer.style.display = 'none';
}

// Get all tab buttons
const tabButtons = document.querySelectorAll('.tab-btn');

// Add click event listeners to tab buttons
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active-tab'));

        // Add active class to the clicked tab
        button.classList.add('active-tab');

        // Get the data attribute to determine which tab was clicked
        const projectType = button.dataset.project;

        if (projectType === 'Completed Project') {
            // Show completed content, hide ongoing
            if (completedContainer) completedContainer.style.display = 'block';
            if (ongoingContainer) ongoingContainer.style.display = 'none';
        } else if (projectType === 'Ongoing Project') {
            // Hide completed content, show ongoing
            if (completedContainer) completedContainer.style.display = 'none';
            if (ongoingContainer) ongoingContainer.style.display = 'block';
        }
    });
});


// FAQ accordion functionality
const faqCards = document.querySelectorAll('.faq-item-card');

faqCards.forEach(card => {
    const questionHeader = card.querySelector('.faq-question-header');
    const toggleIcon = card.querySelector('.faq-toggle-icon');
    const answerContent = card.querySelector('.faq-answer-content');

    questionHeader.addEventListener('click', () => {
        const isExpanded = answerContent.classList.contains('visible');

        // Close all other FAQs
        faqCards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.querySelector('.faq-answer-content').classList.remove('visible');
                otherCard.querySelector('.faq-toggle-icon').classList.remove('expanded');
            }
        });

        // Toggle current FAQ
        if (isExpanded) {
            answerContent.classList.remove('visible');
            toggleIcon.classList.remove('expanded');
        } else {
            answerContent.classList.add('visible');
            toggleIcon.classList.add('expanded');
        }
    });
});

