/**
 * داشبورد متخصص سرویس - طراحی فارسی زیبا
 * Persian Service Expert Dashboard with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianDashboardUtils = {
    // تبدیل اعداد انگلیسی به فارسی
    toPersianNumbers: function(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';

        str = String(str);
        for (let i = 0; i < englishDigits.length; i++) {
            str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
        }
        return str;
    },

    // تبدیل اعداد فارسی به انگلیسی
    toEnglishNumbers: function(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';

        str = String(str);
        for (let i = 0; i < persianDigits.length; i++) {
            str = str.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        }
        return str;
    }
};

class ServiceExpertDashboard {
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
        console.log('🔧 داشبورد متخصص سرویس در حال بارگذاری...');

        this.convertNumbersToPersian();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupStatCards();
        this.setupTableInteractions();
        this.setupNavigationButtons();
        this.setupKeyboardShortcuts();
        this.setupParallaxEffects();
        this.addTooltips();

        console.log('✅ داشبورد متخصص سرویس آماده است');
    }

    // تبدیل تمام اعداد به فارسی
    convertNumbersToPersian() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(element => {
            const number = element.textContent.trim();
            element.textContent = PersianDashboardUtils.toPersianNumbers(number);
            element.classList.add('persian-number');
        });

        const dateElements = document.querySelectorAll('.days-ago');
        dateElements.forEach(element => {
            const text = element.textContent;
            element.textContent = PersianDashboardUtils.toPersianNumbers(text);
        });

        const performanceValues = document.querySelectorAll('.performance-value');
        performanceValues.forEach(element => {
            const text = element.textContent;
            element.textContent = PersianDashboardUtils.toPersianNumbers(text);
        });
    }

    // ایجاد بک‌گراند زیبا
    createBeautifulBackground() {
        this.createGeometricShapes();
        this.createFloatingParticles();
        this.initializeBackgroundAnimations();
    }

    createGeometricShapes() {
        const existingShapes = document.querySelector('.geometric-shapes');
        if (existingShapes) return;

        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'geometric-shapes';
        shapesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;

        const shapes = [
            { size: 120, color: '#667eea', top: '10%', right: '10%', delay: 0 },
            { size: 80, color: '#764ba2', top: '30%', left: '15%', delay: 2 },
            { size: 150, color: '#f093fb', bottom: '20%', right: '20%', delay: 4 }
        ];

        shapes.forEach((config, index) => {
            const shape = document.createElement('div');
            shape.style.cssText = `
                position: absolute;
                width: ${config.size}px;
                height: ${config.size}px;
                background: linear-gradient(45deg, ${config.color}, ${config.color}88);
                border-radius: ${index % 2 === 0 ? '50%' : '20%'};
                opacity: 0.1;
                animation: floatShape 12s ease-in-out infinite;
                animation-delay: ${config.delay}s;
            `;

            Object.assign(shape.style, {
                top: config.top || 'auto',
                bottom: config.bottom || 'auto',
                left: config.left || 'auto',
                right: config.right || 'auto'
            });

            shapesContainer.appendChild(shape);
        });

        document.body.appendChild(shapesContainer);
    }

    createFloatingParticles() {
        const existingParticles = document.querySelector('.floating-particles');
        if (existingParticles) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        for (let i = 1; i <= 10; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
                border-radius: 50%;
                right: ${i * 10}%;
                animation: floatParticle ${8 + (i % 5)}s linear infinite;
                animation-delay: ${i * 0.5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        document.body.appendChild(particlesContainer);
    }

    initializeBackgroundAnimations() {
        if (document.querySelector('#background-animations')) return;

        const style = document.createElement('style');
        style.id = 'background-animations';
        style.textContent = `
            @keyframes floatShape {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -20px) rotate(120deg); }
                66% { transform: translate(-20px, 30px) rotate(240deg); }
            }

            @keyframes floatParticle {
                0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
                10% { opacity: 1; transform: scale(1); }
                90% { opacity: 1; }
                100% { transform: translateY(-100px) translateX(50px) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setupParallaxEffects() {
        let ticking = false;

        const updateParallax = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const mouseX = e.clientX / window.innerWidth;
                    const mouseY = e.clientY / window.innerHeight;

                    const shapes = document.querySelectorAll('.geometric-shapes > div');
                    shapes.forEach((shape, index) => {
                        const speed = (index + 1) * 0.3;
                        const x = (mouseX - 0.5) * speed * 20;
                        const y = (mouseY - 0.5) * speed * 20;

                        const currentTransform = shape.style.transform || '';
                        const baseTransform = currentTransform.replace(/translate\([^)]*\)/g, '');
                        shape.style.transform = `translate(${x}px, ${y}px) ${baseTransform}`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('mousemove', updateParallax);
    }

    // راه‌اندازی رویدادها
    setupEventListeners() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
            card.addEventListener('mouseenter', this.handleStatCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleStatCardLeave.bind(this));
        });

        const tableRows = document.querySelectorAll('.table-row');
        tableRows.forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
        });

        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('mouseenter', this.handleNavButtonHover.bind(this));
        });

        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogoutConfirmation.bind(this));
        }

        const claimButtons = document.querySelectorAll('.btn-claim');
        claimButtons.forEach(btn => {
            btn.addEventListener('click', this.handleClaimClick.bind(this));
        });

        const searchInput = document.querySelector('#requestSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }
    }

    // راه‌اندازی انیمیشن‌ها
    setupAnimations() {
        this.animateStatCards();
        this.setupScrollAnimations();
        this.animateHeader();
    }

    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 150 + (index * 100));
        });
    }

    animateHeader() {
        const header = document.querySelector('.dashboard-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                header.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.requests-section, .nav-section');
        sections.forEach(section => {
            section.style.opacity = '0';
            observer.observe(section);
        });
    }

    // راه‌اندازی کارت‌های آمار
    setupStatCards() {
        const statCards = document.querySelectorAll('.stat-card');

        statCards.forEach(card => {
            const statNumber = card.querySelector('.stat-number');
            if (statNumber) {
                const targetValue = parseInt(PersianDashboardUtils.toEnglishNumbers(statNumber.textContent));
                if (!isNaN(targetValue)) {
                    statNumber.setAttribute('data-target', targetValue);
                    this.animateCounter(statNumber, targetValue);
                }
            }
        });
    }

    animateCounter(element, target, duration = 2000) {
        const startTime = Date.now();
        const startValue = 0;

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.textContent = PersianDashboardUtils.toPersianNumbers(current);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = PersianDashboardUtils.toPersianNumbers(target);
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // راه‌اندازی تعاملات جدول
    setupTableInteractions() {
        const tableRows = document.querySelectorAll('.table-row');

        tableRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'scale(1.01)';
            });

            row.addEventListener('mouseleave', () => {
                row.style.transform = 'scale(1)';
            });
        });
    }

    // راه‌اندازی دکمه‌های ناوبری
    setupNavigationButtons() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
    }

    // مدیریت کلیک روی کارت آمار
    handleStatCardClick(e) {
        const card = e.currentTarget;

        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        if (card.classList.contains('stat-card--primary')) {
            const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
            if (ticketsBtn) {
                window.location.href = ticketsBtn.href;
            }
        } else if (card.classList.contains('stat-card--warning')) {
            const assignedSection = document.querySelector('.requests-section');
            if (assignedSection) {
                assignedSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (card.classList.contains('stat-card--success')) {
            const completedBtn = document.querySelector('a[href*="completed_tasks"]');
            if (completedBtn) {
                window.location.href = completedBtn.href;
            }
        }
    }

    handleStatCardHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.stat-icon');

        if (icon) {
            icon.style.transform = 'scale(1.15) rotate(5deg)';
        }
    }

    handleStatCardLeave(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.stat-icon');

        if (icon) {
            icon.style.transform = '';
        }
    }

    // مدیریت کلیک روی ردیف جدول
    handleTableRowClick(e) {
        if (e.target.closest('.btn') || e.target.closest('form')) return;

        const row = e.currentTarget;
        const viewBtn = row.querySelector('a[href*="detail"]');

        if (viewBtn) {
            row.style.opacity = '0.7';
            row.style.transform = 'scale(0.98)';

            setTimeout(() => {
                window.location.href = viewBtn.href;
            }, 200);
        }
    }

    handleNavButtonHover(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');

        if (icon) {
            icon.style.transform = 'scale(1.15) rotate(5deg)';
        }
    }

    handleLogoutConfirmation(e) {
        const confirmed = confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟');
        if (!confirmed) {
            e.preventDefault();
        }
    }

    handleClaimClick(e) {
        const btn = e.currentTarget;
        btn.style.transform = 'scale(0.95)';

        setTimeout(() => {
            btn.style.transform = '';
        }, 100);
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('.table-row');
        let visibleCount = 0;

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(query);

            if (shouldShow) {
                row.style.display = '';
                visibleCount++;

                row.style.opacity = '0';
                row.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 50);
            } else {
                row.style.display = 'none';
            }
        });

        this.updateSearchResults(visibleCount, tableRows.length);
    }

    updateSearchResults(visible, total) {
        let resultsEl = document.querySelector('.search-results');

        if (!resultsEl) {
            resultsEl = document.createElement('div');
            resultsEl.className = 'search-results';
            resultsEl.style.cssText = `
                text-align: center;
                padding: 1rem;
                color: var(--text-secondary);
                font-size: 0.95rem;
                font-weight: 600;
            `;

            const searchInput = document.querySelector('#requestSearch');
            if (searchInput) {
                searchInput.parentNode.insertBefore(resultsEl, searchInput.nextSibling);
            }
        }

        if (visible !== total) {
            resultsEl.textContent = `نمایش ${PersianDashboardUtils.toPersianNumbers(visible)} از ${PersianDashboardUtils.toPersianNumbers(total)} درخواست`;
            resultsEl.style.display = 'block';
        } else {
            resultsEl.style.display = 'none';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                location.reload();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
                if (ticketsBtn) {
                    ticketsBtn.click();
                }
            }

            if (e.key === 'Escape') {
                this.closeOpenElements();
            }
        });
    }

    addTooltips() {
        const badges = document.querySelectorAll('.priority-badge, .status-badge');
        badges.forEach(badge => {
            const text = badge.textContent.trim();

            const tooltips = {
                'high': 'اولویت بالا - فوری',
                'medium': 'اولویت متوسط',
                'low': 'اولویت پایین',
                'approved': 'تأیید شده و آماده شروع کار',
                'in progress': 'در حال انجام'
            };

            const lowerText = text.toLowerCase();
            for (const key in tooltips) {
                if (lowerText.includes(key)) {
                    badge.setAttribute('title', tooltips[key]);
                    badge.style.cursor = 'help';
                    break;
                }
            }
        });
    }

    closeOpenElements() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap?.Modal?.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: ${type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
                        type === 'success' ? 'linear-gradient(135deg, #4caf50, #388e3c)' :
                        'linear-gradient(135deg, #2196f3, #1976d2)'};
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            font-weight: 600;
            animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 4000);
    }
}

// راه‌اندازی داشبورد
document.addEventListener('DOMContentLoaded', () => {
    window.serviceExpertDashboard = new ServiceExpertDashboard();
});

// افزودن انیمیشن‌ها به استایل‌ها
if (!document.querySelector('#dashboard-animations-extra')) {
    const style = document.createElement('style');
    style.id = 'dashboard-animations-extra';
    style.textContent = `
        @keyframes slideInLeft {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutLeft {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

window.PersianDashboardUtils = PersianDashboardUtils;

console.log('🔧 سیستم داشبورد فارسی متخصص سرویس آماده است');