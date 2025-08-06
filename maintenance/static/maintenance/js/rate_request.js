/**
 * Rate Request JavaScript Module
 * Handles interactive functionality for the maintenance rating form
 */
class RateRequest {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.ratingOptions = [];
        this.init();
    }

    /**
     * Initialize the rate request functionality
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.enhanceForm();
        this.addAnimations();
        console.log('Rate Request module initialized');
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.form = document.getElementById('ratingForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.ratingOptions = document.querySelectorAll('.rating-option');
        this.textArea = document.querySelector('textarea[name="student_feedback"]');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Enhanced rating option interactions
        this.ratingOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');

            // Click on entire option
            option.addEventListener('click', () => {
                if (radio && !radio.checked) {
                    radio.checked = true;
                    this.handleRatingSelect(radio);
                }
            });

            // Radio button change
            if (radio) {
                radio.addEventListener('change', () => {
                    this.handleRatingSelect(radio);
                });
            }

            // Keyboard navigation
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (radio) {
                        radio.checked = true;
                        this.handleRatingSelect(radio);
                    }
                }
            });

            // Make option focusable
            option.setAttribute('tabindex', '0');
        });

        // Enhanced textarea interactions
        if (this.textArea) {
            this.textArea.addEventListener('focus', this.handleTextareaFocus.bind(this));
            this.textArea.addEventListener('blur', this.handleTextareaBlur.bind(this));
            this.textArea.addEventListener('input', this.handleTextareaInput.bind(this));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Form validation on input change
        this.bindFormValidation();
    }

    /**
     * Handle rating selection
     */
    handleRatingSelect(radio) {
        const value = parseInt(radio.value);
        const option = radio.closest('.rating-option');

        // Remove previous selections
        this.ratingOptions.forEach(opt => {
            opt.classList.remove('selected', 'animate-selection');
        });

        // Add selection to current option
        if (option) {
            option.classList.add('selected');
            setTimeout(() => {
                option.classList.add('animate-selection');
            }, 50);
        }

        // Show contextual feedback message
        this.showRatingFeedback(value);

        // Enable submit button if it was disabled
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('btn-disabled');
        }

        // Scroll to feedback section for ratings 1-3
        if (value <= 3 && this.textArea) {
            setTimeout(() => {
                this.textArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.textArea.focus();
            }, 500);
        }
    }

    /**
     * Show contextual feedback based on rating
     */
    showRatingFeedback(rating) {
        const messages = {
            1: "We're sorry to hear about your experience. Please provide details so we can improve.",
            2: "Thank you for your feedback. Please let us know how we can do better.",
            3: "Thanks for rating our service. Any additional feedback would be helpful.",
            4: "Great to hear you're satisfied! Feel free to share what went well.",
            5: "Excellent! We're thrilled you had a great experience. Tell us more!"
        };

        const message = messages[rating];
        if (message && this.textArea) {
            const placeholder = this.textArea.getAttribute('placeholder');
            this.textArea.setAttribute('data-original-placeholder', placeholder);
            this.textArea.setAttribute('placeholder', message);
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(event) {
        event.preventDefault();

        // Check if rating is selected
        const selectedRating = this.form.querySelector('input[name="student_rating"]:checked');
        if (!selectedRating) {
            this.showNotification('Please select a rating before submitting.', 'warning');
            this.focusFirstRatingOption();
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Add slight delay for better UX
        setTimeout(() => {
            this.form.submit();
        }, 500);
    }

    /**
     * Set loading state for form submission
     */
    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    /**
     * Handle textarea interactions
     */
    handleTextareaFocus() {
        if (this.textArea) {
            this.textArea.parentElement.classList.add('focused');
        }
    }

    handleTextareaBlur() {
        if (this.textArea) {
            this.textArea.parentElement.classList.remove('focused');
        }
    }

    handleTextareaInput(event) {
        const textarea = event.target;
        const counter = textarea.parentElement.querySelector('.character-counter');

        if (counter) {
            counter.textContent = `${textarea.value.length} characters`;
        }

        // Auto-resize textarea
        this.autoResizeTextarea(textarea);
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Focus first rating option
     */
    focusFirstRatingOption() {
        const firstOption = this.ratingOptions[0];
        if (firstOption) {
            firstOption.focus();
            firstOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Number keys for quick rating (1-5)
        if (event.key >= '1' && event.key <= '5' && !event.target.matches('textarea, input')) {
            const ratingValue = event.key;
            const radio = this.form.querySelector(`input[name="student_rating"][value="${ratingValue}"]`);
            if (radio) {
                radio.checked = true;
                this.handleRatingSelect(radio);
            }
        }

        // Ctrl/Cmd + Enter to submit
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (this.form) {
                this.handleFormSubmit(event);
            }
        }

        // Escape to focus back to rating options
        if (event.key === 'Escape' && event.target.matches('textarea')) {
            const selectedRating = this.form.querySelector('input[name="student_rating"]:checked');
            if (selectedRating) {
                const option = selectedRating.closest('.rating-option');
                if (option) {
                    option.focus();
                }
            }
        }
    }

    /**
     * Bind form validation
     */
    bindFormValidation() {
        const radioButtons = this.form.querySelectorAll('input[name="student_rating"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                this.validateForm();
            });
        });
    }

    /**
     * Validate form
     */
    validateForm() {
        const selectedRating = this.form.querySelector('input[name="student_rating"]:checked');
        const isValid = !!selectedRating;

        if (this.submitBtn) {
            this.submitBtn.disabled = !isValid;
            if (isValid) {
                this.submitBtn.classList.remove('btn-disabled');
            } else {
                this.submitBtn.classList.add('btn-disabled');
            }
        }

        return isValid;
    }

    /**
     * Enhance form with additional features
     */
    enhanceForm() {
        // Add character counter to textarea
        if (this.textArea) {
            this.addCharacterCounter();
            this.autoResizeTextarea(this.textArea);
        }

        // Initial form validation
        this.validateForm();

        // Add helpful tooltips
        this.addTooltips();
    }

    /**
     * Add character counter to textarea
     */
    addCharacterCounter() {
        if (!this.textArea) return;

        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 0.75rem;
            color: var(--gray-500);
            text-align: right;
            margin-top: 0.25rem;
        `;
        counter.textContent = '0 characters';

        this.textArea.parentElement.appendChild(counter);

        // Update counter on input
        this.textArea.addEventListener('input', () => {
            counter.textContent = `${this.textArea.value.length} characters`;
        });
    }

    /**
     * Add helpful tooltips
     */
    addTooltips() {
        // Add tooltips to rating stars
        const starElements = document.querySelectorAll('.stars');
        starElements.forEach(stars => {
            stars.setAttribute('title', 'Click to select this rating');
        });

        // Add tooltip to submit button
        if (this.submitBtn) {
            this.submitBtn.setAttribute('title', 'Submit your rating and feedback');
        }
    }

    /**
     * Add entrance animations
     */
    addAnimations() {
        // Stagger animation for cards
        const cards = document.querySelectorAll('.summary-card, .rating-card, .guidelines-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Animate rating options
        setTimeout(() => {
            this.ratingOptions.forEach((option, index) => {
                option.style.animationDelay = `${index * 0.1}s`;
                option.classList.add('animate-in');
            });
        }, 300);
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? 'var(--warning-color)' : 'var(--info-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove notification
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Get CSRF token for AJAX requests
     */
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    /**
     * Utility method for debouncing
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RateRequest();
});

// Export for external use
window.RateRequest = RateRequest;
