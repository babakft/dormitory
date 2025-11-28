/**
 * Enhanced Complete Work Form Manager
 * Handles form validation, image preview, and submission
 */

class CompleteWorkManager {
    constructor() {
        // Form elements
        this.form = document.getElementById('completeWorkForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.notesField = document.getElementById('id_completion_notes');
        this.imageField = document.getElementById('id_completion_image');

        // Image preview elements
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.imagePreviewContainer = document.getElementById('imagePreviewContainer');
        this.imagePreview = document.getElementById('imagePreview');
        this.imageName = document.getElementById('imageName');
        this.imageSize = document.getElementById('imageSize');
        this.removeImageBtn = document.getElementById('removeImageBtn');

        // Configuration
        this.config = {
            minChars: 10,
            maxChars: 1000,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
            debounceDelay: 300
        };

        // State
        this.isSubmitting = false;
        this.hasValidImage = false;
        this.hasValidNotes = false;

        if (this.form) {
            this.init();
        }
    }

    /**
     * Initialize the manager
     */
    init() {
        console.log('🚀 Complete Work Manager initializing...');

        this.setupFormValidation();
        this.setupCharacterCounter();
        this.setupImageUpload();
        this.setupFormSubmission();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.animatePageLoad();

        console.log('✅ Complete Work Manager initialized');
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        if (!this.notesField) return;

        // Real-time validation
        this.notesField.addEventListener('input', this.debounce(() => {
            this.validateNotes();
            this.updateSubmitButton();
        }, this.config.debounceDelay));

        // Validation on blur
        this.notesField.addEventListener('blur', () => {
            this.validateNotes();
        });

        // Initial validation
        this.validateNotes();
    }

    /**
     * Validate completion notes
     */
    validateNotes() {
        if (!this.notesField) return false;

        const notes = this.notesField.value.trim();
        const charCount = notes.length;
        const isValid = charCount >= this.config.minChars && charCount <= this.config.maxChars;

        // Update visual state
        this.notesField.classList.remove('is-valid', 'is-invalid');

        if (charCount > 0) {
            if (isValid) {
                this.notesField.classList.add('is-valid');
            } else if (charCount < this.config.minChars) {
                this.notesField.classList.add('is-invalid');
            }
        }

        this.hasValidNotes = isValid;
        return isValid;
    }

    /**
     * Setup character counter
     */
    setupCharacterCounter() {
        if (!this.notesField) return;

        const counter = document.querySelector('.character-counter');
        if (!counter) return;

        const updateCounter = () => {
            const count = this.notesField.value.length;
            const remaining = this.config.maxChars - count;

            // Update text
            counter.querySelector('#charCount').textContent = count;

            // Update styling
            counter.classList.remove('counter-danger', 'counter-warning', 'counter-success');

            if (count < this.config.minChars) {
                counter.classList.add('counter-danger');
            } else if (remaining < 100) {
                counter.classList.add('counter-warning');
            } else {
                counter.classList.add('counter-success');
            }

            // Auto-resize textarea
            this.autoResizeTextarea();
        };

        this.notesField.addEventListener('input', updateCounter);
        this.notesField.addEventListener('paste', () => setTimeout(updateCounter, 10));

        // Initial update
        updateCounter();
    }

    /**
     * Auto-resize textarea
     */
    autoResizeTextarea() {
        if (!this.notesField) return;

        this.notesField.style.height = 'auto';
        const newHeight = Math.max(150, Math.min(400, this.notesField.scrollHeight));
        this.notesField.style.height = newHeight + 'px';
    }

    /**
     * Setup image upload functionality
     */
    setupImageUpload() {
        if (!this.imageField) return;

        // File selection
        this.imageField.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageSelection(file);
            }
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Remove image button
        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeImage();
            });
        }
    }

    /**
     * Setup drag and drop
     */
    setupDragAndDrop() {
        if (!this.uploadPlaceholder) return;

        const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];

        dragEvents.forEach(eventName => {
            this.uploadPlaceholder.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadPlaceholder.addEventListener(eventName, () => {
                this.uploadPlaceholder.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadPlaceholder.addEventListener(eventName, () => {
                this.uploadPlaceholder.classList.remove('drag-over');
            });
        });

        this.uploadPlaceholder.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleImageSelection(file);
            }
        });
    }

    /**
     * Handle image selection
     */
    handleImageSelection(file) {
        // Validate file type
        if (!this.config.allowedTypes.includes(file.type)) {
            this.showNotification(
                `Invalid file type. Please upload ${this.config.allowedTypes.join(', ')}`,
                'error'
            );
            return;
        }

        // Validate file size
        if (file.size > this.config.maxFileSize) {
            this.showNotification(
                `File too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB`,
                'error'
            );
            return;
        }

        // Create FileList and assign to input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        this.imageField.files = dataTransfer.files;

        // Preview image
        this.previewImage(file);
    }

    /**
     * Preview selected image
     */
    previewImage(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            // Show preview
            this.imagePreview.src = e.target.result;
            this.imageName.textContent = file.name;
            this.imageSize.textContent = this.formatFileSize(file.size);

            // Toggle visibility
            this.uploadPlaceholder.style.display = 'none';
            this.imagePreviewContainer.style.display = 'block';

            // Update validation
            this.hasValidImage = true;
            this.updateSubmitButton();

            // Show success notification
            this.showNotification('Image uploaded successfully!', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Failed to read image file', 'error');
        };

        reader.readAsDataURL(file);
    }

    /**
     * Remove selected image
     */
    removeImage() {
        // Clear file input
        this.imageField.value = '';

        // Hide preview
        this.imagePreviewContainer.style.display = 'none';
        this.uploadPlaceholder.style.display = 'block';

        // Clear preview
        this.imagePreview.src = '';
        this.imageName.textContent = '';
        this.imageSize.textContent = '';

        // Update validation
        this.hasValidImage = false;
        this.updateSubmitButton();

        // Show notification
        this.showNotification('Image removed', 'info');
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Update submit button state
     */
    updateSubmitButton() {
        if (!this.submitBtn) return;

        const isValid = this.hasValidNotes && this.hasValidImage;

        this.submitBtn.disabled = !isValid;

        if (!isValid) {
            const missing = [];
            if (!this.hasValidNotes) missing.push('completion notes');
            if (!this.hasValidImage) missing.push('completion photo');

            const btnText = this.submitBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Missing: ${missing.join(', ')}`;
            }
        } else {
            const btnText = this.submitBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.innerHTML = '<i class="fas fa-check-double"></i> Complete Work';
            }
        }
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
                this.showNotification('Please complete all required fields correctly', 'error');
                return;
            }

            // Show confirmation
            const confirmed = await this.showConfirmDialog();
            if (!confirmed) return;

            // Submit form
            this.submitForm();
        });
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const notesValid = this.validateNotes();
        const imageValid = this.hasValidImage;

        if (!notesValid && this.notesField) {
            this.notesField.focus();
            this.showNotification('Please provide detailed completion notes (minimum 10 characters)', 'error');
            return false;
        }

        if (!imageValid) {
            this.showNotification('Please upload a completion photo', 'error');
            window.scrollTo({
                top: this.imageField.offsetTop - 100,
                behavior: 'smooth'
            });
            return false;
        }

        return true;
    }

    /**
     * Show confirmation dialog
     */
    async showConfirmDialog() {
        return new Promise((resolve) => {
            const confirmed = confirm(
                '✅ Ready to complete this work?\n\n' +
                'This will:\n' +
                '• Mark the request as "Completed"\n' +
                '• Send notification to the student\n' +
                '• Allow student to rate your service\n\n' +
                'Continue?'
            );
            resolve(confirmed);
        });
    }

    /**
     * Submit form
     */
    submitForm() {
        this.isSubmitting = true;
        this.setLoadingState(true);

        try {
            this.form.submit();
        } catch (error) {
            console.error('❌ Form submission error:', error);
            this.setLoadingState(false);
            this.isSubmitting = false;
            this.showNotification('An error occurred. Please try again.', 'error');
        }
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            this.submitBtn.style.pointerEvents = 'none';

            // Disable form fields
            if (this.notesField) this.notesField.disabled = true;
            if (this.imageField) this.imageField.disabled = true;
            if (this.removeImageBtn) this.removeImageBtn.disabled = true;

            // Show loading overlay
            this.showLoadingOverlay();
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.style.pointerEvents = '';

            // Enable form fields
            if (this.notesField) this.notesField.disabled = false;
            if (this.imageField) this.imageField.disabled = false;
            if (this.removeImageBtn) this.removeImageBtn.disabled = false;

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

            overlay.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.3);
                                border-top-color: white; border-radius: 50%;
                                animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p style="font-size: 1.125rem; font-weight: 500;">Completing work request...</p>
                    <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem;">
                        Please wait while we process your completion report
                    </p>
                </div>
            `;

            // Add spin animation
            if (!document.querySelector('#spin-animation')) {
                const style = document.createElement('style');
                style.id = 'spin-animation';
                style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(overlay);
        }

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
            setTimeout(() => overlay.remove(), 300);
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.validateForm() && !this.isSubmitting) {
                    this.form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape = Clear/Cancel
            if (e.key === 'Escape' && !this.isSubmitting) {
                if (this.hasValidImage) {
                    this.removeImage();
                }
            }

            // Delete = Remove image when focused
            if (e.key === 'Delete' && this.hasValidImage) {
                if (document.activeElement === this.removeImageBtn) {
                    this.removeImage();
                }
            }
        });
    }

    /**
     * Setup accessibility
     */
    setupAccessibility() {
        // ARIA labels
        if (this.notesField) {
            this.notesField.setAttribute('aria-label', 'Completion notes');
            this.notesField.setAttribute('aria-required', 'true');
        }

        if (this.imageField) {
            this.imageField.setAttribute('aria-label', 'Completion photo');
            this.imageField.setAttribute('aria-required', 'true');
        }

        if (this.submitBtn) {
            this.submitBtn.setAttribute('aria-label', 'Complete work and submit report');
        }

        // Keyboard hint
        const formActions = document.querySelector('.form-actions');
        if (formActions && !document.getElementById('keyboard-hint')) {
            const hint = document.createElement('div');
            hint.id = 'keyboard-hint';
            hint.style.cssText = `
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.5rem;
            `;
            hint.innerHTML = '<i class="fas fa-keyboard"></i> Tip: Press Ctrl+Enter to submit';
            formActions.appendChild(hint);
        }
    }

    /**
     * Animate page load
     */
    animatePageLoad() {
        const cards = document.querySelectorAll('.work-summary-card, .completion-form-card, .best-practices-card');

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
        document.querySelectorAll('.toast-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'toast-notification';

        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle';

        const bgColor = type === 'success' ? '#198754' :
                       type === 'error' ? '#dc3545' :
                       '#0d6efd';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 300px;
            max-width: 500px;
            animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        notification.innerHTML = `
            <i class="fas ${icon}" style="font-size: 1.25rem;"></i>
            <span style="flex: 1;">${message}</span>
        `;

        // Add animation
        if (!document.querySelector('#toast-animation')) {
            const style = document.createElement('style');
            style.id = 'toast-animation';
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Debounce utility
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.completeWorkManager = new CompleteWorkManager();
    console.log('🎯 Complete Work Page Ready');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompleteWorkManager;
}