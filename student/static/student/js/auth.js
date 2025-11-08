// ===== Enhanced Authentication System - Matching Homepage Style =====
class AuthenticationSystem {
    constructor() {
        this.formData = {};
        this.validationRules = {
            id_email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            id_username: {
                required: true,
                minLength: 3,
                pattern: /^[a-zA-Z0-9_]+$/,
                message: 'Username must be 3+ characters (letters, numbers, underscore only)'
            },
            id_student_number: {
                required: true,
                pattern: /^\d{9}$/,
                message: 'Student number must be exactly 9 digits'
            },
            id_password1: {
                required: true,
                minLength: 8,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must be 8+ characters with uppercase, lowercase, and number'
            },
            id_password2: {
                required: true,
                match: 'id_password1',
                message: 'Passwords do not match'
            },
            id_phone: {
                required: false,
                pattern: /^09\d{9}$/,
                message: 'Phone number must be in format 09XXXXXXXXX'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.animateCounters();
        this.createParticles();
        this.addFormClasses();
        this.setupAccessibility();

        // Auto-hide Django messages
        setTimeout(() => this.closeDjangoMessages(), 5000);

        console.log('🔐 SBU Authentication System Initialized');
    }

    addFormClasses() {
        const formFields = [
            'id_email', 'id_username', 'id_student_number',
            'id_password', 'id_password1', 'id_password2', 'id_phone', 'id_room'
        ];

        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('form-control');

                // Add placeholders
                const placeholders = {
                    id_email: 'your.email@student.uk.ac.ir',
                    id_username: 'username',
                    id_student_number: 'e.g., 401234567',
                    id_password: 'Enter your password',
                    id_password1: 'Create strong password',
                    id_password2: 'Confirm your password',
                    id_phone: '09123456789 (Optional)'
                };

                if (placeholders[fieldId]) {
                    field.placeholder = placeholders[fieldId];
                }
            }
        });

