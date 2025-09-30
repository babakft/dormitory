/**
 * کارهای تکمیل شده - سیستم فارسی پیشرفته
 * Persian Completed Tasks with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianCompletedTasksUtils = {
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
        const persianDigits = '۰۱۲۳۴۵۶۷۸ۉ';
        const englishDigits = '0123456789';
        str = String(str);
        for (let i = 0; i < persianDigits.length; i++) {
            str = str.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        }
        return str;
    }
};

// کلاس اصلی مدیریت کارهای تکمیل شده
class PersianCompletedTasksManager {
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
        console.log('📋 راه‌اندازی سیستم کارهای تکمیل شده...');

        this.createBeautifulBackground();
        this.convertNumbersToPersian();
        this.setupEventListeners();
        this.setupSearchFunctionality();
        this.setupModalSystem();
        this.setupAnimations();
        this.setupKeyboardShortcuts();
        this.addParallaxEffect();

        console.log('✅ سیستم کارهای تکمیل شده آماده است');
    }

    /**
     * ایجاد بک‌گراند زیبا
     */
    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { type: 'circle', size: 120, color: '#4caf50', top: '10%', left: '10%', animation: 'float1 12s' },
            { type: 'square', size: 80, color: '#2196f3', top: '20%', right: '15%', animation: 'float2 15s' },
            { type: 'triangle', size: 100, color: '#ff9800', bottom: '20%', left: '20%', animation: 'float3 18s' },
            { type: 'circle', size: 90, color: '#9c27b0', top: '60%', right: '25%', animation: 'float4 14s' },
            { type: 'square', size: 70, color: '#00bcd4', top: '70%', left: '60%', animation: 'float5 16s' }
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
        this.addBackgroundAnimations();
    }

    addBackgroundAnimations() {
        if (document.querySelector('#completed-tasks-animations')) return;

        const style = document.createElement('style');
        style.id = 'completed-tasks-animations';
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
        `;
        document.head.appendChild(style);
    }

    /**
     * تبدیل اعداد به فارسی
     */
    convertNumbersToPersian() {
        // تبدیل شماره‌ها
        document.querySelectorAll('.persian-number').forEach(element => {
            const text = element.textContent;
            element.textContent = PersianCompletedTasksUtils.toPersianNumbers(text);
        });

        // آمار کارت‌ها
        document.querySelectorAll('.stat-badge, .card-stats').forEach(element => {
            const text = element.textContent;
            element.textContent = PersianCompletedTasksUtils.toPersianNumbers(text);
        });

        // امتیازها
        document.querySelectorAll('.rating-value, .rating-text').forEach(element => {
            const text = element.textContent;
            element.textContent = PersianCompletedTasksUtils.toPersianNumbers(text);
        });
    }

    /**
     * تنظیم رویدادها
     */
    setupEventListeners() {
        // کلیک روی ردیف‌های جدول
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('click', (e) => this.handleTableRowClick(e, row));
            row.addEventListener('mouseenter', () => this.handleRowHover(row, true));
            row.addEventListener('mouseleave', () => this.handleRowHover(row, false));
        });

        // دکمه‌های جزئیات
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDetailsClick(e, btn));
        });

        // دکمه‌های بستن مودال
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModalClose(e, btn));
        });

        // کلیک روی پس‌زمینه مودال
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => this.handleModalBackgroundClick(e, modal));
        });

        // دکمه بازگشت
        const backBtn = document.querySelector('.btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => this.handleBackClick(e, backBtn));
        }
    }

    /**
     * راه‌اندازی جستجو
     */
    setupSearchFunctionality() {
        const searchInput = document.getElementById('taskSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', this.debounce((e) => {
            this.performSearch(e.target.value);
        }, 300));

        // افکت focus
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.transform = 'scale(1.02)';
            searchInput.parentElement.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.15)';
        });

        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.transform = '';
            searchInput.parentElement.style.boxShadow = '';
        });
    }

    /**
     * انجام جستجو
     */
    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const tableRows = document.querySelectorAll('.task-row');
        let visibleCount = 0;

        tableRows.forEach(row => {
            const searchText = row.textContent.toLowerCase();
            const shouldShow = searchTerm === '' || searchText.includes(searchTerm);

            if (shouldShow) {
                row.style.display = '';
                visibleCount++;

                // انیمیشن ظاهر شدن
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

    /**
     * به‌روزرسانی نتایج جستجو
     */
    updateSearchResults(visible, total) {
        const resultsCount = document.getElementById('resultsCount');
        const resultsText = document.querySelector('.results-text');

        if (resultsCount) {
            resultsCount.textContent = PersianCompletedTasksUtils.toPersianNumbers(visible);
        }

        if (resultsText && visible !== total) {
            resultsText.innerHTML = `<span id="resultsCount" class="persian-number">${PersianCompletedTasksUtils.toPersianNumbers(visible)}</span> از ${PersianCompletedTasksUtils.toPersianNumbers(total)} کار`;
        } else if (resultsText) {
            resultsText.innerHTML = `<span id="resultsCount" class="persian-number">${PersianCompletedTasksUtils.toPersianNumbers(visible)}</span> کار پیدا شد`;
        }
    }

    /**
     * سیستم مودال
     */
    setupModalSystem() {
        // مخفی کردن همه مودال‌ها در ابتدا
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * مدیریت کلیک روی ردیف جدول
     */
    handleTableRowClick(event, row) {
        // عدم تداخل با دکمه‌ها
        if (event.target.closest('.btn') || event.target.closest('button')) {
            return;
        }

        const taskId = row.getAttribute('data-task-id');
        if (taskId) {
            this.showTaskModal(taskId);
        }
    }

    /**
     * مدیریت hover روی ردیف
     */
    handleRowHover(row, isEntering) {
        const avatar = row.querySelector('.student-avatar');
        const priorityBadge = row.querySelector('.priority-badge');

        if (isEntering) {
            if (avatar) avatar.style.transform = 'scale(1.1) rotate(5deg)';
            if (priorityBadge) priorityBadge.style.transform = 'scale(1.05)';
        } else {
            if (avatar) avatar.style.transform = '';
            if (priorityBadge) priorityBadge.style.transform = '';
        }
    }

    /**
     * مدیریت کلیک دکمه جزئیات
     */
    handleDetailsClick(event, btn) {
        event.stopPropagation();

        const taskId = btn.getAttribute('data-task-id');
        if (taskId) {
            // انیمیشن دکمه
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
                this.showTaskModal(taskId);
            }, 150);
        }
    }

    /**
     * نمایش مودال کار
     */
    showTaskModal(taskId) {
        const modal = document.getElementById(`taskModal${taskId}`);
        if (modal) {
            // بستن سایر مودال‌ها
            this.closeAllModals();

            // نمایش مودال
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            // تمرکز روی دکمه بستن
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }

            // صدای موفقیت
            this.playSuccessSound();

            console.log(`📋 مودال کار ${taskId} باز شد`);
        }
    }

    /**
     * مدیریت بستن مودال
     */
    handleModalClose(event, btn) {
        event.preventDefault();
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        if (modal) {
            this.hideModal(modal);
        }
    }

    /**
     * مدیریت کلیک پس‌زمینه مودال
     */
    handleModalBackgroundClick(event, modal) {
        if (event.target === modal) {
            this.hideModal(modal);
        }
    }

    /**
     * مخفی کردن مودال
     */
    hideModal(modal) {
        modal.classList.remove('show');

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);

        console.log('📋 مودال بسته شد');
    }

    /**
     * بستن همه مودال‌ها
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay.show').forEach(modal => {
            this.hideModal(modal);
        });
    }

    /**
     * مدیریت کلیک دکمه بازگشت
     */
    handleBackClick(event, btn) {
        // انیمیشن دکمه
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }

    /**
     * راه‌اندازی انیمیشن‌ها
     */
    setupAnimations() {
        // انیمیشن کارت‌ها
        this.animateCards();

        // انیمیشن جدول
        this.animateTable();

        // انیمیشن اسکرول
        this.setupScrollAnimations();
    }

    animateCards() {
        const cards = [
            { el: document.querySelector('.page-header'), delay: 100 },
            { el: document.querySelector('.search-section'), delay: 250 },
            { el: document.querySelector('.content-section'), delay: 400 }
        ];

        cards.forEach(({ el, delay }) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    }

    animateTable() {
        const rows = document.querySelectorAll('.task-row');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(20px)';

            setTimeout(() => {
                row.style.transition = 'all 0.4s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 600 + (index * 50));
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.content-card, .search-card').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * میانبرهای صفحه‌کلید
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape = بستن مودال‌ها
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + F = تمرکز روی جستجو
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('taskSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Ctrl/Cmd + B = بازگشت
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const backBtn = document.querySelector('.btn-back');
                if (backBtn) {
                    backBtn.click();
                }
            }

            // Enter = باز کردن اولین نتیجه
            if (e.key === 'Enter' && document.activeElement.id === 'taskSearch') {
                const firstVisibleRow = document.querySelector('.task-row[style*="display: none"] ~ .task-row, .task-row:not([style*="display: none"])');
                if (firstVisibleRow) {
                    const taskId = firstVisibleRow.getAttribute('data-task-id');
                    if (taskId) {
                        this.showTaskModal(taskId);
                    }
                }
            }
        });
    }

    /**
     * افکت parallax
     */
    addParallaxEffect() {
        let ticking = false;

        const updateParallax = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const mouseX = e.clientX / window.innerWidth;
                    const mouseY = e.clientY / window.innerHeight;

                    const shapes = document.querySelectorAll('.shape');
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

    /**
     * پخش صدای موفقیت
     */
    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('🔇 خطا در پخش صدا:', error);
        }
    }

    /**
     * نمایش اعلان
     */
    showNotification(message, type = 'info') {
        const colors = {
            'success': 'linear-gradient(135deg, #4caf50, #388e3c)',
            'error': 'linear-gradient(135deg, #f44336, #d32f2f)',
            'warning': 'linear-gradient(135deg, #ff9800, #f57c00)',
            'info': 'linear-gradient(135deg, #2196f3, #1976d2)'
        };

        const icons = {
            'success': '✓',
            'error': '✕',
            'warning': '!',
            'info': 'ℹ'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            font-weight: 700;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        notification.innerHTML = `
            <span style="font-size: 1.3rem;">${icons[type]}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    /**
     * Debounce function
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
     * تنظیم مجدد سیستم
     */
    reset() {
        this.closeAllModals();

        const searchInput = document.getElementById('taskSearch');
        if (searchInput) {
            searchInput.value = '';
            this.performSearch('');
        }

        console.log('📋 سیستم بازنشانی شد');
    }
}

// راه‌اندازی سیستم
document.addEventListener('DOMContentLoaded', () => {
    window.persianCompletedTasksManager = new PersianCompletedTasksManager();
});

// انیمیشن‌های اضافی
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animStyle);

// Export
window.PersianCompletedTasksUtils = PersianCompletedTasksUtils;

console.log('✅ ماژول کارهای تکمیل شده بارگذاری شد');