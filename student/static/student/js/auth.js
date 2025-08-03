// student/static/student/auth.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handlers
    initializePasswordToggle();
    initializeFormValidation();
    initializePasswordStrength();
    initializeFormSubmission();
    initializeDynamicRoomLoading();

    // Debug: Check if password strength elements exist
    const passwordField = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    console.log('Password field found:', !!passwordField);
    console.log('Strength bar found:', !!strengthBar);
    console.log('Strength text found:', !!strengthText);
});

// Password visibility toggle
function initializePasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '🙈';
            } else {
                input.type = 'password';
                icon.innerHTML = '👁️';
            }
        });
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }

    // Specific field validations
    switch (fieldName) {
        case 'email':
            if (value && !isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;

        case 'student_id':
            if (value && !isValidStudentId(value)) {
                errorMessage = 'Student ID must be alphanumeric (6-10 characters)';
                isValid = false;
            }
            break;

        case 'phone':
            if (value && !isValidPhone(value)) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;

        case 'password':
            if (value && value.length < 8) {
                errorMessage = 'Password must be at least 8 characters long';
                isValid = false;
            }
            break;

        case 'confirm_password':
            const passwordField = document.getElementById('password');
            if (value && value !== passwordField.value) {
                errorMessage = 'Passwords do not match';
                isValid = false;
            }
            break;

        case 'building':
            // Building is optional, so no validation needed
            break;

        case 'room':
            // Room is optional, so no validation needed
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        field.classList.add('error');
    }
}

function clearFieldError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        field.classList.remove('error');
    }
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidStudentId(studentId) {
    const studentIdRegex = /^[A-Za-z0-9]{6,10}$/;
    return studentIdRegex.test(studentId);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function isValidRoomNumber(roomNumber) {
    const roomRegex = /^[A-Za-z]?\d{2,4}[A-Za-z]?$/;
    return roomRegex.test(roomNumber);
}

// Password strength checker
function initializePasswordStrength() {
    const passwordField = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (passwordField && strengthBar && strengthText) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthUI(strength, strengthBar, strengthText);
        });

        passwordField.addEventListener('keyup', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthUI(strength, strengthBar, strengthText);
        });
    }
}

function calculatePasswordStrength(password) {
    if (!password) {
        return { score: 0, level: 'empty', checks: {} };
    }

    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    Object.values(checks).forEach(check => {
        if (check) score++;
    });

    // Bonus for longer passwords
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    return {
        score: score,
        level: getStrengthLevel(score),
        checks: checks
    };
}

function getStrengthLevel(score) {
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 5) return 'good';
    return 'strong';
}

function updatePasswordStrengthUI(strength, strengthBar, strengthText) {
    const colors = {
        empty: '#e2e8f0',
        weak: '#e53e3e',
        medium: '#dd6b20',
        good: '#3182ce',
        strong: '#38a169'
    };

    const texts = {
        empty: 'Enter password',
        weak: 'Weak password',
        medium: 'Fair password',
        good: 'Good password',
        strong: 'Strong password'
    };

    const widths = {
        empty: '0%',
        weak: '25%',
        medium: '50%',
        good: '75%',
        strong: '100%'
    };

    // Update the visual elements
    strengthBar.style.backgroundColor = colors[strength.level];
    strengthBar.style.width = widths[strength.level];
    strengthText.textContent = texts[strength.level];
    strengthText.style.color = colors[strength.level];

    // Add transition effect
    strengthBar.style.transition = 'all 0.3s ease';
}

// Form submission
function initializeFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleFormSubmission);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleFormSubmission);
    }
}

function handleFormSubmission(event) {
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner');

    // Validate all fields before submission
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Check terms acceptance for register form
    if (form.id === 'registerForm') {
        const termsCheckbox = form.querySelector('input[name="terms_accepted"]');
        if (!termsCheckbox.checked) {
            alert('Please accept the terms and conditions to continue.');
            isValid = false;
        }
    }

    if (!isValid) {
        event.preventDefault();
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
}

// Auto-dismiss alerts
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
});

// Room number formatting
document.addEventListener('DOMContentLoaded', function() {
    const roomNumberField = document.getElementById('room_number');
    if (roomNumberField) {
        roomNumberField.addEventListener('input', function() {
            // Auto-format room number (remove spaces, convert to uppercase)
            let value = this.value.replace(/\s/g, '').toUpperCase();
            this.value = value;
        });
    }
});

// Student ID formatting
document.addEventListener('DOMContentLoaded', function() {
    const studentIdField = document.getElementById('student_id');
    if (studentIdField) {
        studentIdField.addEventListener('input', function() {
            // Convert to uppercase and remove spaces
            let value = this.value.replace(/\s/g, '').toUpperCase();
            this.value = value;
        });
    }
});

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            // Remove non-numeric characters except + at the beginning
            let value = this.value.replace(/[^\d\+]/g, '');
            if (value.indexOf('+') > 0) {
                value = value.replace(/\+/g, '');
            }
            this.value = value;
        });
    }
});

// Add CSS classes for validation states
const style = document.createElement('style');
style.textContent = `
    .input-wrapper input.error,
    .input-wrapper select.error {
        border-color: #e53e3e;
        box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }

    .input-wrapper input.valid,
    .input-wrapper select.valid {
        border-color: #38a169;
    }

    .alert {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Dynamic room loading based on building selection
function initializeDynamicRoomLoading() {
    const buildingSelect = document.getElementById('building');
    const roomSelect = document.getElementById('room');

    if (buildingSelect && roomSelect) {
        buildingSelect.addEventListener('change', function() {
            const buildingId = this.value;
            loadRoomsForBuilding(buildingId, roomSelect);
        });
    }
}

function loadRoomsForBuilding(buildingId, roomSelect) {
    // Clear existing options
    roomSelect.innerHTML = '<option value="">Loading rooms...</option>';

    if (!buildingId) {
        roomSelect.innerHTML = '<option value="">Select Building First</option>';
        return;
    }

    // Make AJAX request to get rooms for the building
    fetch(`/api/rooms-by-building/${buildingId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }
            return response.json();
        })
        .then(data => {
            roomSelect.innerHTML = '<option value="">Select Room (Optional)</option>';

            if (data.rooms && data.rooms.length > 0) {
                data.rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = `Room ${room.number} - Floor ${room.floor}`;
                    roomSelect.appendChild(option);
                });
            } else {
                roomSelect.innerHTML = '<option value="">No rooms available</option>';
            }
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
            roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
        });
}