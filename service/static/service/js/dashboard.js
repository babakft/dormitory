/**
 * Service Expert Dashboard JavaScript
 * Handles interactive features and enhancements for the service expert dashboard
 */

class ServiceDashboard {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupTooltips();
        this.setupAutoRefresh();
        this.setupKeyboardShortcuts();
        this.setupFormValidation();
        this.setupSearch();
    }

    /**
     * Setup event listeners for interactive elements
     */
    setupEventListeners() {
        // Stat cards click effects
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
        });

        // Table row click handlers
        const tableRows = document.querySelectorAll('.table-row');
        tableRows.forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
        });

        // Navigation button enhancements
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('mouseenter', this.handleNavButtonHover.bind(this));
        });

        // Action button handlers
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', this.handleActionButtonClick.bind(this));
        });

        // Claim form handlers
        const claimForms = document.querySelectorAll('.claim-form');
        claimForms.forEach(form => {
            form.addEventListener('submit', this.handleClaimSubmit.bind(this));
        });

        // Logout confirmation
        const logoutForm = document.querySelector('.logout-form');
        if (logoutForm) {
            logoutForm.addEventListener('submit', this.handleLogoutConfirmation.bind(this));
        }
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        // Assigned requests search
        const assignedSearch = document.querySelector('#assignedSearch');
        if (assignedSearch) {
            assignedSearch.addEventListener('input',
                this.debounce(this.handleAssignedSearch.bind(this), 300)
            );
        }

        // Available requests search
        const availableSearch = document.querySelector('#availableSearch');
        if (availableSearch) {
            availableSearch.addEventListener('input',
                this.debounce(this.handleAvailableSearch.bind(this), 300)
            );
        }
    }

    /**
     * Handle assigned requests search
     */
    handleAssignedSearch(e) {
        const query = e.target.value.toLowerCase();
        const section = e.target.closest('.requests-section');
        const tableRows = section.querySelectorAll('.table-row');

        this.filterTableRows(tableRows, query);
        this.updateSearchResults(section, tableRows, query);
    }

    /**
     * Handle available requests search
     */
    handleAvailableSearch(e) {
        const query = e.target.value.toLowerCase();
        const section = e.target.closest('.requests-section');
        const tableRows = section.querySelectorAll('.table-row');

        this.filterTableRows(tableRows, query);
        this.updateSearchResults(section, tableRows, query);
    }

    /**
     * Filter table rows based on search query
     */
    filterTableRows(rows, query) {
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(query);
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    /**
     * Update search results display
     */
    updateSearchResults(section, allRows, query) {
        const visibleRows = section.querySelectorAll('.table-row:not([style*="display: none"])');
        let resultsEl = section.querySelector('.search-results');

        if (!resultsEl) {
            resultsEl = document.createElement('div');
            resultsEl.className = 'search-results text-muted mt-2';
            const searchInput = section.querySelector('.search-input');
            if (searchInput) {
                searchInput.parentNode.insertBefore(resultsEl, searchInput.nextSibling);
            }
        }

        if (query && visibleRows.length !== allRows.length) {
            resultsEl.textContent = `Showing ${visibleRows.length} of ${allRows.length} requests`;
            resultsEl.style.display = 'block';
        } else {
            resultsEl.style.display = 'none';
        }
    }

    /**
     * Setup smooth animations and transitions
     */
    setupAnimations() {
        // Animate stat cards on load
        this.animateStatCards();

        // Setup intersection observer for scroll animations
        this.setupScrollAnimations();
    }

    /**
     * Animate stat cards with staggered effect
     */
    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections for animation
        const sections = document.querySelectorAll('.requests-section, .navigation-section, .performance-section');
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup tooltips for better UX
     */
    setupTooltips() {
        // Add tooltips to badges and status indicators
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            this.addTooltip(badge);
        });

        // Add tooltips to action buttons
        const actionButtons = document.querySelectorAll('[title]');
        actionButtons.forEach(btn => {
            this.enhanceTooltip(btn);
        });
    }

    /**
     * Add tooltip functionality
     */
    addTooltip(element) {
        const tooltipText = this.getTooltipText(element);
        if (tooltipText) {
            element.setAttribute('title', tooltipText);
            element.setAttribute('data-toggle', 'tooltip');
        }
    }

    /**
     * Get tooltip text based on element content
     */
    getTooltipText(element) {
        const text = element.textContent.trim().toLowerCase();
        const tooltips = {
            // Status tooltips
            'ready to start': 'Request is approved and ready for work to begin',
            'in progress': 'Work is currently being performed on this request',
            'completed': 'Request has been completed successfully',

            // Priority tooltips
            'high': 'High priority - urgent attention required',
            'medium': 'Medium priority - normal processing time',
            'low': 'Low priority - can be addressed when time permits',

            // Performance tooltips
            'excellent service': 'Outstanding performance with 4.5+ rating',
            'great service': 'Great performance with 4.0+ rating',
            'good service': 'Good performance with 3.5+ rating',
            'keep improving': 'Room for improvement - focus on service quality'
        };
        return tooltips[text] || null;
    }

    /**
     * Setup auto-refresh for real-time updates
     */
    setupAutoRefresh() {
        // Only refresh if user is active (to save bandwidth)
        let lastActivity = Date.now();
        let refreshInterval;

        // Track user activity
        const updateActivity = () => {
            lastActivity = Date.now();
        };

        document.addEventListener('mousemove', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('click', updateActivity);

        // Auto-refresh every 5 minutes if user is active
        refreshInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;

            // Refresh if user was active in the last 10 minutes
            if (timeSinceActivity < 600000) {
                this.refreshDashboardData();
            }
        }, 300000); // 5 minutes

        // Clear interval when page unloads
        window.addEventListener('beforeunload', () => {
            clearInterval(refreshInterval);
        });
    }

    /**
     * Refresh dashboard data via AJAX
     */
    async refreshDashboardData() {
        try {
            // You can implement this endpoint to return updated counts
            // const response = await fetch('/service/dashboard/refresh/', {
            //     headers: {
            //         'X-Requested-With': 'XMLHttpRequest',
            //         'X-CSRFToken': this.getCSRFToken()
            //     }
            // });

            // if (response.ok) {
            //     const data = await response.json();
            //     this.updateDashboardCounts(data);
            //     this.showNotification('Dashboard updated', 'success');
            // }

            console.log('Auto-refresh placeholder - implement with your refresh endpoint');
        } catch (error) {
            console.log('Auto-refresh failed:', error);
        }
    }

    /**
     * Update dashboard counts in the UI
     */
    updateDashboardCounts(data) {
        const counters = {
            'total_available': '.stat-card--primary .stat-number',
            'total_assigned': '.stat-card--warning .stat-number',
            'total_completed': '.stat-card--success .stat-number',
            'total_tickets': '.stat-card--info .stat-number'
        };

        Object.entries(counters).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element && data[key] !== undefined) {
                this.animateCounterUpdate(element, data[key]);
            }
        });
    }

    /**
     * Animate counter updates
     */
    animateCounterUpdate(element, newValue) {
        const currentValue = parseInt(element.textContent);
        if (currentValue !== newValue) {
            element.style.color = '#28a745'; // Flash green
            setTimeout(() => {
                element.style.color = '';
            }, 1000);

            // Animate the number change
            this.animateNumber(element, currentValue, newValue, 500);
        }
    }

    /**
     * Animate number changes
     */
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * this.easeOutCubic(progress));

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        requestAnimationFrame(updateNumber);
    }

    /**
     * Easing function for smooth animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
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
                    window.location.href = ticketsBtn.href;
                }
            }

            // Ctrl/Cmd + N = New Ticket
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newTicketBtn = document.querySelector('a[href*="ticket:create"]');
                if (newTicketBtn) {
                    window.location.href = newTicketBtn.href;
                }
            }

            // Ctrl/Cmd + C = Completed Tasks
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                const completedBtn = document.querySelector('a[href*="completed_tasks"]');
                if (completedBtn) {
                    window.location.href = completedBtn.href;
                }
            }

            // Ctrl/Cmd + F = Focus Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                }
            }

            // Escape = Clear search or close modals
            if (e.key === 'Escape') {
                const activeSearch = document.activeElement;
                if (activeSearch && activeSearch.classList.contains('search-input')) {
                    activeSearch.value = '';
                    const event = new Event('input');
                    activeSearch.dispatchEvent(event);
                }
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
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
    }

    /**
     * Handle stat card clicks
     */
    handleStatCardClick(e) {
        const card = e.currentTarget;
        const title = card.querySelector('.stat-title')?.textContent.trim();

        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Navigate based on card type
        switch (title) {
            case 'Available':
                // Scroll to available requests section
                const availableSection = document.querySelector('.requests-section:last-of-type');
                if (availableSection) {
                    availableSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'My Assigned':
                // Scroll to assigned requests section
                const assignedSection = document.querySelector('.requests-section:first-of-type');
                if (assignedSection) {
                    assignedSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'Completed':
                // Navigate to completed tasks
                const completedBtn = document.querySelector('a[href*="completed_tasks"]');
                if (completedBtn) {
                    window.location.href = completedBtn.href;
                }
                break;
            case 'My Tickets':
                // Navigate to tickets list
                const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
                if (ticketsBtn) {
                    window.location.href = ticketsBtn.href;
                }
                break;
            default:
                this.showNotification('Feature coming soon!', 'info');
        }
    }

    /**
     * Handle table row clicks
     */
    handleTableRowClick(e) {
        // Don't trigger if clicking on a button or form
        if (e.target.closest('.btn') || e.target.closest('form')) return;

        const row = e.currentTarget;
        const requestId = row.dataset.requestId;

        if (requestId) {
            // You can implement a request detail view
            this.showNotification(`Request #${requestId} details coming soon!`, 'info');
        }
    }

    /**
     * Handle navigation button hover effects
     */
    handleNavButtonHover(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');

        if (icon) {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 200);
        }
    }

    /**
     * Handle action button clicks
     */
    handleActionButtonClick(e) {
        const btn = e.currentTarget;
        const action = btn.dataset.action;

        // Show confirmation dialog for important actions
        if (action === 'start-work') {
            if (!confirm('Are you sure you want to start working on this request?')) {
                e.preventDefault();
                return;
            }
        } else if (action === 'complete-work') {
            if (!confirm('Are you sure you want to mark this request as completed?')) {
                e.preventDefault();
                return;
            }
        }

        // Add loading state
        this.setButtonLoading(btn, true);
    }

    /**
     * Handle claim form submission
     */
    handleClaimSubmit(e) {
        const form = e.currentTarget;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!confirm('Are you sure you want to claim this request?')) {
            e.preventDefault();
            return;
        }

        // Add loading state
        this.setButtonLoading(submitBtn, true);
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
     * Handle form submissions
     */
    handleFormSubmit(e) {
        const form = e.currentTarget;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn && !submitBtn.disabled) {
            this.setButtonLoading(submitBtn, true);

            // Re-enable after 5 seconds if form hasn't been submitted
            setTimeout(() => {
                this.setButtonLoading(submitBtn, false);
            }, 5000);
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoading(btn, loading) {
        if (loading) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText || btn.textContent;
        }
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
     * Enhance existing tooltips
     */
    enhanceTooltip(element) {
        element.addEventListener('mouseenter', () => {
            element.style.position = 'relative';
        });
    }

    /**
     * Utility method to show notifications
     */
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.dashboard-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'danger': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Utility method to format dates
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    /**
     * Utility method to calculate days ago
     */
    getDaysAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffTime = Math.abs(now - past);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}

// Initialize dashboard when DOM is ready
const serviceDashboard = new ServiceDashboard();

// Export for potential external use
window.ServiceDashboard = ServiceDashboard;
