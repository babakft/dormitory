// Compatible Registration System JavaScript for Django FormView
// Author: Developed for Shahid Bahonar University
// Compatible with Django FormView and StudentRegistrationForm

class RegistrationSystem {
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
        this.setupDropdowns();
        this.animateCounters();
        this.createParticles();
        this.addFormClasses();

        // Close any Django messages after 5 seconds
        setTimeout(() => {
            this.closeDjangoMessages();
        }, 5000);
    }

    addFormClasses() {
        // Add CSS classes to Django form fields for styling
        const formFields = [
            'id_email', 'id_username', 'id_student_number',
            'id_password1', 'id_password2', 'id_phone', 'id_room'
        ];

        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('form-control');

                // Add proper placeholders
                switch(fieldId) {
                    case 'id_email':
                        field.placeholder = 'your.email@student.uk.ac.ir';
                        break;
                    case 'id_username':
                        field.placeholder = 'Choose a unique username';
                        break;
                    case 'id_student_number':
                        field.placeholder = 'e.g., 1401234567';
                        break;
                    case 'id_password1':
                        field.placeholder = 'Create strong password';
                        break;
                    case 'id_password2':
                        field.placeholder = 'Confirm your password';
                        break;
                    case 'id_phone':
                        field.placeholder = '09123456789 (Optional)';
                        break;
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
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Navbar scroll effect
        window.addEventListener('scroll', this.handleNavbarScroll.bind(this));

        // Close alerts
        document.querySelectorAll('.close-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAlert(e.target.closest('.alert'));
            });
        });

        // Password strength checker - Fixed to use correct field ID and element ID
        const passwordField = document.getElementById('id_password1');
        if (passwordField) {
            passwordField.addEventListener('input', this.checkPasswordStrength.bind(this));
        }

        // Real-time validation
        this.setupRealTimeValidation();
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
            emailField.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    this.validateEmail(e.target.value);
                }
            });
        }

        // Username availability check (simulated)
        const usernameField = document.getElementById('id_username');
        if (usernameField) {
            let timeout;
            usernameField.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (e.target.value.length >= 3) {
                        this.checkUsernameAvailability(e.target.value);
                    }
                }, 500);
            });
        }

        // Password match validation
        const password2Field = document.getElementById('id_password2');
        if (password2Field) {
            password2Field.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }
    }

    setupPasswordToggle() {
        // Password toggle functionality is called via onclick in HTML
    }

    setupDropdowns() {
        const dropdown = document.querySelector('.dropdown');
        const dropdownToggle = document.getElementById('loginDropdown');

        if (dropdown && dropdownToggle) {
            dropdownToggle.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    }

    // Validation Methods
    validateForm() {
        const requiredFields = ['id_email', 'id_username', 'id_student_number', 'id_password1', 'id_password2'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate password match
        if (!this.validatePasswordMatch()) {
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
            // Simulate server-side email uniqueness check
            setTimeout(() => {
                if (email.includes('test@')) {
                    this.showFieldError('email', 'This email is already registered');
                    emailField.classList.add('invalid');
                } else {
                    emailField.classList.add('valid');
                    emailField.classList.remove('invalid');
                }
            }, 300);
        }
    }

    checkUsernameAvailability(username) {
        const usernameField = document.getElementById('id_username');

        // Simulate API call
        setTimeout(() => {
            const unavailableUsernames = ['admin', 'test', 'user', 'student'];
            if (unavailableUsernames.includes(username.toLowerCase())) {
                this.showFieldError('username', 'This username is not available');
                usernameField.classList.add('invalid');
            } else {
                usernameField.classList.add('valid');
                usernameField.classList.remove('invalid');
            }
        }, 500);
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

        // Update UI based on strength
        switch (strength) {
            case 0:
                strengthWidth = '0%';
                strengthLabel = '';
                break;
            case 1:
                strengthFill.classList.add('weak');
                strengthWidth = '20%';
                strengthLabel = 'Weak';
                break;
            case 2:
                strengthFill.classList.add('fair');
                strengthWidth = '40%';
                strengthLabel = 'Fair';
                break;
            case 3:
                strengthFill.classList.add('good');
                strengthWidth = '60%';
                strengthLabel = 'Good';
                break;
            case 4:
                strengthFill.classList.add('good');
                strengthWidth = '80%';
                strengthLabel = 'Good';
                break;
            case 5:
                strengthFill.classList.add('strong');
                strengthWidth = '100%';
                strengthLabel = 'Strong';
                break;
        }

        // Apply the width
        strengthFill.style.width = strengthWidth;

        // Update text
        if (password.length === 0) {
            strengthText.textContent = 'Password strength';
        } else {
            strengthText.textContent = `Password strength: ${strengthLabel}`;
        }
    }

    togglePassword(fieldId) {
        const field = document.getElementById(fieldId);
        let icon;

        // Find the correct icon based on field ID
        if (fieldId === 'id_password1') {
            icon = document.getElementById('toggleIcon1');
        } else if (fieldId === 'id_password2') {
            icon = document.getElementById('toggleIcon2');
        }

        if (field && icon) {
            if (field.type === 'password') {
                field.type = 'text';
                icon.className = 'icon-eye-off'; // or whatever your "hide" icon class is
            } else {
                field.type = 'password';
                icon.className = 'icon-eye';
            }
        }
    }

    // Error Handling Methods
    showFieldError(fieldName, message) {
        const errorContainer = document.getElementById(`${fieldName}Error`);
        const field = document.getElementById(`id_${fieldName}`) || document.getElementById(fieldName);

        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'flex';
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
            id_password1: 'Password',
            id_password2: 'Confirm Password',
            id_phone: 'Phone Number',
            id_room: 'Room'
        };
        return labelMap[fieldId] || fieldId;
    }

    // Form Submission - Compatible with Django FormView
    async handleFormSubmit(e) {
        // Don't prevent default - let Django handle the submission
        // Just validate before submission

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
        const submitBtn = document.getElementById('registerBtn');
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
        const submitBtn = document.getElementById('registerBtn');
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

        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    createParticles() {
        const particleContainer = document.getElementById('particles');
        if (!particleContainer) return;

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            particleContainer.appendChild(particle);
        }

        // Add CSS animation for particles
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
                    25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
                    50% { transform: translateY(-40px) translateX(-10px); opacity: 0.7; }
                    75% { transform: translateY(-20px) translateX(5px); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    toggleMobileMenu() {
        const toggle = document.getElementById('mobileToggle');
        const navLinks = document.querySelector('.nav-links');

        if (toggle) {
            toggle.classList.toggle('active');
        }

        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    }

    // Message and Alert Methods
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)}"></i>
            <span>${message}</span>
            <button type="button" class="close-alert" onclick="closeAlert(this.parentElement)">&times;</button>
        `;

        messageContainer.appendChild(alertDiv);

        // Add event listener to close button
        alertDiv.querySelector('.close-alert').addEventListener('click', () => {
            this.closeAlert(alertDiv);
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeAlert(alertDiv);
        }, 5000);
    }

    getIconForType(type) {
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return iconMap[type] || 'info-circle';
    }

    closeAlert(alertElement) {
        if (alertElement) {
            alertElement.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global Functions (for onclick handlers)
window.togglePassword = function(fieldId) {
    if (window.registrationSystem) {
        window.registrationSystem.togglePassword(fieldId);
    }
};

window.closeAlert = function(element) {
    if (window.registrationSystem) {
        window.registrationSystem.closeAlert(element);
    }
};

// Initialize the registration system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.registrationSystem = new RegistrationSystem();

    // Add additional CSS animations and password strength styles
    const additionalStyles = `
        <style>
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }

            .form-content {
                animation: fadeInUp 0.6s ease-out;
            }

            .form-actions {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid #e5e7eb;
            }

            .form-actions .btn {
                width: 100%;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Password Strength Styles */
            .password-strength {
                margin-top: 0.5rem;
            }

            .strength-meter {
                height: 4px;
                background-color: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 0.25rem;
            }

            .strength-fill {
                height: 100%;
                width: 0%;
                transition: width 0.3s ease, background-color 0.3s ease;
                border-radius: 2px;
            }

            .strength-fill.weak {
                background-color: #ef4444;
            }

            .strength-fill.fair {
                background-color: #f97316;
            }

            .strength-fill.good {
                background-color: #eab308;
            }

            .strength-fill.strong {
                background-color: #22c55e;
            }

            .strength-text {
                font-size: 0.75rem;
                color: #6b7280;
            }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', additionalStyles);
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegistrationSystem;
}