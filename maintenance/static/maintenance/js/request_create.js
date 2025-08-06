/**
 * Maintenance Request Creation Form
 * Enhanced form functionality with modern UX patterns
 */

class MaintenanceRequestForm {
    constructor() {
        this.form = document.getElementById('maintenanceForm');
        this.titleField = document.querySelector('#id_title');
        this.descriptionField = document.querySelector('#id_description');
        this.roomField = document.querySelector('#id_room');
        this.serviceTypeField = document.querySelector('#id_service_type');
        this.imageField = document.querySelector('#id_issue_image');

        this.submitBtn = document.getElementById('submitBtn');
        this.useMyRoomBtn = document.getElementById('useMyRoom');

        // File upload elements
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.filePreview = document.getElementById('filePreview');
        this.removeFileBtn = document.getElementById('removeFile');



        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupFileUpload();
        this.setupCharacterCounters();
        this.setupFormEnhancements();
        console.log('Maintenance Request Form initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Use My Room button
        if (this.useMyRoomBtn) {
            this.useMyRoomBtn.addEventListener('click', this.handleUseMyRoom.bind(this));
        }

        // Room selection change
        if (this.roomField) {
            this.roomField.addEventListener('change', this.handleRoomChange.bind(this));
        }

        // Service type change
        if (this.serviceTypeField) {
            this.serviceTypeField.addEventListener('change', this.handleServiceTypeChange.bind(this));
        }

        // File upload events
        this.setupFileUploadEvents();

        // Character counter updates
        this.setupCharacterCounterEvents();
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Real-time validation
        const fields = [this.titleField, this.descriptionField, this.roomField, this.serviceTypeField];

        fields.forEach(field => {
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            }
        });
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        let isValid = true;
        const value = field.value.trim();

        // Clear previous error
        this.clearFieldError(field);

        // Field-specific validation
        if (field === this.titleField) {
            if (value.length < 5) {
                this.showFieldError(field, 'Title must be at least 5 characters long');
                isValid = false;
            }
        } else if (field === this.descriptionField) {
            if (value.length < 10) {
                this.showFieldError(field, 'Description must be at least 10 characters long');
                isValid = false;
            }
        } else if (field === this.roomField || field === this.serviceTypeField) {
            if (!value) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        }

        // Update field styling
        if (isValid && value) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
        } else if (!isValid) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');

        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: var(--danger-color); font-size: var(--font-size-sm); margin-top: var(--spacing-xs);';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        formGroup.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.field-error');

        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('is-invalid');
    }

    /**
     * Setup file upload functionality
     */
    setupFileUpload() {
        if (!this.fileUploadArea || !this.imageField) return;

        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.fileUploadArea.addEventListener('drop', this.handleFileDrop.bind(this));

        // File selection
        this.imageField.addEventListener('change', this.handleFileSelect.bind(this));

        // Remove file
        if (this.removeFileBtn) {
            this.removeFileBtn.addEventListener('click', this.handleRemoveFile.bind(this));
        }
    }

    /**
     * Setup file upload events
     */
    setupFileUploadEvents() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.preventDefaults, false);
            if (this.fileUploadArea) {
                this.fileUploadArea.addEventListener(eventName, this.preventDefaults, false);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragOver(e) {
        this.fileUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        this.fileUploadArea.classList.remove('dragover');
    }

    handleFileDrop(e) {
        this.fileUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;

        if (files.length > 0) {
            this.imageField.files = files;
            this.handleFileSelect({ target: { files } });
        }
    }

    /**
     * Handle file selection
     */
    handleFileSelect(e) {
        const file = e.target.files[0];

        if (!file) return;

        // Validate file
        if (!this.validateFile(file)) return;

        // Show preview
        this.showFilePreview(file);
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.showNotification('Please select a valid image file (JPG, PNG, GIF)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB', 'error');
            return false;
        }

        return true;
    }

    /**
     * Show file preview
     */
    showFilePreview(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
            const fileName = document.getElementById('fileName');
            const fileSize = document.getElementById('fileSize');

            if (previewImg) previewImg.src = e.target.result;
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = this.formatFileSize(file.size);

            // Hide placeholder, show preview
            if (this.uploadPlaceholder) this.uploadPlaceholder.style.display = 'none';
            if (this.filePreview) this.filePreview.style.display = 'flex';
        };

        reader.readAsDataURL(file);
    }

    /**
     * Handle remove file
     */
    handleRemoveFile() {
        // Clear file input
        if (this.imageField) {
            this.imageField.value = '';
        }

        // Hide preview, show placeholder
        if (this.filePreview) this.filePreview.style.display = 'none';
        if (this.uploadPlaceholder) this.uploadPlaceholder.style.display = 'flex';
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        // Title counter
        if (this.titleField) {
            this.updateCharCounter('titleCount', this.titleField, 200);
        }

        // Description counter
        if (this.descriptionField) {
            this.updateCharCounter('descCount', this.descriptionField, null, 10);
        }
    }

    /**
     * Setup character counter events
     */
    setupCharacterCounterEvents() {
        if (this.titleField) {
            this.titleField.addEventListener('input', () => {
                this.updateCharCounter('titleCount', this.titleField, 200);
            });
        }

        if (this.descriptionField) {
            this.descriptionField.addEventListener('input', () => {
                this.updateCharCounter('descCount', this.descriptionField, null, 10);
            });
        }
    }

    /**
     * Update character counter
     */
    updateCharCounter(counterId, field, max = null, min = null) {
        const counter = document.getElementById(counterId);
        if (!counter || !field) return;

        const length = field.value.length;
        counter.textContent = length;

        // Update counter styling
        const counterParent = counter.parentElement;
        counterParent.classList.remove('warning', 'valid', 'error');

        if (min && length < min) {
            counterParent.classList.add('error');
        } else if (max && length > max * 0.9) {
            counterParent.classList.add('warning');
        } else if (length > 0) {
            counterParent.classList.add('valid');
        }
    }

    /**
     * Handle Use My Room button
     */
   handleUseMyRoom() {
    if (!this.roomField) return;

    // Get student's room value from button data attribute
    const roomValue = this.useMyRoomBtn.getAttribute('data-room-id');
    const originalText = this.useMyRoomBtn.getAttribute('data-original-text');

    if (roomValue) {
        // Set the room field value
        this.roomField.value = roomValue;

        // Trigger change event to update location preview
        this.roomField.dispatchEvent(new Event('change'));


        // Visual feedback
        this.useMyRoomBtn.innerHTML = '<i class="fas fa-check"></i> Selected!';
        this.useMyRoomBtn.style.background = 'var(--success-color)';
        this.useMyRoomBtn.disabled = true;

        // Reset button after 2 seconds
        setTimeout(() => {
            this.useMyRoomBtn.innerHTML = '<i class="fas fa-home"></i> ' + originalText;
            this.useMyRoomBtn.style.background = '';
            this.useMyRoomBtn.disabled = false;
        }, 2000);
    } else {
        console.error('Room ID not found');
        this.showNotification('Unable to auto-fill room information', 'error');
    }
}


    /**
     * Handle room selection change
     */
    handleRoomChange() {
    // Just validate the field if needed
    if (this.roomField && this.roomField.value) {
        this.validateField(this.roomField);
    }
}

    /**
     * Handle service type change
     */
    handleServiceTypeChange() {
        // Could add service-type specific hints or validation
        if (this.serviceTypeField && this.serviceTypeField.value) {
            this.validateField(this.serviceTypeField);
        }
    }

    /**
     * Setup form enhancements
     */
    setupFormEnhancements() {
        // Auto-resize textareas
        if (this.descriptionField) {
            this.setupAutoResize(this.descriptionField);
        }

        // Set initial room if available
        const studentRoomId = this.useMyRoomBtn?.dataset?.roomId;
        if (studentRoomId && this.useMyRoomBtn) {
            this.useMyRoomBtn.dataset.roomId = studentRoomId;
        }

        // Focus first field
        if (this.titleField) {
            this.titleField.focus();
        }
    }

    /**
     * Setup auto-resize for textarea
     */
    setupAutoResize(textarea) {
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
        };

        textarea.addEventListener('input', autoResize);
        autoResize(); // Initial resize
    }

    /**
     * Handle form submission
     */
   handleFormSubmit(e) {
    console.log('Form submission started');

    // Validate all fields first
    const isValid = this.validateForm();

    if (!isValid) {
        e.preventDefault();
        this.showNotification('Please correct the errors in the form', 'error');
        return false;
    }

    // Double-check CSRF token exists
    const csrfToken = this.form.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfToken || !csrfToken.value) {
        e.preventDefault();
        this.showNotification('Security token missing. Please refresh the page.', 'error');
        console.error('CSRF token not found in form');
        return false;
    }

    console.log('CSRF token found:', csrfToken.value.substring(0, 10) + '...');

    // Show loading state
    this.showLoadingState();

    // Let the form submit naturally - don't prevent default
    return true;
}
}

    /**
     * Validate entire form
     */
    validateForm() {
        const fields = [this.titleField, this.descriptionField, this.roomField, this.serviceTypeField];
        let isValid = true;

        fields.forEach(field => {
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate file
        if (!this.imageField?.files?.length) {
            this.showNotification('Please select an image showing the issue', 'error');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.submitBtn) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        }

        // Disable form fields
        const formElements = this.form.querySelectorAll('input, textarea, select, button');
        formElements.forEach(element => {
            if (element !== this.submitBtn) {
                element.disabled = true;
            }
        });
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.submitBtn) {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }

        // Re-enable form fields
        const formElements = this.form.querySelectorAll('input, textarea, select, button');
        formElements.forEach(element => {
            element.disabled = false;
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        // Set colors based on type
        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;
        notification.style.background = color.bg;
        notification.style.border = `1px solid ${color.border}`;
        notification.style.color = color.text;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
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
    // Extract room ID from template for "Use My Room" button
    const useMyRoomBtn = document.getElementById('useMyRoom');
    if (useMyRoomBtn) {
        // Get room ID from Django template context (you'd need to add this to template)
        const roomId = document.body.dataset.studentRoomId;
        if (roomId) {
            useMyRoomBtn.dataset.roomId = roomId;
        }
    }

    // Initialize the form
    window.maintenanceForm = new MaintenanceRequestForm();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing form activities');
    } else {
        console.log('Page visible - resuming form activities');
        if (window.maintenanceForm) {
            window.maintenanceForm.hideLoadingState();
        }
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaintenanceRequestForm;
}