/**
 * داشبورد دانشجو - سیستم مدیریت خوابگاه
 * Persian Student Dashboard with Beautiful Animations
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
    },

    // فرمت کردن تاریخ به فارسی
    formatPersianDate: function(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('fa-IR', options);
    },

    // محاسبه روزهای گذشته
    getDaysAgo: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return this.toPersianNumbers(diffDays);
    }
};

class PersianStudentDashboard {
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
        console.log('🏛️ داشبورد دانشجو در حال بارگذاری...');

        this.convertNumbersToPersian();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupStatCards();
        this.setupTableInteractions();
        this.setupNavigationButtons();
        this.setupAutoRefresh();
        this.setupKeyboardShortcuts();
        this.addTooltips();

        console.log('✅ داشبورد دانشجو آماده است');
    }

    // تبدیل تمام اعداد به فارسی
    convertNumbersToPersian() {
        // تبدیل اعداد در کارت‌های آمار
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(element => {
            const number = element.textContent.trim();
            element.textContent = PersianDashboardUtils.toPersianNumbers(number);
            element.classList.add('persian-number');
        });

        // تبدیل تاریخ‌ها
        const dateElements = document.querySelectorAll('.date-info small');
        dateElements.forEach(element => {
            const text = element.textContent;
            element.textContent = PersianDashboardUtils.toPersianNumbers(text);
        });
    }

    // راه‌اندازی رویدادها
    setupEventListeners() {
        // کلیک روی کارت‌های آمار
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', this.handleStatCardClick.bind(this));
            card.addEventListener('mouseenter', this.handleStatCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleStatCardLeave.bind(this));
        });

        // کلیک روی ردیف‌های جدول
        const tableRows = document.querySelectorAll('.table-row');
        tableRows.forEach(row => {
            row.addEventListener('click', this.handleTableRowClick.bind(this));
        });

        // دکمه‌های ناوبری
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('mouseenter', this.handleNavButtonHover.bind(this));
        });

        // فرم خروج
        const logoutForm = document.querySelector('.logout-form');
        if (logoutForm) {
            logoutForm.addEventListener('submit', this.handleLogoutConfirmation.bind(this));
        }

        // جستجو (در صورت وجود)
        const searchInput = document.querySelector('#requestSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }
    }

    // راه‌اندازی انیمیشن‌ها
    setupAnimations() {
        // انیمیشن ورود کارت‌های آمار
        this.animateStatCards();

        // انیمیشن اسکرول
        this.setupScrollAnimations();

        // انیمیشن هدر
        this.animateHeader();
    }

    // انیمیشن کارت‌های آمار
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

    // انیمیشن هدر
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

    // راه‌اندازی انیمیشن اسکرول
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

        const sections = document.querySelectorAll('.requests-section, .navigation-section');
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

    // انیمیشن شمارنده
    animateCounter(element, target, duration = 2000) {
        const startTime = Date.now();
        const startValue = 0;

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const current = Math.floor(easeOut * target);
            element.textContent = PersianDashboardUtils.toPersianNumbers(current);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = PersianDashboardUtils.toPersianNumbers(target);

                // افکت پایان شمارش
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
                // افکت کلیک
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

        // افکت کلیک
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // هدایت بر اساس نوع کارت
        if (card.classList.contains('stat-card--primary')) {
            this.showNotification('نمایش همه درخواست‌ها', 'info');
        } else if (card.classList.contains('stat-card--warning')) {
            this.showNotification('نمایش درخواست‌های در انتظار', 'info');
        } else if (card.classList.contains('stat-card--success')) {
            this.showNotification('نمایش درخواست‌های تکمیل شده', 'info');
        } else if (card.classList.contains('stat-card--info')) {
            const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
            if (ticketsBtn) {
                window.location.href = ticketsBtn.href;
            }
        }
    }

    // مدیریت هاور روی کارت آمار
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
        // عدم فعال‌سازی اگر روی دکمه کلیک شده
        if (e.target.closest('.btn')) return;

        const row = e.currentTarget;
        const viewBtn = row.querySelector('a[href*="detail"]');

        if (viewBtn) {
            // افکت انتقال
            row.style.opacity = '0.7';
            row.style.transform = 'scale(0.98)';

            setTimeout(() => {
                window.location.href = viewBtn.href;
            }, 200);
        }
    }

    // مدیریت هاور روی دکمه ناوبری
    handleNavButtonHover(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');

        if (icon) {
            icon.style.transform = 'scale(1.15) rotate(5deg)';
        }
    }

    // مدیریت تأیید خروج
    handleLogoutConfirmation(e) {
        const confirmed = confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟');
        if (!confirmed) {
            e.preventDefault();
        }
    }

    // مدیریت جستجو
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

                // انیمیشن ظاهر شدن
                row.style.opacity = '0';
                row.style.transform = 'translateX(20px)';

                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, 50);
            } else {
                row.style.display = 'none';
            }
        });

        this.updateSearchResults(visibleCount, tableRows.length);
    }

    // به‌روزرسانی نتایج جستجو
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

    // راه‌اندازی به‌روزرسانی خودکار
    setupAutoRefresh() {
        let lastActivity = Date.now();

        // ردیابی فعالیت کاربر
        document.addEventListener('mousemove', () => {
            lastActivity = Date.now();
        });

        document.addEventListener('keypress', () => {
            lastActivity = Date.now();
        });

        // به‌روزرسانی هر 5 دقیقه
        setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;

            // به‌روزرسانی فقط اگر کاربر در 10 دقیقه گذشته فعال بوده
            if (timeSinceActivity < 600000) {
                this.refreshStatusCounts();
            }
        }, 300000); // 5 دقیقه
    }

    // به‌روزرسانی شمارنده‌های وضعیت
    async refreshStatusCounts() {
        try {
            // در اینجا می‌توانید درخواست AJAX برای دریافت داده‌های جدید بفرستید
            console.log('🔄 به‌روزرسانی خودکار داده‌ها...');

            // مثال (باید با endpoint واقعی جایگزین شود):
            // const response = await fetch('/student/dashboard/status-counts/', {
            //     headers: {
            //         'X-Requested-With': 'XMLHttpRequest',
            //         'X-CSRFToken': this.getCSRFToken()
            //     }
            // });
            //
            // if (response.ok) {
            //     const data = await response.json();
            //     this.updateStatusCounts(data);
            // }

        } catch (error) {
            console.log('❌ خطا در به‌روزرسانی:', error);
        }
    }

    // راه‌اندازی میانبرهای صفحه‌کلید
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N = درخواست جدید
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newRequestBtn = document.querySelector('a[href*="maintenance:create"]');
                if (newRequestBtn) {
                    newRequestBtn.click();
                }
            }

            // Ctrl/Cmd + T = تیکت‌های من
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const ticketsBtn = document.querySelector('a[href*="ticket:list"]');
                if (ticketsBtn) {
                    ticketsBtn.click();
                }
            }

            // Escape = بستن عناصر باز
            if (e.key === 'Escape') {
                this.closeOpenElements();
            }
        });
    }

    // اضافه کردن راهنماها
    addTooltips() {
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            const text = badge.textContent.trim().toLowerCase();

            const tooltips = {
                'pending': 'در انتظار تأیید مدیر',
                'approved': 'تأیید شده و اختصاص داده شده',
                'in progress': 'در حال انجام توسط تیم نگهداری',
                'completed': 'با موفقیت تکمیل شده',
                'rejected': 'رد شده - جزئیات را بررسی کنید',
                'high': 'اولویت بالا - به سرعت بررسی می‌شود',
                'medium': 'اولویت متوسط - زمان پردازش عادی',
                'low': 'اولویت پایین - ممکن است زمان بیشتری ببرد'
            };

            if (tooltips[text]) {
                badge.setAttribute('title', tooltips[text]);
                badge.style.cursor = 'help';
            }
        });
    }

    // بستن عناصر باز
    closeOpenElements() {
        // بستن مودال‌های Bootstrap
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }

    // دریافت توکن CSRF
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    // تابع debounce
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

    // نمایش اعلان
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
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

        // حذف خودکار بعد از 4 ثانیه
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
    window.persianDashboard = new PersianStudentDashboard();
});

// افزودن انیمیشن‌ها به استایل‌ها
if (!document.querySelector('#dashboard-animations')) {
    const style = document.createElement('style');
    style.id = 'dashboard-animations';
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

// صادرات برای استفاده در سایر ماژول‌ها
window.PersianDashboardUtils = PersianDashboardUtils;

console.log('🏛️ سیستم داشبورد فارسی آماده است');