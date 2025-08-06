/**
 * Ticket List Interactive Features
 * Handles search, filtering, and other interactive elements
 */

class TicketList {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponents());
        } else {
            this.setupComponents();
        }
    }

    setupComponents() {
        this.setupEventListeners();
        this.setupSearch();
        this.setupFilters();
        this.setupAnimations();
        this.setupTooltips();
        this.setupKeyboardShortcuts();
        this.setupAutoRefresh();
        this.setupStatCards();

        console.log('TicketList initialized successfully');
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Table row clicks
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', (e) => this.handleRowClick(e, row));
        });

        // Stat card clicks
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleStatCardClick(e, card));
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavButtonClick(e, btn));
        });

        // Close ticket buttons
        document.querySelectorAll('.close-ticket-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCloseTicket(e, btn));
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPage());
        }
    }

    // ===== SEARCH FUNCTIONALITY =====
    setupSearch() {
        const searchInput = document.getElementById('ticketSearch');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterTickets(e.target.value.toLowerCase());
            }, 300); // Debounce search
        });

        // Clear search on escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.filterTickets('');
            }
        });
    }

    // ===== FILTER FUNCTIONALITY =====
    setupFilters() {
        const statusFilter = document.getElementById('statusFilter');
        if (!statusFilter) return;

        statusFilter.addEventListener('change', (e) => {
            this.filterByStatus(e.target.value);
        });
    }

    filterTickets(searchTerm) {
        const rows = document.querySelectorAll('.table-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const title = row.querySelector('.ticket-title strong')?.textContent.toLowerCase() || '';
            const description = row.querySelector('.ticket-description')?.textContent.toLowerCase() || '';
            const ticketId = row.querySelector('.ticket-id strong')?.textContent.toLowerCase() || '';

            const isVisible = !searchTerm ||
                            title.includes(searchTerm) ||
                            description.includes(searchTerm) ||
                            ticketId.includes(searchTerm);

            if (isVisible) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        this.updateShowingCount(visibleCount);
        this.highlightSearchTerm(searchTerm);
    }

    filterByStatus(status) {
        const rows = document.querySelectorAll('.table-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const rowStatus = row.dataset.status;
            const isVisible = !status || rowStatus === status;

            if (isVisible) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        this.updateShowingCount(visibleCount);
    }

    highlightSearchTerm(searchTerm) {
        // Remove existing highlights
        document.querySelectorAll('.highlight').forEach(el => {
            el.outerHTML = el.innerHTML;
        });

        if (!searchTerm) return;

        // Add new highlights
        document.querySelectorAll('.table-row:not(.hidden)').forEach(row => {
            const titleEl = row.querySelector('.ticket-title strong');
            const descEl = row.querySelector('.ticket-description');

            [titleEl, descEl].forEach(el => {
                if (el && el.textContent.toLowerCase().includes(searchTerm)) {
                    this.highlightText(el, searchTerm);
                }
            });
        });
    }

    highlightText(element, term) {
        const text = element.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        element.innerHTML = text.replace(regex, '<span class="highlight" style="background-color: yellow; font-weight: bold;">$1</span>');
    }

    updateShowingCount(visibleCount) {
        const showingEl = document.getElementById('showingCount');
        const totalCount = document.querySelectorAll('.table-row').length;

        if (showingEl) {
            showingEl.textContent = `Showing ${visibleCount} of ${totalCount} tickets`;
        }
    }

    // ===== ANIMATIONS =====
    setupAnimations() {
        // Animate stat cards on load
        this.animateStatCards();

        // Setup scroll animations
        this.setupScrollAnimations();
    }

    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.tickets-section, .navigation-section').forEach(section => {
            observer.observe(section);
        });
    }

    // ===== TOOLTIPS =====
    setupTooltips() {
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    showTooltip(event) {
        const element = event.target;
        const title = element.getAttribute('title');

        if (!title) return;

        // Remove title to prevent default tooltip
        element.removeAttribute('title');
        element.dataset.originalTitle = title;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = title;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        // Show tooltip
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }

        // Restore original title
        document.querySelectorAll('[data-original-title]').forEach(el => {
            el.setAttribute('title', el.dataset.originalTitle);
            delete el.dataset.originalTitle;
        });
    }

    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New ticket
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newTicketBtn = document.querySelector('a[href*="ticket:create"]');
                if (newTicketBtn) newTicketBtn.click();
            }

            // Ctrl/Cmd + R: Refresh (override default)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshPage();
            }

            // Ctrl/Cmd + F: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('ticketSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape: Clear search and filters
            if (e.key === 'Escape') {
                this.clearFilters();
            }
        });
    }

    clearFilters() {
        const searchInput = document.getElementById('ticketSearch');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) {
            searchInput.value = '';
            this.filterTickets('');
        }

        if (statusFilter) {
            statusFilter.value = '';
            this.filterByStatus('');
        }
    }

    // ===== AUTO REFRESH =====
    setupAutoRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshStatusCounts();
        }, 5 * 60 * 1000);

        // Check for new tickets every 30 seconds
        setInterval(() => {
            this.checkForUpdates();
        }, 30 * 1000);
    }

    async refreshStatusCounts() {
        try {
            // This would make an AJAX call to get updated counts
            // const response = await fetch('/api/ticket-counts/');
            // const data = await response.json();
            // this.updateStatCards(data);

            console.log('Status counts refreshed');
        } catch (error) {
            console.error('Failed to refresh status counts:', error);
        }
    }

    async checkForUpdates() {
        try {
            // Check for new tickets or status updates
            console.log('Checking for updates...');
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    // ===== STAT CARDS =====
    setupStatCards() {
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                const statType = card.dataset.stat;
                this.filterByStatType(statType);
            });
        });
    }

    filterByStatType(statType) {
        const statusFilter = document.getElementById('statusFilter');

        switch (statType) {
            case 'pending':
                if (statusFilter) statusFilter.value = 'pending';
                this.filterByStatus('pending');
                break;
            case 'answered':
                if (statusFilter) statusFilter.value = 'answered';
                this.filterByStatus('answered');
                break;
            case 'closed':
                if (statusFilter) statusFilter.value = 'closed';
                this.filterByStatus('closed');
                break;
            default:
                if (statusFilter) statusFilter.value = '';
                this.filterByStatus('');
        }
    }

    // ===== EVENT HANDLERS =====
    handleRowClick(event, row) {
        // Don't navigate if clicking on a button
        if (event.target.closest('button') || event.target.closest('a')) {
            return;
        }

        const ticketId = row.dataset.ticketId;
        if (ticketId) {
            // Navigate to ticket detail
            window.location.href = `/ticket/${ticketId}/`;
        }
    }

    handleStatCardClick(event, card) {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        const statType = card.dataset.stat;
        this.filterByStatType(statType);
    }

    handleNavButtonClick(event, button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 200);
        }
    }

    async handleCloseTicket(event, button) {
        event.preventDefault();
        event.stopPropagation();

        const ticketId = button.dataset.ticketId;

        if (!confirm('Are you sure you want to close this ticket?')) {
            return;
        }

        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Closing...';

            // Make API call to close ticket
            // const response = await fetch(`/api/tickets/${ticketId}/close/`, {
            //     method: 'POST',
            //     headers: {
            //         'X-CSRFToken': this.getCSRFToken(),
            //         'Content-Type': 'application/json'
            //     }
            // });

            // if (response.ok) {
            //     // Update UI
            //     this.updateTicketStatus(ticketId, 'closed');
            //     this.showNotification('Ticket closed successfully', 'success');
            // } else {
            //     throw new Error('Failed to close ticket');
            // }

            // Temporary simulation
            setTimeout(() => {
                this.updateTicketStatus(ticketId, 'closed');
                this.showNotification('Ticket closed successfully', 'success');
            }, 1000);

        } catch (error) {
            console.error('Error closing ticket:', error);
            this.showNotification('Failed to close ticket', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-times"></i> Close';
        }
    }

    updateTicketStatus(ticketId, newStatus) {
        const row = document.querySelector(`[data-ticket-id="${ticketId}"]`);
        if (!row) return;

        const badge = row.querySelector('.badge');
        if (badge) {
            badge.className = `badge badge-${newStatus === 'closed' ? 'secondary' : newStatus}`;
            badge.innerHTML = `<i class="fas fa-${newStatus === 'closed' ? 'archive' : 'check-circle'}"></i> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
        }

        // Hide close button
        const closeBtn = row.querySelector('.close-ticket-btn');
        if (closeBtn) {
            closeBtn.style.display = 'none';
        }

        // Update row dataset
        row.dataset.status = newStatus;
    }

    refreshPage() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
        }

        // Simulate refresh delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    // ===== UTILITY METHODS =====
    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                     document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ||
                     document.cookie.match(/csrftoken=([^;]+)/)?.[1];
        return token || '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

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
    window.ticketList = new TicketList();
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }

    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);
