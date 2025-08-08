/**
 * Ticket Creation JavaScript
 * Handles form validation, UI interactions, and user experience enhancements
 */

class TicketCreate {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.titleInput = null;
        this.descriptionInput = null;
        this.isSubmitting = false;

        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.form = document.getElementById('ticketForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnLoader = document.getElementById('btnLoader');
        this.titleInput = document.querySelector('#id_title');
        this.descriptionInput = document.querySelector('#id_description');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Real-time validation
        if (this.titleInput) {
            this.titleInput.addEventListener('input', this.debounce(this.validateTitle.bind(this), 300));
            this.titleInput.addEventListener('blur', this.validateTitle.bind(this));
        }

        if (this.descriptionInput) {
            this.descriptionInput.addEventListener('input', this.debounce(this.validateDescription.bind(this), 300));
            this.descriptionInput.addEventListener('blur', this.validateDescription.bind(this));
        }

        // Auto-dismiss alerts
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            setTimeout(() => {
                this.dismissAlert(alert);
            }, 5000); // Auto-dismiss after 5 seconds
        });

        // Character counter for inputs
        this.setupCharacterCounters();
    }

    /**
     * Setup smooth animations
     */
    setupAnimations() {
        // Animate elements on page load
        this.animatePageLoad();
    }

    /**
     * Animate page elements on load
     */
    animatePageLoad() {
        const animatedElements = [
            '.ticket-header',
            '.user-info-card',
            '.form-card',
            '.steps-card'
        ];

        animatedElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        if (this.isSubmitting) {
            e.preventDefault();
            return false;
        }

        // Validate form before submission
        if (!this.validateForm()) {
            e.preventDefault();
            return false;
        }

        // Set loading state
        this.setLoadingState(true);
        this.isSubmitting = true;

        // Form will submit normally, but we show loading state
        // Reset loading state after a delay in case of validation errors
        setTimeout(() => {
            if (this.isSubmitting) {
                this.setLoadingState(false);
                this.isSubmitting = false;
            }
        }, 5000);
    }

    /**
     * Set loading state for submit button
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
     * Validate entire form
     */
    validateForm() {
        let isValid = true;

        // Validate title
        if (!this.validateTitle()) {
            isValid = false;
        }

        // Validate description
        if (!this.validateDescription()) {
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate title field
     */
    validateTitle() {
        if (!this.titleInput) return true;

        const title = this.titleInput.value.trim();
        const minLength = 5;
        const maxLength = 200;

        // Remove previous validation
        this.clearFieldValidation(this.titleInput);

        if (!title) {
            this.showFieldError(this.titleInput, 'Title is required.');
            return false;
        }

        if (title.length < minLength) {
            this.showFieldError(this.titleInput, `Title must be at least ${minLength} characters.`);
            return false;
        }

        if (title.length > maxLength) {
            this.showFieldError(this.titleInput, `Title cannot exceed ${maxLength} characters.`);
            return false;
        }

        this.showFieldSuccess(this.titleInput);
        return true;
    }

    /**
     * Validate description field
     */
    validateDescription() {
        if (!this.descriptionInput) return true;

        const description = this.descriptionInput.value.trim();
        const minLength = 10;

        // Remove previous validation
        this.clearFieldValidation(this.descriptionInput);

        if (!description) {
            this.showFieldError(this.descriptionInput, 'Description is required.');
            return false;
        }

        if (description.length < minLength) {
            this.showFieldError(this.descriptionInput, `Description must be at least ${minLength} characters.`);
            return false;
        }

        this.showFieldSuccess(this.descriptionInput);
        return true;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.add('is-invalid');
        field.style.borderColor = 'var(--danger-color)';

        // Remove existing error message
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.style.fontSize = 'var(--font-size-xs)';
        errorDiv.style.marginTop = 'var(--spacing-xs)';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        const helpText = formGroup.querySelector('.form-help');
        if (helpText) {
            formGroup.insertBefore(errorDiv, helpText);
        } else {
            formGroup.appendChild(errorDiv);
        }
    }

    /**
     * Show field success
     */
    showFieldSuccess(field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        field.style.borderColor = 'var(--success-color)';
    }

    /**
     * Clear field validation
     */
    clearFieldValidation(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.remove('is-invalid', 'is-valid');
        field.style.borderColor = '';

        const errorDiv = formGroup.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        if (this.titleInput) {
            this.addCharacterCounter(this.titleInput, 200);
        }

        if (this.descriptionInput) {
            this.addCharacterCounter(this.descriptionInput, 1000);
        }
    }

    /**
     * Add character counter to field
     */
    addCharacterCounter(field, maxLength) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.fontSize = 'var(--font-size-xs)';
        counter.style.color = 'var(--gray-500)';
        counter.style.textAlign = 'right';
        counter.style.marginTop = 'var(--spacing-xs)';

        // Update counter
        const updateCounter = () => {
            const currentLength = field.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;

            if (currentLength > maxLength * 0.9) {
                counter.style.color = 'var(--warning-color)';
            } else if (currentLength > maxLength) {
                counter.style.color = 'var(--danger-color)';
            } else {
                counter.style.color = 'var(--gray-500)';
            }
        };

        field.addEventListener('input', updateCounter);
        updateCounter();

        formGroup.appendChild(counter);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (this.form && !this.isSubmitting) {
                    e.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape = Clear form
            if (e.key === 'Escape') {
                if (confirm('Are you sure you want to clear the form?')) {
                    this.clearForm();
                }
            }
        });
    }

    /**
     * Clear form fields
     */
    clearForm() {
        if (this.titleInput) {
            this.titleInput.value = '';
            this.clearFieldValidation(this.titleInput);
        }

        if (this.descriptionInput) {
            this.descriptionInput.value = '';
            this.clearFieldValidation(this.descriptionInput);
        }

        // Update character counters
        this.titleInput?.dispatchEvent(new Event('input'));
        this.descriptionInput?.dispatchEvent(new Event('input'));

        // Focus first field
        if (this.titleInput) {
            this.titleInput.focus();
        }
    }

    /**
     * Setup tooltips
     */
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            this.enhanceTooltip(element);
        });
    }

    /**
     * Enhance tooltip functionality
     */
    enhanceTooltip(element) {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = element.getAttribute('title');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--gray-800);
                color: var(--white);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--border-radius-sm);
                font-size: var(--font-size-xs);
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity var(--transition-normal);
            `;

            document.body.appendChild(tooltip);

            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';

            // Remove original title to prevent browser tooltip
            element.setAttribute('data-title', element.getAttribute('title'));
            element.removeAttribute('title');

            setTimeout(() => tooltip.style.opacity = '1', 10);

            // Store reference for cleanup
            element._tooltip = tooltip;
        });

        element.addEventListener('mouseleave', (e) => {
            if (element._tooltip) {
                element._tooltip.remove();
                element._tooltip = null;
            }

            // Restore title
            if (element.getAttribute('data-title')) {
                element.setAttribute('title', element.getAttribute('data-title'));
                element.removeAttribute('data-title');
            }
        });
    }

    /**
     * Dismiss alert
     */
    dismissAlert(alert) {
        if (alert) {
            alert.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                alert.remove();
            }, 300);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert--${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="alert-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.querySelector('.messages-container') ||
                         document.querySelector('.ticket-container');

        if (container) {
            container.insertAdjacentElement('afterbegin', notification);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                this.dismissAlert(notification);
            }, 5000);
        }
    }

    /**
     * Debounce utility function
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
    window.ticketCreate = new TicketCreate();
});

// Expose class to global scope for external access
window.TicketCreate = TicketCreate;
