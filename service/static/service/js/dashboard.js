/**
 * Service Expert Dashboard JavaScript
 * Handles interactive functionality for the service expert dashboard
 */

class ServiceDashboard {
    constructor() {
        this.init();
    }

    /**
     * Initialize dashboard functionality
     */
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupFormValidation();
        this.setupTableInteractions();
        this.setupNotifications();
        console.log('Service Dashboard initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Stat card clicks
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
        });

        // Table row clicks
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
        });

        // Navigation button hover effects
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('mouseenter', this.handleNavButtonHover.bind(this));
        });

        // Logout confirmation
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', this.handleLogoutConfirmation.bind(this));
        });

        // Claim button handling (no processing state)
        document.querySelectorAll('.btn-claim').forEach(btn => {
            btn.addEventListener('click', this.handleClaimClick.bind(this));
        });

        // Search functionality
        const searchInput = document.querySelector('#requestSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        // Refresh button
        const refreshBtn = document.querySelector('[onclick="location.reload()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R = Refresh Dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                location.reload();
            }

            // Ctrl/Cmd + T = My Tickets
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
                if (ticketsBtn) {
                    ticketsBtn.click();
                }
            }

            // Escape = Close any open modals/dropdowns
            if (e.key === 'Escape') {
                this.closeOpenElements();
            }
        });
    }

    /**
     * Setup form validation enhancements
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Skip claim forms - they should submit immediately
            if (form.querySelector('input[name="action"][value="claim"]')) {
                return;
            }
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
    }

    /**
     * Setup table interactions
     */
    setupTableInteractions() {
        // Add row hover effects
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'var(--gray-50)';
            });

            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    }

    /**
     * Setup notification system
     */
    setupNotifications() {
        // Check for Django messages and display them
        const messages = document.querySelectorAll('.alert');
        messages.forEach(message => {
            this.enhanceNotification(message);
        });
    }

    /**
     * Handle stat card clicks
     */
    handleStatCardClick(e) {
        const card = e.currentTarget;

        // Add click effect
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Navigate based on card type
        if (card.classList.contains('stat-card--primary')) {
            // Navigate to tickets
            const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
            if (ticketsBtn) {
                window.location.href = ticketsBtn.href;
            }
        } else if (card.classList.contains('stat-card--warning')) {
            // Scroll to assigned requests
            const assignedSection = document.querySelector('.requests-section');
            if (assignedSection) {
                assignedSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (card.classList.contains('stat-card--success')) {
            // Navigate to completed tasks
            const completedBtn = document.querySelector('a[href*="completed_tasks"]');
            if (completedBtn) {
                window.location.href = completedBtn.href;
            }
        } else if (card.classList.contains('stat-card--info')) {
            // Scroll to available requests
            const availableSection = document.querySelectorAll('.requests-section')[1];
            if (availableSection) {
                availableSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    /**
     * Handle table row clicks
     */
    handleTableRowClick(e) {
        // Don't trigger if clicking on a button or form
        if (e.target.closest('.btn') || e.target.closest('form')) return;

        const row = e.currentTarget;
        const viewBtn = row.querySelector('a[href*="detail"]');
        if (viewBtn) {
            window.location.href = viewBtn.href;
        }
    }

    /**
     * Handle navigation button hover effects
     */
    handleNavButtonHover(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('.nav-icon i');

        if (icon) {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 200);
        }
    }

    /**
     * Handle logout confirmation
     */
    handleLogoutConfirmation(e) {
        if (!confirm('Are you sure you want to logout?')) {
            e.preventDefault();
        }
    }

    /**
     * Handle claim button clicks (immediate submission)
     */
    handleClaimClick(e) {
        const btn = e.currentTarget;

        // Simple visual feedback without processing state
        btn.style.transform = 'scale(0.95)';

        setTimeout(() => {
            btn.style.transform = '';
        }, 100);

        // Form will submit naturally - no processing state needed
    }

    /**
     * Handle search functionality
     */
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('.table-row');

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(query);
            row.style.display = shouldShow ? '' : 'none';
        });

        // Update results count
        const visibleRows = document.querySelectorAll('.table-row:not([style*="display: none"])');
        this.updateSearchResults(visibleRows.length, tableRows.length);
    }

    /**
     * Update search results display
     */
    updateSearchResults(visible, total) {
        let resultsEl = document.querySelector('.search-results');
        if (!resultsEl) {
            resultsEl = document.createElement('div');
            resultsEl.className = 'search-results text-muted mt-2';
            const searchInput = document.querySelector('#requestSearch');
            if (searchInput) {
                searchInput.parentNode.insertBefore(resultsEl, searchInput.nextSibling);
            }
        }

        if (visible !== total) {
            resultsEl.textContent = `Showing ${visible} of ${total} requests`;
            resultsEl.style.display = 'block';
        } else {
            resultsEl.style.display = 'none';
        }
    }

    /**
     * Handle form submissions (excluding claim forms)
     */
    handleFormSubmit(e) {
        const form = e.currentTarget;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn && !submitBtn.classList.contains('btn-claim')) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Re-enable after 5 seconds if form hasn't been submitted
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 5000);
        }
    }

    /**
     * Handle refresh button
     */
    handleRefresh(e) {
        e.preventDefault();

        // Add loading state to refresh button
        const btn = e.currentTarget;
        const originalContent = btn.innerHTML;

        btn.innerHTML = '<div class="nav-icon"><i class="fas fa-spinner fa-spin"></i></div><span class="nav-text">Refreshing...</span>';
        btn.disabled = true;

        // Reload after short delay
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    /**
     * Close any open elements (modals, dropdowns, etc.)
     */
    closeOpenElements() {
        // Close any Bootstrap modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap?.Modal?.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });

        // Close any dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    /**
     * Enhance notification display
     */
    enhanceNotification(notification) {
        // Add close functionality if not present
        if (!notification.querySelector('.btn-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn-close';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
            notification.appendChild(closeBtn);
        }

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 8000);
    }

    /**
     * Get CSRF token for AJAX requests
     */
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    /**
     * Debounce function to limit API calls
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
     * Utility method to show notifications
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" aria-label="Close"></button>
        `;

        // Add close functionality
        notification.querySelector('.btn-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
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
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new ServiceDashboard();

    // Make dashboard globally available
    window.serviceDashboard = dashboard;
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceDashboard;
}
