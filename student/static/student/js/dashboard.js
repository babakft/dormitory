/**
 * Student Dashboard JavaScript
 * Handles interactive features and enhancements for the student dashboard
 */

class StudentDashboard {
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

        // Logout confirmation
        const logoutForm = document.querySelector('.logout-form');
        if (logoutForm) {
            logoutForm.addEventListener('submit', this.handleLogoutConfirmation.bind(this));
        }

        // Search functionality (if search input exists)
        const searchInput = document.querySelector('#requestSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
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
        const sections = document.querySelectorAll('.requests-section, .navigation-section');
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
            'pending': 'Request is waiting for admin approval',
            'approved': 'Request has been approved and assigned',
            'in progress': 'Maintenance team is working on this request',
            'completed': 'Request has been completed successfully',
            'rejected': 'Request was rejected - check details for reason',
            'high': 'High priority - will be addressed urgently',
            'medium': 'Medium priority - normal processing time',
            'low': 'Low priority - may take longer to process'
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
        document.addEventListener('mousemove', () => {
            lastActivity = Date.now();
        });

        document.addEventListener('keypress', () => {
            lastActivity = Date.now();
        });

        // Auto-refresh every 5 minutes if user is active
        refreshInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;

            // Refresh if user was active in the last 10 minutes
            if (timeSinceActivity < 600000) {
                this.refreshStatusCounts();
            }
        }, 300000); // 5 minutes

        // Clear interval when page unloads
        window.addEventListener('beforeunload', () => {
            clearInterval(refreshInterval);
        });
    }

    /**
     * Refresh status counts via AJAX
     */
    async refreshStatusCounts() {
        try {
            // You can uncomment and adjust this when you have the endpoint
            // const response = await fetch('/student/dashboard/status-counts/', {
            //     headers: {
            //         'X-Requested-With': 'XMLHttpRequest',
            //         'X-CSRFToken': this.getCSRFToken()
            //     }
            // });

            // if (response.ok) {
            //     const data = await response.json();
            //     this.updateStatusCounts(data);
            // }

            console.log('Auto-refresh placeholder - implement with your status endpoint');
        } catch (error) {
            console.log('Auto-refresh failed:', error);
        }
    }

    /**
     * Update status counts in the UI
     */
    updateStatusCounts(data) {
        const counters = {
            'total_requests': '.stat-card--primary .stat-number',
            'pending_requests': '.stat-card--warning .stat-number',
            'completed_requests': '.stat-card--success .stat-number',
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
            // Ctrl/Cmd + N = New Request
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newRequestBtn = document.querySelector('a[href*="maintenance:create"]');
                if (newRequestBtn) {
                    newRequestBtn.click();
                }
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
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
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
            // Navigate to all requests (placeholder - adjust URL as needed)
            alert('All requests view coming soon!');
        } else if (card.classList.contains('stat-card--warning')) {
            // Navigate to pending requests (placeholder - adjust URL as needed)
            alert('Pending requests view coming soon!');
        } else if (card.classList.contains('stat-card--success')) {
            // Navigate to completed requests (placeholder - adjust URL as needed)
            alert('Completed requests view coming soon!');
        } else if (card.classList.contains('stat-card--info')) {
            // Navigate to tickets
            const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
            if (ticketsBtn) {
                window.location.href = ticketsBtn.href;
            }
        }
    }

    /**
     * Handle table row clicks
     */
    handleTableRowClick(e) {
        // Don't trigger if clicking on a button
        if (e.target.closest('.btn')) return;

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
        const icon = btn.querySelector('i');

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
     * Handle form submissions
     */
    handleFormSubmit(e) {
        const form = e.currentTarget;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';

            // Re-enable after 3 seconds if form hasn't been submitted
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 3000);
        }
    }

    /**
     * Close any open elements (modals, dropdowns, etc.)
     */
    closeOpenElements() {
        // Close any Bootstrap modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize dashboard when DOM is ready
const dashboard = new StudentDashboard();

// Export for potential external use
window.StudentDashboard = StudentDashboard;