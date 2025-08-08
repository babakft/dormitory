/**
 * Dormitory Admin UI Enhancements
 * SIMPLIFIED - Works with your existing HTMX notification system
 * Focuses on general UI improvements without conflicting with existing polling
 */

class DormitoryAdminEnhancements {
    constructor() {
        this.config = {
            searchDebounceDelay: 300,
            confirmationTimeout: 5000
        };

        this.state = {
            isInitialized: false,
            unsavedChanges: false
        };

        this.init();
    }

    /**
     * Initialize essential enhancements only
     */
    init() {
        if (this.state.isInitialized) return;

        console.log('🎨 Initializing Admin UI Enhancements (HTMX-compatible)');

        this.enhanceSearchFunctionality();
        this.enhanceFormExperience();
        this.enhanceTableInteractions();
        this.addKeyboardShortcuts();
        this.addBulkActionEnhancements();
        this.addConfirmationDialogs();
        this.addLoadingStates();

        this.state.isInitialized = true;
        console.log('✅ Admin UI Enhancements initialized');
    }

    /**
     * Enhance search functionality with simple debouncing
     */
    enhanceSearchFunctionality() {
        const searchInputs = document.querySelectorAll('#searchbar, .search-input, input[name="q"]');

        searchInputs.forEach(input => {
            // Add simple search enhancements without competing with existing system
            this.addSearchClearButton(input);

            // Simple focus enhancement
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('search-focused');
            });

            input.addEventListener('blur', () => {
                input.parentNode.classList.remove('search-focused');
            });
        });
    }

    /**
     * Add clear button to search input
     */
    addSearchClearButton(input) {
        // Only add if not already present
        if (input.parentNode.querySelector('.search-clear-btn')) return;

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.title = 'Clear search';
        clearBtn.style.cssText = `
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            display: none;
            z-index: 10;
        `;

        clearBtn.addEventListener('click', () => {
            input.value = '';
            input.focus();

            // Trigger search if form exists
            const form = input.closest('form');
            if (form) {
                form.submit();
            }
        });

        // Position relative to input
        if (input.parentNode.style.position !== 'relative') {
            input.parentNode.style.position = 'relative';
        }
        input.parentNode.appendChild(clearBtn);

        // Show/hide clear button
        const toggleClearButton = () => {
            clearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
        };

        input.addEventListener('input', toggleClearButton);
        toggleClearButton(); // Initial state
    }

    /**
     * Simple form enhancements without conflicting with existing system
     */
    enhanceFormExperience() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // Basic form enhancements only
            this.addBasicFormValidation(form);
            this.trackFormChanges(form);

            // Better submit handling
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(form, e);
            });
        });
    }

    /**
     * Add basic form validation
     */
    addBasicFormValidation(form) {
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                if (!field.checkValidity()) {
                    field.style.borderColor = 'var(--danger-color)';
                } else {
                    field.style.borderColor = '';
                }
            });

            field.addEventListener('input', () => {
                // Clear error styling on input
                field.style.borderColor = '';
            });
        });
    }

    /**
     * Track form changes for unsaved warning (basic version)
     */
    trackFormChanges(form) {
        let hasChanges = false;

        form.addEventListener('input', () => {
            hasChanges = true;
            this.state.unsavedChanges = true;
        });

        form.addEventListener('change', () => {
            hasChanges = true;
            this.state.unsavedChanges = true;
        });

        form.addEventListener('submit', () => {
            this.state.unsavedChanges = false;
        });

        // Simple unsaved changes warning
        window.addEventListener('beforeunload', (e) => {
            if (this.state.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    /**
     * Handle form submission with basic loading states
     */
    handleFormSubmit(form, event) {
        const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');

        if (submitButton) {
            this.addLoadingState(submitButton, 'Saving...');

            // Re-enable after timeout (fallback)
            setTimeout(() => {
                this.removeLoadingState(submitButton);
            }, 10000);
        }
    }

    /**
     * Basic table interaction improvements
     */
    enhanceTableInteractions() {
        const tables = document.querySelectorAll('#changelist table, .results');

        tables.forEach(table => {
            this.addBasicTableRowHover(table);
        });
    }

    /**
     * Add simple table row hover effects
     */
    addBasicTableRowHover(table) {
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'var(--gray-50)';
            });

            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    }

    /**
     * Add essential keyboard shortcuts
     */
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const submitBtn = document.querySelector('input[type="submit"], button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }

            // Ctrl/Cmd + / for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('#searchbar, input[name="q"]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }

    /**
     * Basic bulk action improvements
     */
    addBulkActionEnhancements() {
        const actionSelect = document.querySelector('select[name="action"]');
        const goButton = document.querySelector('button[name="index"]');

        if (actionSelect && goButton) {
            // Confirm dangerous actions
            goButton.addEventListener('click', (e) => {
                const selectedAction = actionSelect.value;
                const dangerousActions = ['delete_selected'];

                if (dangerousActions.includes(selectedAction)) {
                    const selectedCount = document.querySelectorAll('input[name="_selected_action"]:checked').length;

                    if (selectedCount === 0) {
                        e.preventDefault();
                        this.showNotification('Please select at least one item.', 'warning');
                        return;
                    }

                    const confirmed = confirm(`Are you sure you want to ${selectedAction.replace('_', ' ')} ${selectedCount} item(s)?`);
                    if (!confirmed) {
                        e.preventDefault();
                    }
                }
            });
        }
    }

    /**
     * Add confirmation dialogs for dangerous actions
     */
    addConfirmationDialogs() {
        const dangerousLinks = document.querySelectorAll('a[href*="delete"], .deletelink');

        dangerousLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const confirmMessage = link.dataset.confirm || 'Are you sure you want to delete this item?';

                if (!confirm(confirmMessage)) {
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * Basic loading states
     */
    addLoadingStates() {
        // This method is called by other functions
        // The actual implementation is in addLoadingState/removeLoadingState methods below
    }

    /**
     * Add loading state to element
     */
    addLoadingState(element, text = 'Loading...') {
        if (!element.dataset.originalContent) {
            element.dataset.originalContent = element.innerHTML;
        }
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        element.disabled = true;
        element.classList.add('loading');
    }

    /**
     * Remove loading state from element
     */
    removeLoadingState(element) {
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
        element.disabled = false;
        element.classList.remove('loading');
    }

    /**
     * Show simple notification to user
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Position and show
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after timeout
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, this.config.confirmationTimeout);
    }

    /**
     * Get appropriate icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin pages
    if (window.location.pathname.includes('/admin/')) {
        window.dormitoryAdminEnhancements = new DormitoryAdminEnhancements();
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DormitoryAdminEnhancements;
}