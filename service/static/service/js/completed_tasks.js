/**
 * Completed Tasks JavaScript
 * Handles modal interactions and task detail viewing
 */

class CompletedTasksManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize the completed tasks functionality
     */
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        console.log('Completed Tasks Manager initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // View details button clicks
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', this.handleViewDetailsClick.bind(this));
        });

        // Table row clicks (alternative way to view details)
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', this.handleModalClose.bind(this));
        });

        // Modal background clicks (close modal)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', this.handleModalBackgroundClick.bind(this));
        });

        // Prevent modal content clicks from closing modal
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Search functionality
        const searchInput = document.querySelector('#taskSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + B = Back to Dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const backBtn = document.querySelector('a[href*="service_dashboard"]');
                if (backBtn) {
                    window.location.href = backBtn.href;
                }
            }
        });
    }

    /**
     * Handle view details button clicks
     */
    handleViewDetailsClick(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const taskId = btn.getAttribute('data-task-id');

        if (taskId) {
            this.showTaskModal(taskId);
        }
    }

    /**
     * Handle table row clicks (show modal)
     */
    handleTableRowClick(e) {
        // Don't trigger if clicking on a button
        if (e.target.closest('.btn') || e.target.closest('button')) {
            return;
        }

        const row = e.currentTarget;
        const taskId = row.getAttribute('data-task-id');

        if (taskId) {
            this.showTaskModal(taskId);
        }
    }

    /**
     * Show task modal
     */
    showTaskModal(taskId) {
        const modal = document.getElementById(`taskModal${taskId}`);
        if (modal) {
            // Close any other open modals first
            this.closeAllModals();

            // Show the modal
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Focus management for accessibility
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.focus();
            }

            console.log(`Opened modal for task ${taskId}`);
        }
    }

    /**
     * Handle modal close button clicks
     */
    handleModalClose(e) {
        const modal = e.currentTarget.closest('.modal');
        if (modal) {
            this.hideModal(modal);
        }
    }

    /**
     * Handle modal background clicks
     */
    handleModalBackgroundClick(e) {
        if (e.target === e.currentTarget) {
            this.hideModal(e.currentTarget);
        }
    }

    /**
     * Hide specific modal
     */
    hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        console.log('Modal closed');
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            this.hideModal(modal);
        });
    }

    /**
     * Handle search functionality
     */
    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const tableRows = document.querySelectorAll('.task-row');
        let visibleCount = 0;

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = query === '' || text.includes(query);

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        // Update results count
        this.updateResultsCount(visibleCount, tableRows.length);
    }

    /**
     * Update results count display
     */
    updateResultsCount(visible, total) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = visible;
        }

        const resultsSummary = document.querySelector('.results-summary');
        if (resultsSummary && visible !== total) {
            resultsSummary.innerHTML = `<span id="resultsCount">${visible}</span> of ${total} tasks shown`;
        } else if (resultsSummary) {
            resultsSummary.innerHTML = `<span id="resultsCount">${visible}</span> task${visible !== 1 ? 's' : ''} found`;
        }
    }

    /**
     * Utility: Debounce function
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

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
                <button type="button" class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Add loading state to element
     */
    addLoadingState(element, text = 'Loading...') {
        element.classList.add('loading');
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        element.disabled = true;
    }

    /**
     * Remove loading state from element
     */
    removeLoadingState(element) {
        element.classList.remove('loading');
        element.innerHTML = element.dataset.originalContent || element.innerHTML;
        element.disabled = false;
        delete element.dataset.originalContent;
    }

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showNotification('Failed to copy text', 'danger');
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const finalOptions = { ...defaultOptions, ...options };
        return new Date(dateString).toLocaleDateString('en-US', finalOptions);
    }

    /**
     * Animate element
     */
    animateElement(element, animation = 'pulse') {
        element.style.animation = `${animation} 0.3s ease`;
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.completedTasksManager = new CompletedTasksManager();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompletedTasksManager;
}
