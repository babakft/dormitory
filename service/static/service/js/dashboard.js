/**
 * Enhanced Service Expert Dashboard JavaScript
 * Handles interactive functionality with animations and modern UX
 */

class ServiceDashboard {
    constructor() {
        this.isCounterAnimated = false;
        this.init();
    }

    init() {
        console.log('🚀 Enhanced Service Dashboard initializing...');
        this.setupAnimations();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.startAutoRefresh();
        console.log('✅ Enhanced Service Dashboard initialized');
    }

    // ===== Animations =====
    setupAnimations() {
        this.animateOnLoad();
        this.setupScrollObserver();
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

        const sections = document.querySelectorAll('.requests-section, .navigation-section');
        sections.forEach(section => observer.observe(section));
    }

    animateCountersOnScroll() {
        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isCounterAnimated) {
                    this.animateStatNumbers();
                    this.isCounterAnimated = true;
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent) || 0;
            const duration = 2000;
            const startTime = performance.now();

            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(this.easeOutCubic(progress) * finalValue);

                stat.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = finalValue;
                }
            };

            stat.textContent = '0';
            requestAnimationFrame(updateNumber);
        });
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Stat card interactions
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
            card.addEventListener('mouseenter', this.handleStatCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleStatCardLeave.bind(this));
        });

        // Table row clicks
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
            row.addEventListener('mouseenter', this.handleTableRowHover.bind(this));
            row.addEventListener('mouseleave', this.handleTableRowLeave.bind(this));
        });

        // Navigation cards
        document.querySelectorAll('.nav-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleNavCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleNavCardLeave.bind(this));
        });

        // Logout confirmation
        const logoutForm = document.querySelector('.nav-card-form');
        if (logoutForm) {
            logoutForm.addEventListener('submit', this.handleLogoutConfirmation.bind(this));
        }

        // Button interactions
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', this.handleButtonClick.bind(this));
        });
    }

    // ===== Event Handlers =====
    handleStatCardClick(e) {
        const card = e.currentTarget;
        this.createRippleEffect(card, e);

        card.style.transform = 'scale(0.98) translateY(-8px)';
        setTimeout(() => {
            card.style.transform = 'translateY(-8px)';
        }, 150);
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
        if (e.target.closest('.btn')) return;

        const row = e.currentTarget;
        const viewBtn = row.querySelector('a[href*="detail"]') || row.querySelector('.btn-primary');

        if (viewBtn) {
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

    handleTableRowLeave(e) {
        const row = e.currentTarget;
        row.style.transform = '';
    }

    handleNavCardHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.nav-card-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    handleNavCardLeave(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.nav-card-icon');
        if (icon) {
            icon.style.transform = '';
        }
    }

    handleLogoutConfirmation(e) {
        const confirmed = confirm('Are you sure you want to logout? 👋');
        if (!confirmed) {
            e.preventDefault();
        }
    }

    handleButtonClick(e) {
        const button = e.currentTarget;
        this.createRippleEffect(button, e);
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
            border-left: 4px solid ${type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd'};
        `;

        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' :
                        type === 'error' ? 'fas fa-exclamation-circle' :
                        'fas fa-info-circle';
        icon.style.fontSize = '1.5rem';
        icon.style.color = type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd';

        const text = document.createElement('span');
        text.textContent = message;
        text.style.flex = '1';

        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== Keyboard Shortcuts =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + H = Home/Dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                window.location.href = '/service/dashboard/';
            }

            // Ctrl/Cmd + M = My Requests
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                const myRequestsLink = document.querySelector('a[href*="my_requests"]');
                if (myRequestsLink) myRequestsLink.click();
            }

            // Escape = Close notifications
            if (e.key === 'Escape') {
                document.querySelectorAll('.dashboard-notification').forEach(n => n.remove());
            }
        });
    }

    // ===== Auto Refresh =====
    startAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.refreshDashboardData();
        }, 300000);
    }

    async refreshDashboardData() {
        try {
            const response = await fetch(window.location.href, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (response.ok) {
                console.log('✅ Dashboard data refreshed');
                this.showNotification('Dashboard updated', 'success');
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ServiceDashboard());
} else {
    new ServiceDashboard();
}