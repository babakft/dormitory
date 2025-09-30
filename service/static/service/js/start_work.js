/**
 * شروع کار - سیستم فارسی پیشرفته
 * Persian Start Work System with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianStartWorkUtils = {
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

class PersianStartWork {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.notesField = null;
        this.charCounter = null;
        this.isSubmitting = false;

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
        console.log('🚀 راه‌اندازی سیستم شروع کار...');

        this.cacheElements();
        this.convertNumbersToPersian();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCharacterCounter();
        this.setupKeyboardShortcuts();
        this.animateElements();
        this.addParallaxEffect();

        console.log('✅ سیستم شروع کار آماده است');
    }

    cacheElements() {
        this.form = document.getElementById('startWorkForm');
        this.submitBtn = document.getElementById('startWorkBtn');
        this.notesField = document.querySelector('#id_expert_notes');
        this.charCounter = document.querySelector('.character-counter');
    }

    convertNumbersToPersian() {
        // تبدیل اعداد در محتوا
        const numberElements = document.querySelectorAll('.character-counter, .info-value');
        numberElements.forEach(element => {
            const text = element.textContent;
            if (text && /\d/.test(text)) {
                element.textContent = PersianStartWorkUtils.toPersianNumbers(text);
            }
        });
    }

    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { size: 120, color: '#4caf50', top: '10%', left: '10%', animation: 'float1 12s' },
            { size: 80, color: '#2196f3', top: '20%', right: '15%', animation: 'float2 15s' },
            { size: 150, color: '#ff9800', bottom: '20%', left: '20%', animation: 'float3 18s' },
            { size: 100, color: '#9c27b0', top: '60%', right: '25%', animation: 'float4 14s' },
            { size: 90, color: '#00bcd4', top: '70%', left: '60%', animation: 'float5 16s' }
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
            element.style.cssText = `
                position: absolute;
                width: ${shape.size}px;
                height: ${shape.size}px;
                background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                border-radius: ${index % 2 === 0 ? '50%' : '15px'};
                opacity: 0.1;
                animation: ${shape.animation} ease-in-out infinite;
            `;

            Object.assign(element.style, {
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
        if (document.querySelector('#start-work-animations')) return;

        const style = document.createElement('style');
        style.id = 'start-work-animations';
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

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        if (this.notesField) {
            this.notesField.addEventListener('input', this.handleNotesInput.bind(this));
            this.notesField.addEventListener('blur', this.validateNotes.bind(this));
            this.notesField.addEventListener('focus', this.handleNotesFocus.bind(this));
        }

        // انیمیشن hover برای کارت‌ها
        const cards = document.querySelectorAll('.request-details-card, .start-work-form-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // انیمیشن برای info items
        const infoItems = document.querySelectorAll('.info-value');
        infoItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px)';
                item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
                item.style.boxShadow = '';
            });
        });
    }

    setupFormValidation() {
        if (!this.form || !this.submitBtn) return;

        // اعتبارسنجی زمان واقعی
        if (this.notesField) {
            this.notesField.addEventListener('input', () => {
                this.validateForm();
                this.clearFieldError(this.notesField);
            });
        }

        // اعتبارسنجی اولیه
        this.validateForm();
    }

    validateForm() {
        if (!this.notesField || !this.submitBtn) return;

        const notes = this.notesField.value.trim();
        const isValid = notes.length >= 10; // حداقل 10 کاراکتر

        this.submitBtn.disabled = !isValid;

        if (!isValid && notes.length > 0) {
            this.submitBtn.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span class="btn-text">نیاز به جزئیات بیشتر (${PersianStartWorkUtils.toPersianNumbers(notes.length)}/۱۰)</span>
            `;
            this.submitBtn.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
        } else if (isValid) {
            this.submitBtn.innerHTML = `
                <i class="fas fa-play"></i>
                <span class="btn-text">شروع کار</span>
            `;
            this.submitBtn.style.background = '';
        }

        return isValid;
    }

    validateNotes() {
        if (!this.notesField) return true;

        const notes = this.notesField.value.trim();

        this.clearFieldError(this.notesField);

        if (notes.length < 10) {
            this.showFieldError(this.notesField, 'یادداشت‌های متخصص باید حداقل ۱۰ کاراکتر باشد');
            return false;
        }

        if (notes.length > 1000) {
            this.showFieldError(this.notesField, 'یادداشت‌های متخصص نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد');
            return false;
        }

        // موفق
        this.notesField.style.borderColor = 'var(--success)';
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: var(--error);
            font-size: 0.85rem;
            font-weight: 600;
            margin-top: 0.5rem;
            padding: 0.5rem 0.8rem;
            background: rgba(244, 67, 54, 0.08);
            border-radius: var(--border-radius);
            border-right: 3px solid var(--error);
            animation: slideInRight 0.3s ease;
        `;
        errorDiv.textContent = message;

        field.parentElement.appendChild(errorDiv);
        field.style.borderColor = 'var(--error)';

        // حذف خودکار بعد از 5 ثانیه
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    clearFieldError(field) {
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }

    setupCharacterCounter() {
        if (!this.notesField) return;

        // ایجاد شمارنده اگر وجود ندارد
        if (!this.charCounter) {
            this.charCounter = document.createElement('div');
            this.charCounter.className = 'character-counter';
            this.charCounter.style.cssText = `
                text-align: left;
                margin-top: 0.75rem;
                font-size: 0.9rem;
                font-weight: 700;
                transition: color 0.3s ease;
                direction: ltr;
                unicode-bidi: embed;
            `;
            this.notesField.parentNode.appendChild(this.charCounter);
        }

        const updateCounter = () => {
            const count = this.notesField.value.length;
            this.charCounter.textContent = `${PersianStartWorkUtils.toPersianNumbers(count)} کاراکتر`;

            // تغییر رنگ بر اساس تعداد کاراکترها
            if (count < 10) {
                this.charCounter.style.color = 'var(--error)';
            } else if (count < 50) {
                this.charCounter.style.color = 'var(--warning)';
            } else if (count > 900) {
                this.charCounter.style.color = 'var(--error)';
            } else {
                this.charCounter.style.color = 'var(--success)';
            }
        };

        this.notesField.addEventListener('input', updateCounter);
        this.notesField.addEventListener('paste', () => {
            setTimeout(updateCounter, 10);
        });

        // به‌روزرسانی اولیه
        updateCounter();
    }

    handleNotesInput() {
        this.autoResizeTextarea();
        this.validateForm();
    }

    handleNotesFocus() {
        this.notesField.style.transform = 'translateY(-2px)';
        this.notesField.style.boxShadow = '0 0 0 4px rgba(25, 118, 210, 0.12), 0 4px 12px rgba(0, 0, 0, 0.1)';
    }

    autoResizeTextarea() {
        if (!this.notesField) return;

        this.notesField.style.height = 'auto';
        const newHeight = Math.max(150, this.notesField.scrollHeight);
        this.notesField.style.height = newHeight + 'px';
    }

    handleFormSubmit(e) {
        if (this.isSubmitting) {
            e.preventDefault();
            return false;
        }

        // اعتبارسنجی نهایی
        const notesValid = this.validateNotes();

        if (!notesValid) {
            e.preventDefault();
            this.showNotification('لطفاً یادداشت‌های متخصص را به درستی پر کنید', 'error');
            return false;
        }

        // تأیید شروع کار
        const confirmed = confirm(
            'آیا آماده شروع کار روی این درخواست هستید؟\n\n' +
            'این عمل درخواست را به وضعیت "در حال انجام" تغییر می‌دهد.'
        );

        if (!confirmed) {
            e.preventDefault();
            return false;
        }

        // تبدیل اعداد فارسی به انگلیسی
        if (this.notesField) {
            this.notesField.value = PersianStartWorkUtils.toEnglishNumbers(this.notesField.value);
        }

        this.isSubmitting = true;
        this.setLoadingState(true);

        // ذخیره پیام موفقیت برای صفحه بعد
        sessionStorage.setItem('workStarted', 'true');

        console.log('🚀 در حال ارسال فرم شروع کار...');
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            this.submitBtn.style.transform = 'scale(0.98)';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.style.transform = '';
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = ارسال فرم
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.form && this.validateForm()) {
                    this.form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            }

            // Escape = بازگشت
            if (e.key === 'Escape') {
                const backBtn = document.querySelector('a[href*="dashboard"]');
                if (backBtn) {
                    window.location.href = backBtn.href;
                }
            }

            // Ctrl/Cmd + B = بازگشت به داشبورد
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const backBtn = document.querySelector('a[href*="dashboard"]');
                if (backBtn) {
                    window.location.href = backBtn.href;
                }
            }
        });
    }

    animateElements() {
        const elements = [
            { el: document.querySelector('.start-work-header'), delay: 100 },
            { el: document.querySelector('.request-details-card'), delay: 250 },
            { el: document.querySelector('.start-work-form-card'), delay: 400 }
        ];

        elements.forEach(({ el, delay }) => {
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
            backdrop-filter: blur(10px);
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

    // متدهای عمومی
    reset() {
        if (this.notesField) {
            this.notesField.value = '';
            this.autoResizeTextarea();
        }
        this.setLoadingState(false);
        this.validateForm();
    }

    destroy() {
        // پاک کردن رویدادها و المان‌ها
        const shapes = document.querySelector('.geometric-shapes');
        if (shapes) {
            shapes.remove();
        }

        const animations = document.querySelector('#start-work-animations');
        if (animations) {
            animations.remove();
        }

        window.removeEventListener('mousemove', this.updateParallax);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianStartWork = new PersianStartWork();
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
    @keyframes slideInRight {
        from { transform: translateX(50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(animStyle);

// Export
window.PersianStartWorkUtils = PersianStartWorkUtils;

console.log('✅ ماژول شروع کار فارسی بارگذاری شد');