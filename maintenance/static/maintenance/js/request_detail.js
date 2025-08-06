class RequestDetail {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupImageGallery();
        this.setupAnimations();
        this.setupTooltips();
        this.setupScrollEffects();
        this.setupKeyboardShortcuts();
        this.setupTimelineAnimation();
        this.setupStatusUpdates();
    }

    // ===== IMAGE GALLERY ===== //
    setupImageGallery() {
        const images = document.querySelectorAll('.gallery-image');

        images.forEach((image, index) => {
            image.addEventListener('click', () => this.openImageModal(image, index));
            image.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openImageModal(image, index);
                }
            });

            // Make images focusable for accessibility
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.setAttribute('aria-label', 'Click to view full size image');
        });
    }

    openImageModal(image, index) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('imageModal');
        if (!modal) {
            modal = this.createImageModal();
            document.body.appendChild(modal);
        }

        const modalImage = modal.querySelector('.modal-image');
        const modalCounter = modal.querySelector('.modal-counter');

        modalImage.src = image.src;
        modalImage.alt = image.alt || 'Full size image';

        if (modalCounter) {
            const totalImages = document.querySelectorAll('.gallery-image').length;
            modalCounter.textContent = `${index + 1} / ${totalImages}`;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus management
        modalImage.focus();
    }

    createImageModal() {
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="image-modal-close" aria-label="Close image">&times;</button>
                <img class="modal-image" alt="Full size image">
                <div class="modal-counter"></div>
                <div class="modal-navigation">
                    <button class="modal-nav-btn modal-prev" aria-label="Previous image">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="modal-nav-btn modal-next" aria-label="Next image">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;

        // Add modal styles
        const modalStyles = `
            .image-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 9999;
                align-items: center;
                justify-content: center;
            }
            .image-modal-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-image {
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
            }
            .image-modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .image-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .modal-counter {
                position: absolute;
                bottom: -40px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
            }
            .modal-navigation {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 100%;
                display: flex;
                justify-content: space-between;
                pointer-events: none;
            }
            .modal-nav-btn {
                background: rgba(0, 0, 0, 0.5);
                border: none;
                color: white;
                padding: 16px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                pointer-events: auto;
                transition: background 0.2s;
            }
            .modal-nav-btn:hover {
                background: rgba(0, 0, 0, 0.7);
            }
        `;

        if (!document.getElementById('image-modal-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'image-modal-styles';
            styleSheet.textContent = modalStyles;
            document.head.appendChild(styleSheet);
        }

        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeImageModal();
            }
        });

        modal.querySelector('.image-modal-close').addEventListener('click', () => {
            this.closeImageModal();
        });

        // Keyboard navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
            }
        });

        return modal;
    }

    closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // ===== ANIMATIONS ===== //
    setupAnimations() {
        // Stagger animation for cards
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Animate status badge
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.addEventListener('mouseenter', () => {
                statusBadge.style.transform = 'scale(1.05)';
            });
            statusBadge.addEventListener('mouseleave', () => {
                statusBadge.style.transform = 'scale(1)';
            });
        }
    }

    setupTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');

        // Animate timeline items on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        }, { threshold: 0.1 });

        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(item);
        });
    }

    // ===== TOOLTIPS ===== //
    setupTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title], .priority-badge, .status-badge');

        elementsWithTooltips.forEach(element => {
            const title = element.getAttribute('title') || this.getTooltipContent(element);
            if (title) {
                element.addEventListener('mouseenter', (e) => this.showTooltip(e, title));
                element.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }

    getTooltipContent(element) {
        if (element.classList.contains('priority-badge')) {
            const priority = element.textContent.toLowerCase();
            const tooltips = {
                'high priority': 'This request requires immediate attention',
                'medium priority': 'This request will be processed with normal priority',
                'low priority': 'This request will be processed when resources are available',
                'priority not decided': 'Priority level has not been determined yet'
            };
            return tooltips[priority] || '';
        }

        if (element.classList.contains('status-badge')) {
            const status = element.textContent.toLowerCase();
            const tooltips = {
                'pending': 'Waiting for approval',
                'approved': 'Approved and ready for assignment',
                'in progress': 'Work is currently in progress',
                'completed': 'Request has been completed',
                'rejected': 'Request was rejected'
            };
            return tooltips[status] || '';
        }

        return '';
    }

    showTooltip(event, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(tooltip);

        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // ===== SCROLL EFFECTS ===== //
    setupScrollEffects() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.request-header');

        if (header && scrolled > 100) {
            header.style.transform = `translateY(${-scrolled * 0.1}px)`;
        }

        // Animate elements on scroll
        const animateElements = document.querySelectorAll('.detail-card:not(.animated)');
        const windowHeight = window.innerHeight;

        animateElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < windowHeight * 0.8) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // ===== KEYBOARD SHORTCUTS ===== //
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key - close modals
            if (e.key === 'Escape') {
                this.closeImageModal();
                this.hideTooltip();
            }

            // Ctrl/Cmd + B - Back to dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const backButton = document.querySelector('a[href*="dashboard"]');
                if (backButton) {
                    backButton.click();
                }
            }

            // Ctrl/Cmd + R - Rate service (if available)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                const rateButton = document.querySelector('a[href*="rate"]');
                if (rateButton) {
                    rateButton.click();
                }
            }
        });
    }

    // ===== STATUS UPDATES ===== //
    setupStatusUpdates() {
        // Auto-refresh status every 5 minutes if user is active
        this.lastActivity = Date.now();
        this.setupActivityTracking();

        setInterval(() => {
            if (Date.now() - this.lastActivity < 10 * 60 * 1000) { // 10 minutes
                this.checkForUpdates();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, true);
        });
    }

    async checkForUpdates() {
        try {
            const requestId = this.getRequestId();
            if (!requestId) return;

            const response = await fetch(`/maintenance/api/request/${requestId}/status/`, {
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateStatusIfChanged(data);
            }
        } catch (error) {
            console.log('Status update check failed:', error);
        }
    }

    getRequestId() {
        // Extract request ID from URL or page data
        const match = window.location.pathname.match(/\/(\d+)\//);
        return match ? match[1] : null;
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }

    updateStatusIfChanged(data) {
        const currentStatus = document.querySelector('.status-badge');
        if (currentStatus && data.status !== currentStatus.textContent.toLowerCase().replace(' ', '_')) {
            this.showNotification(`Status updated to: ${data.status_display}`, 'info');
            // Optionally reload the page or update specific elements
            setTimeout(() => window.location.reload(), 2000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 16px;
                z-index: 10000;
                min-width: 300px;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #007bff;
            }
            .notification-info { border-left-color: #007bff; }
            .notification-success { border-left-color: #28a745; }
            .notification-warning { border-left-color: #ffc107; }
            .notification-error { border-left-color: #dc3545; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-close {
                margin-left: auto;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;

        if (!document.getElementById('notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        document.body.appendChild(notification);

        // Auto dismiss
        const dismissTimer = setTimeout(() => {
            this.dismissNotification(notification);
        }, 5000);

        // Manual dismiss
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(dismissTimer);
            this.dismissNotification(notification);
        });
    }

    dismissNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);

        // Add slide out animation
        if (!document.getElementById('slideout-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'slideout-styles';
            styleSheet.textContent = `
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }
}

// Initialize when DOM is ready
const requestDetail = new RequestDetail();

// Make it globally accessible for debugging
window.RequestDetail = RequestDetail;
