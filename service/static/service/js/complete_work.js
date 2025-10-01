/**
 * تکمیل کار تعمیرات - سیستم فارسی پیشرفته
 * Persian Complete Work Form with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianCompleteWorkUtils = {
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

class PersianCompleteWorkForm {
    constructor() {
        this.form = null;
        this.notesInput = null;
        this.fileInput = null;
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
        console.log('✅ سیستم تکمیل کار در حال بارگذاری...');

        this.cacheElements();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupCharacterCounter();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.animateElements();

        console.log('✅ سیستم تکمیل کار آماده است');
    }

    cacheElements() {
        this.form = document.getElementById('completeWorkForm');
        this.notesInput = document.querySelector('#id_completion_notes');
        this.fileInput = document.querySelector('#id_completion_image');
        this.submitBtn = document.querySelector('#submitBtn');

        console.log('Elements cached:', {
            form: !!this.form,
            notesInput: !!this.notesInput,
            fileInput: !!this.fileInput,
            submitBtn: !!this.submitBtn
        });
    }

    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { size: 120, color: '#4caf50', top: '10%', right: '10%', animation: 'float1 12s' },
            { size: 80, color: '#00bcd4', top: '20%', left: '15%', animation: 'float2 15s' },
            { size: 150, color: '#ff9800', bottom: '20%', right: '20%', animation: 'float3 18s' },
            { size: 100, color: '#9c27b0', top: '60%', left: '25%', animation: 'float4 14s' }
        ];

        shapes.forEach((shape, index) => {
            const element = document.createElement('div');
            element.className = `shape shape-${index + 1}`;
            element.style.cssText = `
                position: fixed;
                width: ${shape.size}px;
                height: ${shape.size}px;
                background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                border-radius: ${index % 2 === 0 ? '50%' : '20%'};
                opacity: 0.1;
                pointer-events: none;
                z-index: 0;
                animation: ${shape.animation} ease-in-out infinite;
            `;

            Object.assign(element.style, {
                top: shape.top || 'auto',
                bottom: shape.bottom || 'auto',
                left: shape.left || 'auto',
                right: shape.right || 'auto'
            });

            document.body.appendChild(element);
        });

        this.addBackgroundAnimations();
    }

    addBackgroundAnimations() {
        if (document.querySelector('#complete-work-animations')) return;

        const style = document.createElement('style');
        style.id = 'complete-work-animations';
        style.textContent = `
            @keyframes float1 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                33% { transform: translate(30px, -20px) rotate(120deg) scale(1.1); }
                66% { transform: translate(-20px, 30px) rotate(240deg) scale(0.9); }
            }

            @keyframes float2 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                50% { transform: translate(40px, -40px) rotate(180deg) scale(1.3); }
            }

            @keyframes float3 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                33% { transform: translate(-40px, 20px) rotate(120deg) scale(1.15); }
                66% { transform: translate(20px, -40px) rotate(240deg) scale(0.85); }
            }

            @keyframes float4 {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                20% { transform: translate(20px, 20px) rotate(72deg) scale(1.1); }
                40% { transform: translate(-30px, 10px) rotate(144deg) scale(0.9); }
                60% { transform: translate(10px, -30px) rotate(216deg) scale(1.2); }
                80% { transform: translate(-20px, -20px) rotate(288deg) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // اضافه کردن رویدادهای input و blur
        if (this.notesInput) {
            this.notesInput.addEventListener('input', () => {
                this.validateField(this.notesInput);
                this.clearFieldError(this.notesInput);
            });

            this.notesInput.addEventListener('blur', () => {
                this.validateField(this.notesInput);
            });
        }
    }

    setupFileUpload() {
        console.log('Setting up file upload...');

        if (!this.fileInput) {
            console.error('File input not found!');
            return;
        }

        const uploadArea = document.getElementById('fileUploadArea');

        console.log('Upload area:', uploadArea);

        if (!uploadArea) {
            console.error('Upload area not found!');
            return;
        }

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('dragover');
            console.log('Drag over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('dragover');
            console.log('Drag leave');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('dragover');
            console.log('File dropped');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // تنظیم فایل در input
                this.fileInput.files = files;
                this.handleFileSelect(files[0]);
            }
        });

        // File selection - رویداد اصلی
        this.fileInput.addEventListener('change', (e) => {
            console.log('File input changed');
            console.log('Files:', e.target.files);

            if (e.target.files && e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // کلیک روی ناحیه آپلود
        uploadArea.addEventListener('click', (e) => {
            // فقط اگر روی دکمه حذف کلیک نشده باشد
            if (!e.target.closest('.btn-remove-file')) {
                console.log('Upload area clicked');
                this.fileInput.click();
            }
        });

        console.log('File upload setup complete');
    }

    handleFileSelect(file) {
        console.log('Handling file:', file);

        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('filePreview');
        const previewImg = document.getElementById('previewImg');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        if (!placeholder || !preview || !previewImg || !fileName || !fileSize) {
            console.error('Preview elements not found!', {
                placeholder: !!placeholder,
                preview: !!preview,
                previewImg: !!previewImg,
                fileName: !!fileName,
                fileSize: !!fileSize
            });
            return;
        }

        // بررسی نوع فایل
        if (!file.type.startsWith('image/')) {
            this.showNotification('لطفاً فقط تصویر آپلود کنید', 'error');
            this.clearFileSelection();
            return;
        }

        // بررسی حجم (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('حجم تصویر نباید بیشتر از ۵ مگابایت باشد', 'error');
            this.clearFileSelection();
            return;
        }

        // نمایش پیش‌نمایش
        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('File loaded successfully');

            previewImg.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);

            // مخفی کردن placeholder
            placeholder.style.display = 'none';

            // نمایش preview
            preview.style.display = 'flex';
            preview.style.opacity = '0';
            preview.style.transform = 'scale(0.9)';

            // انیمیشن
            setTimeout(() => {
                preview.style.transition = 'all 0.4s ease';
                preview.style.opacity = '1';
                preview.style.transform = 'scale(1)';
            }, 50);

            this.showNotification('تصویر با موفقیت انتخاب شد', 'success');
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.showNotification('خطا در خواندن فایل', 'error');
        };

        reader.readAsDataURL(file);
    }

    clearFileSelection() {
        console.log('Clearing file selection');

        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('filePreview');

        if (this.fileInput) {
            this.fileInput.value = '';
        }

        if (preview) {
            preview.style.display = 'none';
        }

        if (placeholder) {
            placeholder.style.display = 'flex';
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) {
            return PersianCompleteWorkUtils.toPersianNumbers(bytes) + ' بایت';
        } else if (bytes < 1024 * 1024) {
            return PersianCompleteWorkUtils.toPersianNumbers((bytes / 1024).toFixed(1)) + ' کیلوبایت';
        } else {
            return PersianCompleteWorkUtils.toPersianNumbers((bytes / (1024 * 1024)).toFixed(1)) + ' مگابایت';
        }
    }

    setupCharacterCounter() {
        if (!this.notesInput) return;

        const charCount = document.getElementById('charCount');
        if (!charCount) return;

        const updateCounter = () => {
            const count = this.notesInput.value.length;
            charCount.textContent = PersianCompleteWorkUtils.toPersianNumbers(count);

            const parent = charCount.parentElement;
            if (count > 900) {
                parent.classList.remove('valid');
                parent.classList.add('warning');
            } else if (count >= 20) {
                parent.classList.remove('warning');
                parent.classList.add('valid');
            } else {
                parent.classList.remove('valid', 'warning');
            }
        };

        this.notesInput.addEventListener('input', updateCounter);
        updateCounter();
    }

    setupFormValidation() {
        // تبدیل اعداد فارسی قبل از ارسال
        if (this.form) {
            this.form.addEventListener('submit', () => {
                const inputs = this.form.querySelectorAll('input:not([type="file"]), textarea');
                inputs.forEach(input => {
                    input.value = PersianCompleteWorkUtils.toEnglishNumbers(input.value);
                });
            });
        }
    }

    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        this.clearFieldError(field);

        // یادداشت‌های تکمیل
        if (field === this.notesInput) {
            if (value.length < 20) {
                this.showFieldError(field, 'یادداشت‌های تکمیل باید حداقل ۲۰ کاراکتر باشد');
                return false;
            }
            if (value.length > 1000) {
                this.showFieldError(field, 'یادداشت‌های تکمیل نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد');
                return false;
            }
        }

        // موفق
        field.style.borderColor = 'var(--success)';
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

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = ارسال
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.form && this.validateForm()) {
                    this.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }

            // Escape = بازگشت
            if (e.key === 'Escape') {
                const backBtn = document.querySelector('.btn-secondary');
                if (backBtn) {
                    window.location.href = backBtn.href;
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
        const notesValid = this.validateField(this.notesInput);

        // بررسی فایل
        if (!this.fileInput || !this.fileInput.files || this.fileInput.files.length === 0) {
            e.preventDefault();
            this.showNotification('لطفاً تصویر تکمیل کار را آپلود کنید', 'error');
            return false;
        }

        if (!notesValid) {
            e.preventDefault();
            this.showNotification('لطفاً خطاهای فرم را برطرف کنید', 'error');
            return false;
        }

        // تأیید
        const confirmed = confirm('آیا مطمئن هستید که کار تکمیل شده است؟\n\nاین عملیات قابل بازگشت نیست.');
        if (!confirmed) {
            e.preventDefault();
            return false;
        }

        this.isSubmitting = true;
        this.setLoadingState(true);
    }

    validateForm() {
        const notesValid = this.validateField(this.notesInput);
        const fileValid = this.fileInput && this.fileInput.files && this.fileInput.files.length > 0;

        return notesValid && fileValid;
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }

    animateElements() {
        const elements = [
            { el: document.querySelector('.page-header'), delay: 100 },
            { el: document.querySelector('.work-details-card'), delay: 250 },
            { el: document.querySelector('.completion-form-card'), delay: 400 }
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
            animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
            notification.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianCompleteWorkForm = new PersianCompleteWorkForm();
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

window.PersianCompleteWorkUtils = PersianCompleteWorkUtils;

console.log('✅ سیستم تکمیل کار بارگذاری شد');