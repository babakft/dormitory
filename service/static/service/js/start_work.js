/**
 * Enhanced Start Work Page JavaScript
 * Provides comprehensive form validation and UX improvements
 */

class StartWorkManager {
    constructor() {
        // Form elements
        this.form = document.getElementById('startWorkForm');
        this.submitBtn = document.getElementById('startWorkBtn');
        this.notesField = document.getElementById('id_expert_notes');

        // Configuration
        this.config = {
            minChars: 10,
            maxChars: 1000,
            warningThreshold: 50,
            debounceDelay: 300
        };

        // State
        this.isSubmitting = false;
        this.charCount = 0;

        if (this.form) {
            this.init();
        }
    }

    /**
     * Initialize the start work manager
     */
    init() {
        console.log('🚀 Start Work Manager initializing...');

        this.setupFormValidation();
        this.setupCharacterCounter();
        this.setupFormSubmission();
        this.setupNotesField();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.animatePageLoad();

        console.log('✅ Start Work Manager initialized');
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        if (!this.notesField || !this.submitBtn) return;

        // Real-time validation on input
        this.notesField.addEventListener('input', this.debounce(() => {
            this.validateForm();
        }, this.config.debounceDelay));

        // Validation on blur
        this.notesField.addEventListener('blur', () => {
            this.validateForm();
        });

        // Initial validation
        this.validateForm();
    }

    /**
     * Validate form and update UI
     */
    validateForm() {
        const notes = this.notesField.value.trim();
        const charCount = notes.length;
        const isValid = charCount >= this.config.minChars && charCount <= this.config.maxChars;

        // Update button state
        if (this.submitBtn) {
            this.submitBtn.disabled = !isValid;

            if (!isValid && charCount > 0) {
                if (charCount < this.config.minChars) {
                    this.updateButtonText(`Need ${this.config.minChars - charCount} more characters`);
                } else if (charCount > this.config.maxChars) {
                    this.updateButtonText(`${charCount - this.config.maxChars} characters over limit`);
                }
            } else if (isValid) {
                this.updateButtonText('Start Work', true);
            } else {
                this.updateButtonText('Start Work');
            }
        }

        // Visual feedback
        this.updateFieldVisualFeedback(isValid, charCount);

        return isValid;
    }

    /**
     * Update button text
     */
    updateButtonText(text, isValid = false) {
        if (!this.submitBtn) return;

        const icon = isValid ?
            '<i class="fas fa-play"></i>' :
            '<i class="fas fa-exclamation-triangle"></i>';

        this.submitBtn.innerHTML = `
            ${icon}
            <span class="btn-text">${text}</span>
        `;
    }

    /**
     * Update field visual feedback
     */
    updateFieldVisualFeedback(isValid, charCount) {
        if (!this.notesField) return;

        // Remove all validation classes
        this.notesField.classList.remove('is-valid', 'is-invalid', 'is-warning');

        if (charCount > 0) {
            if (isValid) {
                this.notesField.classList.add('is-valid');
            } else if (charCount < this.config.minChars) {
                this.notesField.classList.add('is-invalid');
            }
        }
    }

    /**
     * Setup character counter
     */
    setupCharacterCounter() {
        if (!this.notesField) return;

        // Create counter element if it doesn't exist
        let counter = document.querySelector('.character-counter');

        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'character-counter';
            this.notesField.parentNode.appendChild(counter);
        }

        // Update counter on input
        const updateCounter = () => {
            const count = this.notesField.value.length;
            this.charCount = count;

            // Update counter display
            counter.textContent = `${count} / ${this.config.maxChars} characters`;

            // Update counter styling
            counter.classList.remove('text-danger', 'text-warning', 'text-success');

            if (count < this.config.minChars) {
                counter.classList.add('text-danger');
            } else if (count < this.config.warningThreshold) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.add('text-success');
            }

