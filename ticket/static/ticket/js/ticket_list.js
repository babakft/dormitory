/**
 * سیستم تیکت فارسی - لیست تیکت‌ها
 * Persian Ticket List with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianTicketUtils = {
    toPersianNumbers: function(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        str = String(str);
        for (let i = 0; i < englishDigits.length; i++) {
            str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
        }
        return str;
    },

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

class PersianTicketList {
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
        console.log('🎫 سیستم لیست تیکت‌های فارسی در حال بارگذاری...');

        this.createBeautifulBackground();
        this.convertNumbersToPersian();
        this.setupEventListeners();
        this.setupSearch();
        this.setupFilters();
        this.setupAnimations();
        this.setupStatCards();
        this.setupKeyboardShortcuts();

        console.log('✅ سیستم لیست تیکت‌ها آماده است');
    }

    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { type: 'circle', size: 120, color: '#ff6b6b', top: '10%', left: '10%', animation: 'float1 12s' },
            { type: 'square', size: 80, color: '#4834d4', top: '20%', right: '15%', animation: 'float2 15s' },
            { type: 'ellipse', size: '150px 60px', color: '#00d2d3', bottom: '20%', left: '20%', animation: 'float3 18s' },
            { type: 'triangle', size: 100, color: '#ff9ff3', top: '60%', right: '25%', animation: 'float4 14s' },
            { type: 'square', size: 90, color: '#feca57', top: '70%', left: '60%', animation: 'float5 16s' }
        ];

        const container = document.createElement('div');
        container.className = 'geometric-shapes';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;

        shapes.forEach((shape, index) => {
            const element = document.createElement('div');
            element.className = `shape shape-${index + 1}`;

            let shapeStyle = `
                position: absolute;
                opacity: 0.1;
                animation: ${shape.animation} ease-in-out infinite;
            `;

            if (shape.type === 'circle') {
                shapeStyle += `
                    width: ${shape.size}px;
                    height: ${shape.size}px;
                    background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                    border-radius: 50%;
                `;
            } else if (shape.type === 'square') {
                shapeStyle += `
                    width: ${shape.size}px;
                    height: ${shape.size}px;
                    background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                    border-radius: 15px;
                `;
            } else if (shape.type === 'ellipse') {
                shapeStyle += `
                    width: 150px;
                    height: 60px;
                    background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                    border-radius: 50px;
                `;
            } else if (shape.type === 'triangle') {
                shapeStyle += `
                    width: ${shape.size}px;
                    height: ${shape.size}px;
                    background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                `;
            }

            Object.assign(element.style, {
                cssText: shapeStyle,
                top: shape.top || 'auto',
                bottom: shape.bottom || 'auto',
                left: shape.left || 'auto',
                right: shape.right || 'auto'
            });

            container.appendChild(element);
        });

        document.body.appendChild(container);

        // اضافه کردن انیمیشن‌ها
        this.addBackgroundAnimations();
    }

    addBackgroundAnimations() {
        if (document.querySelector('#ticket-background-animations')) return;

        const style = document.createElement('style');
        style.id = 'ticket-background-animations';
        style.textContent = `
            @keyframes float1 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                33% { transform: translate(30px, -20px) rotate(120deg) scale(1.1); }
                66% { transform: translate(-20px, 30px) rotate(240deg) scale(0.9); }
            }

            @keyframes float2 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                25% { transform: translate(-25px, 15px) rotate(90deg) scale(1.2); }
                50% { transform: translate(35px, -25px) rotate(180deg) scale(0.8); }
                75% { transform: translate(-15px, -35px) rotate(270deg) scale(1.1); }
            }

            @keyframes float3 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                50% { transform: translate(40px, -40px) rotate(180deg) scale(1.3); }
            }

            @keyframes float4 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                20% { transform: translate(20px, 20px) rotate(72deg) scale(1.1); }
                40% { transform: translate(-30px, 10px) rotate(144deg) scale(0.9); }
                60% { transform: translate(10px, -30px) rotate(216deg) scale(1.2); }
                80% { transform: translate(-20px, -20px) rotate(288deg) scale(0.8); }
            }

            @keyframes float5 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                33% { transform: translate(-40px, 20px) rotate(120deg) scale(1.15); }
                66% { transform: translate(20px, -40px) rotate(240deg) scale(0.85); }
            }

            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    convertNumbersToPersian() {
        // تبدیل اعداد در کارت‌های آمار
        document.querySelectorAll('.stat-number').forEach(element => {
            const number = element.textContent.trim();
            element.textContent = PersianTicketUtils.toPersianNumbers(number);
        });

        // تبدیل اعداد در جدول
        document.querySelectorAll('.table-row').forEach(row => {
            const idElement = row.querySelector('.ticket-id strong');
            if (idElement) {
                idElement.textContent = PersianTicketUtils.toPersianNumbers(idElement.textContent);
            }

            const daysElement = row.querySelector('.days-ago');
            if (daysElement) {
                daysElement.textContent = PersianTicketUtils.toPersianNumbers(daysElement.textContent);
            }
        });
    }

    setupEventListeners() {
        // کلیک روی ردیف‌های جدول
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', (e) => this.handleRowClick(e, row));
            row.addEventListener('mouseenter', () => this.handleRowHover(row));
            row.addEventListener('mouseleave', () => this.handleRowLeave(row));
        });

        // کلیک روی کارت‌های آمار
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleStatCardClick(e, card));
        });

        // دکمه رفرش
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPage());
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('ticketSearch');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterTickets(e.target.value.toLowerCase());
            }, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.filterTickets('');
            }
        });
    }

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
                row.style.display = '';
                row.classList.remove('hidden');

                // انیمیشن ظاهر شدن
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 50);

                visibleCount++;
            } else {
                row.style.opacity = '0';
                row.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    row.style.display = 'none';
                    row.classList.add('hidden');
                }, 300);
            }
        });

        this.updateShowingCount(visibleCount);
    }

    filterByStatus(status) {
        const rows = document.querySelectorAll('.table-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const rowStatus = row.dataset.status;
            const isVisible = !status || rowStatus === status;

            if (isVisible) {
                row.style.display = '';
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.style.display = 'none';
                row.classList.add('hidden');
            }
        });

        this.updateShowingCount(visibleCount);
    }

    updateShowingCount(visibleCount) {
        const totalCount = document.querySelectorAll('.table-row').length;
        const countElement = document.querySelector('.table-info');

        if (countElement) {
            countElement.innerHTML = `
                نمایش ${PersianTicketUtils.toPersianNumbers(visibleCount)} از
                ${PersianTicketUtils.toPersianNumbers(totalCount)} تیکت
            `;
        }
    }

    setupAnimations() {
        // انیمیشن کارت‌های آمار
        this.animateStatCards();

        // انیمیشن اسکرول
        this.setupScrollAnimations();

        // انیمیشن هدر
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
        const header = document.querySelector('.ticket-header');
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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.style.opacity = '1';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.tickets-section, .navigation-section').forEach(section => {
            section.style.opacity = '0';
            observer.observe(section);
        });
    }

    setupStatCards() {
        document.querySelectorAll('.stat-card').forEach(card => {
            const statNumber = card.querySelector('.stat-number');
            if (statNumber) {
                const targetValue = parseInt(PersianTicketUtils.toEnglishNumbers(statNumber.textContent));
                if (!isNaN(targetValue)) {
                    this.animateCounter(statNumber, targetValue);
                }
            }
        });
    }

    animateCounter(element, target, duration = 2000) {
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.textContent = PersianTicketUtils.toPersianNumbers(current);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = PersianTicketUtils.toPersianNumbers(target);

                // افکت پایان
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N = تیکت جدید
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const newTicketBtn = document.querySelector('a[href*="ticket:create"]');
                if (newTicketBtn) newTicketBtn.click();
            }

            // Ctrl/Cmd + F = فوکوس جستجو
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('ticketSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape = پاک کردن فیلترها
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

        this.showNotification('فیلترها پاک شدند', 'info');
    }

    handleRowClick(event, row) {
        if (event.target.closest('button') || event.target.closest('a')) {
            return;
        }

        const ticketId = row.dataset.ticketId;
        if (ticketId) {
            // افکت انتقال
            row.style.opacity = '0.7';
            row.style.transform = 'scale(0.98)';

            setTimeout(() => {
                window.location.href = `/ticket/${ticketId}/`;
            }, 200);
        }
    }

    handleRowHover(row) {
        row.style.transform = 'scale(1.02)';
        row.style.zIndex = '10';
    }

    handleRowLeave(row) {
        row.style.transform = 'scale(1)';
        row.style.zIndex = '1';
    }

    handleStatCardClick(event, card) {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        const statType = card.dataset.stat;
        this.filterByStatType(statType);
    }

    filterByStatType(statType) {
        const statusFilter = document.getElementById('statusFilter');

        const statusMap = {
            'pending': 'pending',
            'answered': 'answered',
            'closed': 'closed',
            'total': ''
        };

        const status = statusMap[statType] || '';

        if (statusFilter) {
            statusFilter.value = status;
            this.filterByStatus(status);
        }
    }

    refreshPage() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
            }
        }

        this.showNotification('در حال به‌روزرسانی...', 'info');

        setTimeout(() => {
            window.location.reload();
        }, 500);
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
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianTicketList = new PersianTicketList();
});

// انیمیشن‌های اضافی
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideInLeft {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animStyle);

window.PersianTicketUtils = PersianTicketUtils;