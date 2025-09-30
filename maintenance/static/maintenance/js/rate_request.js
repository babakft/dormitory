/**
 * امتیازدهی به خدمات - سیستم فارسی پیشرفته
 */

// توابع کمکی فارسی
const PersianRatingUtils = {
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

class PersianRatingSystem {
    constructor() {
        this.selectedRating = 0;
        this.ratingTexts = {
            0: 'امتیاز خود را انتخاب کنید',
            1: '۱ ستاره - بسیار ضعیف',
            2: '۲ ستاره - ضعیف',
            3: '۳ ستاره - متوسط',
            4: '۴ ستاره - خوب',
            5: '۵ ستاره - عالی'
        };

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
        console.log('⭐ راه‌اندازی سیستم امتیازدهی فارسی');

        this.createBeautifulBackground();
        this.setupStarRating();
        this.setupCharacterCounter();
        this.setupFormValidation();
        this.animateElements();
        this.setupKeyboardShortcuts();

        console.log('✅ سیستم امتیازدهی آماده است');
    }

    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { size: 120, color: '#ff6b6b', top: '10%', left: '10%' },
            { size: 80, color: '#4834d4', top: '20%', right: '15%' },
            { size: 100, color: '#00d2d3', bottom: '20%', left: '20%' },
            { size: 90, color: '#feca57', top: '70%', right: '25%' }
        ];

        shapes.forEach((shape, index) => {
            const element = document.createElement('div');
            element.style.cssText = `
                position: fixed;
                width: ${shape.size}px;
                height: ${shape.size}px;
                background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                border-radius: 50%;
                opacity: 0.1;
                pointer-events: none;
                z-index: 0;
                animation: float${index + 1} ${12 + index * 2}s ease-in-out infinite;
            `;

            Object.assign(element.style, {
                top: shape.top || 'auto',
                bottom: shape.bottom || 'auto',
                left: shape.left || 'auto',
                right: shape.right || 'auto'
            });

            document.body.appendChild(element);
        });

        // اضافه کردن انیمیشن‌ها
        this.addBackgroundAnimations();
    }

    addBackgroundAnimations() {
        if (document.querySelector('#rating-animations')) return;

        const style = document.createElement('style');
        style.id = 'rating-animations';
        style.textContent = `
            @keyframes float1 {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -20px) rotate(120deg); }
                66% { transform: translate(-20px, 30px) rotate(240deg); }
            }
            @keyframes float2 {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                50% { transform: translate(40px, -40px) rotate(180deg); }
            }
            @keyframes float3 {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(-40px, 20px) rotate(120deg); }
                66% { transform: translate(20px, -40px) rotate(240deg); }
            }
            @keyframes float4 {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                50% { transform: translate(-30px, 30px) rotate(180deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingText = document.getElementById('ratingText');
        const radioButtons = document.querySelectorAll('input[name="student_rating"]');

        if (!stars.length || !ratingText) return;

        // کلیک روی ستاره
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                this.setRating(value, stars, ratingText, radioButtons);
            });

            // هاور
            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                this.highlightStars(value, stars);
            });
        });

        // خارج شدن از ناحیه ستاره‌ها
        const starContainer = document.querySelector('.star-rating-display');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                this.highlightStars(this.selectedRating, stars);
            });
        }

        // بررسی مقدار از پیش انتخاب شده
        radioButtons.forEach(radio => {
            if (radio.checked) {
                const value = parseInt(radio.value);
                this.setRating(value, stars, ratingText, radioButtons, false);
            }
        });
    }

    setRating(value, stars, ratingText, radioButtons, animate = true) {
        this.selectedRating = value;

        // به‌روزرسانی ستاره‌ها
        this.highlightStars(value, stars);

        // به‌روزرسانی متن
        ratingText.textContent = this.ratingTexts[value];

        // به‌روزرسانی radio button
        radioButtons.forEach(radio => {
            radio.checked = (parseInt(radio.value) === value);
        });

        // انیمیشن
        if (animate) {
            this.animateRatingSelection(value);
            this.playSuccessSound();
        }

        console.log(`⭐ امتیاز انتخاب شده: ${value}`);
    }

    highlightStars(value, stars) {
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    animateRatingSelection(value) {
        const container = document.querySelector('.star-rating-container');
        if (!container) return;

        // افکت موقت
        container.style.transform = 'scale(1.05)';
        container.style.borderColor = '#ffd700';

        setTimeout(() => {
            container.style.transform = '';
            container.style.borderColor = '';
        }, 300);
    }

    setupCharacterCounter() {
        const textarea = document.querySelector('textarea[name="student_feedback"]');
        const charCount = document.getElementById('charCount');

        if (!textarea || !charCount) return;

        const updateCounter = () => {
            const count = textarea.value.length;
            charCount.textContent = PersianRatingUtils.toPersianNumbers(count);

            // تغییر رنگ
            const parent = charCount.parentElement;
            if (count > 900) {
                parent.style.color = 'var(--error)';
            } else if (count > 800) {
                parent.style.color = 'var(--warning)';
            } else {
                parent.style.color = 'var(--text-secondary)';
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    setupFormValidation() {
        const form = document.getElementById('ratingForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showNotification('لطفاً همه فیلدهای الزامی را پر کنید', 'error');
            } else {
                this.setLoadingState(true);
            }
        });
    }

    validateForm() {
        let isValid = true;

        // بررسی امتیاز
        if (this.selectedRating === 0) {
            this.showNotification('لطفاً امتیاز خود را انتخاب کنید', 'error');
            isValid = false;
        }

        // بررسی نظرات (اختیاری - بسته به نیاز)
        const textarea = document.querySelector('textarea[name="student_feedback"]');
        if (textarea && textarea.required && !textarea.value.trim()) {
            this.showNotification('لطفاً نظر خود را بنویسید', 'error');
            isValid = false;
        }

        return isValid;
    }

    setLoadingState(loading) {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;

        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    animateElements() {
        const elements = [
            { el: document.querySelector('.rating-header'), delay: 100 },
            { el: document.querySelector('.summary-card'), delay: 250 },
            { el: document.querySelector('.rating-card'), delay: 400 },
            { el: document.querySelector('.guidelines-card'), delay: 550 }
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

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // اعداد 1-5 برای انتخاب امتیاز
            if (e.key >= '1' && e.key <= '5') {
                const value = parseInt(e.key);
                const stars = document.querySelectorAll('.star');
                const ratingText = document.getElementById('ratingText');
                const radioButtons = document.querySelectorAll('input[name="student_rating"]');

                if (stars.length && ratingText) {
                    this.setRating(value, stars, ratingText, radioButtons);
                }
            }

            // Enter برای submit (اگر فرم valid باشد)
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const form = document.getElementById('ratingForm');
                if (form && this.validateForm()) {
                    form.submit();
                }
            }
        });
    }

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
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianRatingSystem = new PersianRatingSystem();
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

window.PersianRatingUtils = PersianRatingUtils;

console.log('✅ ماژول امتیازدهی فارسی بارگذاری شد');