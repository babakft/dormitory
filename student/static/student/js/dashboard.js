/**
 * Enhanced Student Dashboard System
 * Matches the style and quality of homepage and auth systems
 */

class EnhancedStudentDashboard {
    constructor() {
        this.lastActivity = Date.now();
        this.refreshInterval = null;
        this.isCounterAnimated = false;
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
        this.setupAutoRefresh();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.animateStatsOnScroll();

        console.log('✨ Enhanced Student Dashboard Initialized');
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Stat cards click effects
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
            card.addEventListener('mouseenter', this.handleStatCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleStatCardLeave.bind(this));
        });

        // Table row interactions
        const tableRows = document.querySelectorAll('.table-row');
        tableRows.forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
            row.addEventListener('mouseenter', this.handleTableRowHover.bind(this));
        });

        // Navigation cards
        const navCards = document.querySelectorAll('.nav-card');
        navCards.forEach(card => {
            card.addEventListener('mouseenter', this.handleNavCardHover.bind(this));
        });

        // Logout confirmation
        const logoutForm = document.querySelector('.nav-card-form');
        if (logoutForm) {
            logoutForm.addEventListener('submit', this.handleLogoutConfirmation.bind(this));
        }

        // Track user activity for auto-refresh
        this.trackUserActivity();
    }

    // ===== Animations =====
    setupAnimations() {
        // Animate elements on page load
        this.animateOnLoad();

        // Setup scroll-based animations
        this.setupScrollObserver();

        // Animate numbers
        this.animateCountersOnScroll();
    }

    animateOnLoad() {
        const elements = document.querySelectorAll('.dashboard-header, .stat-card, .requests-card, .nav-card');

        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';

            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupScrollObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.requests-section, .navigation-section, .quick-stats-bar');
        sections.forEach(section => observer.observe(section));
    }

    animateStatsOnScroll() {
        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isCounterAnimated) {
                    this.animateStatNumbers();
                    this.isCounterAnimated = true;
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(statsSection);
    }

    animateCountersOnScroll() {
        // Alternative method if AOS is not available
        if (typeof AOS === 'undefined') {
            this.animateStatsOnScroll();
        }
    }

    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count')) || 0;
            const duration = 2000;
            const startTime = performance.now();

            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(this.easeOutCubic(progress) * target);

                stat.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target;
                }
            };

            requestAnimationFrame(updateNumber);
        });
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ===== Event Handlers =====
    handleStatCardClick(e) {
        const card = e.currentTarget;

        // Add ripple effect
        this.createRippleEffect(card, e);

        // Add click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Navigate based on card type
        if (card.classList.contains('stat-card--info')) {
            const ticketsLink = document.querySelector('a[href*="ticket:list"]');
            if (ticketsLink) {
                window.location.href = ticketsLink.href;
            }
        } else {
            // Show notification
            this.showNotification('Feature coming soon! 🚀', 'info');
        }
    }

    handleStatCardHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.stat-icon');

        if (icon) {
            icon.style.transition = 'transform 0.3s ease';
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    handleStatCardLeave(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.stat-icon');

        if (icon) {
            icon.style.transform = '';
        }
    }

    handleTableRowClick(e) {
        // Don't trigger if clicking on a button
        if (e.target.closest('.btn')) return;

        const row = e.currentTarget;
        const viewBtn = row.querySelector('a[href*="detail"]');

        if (viewBtn) {
            // Add visual feedback
            row.style.transform = 'scale(0.99)';
            setTimeout(() => {
                window.location.href = viewBtn.href;
            }, 100);
        }
    }

    handleTableRowHover(e) {
        const row = e.currentTarget;
        row.style.transition = 'transform 0.2s ease';
        row.style.transform = 'translateX(4px)';
    }

    handleNavCardHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.nav-card-icon');

        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    handleLogoutConfirmation(e) {
        const confirmed = confirm('Are you sure you want to logout? 👋');
        if (!confirmed) {
            e.preventDefault();
        }
    }

    // ===== Utility Functions =====
    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple 0.8s ease-out;
            pointer-events: none;
            z-index: 10;
        `;

        // Add ripple animation if not exists
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 800);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.dashboard-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `dashboard-notification dashboard-notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            border-left: 4px solid var(--primary-color);
        `;

        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
        icon.style.cssText = 'font-size: 1.5rem; color: var(--primary-color);';

        const text = document.createElement('span');
        text.textContent = message;
        text.style.cssText = 'color: #1a202c; font-weight: 500;';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #718096;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => notification.remove();

        notification.appendChild(icon);
        notification.appendChild(text);
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);

        // Add animation
        if (!document.querySelector('#notification-animation')) {
            const style = document.createElement('style');
            style.id = 'notification-animation';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
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

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===== Auto Refresh =====
    trackUserActivity() {
        ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });
    }

    setupAutoRefresh() {
        // Auto-refresh every 5 minutes if user is active
        this.refreshInterval = setInterval(() => {
            const timeSinceActivity = Date.now() - this.lastActivity;

            // Refresh if user was active in the last 10 minutes
            if (timeSinceActivity < 600000) {
                this.refreshDashboardData();
            }
        }, 300000); // 5 minutes

        // Clear interval when page unloads
        window.addEventListener('beforeunload', () => {
            clearInterval(this.refreshInterval);
        });
    }

    async refreshDashboardData() {
        try {
            // Placeholder for future implementation
            console.log('🔄 Auto-refreshing dashboard data...');

            // You can implement actual AJAX refresh here when backend is ready
            // const response = await fetch('/student/dashboard/status-counts/', {
            //     headers: {
            //         'X-Requested-With': 'XMLHttpRequest',
            //         'X-CSRFToken': this.getCSRFToken()
            //     }
            // });
            //
            // if (response.ok) {
            //     const data = await response.json();
            //     this.updateStatCounts(data);
            // }

        } catch (error) {
            console.log('Auto-refresh error:', error);
        }
    }

    updateStatCounts(data) {
        const counters = {
            'total_requests': '.stat-card--primary .stat-number',
            'pending_requests': '.stat-card--warning .stat-number',
            'completed_requests': '.stat-card--success .stat-number',
            'total_tickets': '.stat-card--info .stat-number'
        };

        Object.entries(counters).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element && data[key] !== undefined) {
                this.animateNumberUpdate(element, parseInt(element.textContent), data[key]);
            }
        });
    }

    animateNumberUpdate(element, fromValue, toValue) {
        if (fromValue !== toValue) {
            // Flash effect
            element.style.color = 'var(--success-color)';
            setTimeout(() => {
                element.style.color = '';
            }, 1000);

            // Animate number
            const duration = 500;
            const startTime = performance.now();

            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.round(fromValue + (toValue - fromValue) * this.easeOutCubic(progress));

                element.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            };

            requestAnimationFrame(updateNumber);
        }
    }

    // ===== Keyboard Shortcuts =====
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

            // Escape = Close notifications
            if (e.key === 'Escape') {
                const notifications = document.querySelectorAll('.dashboard-notification');
                notifications.forEach(n => n.remove());
            }
        });
    }

    // ===== Accessibility =====
    setupAccessibility() {
        // Add ARIA labels to interactive elements
        document.querySelectorAll('.stat-card, .nav-card').forEach(el => {
            if (!el.getAttribute('role')) {
                el.setAttribute('role', 'button');
            }
            if (!el.getAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });

        // Keyboard navigation for cards
        document.querySelectorAll('[role="button"]').forEach(el => {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        });

        // Focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add focus styles
        if (!document.querySelector('#keyboard-nav-styles')) {
            const style = document.createElement('style');
            style.id = 'keyboard-nav-styles';
            style.textContent = `
                .keyboard-navigation *:focus {
                    outline: 3px solid var(--sbu-gold) !important;
                    outline-offset: 3px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== Utilities =====
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
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

// ===== Performance Monitoring =====
class DashboardPerformanceMonitor {
    static init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('📊 Dashboard Performance:', {
                            'Load Time': `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
                            'DOM Ready': `${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`,
                            'Total Load': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`
                        });
                    }
                }, 0);
            });
        }
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main dashboard
    window.studentDashboard = new EnhancedStudentDashboard();

    // Initialize performance monitoring
    DashboardPerformanceMonitor.init();

    console.log('🎓 Welcome to Enhanced Student Dashboard');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('👋 Thanks for using the Dashboard');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedStudentDashboard,
        DashboardPerformanceMonitor
    };
}