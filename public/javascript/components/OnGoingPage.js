// OnGoingPage.js

document.addEventListener('DOMContentLoaded', () => {
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

    // scroll option
    const scrollBtn = document.getElementById("scrollToTopBtn");
    window.addEventListener("scroll", () => {
        scrollBtn.classList.toggle("show", window.scrollY > 200);
    });
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});