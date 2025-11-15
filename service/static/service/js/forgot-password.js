// ===== Service Expert Forgot Password System =====
class ForgotPasswordSystem {
    constructor() {
        this.validationRules = {
            id_employee_id: {
                required: true,
                minLength: 3,
                message: 'Employee ID must be at least 3 characters'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.addFormClasses();
        this.setupAccessibility();
        this.animateElements();
        this.createParticles();

        // Auto-hide Django messages
        setTimeout(() => this.closeDjangoMessages(), 8000);

        console.log('🔧 Service Expert Password Reset System Initialized');
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('forgotPasswordForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Input field events
        const formControls = document.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.addEventListener('blur', (e) => this.validateField(e.target));
            control.addEventListener('input', (e) => {
                this.clearFieldError(e.target);
                if (e.target.value.length > 0) {
                    this.validateField(e.target, false);
                }
            });
            control.addEventListener('focus', (e) => this.addFocusEffect(e.target));
        });

        // Close alert buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeAlert(e.target.closest('.alert')));
        });

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupFormValidation() {
        const formControls = document.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.addEventListener('blur', (e) => this.validateField(e.target));
        });
    }

    addFormClasses() {
        const employeeIdField = document.getElementById('id_employee_id');

        if (employeeIdField) {
            employeeIdField.classList.add('form-control');
            employeeIdField.placeholder = 'Enter your employee ID';
            employeeIdField.setAttribute('autocomplete', 'username');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('.form-control')) {
                e.preventDefault();
                const form = document.getElementById('forgotPasswordForm');
                if (form && this.validateForm()) {
                    form.submit();
                }
            }

            if (e.key === 'Escape') {
                this.clearForm();
            }
        });
    }

    setupAccessibility() {
        const employeeIdField = document.getElementById('id_employee_id');

        if (employeeIdField) {
            employeeIdField.setAttribute('aria-label', 'Employee ID');
            employeeIdField.setAttribute('aria-describedby', 'employee-id-hint');
        }

        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim()) {
                btn.setAttribute('aria-label', 'Interactive button');
            }
        });
    }

    animateElements() {
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';

            setTimeout(() => {
                group.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animate sidebar elements
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                feature.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 400 + (index * 100));
        });
    }

    createParticles() {
        const sidebar = document.querySelector('.auth-sidebar');
        if (!sidebar) return;

        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 2}px;
                height: ${Math.random() * 3 + 2}px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                pointer-events: none;
                z-index: 0;
            `;
            sidebar.appendChild(particle);
        }

        if (!document.querySelector('#particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translateY(-20px) translateX(10px);
                        opacity: 0.8;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Validation Methods
    validateForm() {
        let isValid = true;
        const employeeIdField = document.getElementById('id_employee_id');

        if (employeeIdField && !this.validateField(employeeIdField)) {
            isValid = false;
        }

        return isValid;
    }

    validateField(field, showError = true) {
        const fieldId = field.id;
        const value = field.value.trim();
        const rules = this.validationRules[fieldId];

        if (!rules) return true;

        this.clearFieldError(field);

        if (rules.required && !value) {
            if (showError) {
                this.showFieldError(field, `${this.getFieldLabel(fieldId)} is required`);
            }
            return false;
        }

        if (!value && !rules.required) {
            field.classList.add('valid');
            return true;
        }

        if (rules.minLength && value.length < rules.minLength) {
            if (showError) {
                this.showFieldError(field, rules.message);
            }
            return false;
        }

        field.classList.add('valid');
        field.classList.remove('invalid');
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        const inputWrapper = field.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.insertAdjacentElement('afterend', errorElement);
        }

        field.classList.add('invalid');
        field.classList.remove('valid');

        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }

    clearFieldError(field) {
        const inputWrapper = field.closest('.input-wrapper');
        const existingError = inputWrapper?.nextElementSibling;

        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }

        field.classList.remove('invalid');
    }

    addFocusEffect(field) {
        const inputWrapper = field.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.style.transform = 'translateY(-1px)';
            setTimeout(() => {
                inputWrapper.style.transform = '';
            }, 200);
        }
    }

    getFieldLabel(fieldId) {
        const labelMap = {
            id_employee_id: 'Employee ID'
        };
        return labelMap[fieldId] || fieldId;
    }

    handleFormSubmit(e) {
        if (!this.validateForm()) {
            e.preventDefault();
            this.showMessage('Please enter a valid employee ID', 'error');
            return false;
        }

        this.showLoadingState();
    }

    showLoadingState() {
        const submitBtn = document.getElementById('resetBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    hideLoadingState() {
        const submitBtn = document.getElementById('resetBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }

        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    clearForm() {
        const form = document.getElementById('forgotPasswordForm');
        if (form) {
            form.reset();
            const formControls = form.querySelectorAll('.form-control');
            formControls.forEach(control => {
                control.classList.remove('valid', 'invalid');
                this.clearFieldError(control);
            });
        }
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.querySelector('.messages') || this.createMessagesContainer();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-btn" onclick="closeAlert(this.parentElement)">×</button>
        `;

        messagesContainer.appendChild(alert);

        setTimeout(() => this.closeAlert(alert), 5000);
    }

    createMessagesContainer() {
        const container = document.createElement('div');
        container.className = 'messages';
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(container, form.firstChild);
        }
        return container;
    }

    closeAlert(alertElement) {
        if (alertElement) {
            alertElement.style.transition = 'all 0.3s ease';
            alertElement.style.opacity = '0';
            alertElement.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 300);
        }
    }

    closeDjangoMessages() {
        const djangoMessage = document.getElementById('djangoMessage');
        if (djangoMessage) {
            this.closeAlert(djangoMessage);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.forgotPasswordSystem = new ForgotPasswordSystem();

    // Focus on first input
    setTimeout(() => {
        const firstInput = document.querySelector('.form-control');
        if (firstInput) {
            firstInput.focus();
        }
    }, 500);

    console.log('🔑 Password Reset System Ready');
});

// Global functions for HTML onclick handlers
window.closeAlert = function(element) {
    if (window.forgotPasswordSystem) {
        window.forgotPasswordSystem.closeAlert(element);
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.forgotPasswordSystem) {
        window.forgotPasswordSystem.hideLoadingState();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForgotPasswordSystem;
}