            // Animate counter on significant changes
            if (count % 10 === 0 && count > 0) {
                this.animateElement(counter, 'pulse');
            }
        };

        this.notesField.addEventListener('input', updateCounter);
        this.notesField.addEventListener('paste', () => {
            setTimeout(updateCounter, 10);
        });

        // Initial update
        updateCounter();
    }

    /**
     * Setup notes field enhancements
     */
    setupNotesField() {
        if (!this.notesField) return;

        // Auto-resize textarea
        this.notesField.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // Prevent form submission on Enter (allow Shift+Enter for new line)
        this.notesField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.validateForm()) {
                    this.form.submit();
                }
            }
        });

        // Initial resize
        this.autoResizeTextarea();
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea() {
        if (!this.notesField) return;

        this.notesField.style.height = 'auto';
        const newHeight = Math.max(150, Math.min(400, this.notesField.scrollHeight));
        this.notesField.style.height = newHeight + 'px';
    }

    /**
     * Setup form submission
     */
    setupFormSubmission() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Prevent double submission
            if (this.isSubmitting) {
                console.log('⚠️ Form already submitting...');
                return;
            }

            // Final validation
            if (!this.validateForm()) {
                this.showNotification('Please provide detailed work notes (minimum 10 characters)', 'error');
                this.notesField.focus();
                return;
            }

            // Show confirmation dialog
            const confirmed = await this.showConfirmDialog();
            if (!confirmed) {
                return;
            }

            // Mark as submitting
            this.isSubmitting = true;
            this.setLoadingState(true);

            // Submit the form
            try {
                this.form.submit();
            } catch (error) {
                console.error('❌ Form submission error:', error);
                this.setLoadingState(false);
                this.isSubmitting = false;
                this.showNotification('An error occurred. Please try again.', 'error');
            }
        });
    }

    /**
     * Show confirmation dialog
     */
    async showConfirmDialog() {
        return new Promise((resolve) => {
            const confirmed = confirm(
                '🚀 Ready to start work?\n\n' +
                'This will:\n' +
                '• Mark the request as "In Progress"\n' +
                '• Start tracking your work time\n' +
                '• Notify the student\n\n' +
                'Continue?'
            );
            resolve(confirmed);
        });
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span class="btn-text">Starting Work...</span>
            `;
            this.submitBtn.style.pointerEvents = 'none';

            // Disable form fields
            if (this.notesField) {
                this.notesField.disabled = true;
            }

            // Show loading overlay
            this.showLoadingOverlay();
        } else {
            this.submitBtn.disabled = false;
            this.updateButtonText('Start Work', true);
            this.submitBtn.style.pointerEvents = '';

            // Enable form fields
            if (this.notesField) {
                this.notesField.disabled = false;
            }

            // Hide loading overlay
            this.hideLoadingOverlay();
        }
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        let overlay = document.getElementById('loadingOverlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Starting work on request...</p>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(overlay);
        }

        // Trigger animation
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.validateForm() && !this.isSubmitting) {
                    this.form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape = Clear form
            if (e.key === 'Escape' && !this.isSubmitting) {
                if (confirm('Clear all form data?')) {
                    this.reset();
                }
            }
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels
        if (this.notesField) {
            this.notesField.setAttribute('aria-label', 'Work notes');
            this.notesField.setAttribute('aria-describedby', 'notes-help');
            this.notesField.setAttribute('aria-required', 'true');
        }

        if (this.submitBtn) {
            this.submitBtn.setAttribute('aria-label', 'Start work on maintenance request');
        }

        // Add keyboard navigation hints
        const helpText = document.querySelector('.form-help');
        if (helpText && !document.getElementById('keyboard-hint')) {
            const hint = document.createElement('div');
            hint.id = 'keyboard-hint';
            hint.style.cssText = 'margin-top: 0.5rem; font-size: 0.75rem; color: #6c757d;';
            hint.innerHTML = '<i class="fas fa-keyboard"></i> Tip: Press Ctrl+Enter to submit';
            helpText.parentNode.appendChild(hint);
        }
    }

    /**
     * Animate page load
     */
    animatePageLoad() {
        // Animate cards on load
        const cards = document.querySelectorAll('.request-details-card, .start-work-form-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });

        // Focus on notes field after animation
        setTimeout(() => {
            if (this.notesField) {
                this.notesField.focus();
            }
        }, 800);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.toast-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'toast-notification';

        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle';

        const bgColor = type === 'success' ? '#198754' :
                       type === 'error' ? '#dc3545' :
                       '#0d6efd';

        notification.innerHTML = `
            <div class="toast-content">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Animate element
     */
    animateElement(element, animationName = 'pulse') {
        element.style.animation = `${animationName} 0.4s ease`;
        setTimeout(() => {
            element.style.animation = '';
        }, 400);
    }

    /**
     * Reset form
     */
    reset() {
        if (this.notesField) {
            this.notesField.value = '';
            this.autoResizeTextarea();
            this.validateForm();
        }
        this.setLoadingState(false);
        this.isSubmitting = false;
        this.showNotification('Form cleared', 'info');
    }

    /**
     * Debounce utility
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.startWorkManager = new StartWorkManager();
    console.log('🎯 Start Work Page Ready');
});

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    .loading-content {
        text-align: center;
        color: white;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    .loading-text {
        font-size: 1.125rem;
        font-weight: 500;
        margin: 0;
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .toast-content i {
        font-size: 1.25rem;
    }
`;
document.head.appendChild(animationStyles);