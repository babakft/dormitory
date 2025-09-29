/**
 * سیستم تیکت فارسی - ایجاد تیکت
 */

class PersianTicketCreate {
    constructor() {
        this.form = null;
        this.titleInput = null;
        this.descriptionInput = null;
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
        this.cacheElements();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCharacterCounters();
        this.setupKeyboardShortcuts();
        this.animateElements();

        console.log('🎫 سیستم تیکت فارسی آماده است');
    }

    cacheElements() {
        this.form = document.getElementById('ticketForm');
        this.titleInput = document.querySelector('#id_title');
        this.descriptionInput = document.querySelector('#id_description');
        this.submitBtn = document.querySelector('.btn-primary');
    }

    createBeautifulBackground() {
        // اشکال هندسی
        const shapes = [
            { type: 'circle', size: 120, color: '#ff6b6b', top: '10%', left: '10%', delay: 0 },
            { type: 'square', size: 80, color: '#4834d4', top: '20%', right: '15%', delay: 2 },
            { type: 'circle', size: 150, color: '#00d2d3', bottom: '20%', left: '20%', delay: 4 }
        ];

        shapes.forEach(shape => {
            const element = document.createElement('div');
            element.style.cssText = `
                position: fixed;
                width: ${shape.size}px;
                height: ${shape.size}px;
                background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                border-radius: ${shape.type === 'circle' ? '50%' : '20%'};
                opacity: 0.1;
                pointer-events: none;
                z-index: 0;
                animation: floatShape 12s ease-in-out infinite;
                animation-delay: ${shape.delay}s;
            `;

            Object.assign(element.style, {
                top: shape.top || 'auto',
                bottom: shape.bottom || 'auto',
                left: shape.left || 'auto',
                right: shape.right || 'auto'
            });

            document.body.appendChild(element);
        });

        // انیمیشن
        if (!document.querySelector('#background-animations')) {
            const style = document.createElement('style');
            style.id = 'background-animations';
            style.textContent = `
                @keyframes floatShape {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -20px) rotate(120deg); }
                    66% { transform: translate(-20px, 30px) rotate(240deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        if (this.titleInput) {
            this.titleInput.addEventListener('input', () => {
                this.validateField(this.titleInput, this.validateTitle.bind(this));
            });
            this.titleInput.addEventListener('blur', () => {
                this.validateField(this.titleInput, this.validateTitle.bind(this));
            });
        }

        if (this.descriptionInput) {
            this.descriptionInput.addEventListener('input', () => {
                this.validateField(this.descriptionInput, this.validateDescription.bind(this));
            });
            this.descriptionInput.addEventListener('blur', () => {
                this.validateField(this.descriptionInput, this.validateDescription.bind(this));
            });
        }
    }

    setupFormValidation() {
        // تبدیل اعداد فارسی به انگلیسی قبل از submit
        if (this.form) {
            this.form.addEventListener('submit', () => {
                const inputs = this.form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.value = this.toEnglishNumbers(input.value);
                });
            });
        }
    }

    validateField(field, validator) {
        this.clearFieldError(field);
        const isValid = validator();

        if (!isValid) {
            field.style.borderColor = 'var(--error)';
        } else {
            field.style.borderColor = 'var(--success)';
        }

        return isValid;
    }

    validateTitle() {
        if (!this.titleInput) return true;

        const value = this.titleInput.value.trim();

        if (value.length < 5) {
            this.showFieldError(this.titleInput, 'عنوان باید حداقل ۵ کاراکتر باشد');
            return false;
        }

        if (value.length > 200) {
            this.showFieldError(this.titleInput, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد');
            return false;
        }

        return true;
    }

    validateDescription() {
        if (!this.descriptionInput) return true;

        const value = this.descriptionInput.value.trim();

        if (value.length < 10) {
            this.showFieldError(this.descriptionInput, 'توضیحات باید حداقل ۱۰ کاراکتر باشد');
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        field.parentElement.appendChild(errorDiv);

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

    setupCharacterCounters() {
        [this.titleInput, this.descriptionInput].forEach(field => {
            if (!field) return;

            const maxLength = field.maxLength || 1000;
            const counter = document.createElement('div');
            counter.className = 'character-counter';

            const updateCounter = () => {
                const current = field.value.length;
                counter.textContent = `${this.toPersianNumbers(current)} / ${this.toPersianNumbers(maxLength)}`;

                if (current > maxLength * 0.9) {
                    counter.style.color = 'var(--warning)';
                } else {
                    counter.style.color = 'var(--text-secondary)';
                }
            };

            field.addEventListener('input', updateCounter);
            updateCounter();

            field.parentElement.appendChild(counter);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.form) {
                    this.form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape = Clear
            if (e.key === 'Escape') {
                if (confirm('آیا می‌خواهید فرم را پاک کنید؟')) {
                    this.form?.reset();
                }
            }
        });
    }

    handleFormSubmit(e) {
        if (this.isSubmitting) {
            e.preventDefault();
            return false;
        }

        // اعتبارسنجی
        const titleValid = this.validateField(this.titleInput, this.validateTitle.bind(this));
        const descValid = this.validateField(this.descriptionInput, this.validateDescription.bind(this));

        if (!titleValid || !descValid) {
            e.preventDefault();
            this.showNotification('لطفاً خطاهای فرم را برطرف کنید', 'error');
            return false;
        }

        this.isSubmitting = true;
        this.setLoadingState(true);
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال تیکت';
        }
    }

    animateElements() {
        const elements = document.querySelectorAll('.form-group');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';

            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });
    }

    toPersianNumbers(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        str = String(str);
        for (let i = 0; i < englishDigits.length; i++) {
            str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
        }
        return str;
    }

    toEnglishNumbers(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        str = String(str);
        for (let i = 0; i < persianDigits.length; i++) {
            str = str.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        }
        return str;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: ${type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' : 'linear-gradient(135deg, #4caf50, #388e3c)'};
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            font-weight: 600;
            animation: slideIn 0.4s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianTicketCreate = new PersianTicketCreate();
});

// انیمیشن‌ها
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
`;
document.head.appendChild(animStyle);