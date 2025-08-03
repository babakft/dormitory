// service/static/service/js/login.js

/**
 * Service Expert Login System
 * Enhanced login functionality for service experts
 */

class ServiceExpertLogin {
    constructor() {
        this.validationRules = {
            id_username: {
                required: true,
                minLength: 3,
                message: 'Employee ID must be at least 3 characters'
            },
            id_password: {
                required: true,
                minLength: 4,
                message: 'Password must be at least 4 characters'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.addFormClasses();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.animateElements();

        // Auto-close Django messages after 5 seconds
        setTimeout(() => {
            this.closeDjangoMessages();
        }, 5000);

        console.log('🔧 Service Expert Login System initialized');
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('expertLoginForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Input field events
        const formControls = document.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            control.addEventListener('input', (e) => {
                this.clearFieldError(e.target);
                if (e.target.value.length > 0) {
                    this.validateField(e.target, false);
                }
            });

            control.addEventListener('focus', (e) => {
                this.addFocusEffect(e.target);
            });
        });

        // Close alert buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAlert(e.target.closest('.alert'));
            });
        });

        // Portal link hover effects
        document.querySelectorAll('.portal-link').forEach(link => {
            link.addEventListener('mouseenter', this.handlePortalLinkHover.bind(this));
        });

        // Sidebar stat animations
        this.setupStatAnimations();
    }

    setupFormValidation() {
        // Real-time validation for employee ID
        const employeeIdField = document.getElementById('id_username');
        if (employeeIdField) {
            employeeIdField.addEventListener('input', (e) => {
                this.validateEmployeeId(e.target.value);
            });
        }

        // Password strength indicator (basic)
        const passwordField = document.getElementById('id_password');
        if (passwordField) {
            passwordField.addEventListener('input', (e) => {
                this.validatePassword(e.target.value);
            });
        }
    }

    setupPasswordToggle() {
        // Password toggle is handled via global function
        window.togglePassword = (fieldId) => {
            const field = document.getElementById(fieldId);
            const icon = document.getElementById('toggleIcon');

            if (field && icon) {
                if (field.type === 'password') {
                    field.type = 'text';
                    icon.className = 'icon-eye-off';
                } else {
                    field.type = 'password';
                    icon.className = 'icon-eye';
                }

                // Add visual feedback
                const toggleBtn = icon.closest('.toggle-password');
                if (toggleBtn) {
                    toggleBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        toggleBtn.style.transform = '';
                    }, 150);
                }
            }
        };
    }

    addFormClasses() {
        // Add CSS classes to Django form fields
        const employeeIdField = document.getElementById('id_username');
        const passwordField = document.getElementById('id_password');

        if (employeeIdField) {
            employeeIdField.classList.add('form-control');
            employeeIdField.placeholder = 'e.g., EMP001, TECH123';
        }

        if (passwordField) {
            passwordField.classList.add('form-control');
            passwordField.placeholder = 'Enter your password';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Enter to submit form
            if (e.key === 'Enter' && e.target.matches('.form-control')) {
                e.preventDefault();
                const form = document.getElementById('expertLoginForm');
                if (form && this.validateForm()) {
                    form.submit();
                }
            }

            // Escape to clear fields
            if (e.key === 'Escape') {
                this.clearForm();
            }

            // Alt + P for password toggle
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                const passwordField = document.getElementById('id_password');
                if (passwordField) {
                    window.togglePassword('id_password');
                }
            }
        });
    }

    setupAccessibility() {
        // Add ARIA labels and descriptions
        const employeeIdField = document.getElementById('id_username');
        const passwordField = document.getElementById('id_password');

        if (employeeIdField) {
            employeeIdField.setAttribute('aria-describedby', 'employee-id-hint');
            employeeIdField.setAttribute('aria-label', 'Employee ID or identifier');
        }

        if (passwordField) {
            passwordField.setAttribute('aria-label', 'Password for your account');
        }

        // Improve button accessibility
        const submitBtn = document.getElementById('loginBtn');
        if (submitBtn) {
            submitBtn.setAttribute('aria-describedby', 'login-btn-desc');
        }
    }

    animateElements() {
        // Stagger animation for form elements
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
                feature.style.transition = 'all 0.4s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 500 + (index * 150));
        });
    }

    setupStatAnimations() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    animateStatNumber(element) {
        const text = element.textContent;
        const hasNumber = /\d+/.test(text);

        if (hasNumber) {
            const match = text.match(/(\d+)/);
            if (match) {
                const number = parseInt(match[1]);
                const prefix = text.substring(0, match.index);
                const suffix = text.substring(match.index + match[1].length);

                let current = 0;
                const increment = number / 30;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        element.textContent = prefix + number + suffix;
                        clearInterval(timer);
                    } else {
                        element.textContent = prefix + Math.floor(current) + suffix;
                    }
                }, 50);
            }
        }
    }

    // Validation Methods
    validateForm() {
        const employeeIdField = document.getElementById('id_username');
        const passwordField = document.getElementById('id_password');
        let isValid = true;

        if (employeeIdField && !this.validateField(employeeIdField)) {
            isValid = false;
        }

        if (passwordField && !this.validateField(passwordField)) {
            isValid = false;
        }

        return isValid;
    }

    validateField(field, showError = true) {
        const fieldId = field.id;
        const value = field.value.trim();
        const rules = this.validationRules[fieldId];

        if (!rules) return true;

        // Clear previous validation state
        this.clearFieldError(field);

        // Required field validation
        if (rules.required && !value) {
            if (showError) {
                this.showFieldError(field, `${this.getFieldLabel(fieldId)} is required`);
            }
            return false;
        }

        // Skip other validations if field is empty and not required
        if (!value && !rules.required) {
            field.classList.add('valid');
            return true;
        }

        // Minimum length validation
        if (rules.minLength && value.length < rules.minLength) {
            if (showError) {
                this.showFieldError(field, rules.message);
            }
            return false;
        }

        // Field is valid
        field.classList.add('valid');
        field.classList.remove('invalid');
        return true;
    }

    validateEmployeeId(employeeId) {
        const field = document.getElementById('id_username');
        if (!field) return;

        // Clean the employee ID
        const cleanId = employeeId.replace(/[\s\-]/g, '');

        if (cleanId.length >= 3) {
            // Basic format validation
            if (/^[A-Za-z0-9]+$/.test(cleanId)) {
                field.classList.add('valid');
                field.classList.remove('invalid');
            } else {
                field.classList.add('invalid');
                field.classList.remove('valid');
            }
        }
    }

    validatePassword(password) {
        const field = document.getElementById('id_password');
        if (!field) return;

        if (password.length >= 4) {
            field.classList.add('valid');
            field.classList.remove('invalid');
        } else if (password.length > 0) {
            field.classList.add('invalid');
            field.classList.remove('valid');
        }
    }

    // Error Handling Methods
    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Insert after input wrapper
        const inputWrapper = field.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.insertAdjacentElement('afterend', errorElement);
        }

        // Add invalid class
        field.classList.add('invalid');
        field.classList.remove('valid');

        // Auto-hide error after 5 seconds
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
            id_username: 'Employee ID',
            id_password: 'Password'
        };
        return labelMap[fieldId] || fieldId;
    }

    // Form Submission
    async handleFormSubmit(e) {
        // Validate before submission
        if (!this.validateForm()) {
            e.preventDefault();
            this.showMessage('Please fix the errors before submitting', 'error');
            return false;
        }

        // Show loading state
        this.showLoadingState();

        // Let Django handle the actual submission
        // The form will be submitted naturally after this function
    }

    showLoadingState() {
        const submitBtn = document.getElementById('loginBtn');
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
        const submitBtn = document.getElementById('loginBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }

        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    // UI Enhancement Methods
    handlePortalLinkHover(e) {
        const link = e.currentTarget;
        const icon = link.querySelector('i');

        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 300);
        }
    }

    clearForm() {
        const form = document.getElementById('expertLoginForm');
        if (form) {
            form.reset();

            // Clear validation states
            const formControls = form.querySelectorAll('.form-control');
            formControls.forEach(control => {
                control.classList.remove('valid', 'invalid');
                this.clearFieldError(control);
            });
        }
    }

    // Message System
    showMessage(message, type = 'info') {
        const messagesContainer = document.querySelector('.messages') || this.createMessagesContainer();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-btn" onclick="closeAlert(this.parentElement)">×</button>
        `;

        messagesContainer.appendChild(alert);

        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeAlert(alert);
        }, 5000);
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

    // Utility Methods
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

    // Public API for external access
    focus() {
        const firstInput = document.querySelector('.form-control');
        if (firstInput) {
            firstInput.focus();
        }
    }

    getFormData() {
        const form = document.getElementById('expertLoginForm');
        if (form) {
            return new FormData(form);
        }
        return null;
    }
}

// Initialize the service expert login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.serviceExpertLogin = new ServiceExpertLogin();

    // Focus on first input
    setTimeout(() => {
        const firstInput = document.querySelector('.form-control');
        if (firstInput) {
            firstInput.focus();
        }
    }, 500);
});

// Global functions for HTML onclick handlers
window.closeAlert = function(element) {
    if (window.serviceExpertLogin) {
        window.serviceExpertLogin.closeAlert(element);
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause any ongoing animations
        console.log('🔧 Service login page hidden');
    } else {
        // Page is visible - resume animations
        console.log('🔧 Service login page visible');
        if (window.serviceExpertLogin) {
            window.serviceExpertLogin.hideLoadingState();
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('🔧 Service expert login page unloading');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceExpertLogin;
}