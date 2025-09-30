/**
 * صفحه جزئیات درخواست تعمیرات - سیستم فارسی
 * Persian Request Detail with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianRequestUtils = {
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

// کلاس اصلی
class PersianRequestDetail {
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
        console.log('🔧 راه‌اندازی صفحه جزئیات درخواست...');

        this.createBeautifulBackground();
        this.convertNumbersToPersian();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupImageGallery();
        this.setupKeyboardShortcuts();
        this.addParallaxEffect();

        console.log('✅ صفحه جزئیات درخواست آماده است');
    }

    /**
     * ایجاد بک‌گراند زیبا با اشکال هندسی
     */
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
        if (document.querySelector('#request-background-animations')) return;

        const style = document.createElement('style');
        style.id = 'request-background-animations';
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
        // شماره درخواست
        const requestId = document.querySelector('.request-id');
        if (requestId) {
            const text = requestId.textContent;
            requestId.textContent = PersianRequestUtils.toPersianNumbers(text);
        }

        // تاریخ‌ها
        document.querySelectorAll('.time-ago, .timeline-date').forEach(element => {
            const text = element.textContent;
            element.textContent = PersianRequestUtils.toPersianNumbers(text);
        });

        // امتیاز
        const ratingText = document.querySelector('.rating-text');
        if (ratingText) {
            const text = ratingText.textContent;
            ratingText.textContent = PersianRequestUtils.toPersianNumbers(text);
        }
    }

    /**
     * تنظیم رویدادها
     */
    setupEventListeners() {
        // کلیک روی تصاویر
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryImages.forEach(image => {
            image.addEventListener('click', () => this.openImageModal(image));
        });

        // دکمه‌ها
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e, btn));
        });
    }

    /**
     * راه‌اندازی انیمیشن‌ها
     */
    setupAnimations() {
        // انیمیشن کارت‌ها
        this.animateCards();

        // انیمیشن timeline
        this.animateTimeline();

        // انیمیشن اسکرول
        this.setupScrollAnimations();
    }

    animateCards() {
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });
    }

    animateTimeline() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 300 + (index * 150));
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

        document.querySelectorAll('.detail-card, .sidebar-content > *').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * تنظیم گالری تصاویر
     */
    setupImageGallery() {
        // افزودن افکت hover
        const imageItems = document.querySelectorAll('.image-item');
        imageItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * باز کردن مودال تصویر
     */
    openImageModal(image) {
        // می‌توانید از Bootstrap Modal استفاده کنید
        console.log('Opening image:', image.src);
        // یا یک lightbox سفارشی
    }

    /**
     * مدیریت کلیک دکمه
     */
    handleButtonClick(event, button) {
        // افکت کلیک
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * میانبرهای صفحه‌کلید
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // B = بازگشت
            if (e.key === 'b' || e.key === 'B') {
                const backBtn = document.querySelector('.btn-outline-primary');
                if (backBtn) backBtn.click();
            }

            // R = امتیازدهی
            if (e.key === 'r' || e.key === 'R') {
                const rateBtn = document.querySelector('a[href*="rate"]');
                if (rateBtn) rateBtn.click();
            }

            // Escape = بازگشت
            if (e.key === 'Escape') {
                history.back();
            }
        });
    }

    /**
     * افکت Parallax
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
     * نمایش اعلان
     */
    showNotification(message, type = 'info') {
        const colors = {
            'success': 'linear-gradient(135deg, #4caf50, #388e3c)',
            'error': 'linear-gradient(135deg, #f44336, #d32f2f)',
            'warning': 'linear-gradient(135deg, #ff9800, #f57c00)',
            'info': 'linear-gradient(135deg, #2196f3, #1976d2)'
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
            animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
    window.persianRequestDetail = new PersianRequestDetail();
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

// Export
window.PersianRequestUtils = PersianRequestUtils;

console.log('✅ ماژول جزئیات درخواست بارگذاری شد');