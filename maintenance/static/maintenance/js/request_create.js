/**
 * Maintenance Request Creation Form
 * Clean version - NO form submission interference
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
        this.setupFileUpload();
        this.setupCharacterCounters();
        this.setupFormEnhancements();
        console.log('Maintenance Request Form initialized - NO form submission interference');
    }

    /**
     * Setup event listeners - NO FORM SUBMISSION HANDLER
     */
    setupEventListeners() {
        // ✅ Keep - Use My Room button
        if (this.useMyRoomBtn) {
            this.useMyRoomBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleUseMyRoom();
            });
        }

        // ✅ Keep - Room selection change
        if (this.roomField) {
            this.roomField.addEventListener('change', this.handleRoomChange.bind(this));
        }

        // ✅ Keep - Service type change
        if (this.serviceTypeField) {
            this.serviceTypeField.addEventListener('change', this.handleServiceTypeChange.bind(this));
        }

        // ✅ Keep - File upload events
        this.setupFileUploadEvents();

        // ✅ Keep - Character counter updates
        this.setupCharacterCounterEvents();

        // ❌ REMOVED - NO form submission handler
        // Form will submit naturally without any JavaScript interference
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
        console.log('Use My Room button clicked');

        if (!this.roomField || !this.useMyRoomBtn) {
            console.error('Room field or button not found');
            return;
        }

        const roomValue = this.useMyRoomBtn.getAttribute('data-room-id');
        console.log('Room value from button:', roomValue);

        if (roomValue && roomValue !== 'None' && roomValue !== '') {
            // Set the room field value
            this.roomField.value = roomValue;

            // Trigger change event
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true
            });
            this.roomField.dispatchEvent(changeEvent);

            // Visual feedback
            const originalHTML = this.useMyRoomBtn.innerHTML;
            const originalStyle = this.useMyRoomBtn.style.cssText;

            this.useMyRoomBtn.innerHTML = '<i class="fas fa-check"></i> Selected!';
            this.useMyRoomBtn.style.background = '#28a745';
            this.useMyRoomBtn.style.color = 'white';
            this.useMyRoomBtn.disabled = true;

            this.showNotification('Your room has been selected!', 'success');

            // Reset button after 2 seconds
            setTimeout(() => {
                this.useMyRoomBtn.innerHTML = originalHTML;
                this.useMyRoomBtn.style.cssText = originalStyle;
                this.useMyRoomBtn.disabled = false;
            }, 2000);

        } else {
            console.error('Room value is empty or invalid:', roomValue);
            this.showNotification('No room information available', 'error');
        }
    }

    /**
     * Handle room selection change
     */
    handleRoomChange() {
        console.log('Room selection changed to:', this.roomField.value);
    }

    /**
     * Handle service type change
     */
    handleServiceTypeChange() {
        console.log('Service type changed to:', this.serviceTypeField.value);
    }

    /**
     * Setup form enhancements
     */
    setupFormEnhancements() {
        // Auto-resize textareas
        if (this.descriptionField) {
            this.setupAutoResize(this.descriptionField);
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
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Remove any existing notifications first
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

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
            font-family: inherit;
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
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing Clean Maintenance Request Form');

    // Initialize the form
    window.maintenanceForm = new MaintenanceRequestForm();

    // Debug: Check if Use My Room button exists and has data
    const useMyRoomBtn = document.getElementById('useMyRoom');
    if (useMyRoomBtn) {
        console.log('Use My Room button found');
        console.log('Button data-room-id:', useMyRoomBtn.getAttribute('data-room-id'));
    } else {
        console.log('Use My Room button not found - student may not have a room assigned');
    }

    console.log('✅ Form will submit naturally - NO JavaScript interference with CSRF');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaintenanceRequestForm;
}