        // Style the room select field
        const roomField = document.getElementById('id_room');
        if (roomField) {
            roomField.classList.add('form-control');
        }
    }

    setupEventListeners() {
        // Form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Password strength checker
        const passwordField = document.getElementById('id_password1');
        if (passwordField) {
            passwordField.addEventListener('input', this.checkPasswordStrength.bind(this));
        }

        // Real-time validation
        this.setupRealTimeValidation();

        // Close alerts
        document.querySelectorAll('.close-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAlert(e.target.closest('.alert'));
            });
        });
    }

    setupFormValidation() {
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
        });
    }

    setupRealTimeValidation() {
        // Email validation
        const emailField = document.getElementById('id_email');
        if (emailField) {
            let timeout;
            emailField.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (e.target.value.length > 0) {
                        this.validateEmail(e.target.value);
                    }
                }, 500);
            });
        }

        // Password match validation
        const password2Field = document.getElementById('id_password2');
        if (password2Field) {
            password2Field.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    setupPasswordToggle() {
        // Password toggle is handled via onclick in HTML
    }

    // Validation Methods
    validateForm() {
        let isValid = true;
        const form = document.querySelector('form');
        const requiredFields = form.querySelectorAll('input[required], select[required]');

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate password match for registration
        const password2 = document.getElementById('id_password2');
        if (password2 && !this.validatePasswordMatch()) {
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
                this.showFieldError(fieldId.replace('id_', ''), `${this.getFieldLabel(fieldId)} is required`);
            }
            return false;
        }

        // Skip other validations if field is empty and not required
        if (!value && !rules.required) {
            field.classList.add('valid');
            return true;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            if (showError) {
                this.showFieldError(fieldId.replace('id_', ''), rules.message);
            }
            return false;
        }

        // Minimum length validation
        if (rules.minLength && value.length < rules.minLength) {
            if (showError) {
                this.showFieldError(fieldId.replace('id_', ''), `Minimum ${rules.minLength} characters required`);
            }
            return false;
        }

        // Match validation (for password confirmation)
        if (rules.match) {
            const matchField = document.getElementById(rules.match);
            if (matchField && value !== matchField.value) {
                if (showError) {
                    this.showFieldError(fieldId.replace('id_', ''), rules.message);
                }
                return false;
            }
        }

        // Field is valid
        field.classList.add('valid');
        field.classList.remove('invalid');
        return true;
    }

    validateEmail(email) {
        const emailField = document.getElementById('id_email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(email)) {
            emailField.classList.add('valid');
            emailField.classList.remove('invalid');
        }
    }

    validatePasswordMatch() {
        const password1 = document.getElementById('id_password1');
        const password2 = document.getElementById('id_password2');

        if (password1 && password2 && password2.value) {
            if (password1.value !== password2.value) {
                this.showFieldError('password2', 'Passwords do not match');
                password2.classList.add('invalid');
                return false;
            } else {
                this.clearFieldError(password2);
                password2.classList.add('valid');
                password2.classList.remove('invalid');
                return true;
            }
        }
        return true;
    }

    checkPasswordStrength(e) {
        const password = e.target.value;
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const strengthContainer = document.querySelector('.password-strength');

        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let strengthLabel = '';
        let strengthWidth = '0%';

        // Check password criteria
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        // Reset all classes
        strengthFill.className = 'strength-fill';
        if (strengthContainer) {
            strengthContainer.className = 'password-strength';
        }

        // Update UI based on strength
        if (password.length === 0) {
            strengthWidth = '0%';
            strengthLabel = 'Password strength';
        } else {
            const strengthMap = {
                1: { class: 'weak', width: '20%', label: 'Weak' },
                2: { class: 'fair', width: '40%', label: 'Fair' },
                3: { class: 'good', width: '60%', label: 'Good' },
                4: { class: 'good', width: '80%', label: 'Good' },
                5: { class: 'strong', width: '100%', label: 'Strong' }
            };

            const config = strengthMap[strength] || { class: 'weak', width: '10%', label: 'Too weak' };
            strengthFill.classList.add(config.class);
            strengthContainer?.classList.add(config.class);
            strengthWidth = config.width;
            strengthLabel = config.label;
        }

        strengthFill.style.width = strengthWidth;
        strengthText.textContent = password.length === 0 ? 'Password strength' : `Password strength: ${strengthLabel}`;
    }

    togglePassword(fieldId) {
        const field = document.getElementById(fieldId);
        let icon;

        // Handle different forms
        if (fieldId === 'id_password1') {
            icon = document.getElementById('toggleIcon1');
        } else if (fieldId === 'id_password2') {
            icon = document.getElementById('toggleIcon2');
        } else if (fieldId === 'id_password') {
            icon = document.getElementById('toggleIcon');
        } else {
            const fieldContainer = field?.closest('.form-group') || field?.closest('.input-wrapper');
            icon = fieldContainer?.querySelector('.toggle-password i');
        }

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
    }

    // Error Handling Methods
    showFieldError(fieldName, message) {
        const errorContainer = document.getElementById(`${fieldName}Error`);
        const field = document.getElementById(`id_${fieldName}`) || document.getElementById(fieldName);

        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }

        if (field) {
            field.classList.add('invalid');
            field.classList.remove('valid');
        }
    }

    clearFieldError(field) {
        const fieldName = field.id.replace('id_', '');
        const errorContainer = document.getElementById(`${fieldName}Error`);

        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }

        field.classList.remove('invalid');
    }

    getFieldLabel(fieldId) {
        const labelMap = {
            id_email: 'Email',
            id_username: 'Username',
            id_student_number: 'Student Number',
            id_password: 'Password',
            id_password1: 'Password',
            id_password2: 'Confirm Password',
            id_phone: 'Phone Number',
            id_room: 'Room'
        };
        return labelMap[fieldId] || fieldId;
    }

    // Form Submission
    handleFormSubmit(e) {
        if (!this.validateForm()) {
            e.preventDefault();
            this.showMessage('Please fix the errors before submitting', 'error');
            return false;
        }

        this.showLoadingState();
    }

    showLoadingState() {
        const submitBtn = document.querySelector('button[type="submit"]');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.style.opacity = '0.7';
            }
        }

        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    // UI Enhancement Methods
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
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

        // Add particle animation
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

    setupAccessibility() {
        // Add ARIA labels
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Interactive button');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    modal.classList.remove('show');
                }
            }
        });
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.querySelector('.messages') || this.createMessagesContainer();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<span>${message}</span>`;

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
            alertElement.style.animation = 'slideUp 0.3s ease-in-out forwards';
            setTimeout(() => alertElement.remove(), 300);
        }
    }

    closeDjangoMessages() {
        const messages = document.querySelectorAll('.messages .alert');
        messages.forEach(message => this.closeAlert(message));
    }

    // Utility method
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
    window.authSystem = new AuthenticationSystem();
    console.log('🎓 Welcome to SBU Dormitory Authentication');
});

// Global functions for HTML onclick handlers
window.togglePassword = function(fieldId) {
    if (window.authSystem) {
        window.authSystem.togglePassword(fieldId);
    }
};

window.closeAlert = function(element) {
    if (window.authSystem) {
        window.authSystem.closeAlert(element);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationSystem;
}