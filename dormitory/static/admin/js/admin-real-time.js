/**
 * Dormitory Admin Real-Time System
 * SIMPLIFIED version that works with your existing HTMX notification system
 * No API endpoints needed - integrates with existing AdminActivityTracker
 */

class DormitoryAdminRealTime {
    constructor() {
        // Simple configuration - work with your existing system
        this.config = {
            enhancementOnly: true,  // Don't create competing polling
            connectionCheckInterval: 30000, // Just check connection every 30s
        };

        this.state = {
            isInitialized: false,
            lastActivity: new Date(),
            connectionStatus: 'connected'
        };

        // Cache DOM elements
        this.elements = {
            existingNotificationBadge: null,
            statusIndicator: null,
            adminHeader: null
        };

        this.init();
    }

    /**
     * Initialize - enhance existing system, don't replace it
     */
    init() {
        if (this.state.isInitialized) return;

        console.log('🚀 Initializing Admin Enhancements (working with existing HTMX system)');

        this.findExistingElements();
        this.createStatusIndicator();
        this.enhanceExistingNotifications();
        this.setupDesktopNotifications();
        this.setupPageVisibilityHandling();
        this.monitorHTMXActivity();

        this.state.isInitialized = true;
        console.log('✅ Admin Real-Time Enhancements initialized');
    }

    /**
     * Find your existing notification elements
     */
    findExistingElements() {
        // Find your existing notification badge (HTMX powered)
        this.elements.existingNotificationBadge = document.getElementById('notification-badge');
        this.elements.adminHeader = document.getElementById('header') || document.querySelector('#branding');

        if (this.elements.existingNotificationBadge) {
            console.log('✅ Found existing HTMX notification system');
        }
    }

    /**
     * Create simple connection status indicator
     */
    createStatusIndicator() {
        if (!this.elements.adminHeader) return;

        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'admin-connection-status';
        statusIndicator.className = 'admin-status-indicator';
        statusIndicator.innerHTML = `
            <div class="status-dot connected"></div>
            <span class="status-text">Live</span>
        `;

        // Position it in the header
        const userTools = this.elements.adminHeader.querySelector('#user-tools');
        if (userTools) {
            userTools.insertAdjacentElement('beforebegin', statusIndicator);
        } else {
            this.elements.adminHeader.appendChild(statusIndicator);
        }

        this.elements.statusIndicator = statusIndicator;
    }

    /**
     * Enhance your existing notification system with better UX
     */
    enhanceExistingNotifications() {
        if (!this.elements.existingNotificationBadge) return;

        // Monitor changes to the notification badge for desktop notifications
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    this.handleNotificationUpdate();
                }
            });
        });

        observer.observe(this.elements.existingNotificationBadge, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Add better hover effects to existing notification items
        this.enhanceNotificationItems();
    }

    /**
     * Enhanced hover effects for notification items
     */
    enhanceNotificationItems() {
        // Use event delegation for dynamically loaded HTMX content
        document.addEventListener('mouseenter', (e) => {
            const notificationItem = e.target.closest('.notification-item, .list-group-item-action');
            if (notificationItem) {
                notificationItem.style.transform = 'translateX(5px)';
                notificationItem.style.transition = 'transform 0.2s ease';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const notificationItem = e.target.closest('.notification-item, .list-group-item-action');
            if (notificationItem) {
                notificationItem.style.transform = '';
            }
        }, true);
    }

    /**
     * Handle notification updates from your existing system
     */
    handleNotificationUpdate() {
        this.state.lastActivity = new Date();
        this.updateConnectionStatus('connected');

        // Check for high-priority notifications
        const notificationBadge = this.elements.existingNotificationBadge;
        if (notificationBadge) {
            const badgeElement = notificationBadge.querySelector('.badge');
            const count = badgeElement ? parseInt(badgeElement.textContent) || 0 : 0;

            if (count > 0 && this.shouldShowDesktopNotification()) {
                this.showDesktopNotification(count);
            }
        }
    }

    /**
     * Monitor HTMX activity to show connection status
     */
    monitorHTMXActivity() {
        // Listen for HTMX events
        document.addEventListener('htmx:beforeRequest', () => {
            this.updateConnectionStatus('loading');
        });

        document.addEventListener('htmx:afterRequest', (e) => {
            if (e.detail.successful) {
                this.updateConnectionStatus('connected');
                this.state.lastActivity = new Date();
            } else {
                this.updateConnectionStatus('error');
            }
        });

        document.addEventListener('htmx:sendError', () => {
            this.updateConnectionStatus('error');
        });

        document.addEventListener('htmx:responseError', () => {
            this.updateConnectionStatus('error');
        });

        // Periodic connection check
        setInterval(() => {
            this.checkConnectionHealth();
        }, this.config.connectionCheckInterval);
    }

    /**
     * Check if connection is healthy
     */
    checkConnectionHealth() {
        const now = new Date();
        const timeSinceLastActivity = now - this.state.lastActivity;

        // If no activity for 2 minutes, show as potentially disconnected
        if (timeSinceLastActivity > 120000) {
            this.updateConnectionStatus('idle');
        }
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(status) {
        if (!this.elements.statusIndicator) return;

        this.state.connectionStatus = status;
        const dot = this.elements.statusIndicator.querySelector('.status-dot');
        const text = this.elements.statusIndicator.querySelector('.status-text');

        // Reset classes
        dot.className = `status-dot ${status}`;

        switch (status) {
            case 'loading':
                text.textContent = 'Updating...';
                break;
            case 'connected':
                text.textContent = 'Live';
                break;
            case 'error':
                text.textContent = 'Error';
                break;
            case 'idle':
                text.textContent = 'Idle';
                break;
        }
    }

    /**
     * Setup desktop notifications
     */
    setupDesktopNotifications() {
        // Request permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Determine if desktop notification should be shown
     */
    shouldShowDesktopNotification() {
        return 'Notification' in window &&
               Notification.permission === 'granted' &&
               document.hidden; // Only show when page is hidden
    }

    /**
     * Show desktop notification
     */
    showDesktopNotification(count) {
        if (!this.shouldShowDesktopNotification()) return;

        const notification = new Notification('Dormitory Management', {
            body: `${count} new notification${count > 1 ? 's' : ''} require attention`,
            icon: '/static/admin/img/icon-yes.svg',
            tag: 'admin-notification', // Prevents duplicate notifications
        });

        // Close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Focus window when notification is clicked
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    /**
     * Handle page visibility changes
     */
    setupPageVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible - refresh notifications
                console.log('📱 Page visible - refreshing notifications');
                this.triggerNotificationRefresh();
            }
        });
    }

    /**
     * Trigger refresh of your existing HTMX notification system
     */
    triggerNotificationRefresh() {
        const notificationBadge = this.elements.existingNotificationBadge;
        if (notificationBadge && window.htmx) {
            // Trigger HTMX refresh
            htmx.trigger(notificationBadge, 'refresh');
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Remove event listeners if needed
        console.log('🧹 Admin Real-Time Enhancements cleaned up');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin pages
    if (window.location.pathname.includes('/admin/')) {
        window.dormitoryAdminRealTime = new DormitoryAdminRealTime();
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.dormitoryAdminRealTime) {
        window.dormitoryAdminRealTime.cleanup();
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DormitoryAdminRealTime;
}