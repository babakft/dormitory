/**
 * Start Work Page JavaScript
 */
class StartWork {
    constructor() {
        this.form = document.getElementById('startWorkForm');
        this.submitBtn = document.getElementById('startWorkBtn');
        this.notesField = document.getElementById('id_expert_notes');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupFormSubmission();
        this.setupFormValidation();
        this.setupNotesField();
        console.log('StartWork initialized');
    }

    setupFormSubmission() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                // Don't prevent default - let Django handle the form submission
                console.log('Form submitting...');

                // Debug CSRF token
                const csrfToken = this.form.querySelector('[name="csrfmiddlewaretoken"]');
                console.log('CSRF token element:', csrfToken);
                console.log('CSRF token value:', csrfToken ? csrfToken.value : 'NOT FOUND');
                console.log('Form action:', this.form.action);
                console.log('Form method:', this.form.method);

                // Add loading state
                this.setLoadingState(true);
            });
        }
    }

    setupFormValidation() {
        if (this.notesField && this.submitBtn) {
            // Real-time validation
            this.notesField.addEventListener('input', () => {
                this.validateForm();
            });

            // Initial validation
            this.validateForm();
        }
    }

    validateForm() {
        const notes = this.notesField.value.trim();
        const isValid = notes.length >= 10; // Minimum 10 characters

        if (this.submitBtn) {
            this.submitBtn.disabled = !isValid;

            if (!isValid && notes.length > 0) {
                this.submitBtn.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="btn-text">Need more details (${notes.length}/10)</span>
                `;
            } else if (isValid) {
                this.submitBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    <span class="btn-text">Start Work</span>
                `;
            } else {
                this.submitBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    <span class="btn-text">Start Work</span>
                `;
            }
        }
    }

    setupNotesField() {
        if (this.notesField) {
            // Auto-resize textarea
            this.notesField.addEventListener('input', () => {
                this.autoResizeTextarea();
            });

            // Character counter
            this.addCharacterCounter();
        }
    }

    autoResizeTextarea() {
        this.notesField.style.height = 'auto';
        this.notesField.style.height = Math.max(120, this.notesField.scrollHeight) + 'px';
    }

    addCharacterCounter() {
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 12px;
            color: #6c757d;
            text-align: right;
            margin-top: 4px;
        `;

        this.notesField.parentNode.appendChild(counter);

        const updateCounter = () => {
            const count = this.notesField.value.length;
            counter.textContent = `${count} characters`;

            if (count < 10) {
                counter.style.color = '#dc3545';
            } else if (count < 50) {
                counter.style.color = '#ffc107';
            } else {
                counter.style.color = '#28a745';
            }
        };

        this.notesField.addEventListener('input', updateCounter);
        updateCounter();
    }

    setLoadingState(loading) {
        if (this.submitBtn) {
            if (loading) {
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    <span class="btn-text">Starting Work...</span>
                `;
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    <span class="btn-text">Start Work</span>
                `;
            }
        }
    }

    // Public method to reset form state
    reset() {
        if (this.notesField) {
            this.notesField.value = '';
            this.autoResizeTextarea();
        }
        this.setLoadingState(false);
        this.validateForm();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.startWork = new StartWork();
});

// Add some additional CSS for character counter
const additionalCSS = `
.character-counter {
    font-size: 12px;
    color: #6c757d;
    text-align: right;
    margin-top: 4px;
    transition: color 0.2s ease;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
