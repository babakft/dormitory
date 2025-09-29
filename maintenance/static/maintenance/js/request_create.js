/**
 * فرم درخواست تعمیرات - سیستم فارسی پیشرفته
 * Persian Maintenance Request Form with Beautiful Animations
 */

// توابع کمکی فارسی
const PersianMaintenanceUtils = {
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

class PersianMaintenanceForm {
    constructor() {
        this.form = null;
        this.titleInput = null;
        this.descriptionInput = null;
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
        console.log('🔧 سیستم درخواست تعمیرات در حال بارگذاری...');

        this.cacheElements();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupCharacterCounters();
        this.setupFormValidation();
        this.setupQuickFill();
        this.setupKeyboardShortcuts();
        this.animateElements();

        console.log('✅ سیستم آماده است');
    }

    cacheElements() {
        this.form = document.getElementById('maintenanceForm');
        this.titleInput = document.querySelector('#id_title');
        this.descriptionInput = document.querySelector('#id_description');
        this.fileInput = document.querySelector('#id_issue_image');
        this.submitBtn = document.querySelector('#submitBtn');
    }

    createBeautifulBackground() {
        // اشکال هندسی شناور
        const shapes = [
            { size: 120, color: '#ff6b6b', top: '10%', left: '10%', animation: 'float1 12s' },
            { size: 80, color: '#4834d4', top: '20%', right: '15%', animation: 'float2 15s' },
            { size: 150, color: '#00d2d3', bottom: '20%', left: '20%', animation: 'float3 18s' },
            { size: 100, color: '#ff9ff3', top: '60%', right: '25%', animation: 'float4 14s' },
            { size: 90, color: '#feca57', top: '70%', left: '60%', animation: 'float5 16s' }
        ];

        shapes.forEach((shape, index) => {
            const element = document.createElement('div');
            element.className = `shape shape-${index + 1}`;
            element.style.cssText = `
                position: fixed;
                width: ${shape.size}px;
                height: ${shape.size}px;
                background: linear-gradient(45deg, ${shape.color}, ${shape.color}88);
                border-radius: ${index % 2 === 0 ? '50%' : '15px'};
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
        if (document.querySelector('#maintenance-animations')) return;

        const style = document.createElement('style');
        style.id = 'maintenance-animations';
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

        // اضافه کردن رویدادهای blur و input
        [this.titleInput, this.descriptionInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.validateField(input);
                    this.clearFieldError(input);
                });

                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            }
        });
    }

    setupFileUpload() {
        if (!this.fileInput) return;

        const uploadArea = document.getElementById('fileUploadArea');
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('filePreview');
        const previewImg = document.getElementById('previewImg');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const removeBtn = document.getElementById('removeFile');

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = '';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files;
                this.handleFileSelect(files[0]);
            }
        });

        // File selection
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearFileSelection();
            });
        }
    }

    handleFileSelect(file) {
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('filePreview');
        const previewImg = document.getElementById('previewImg');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

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
            previewImg.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);

            placeholder.style.display = 'none';
            preview.style.display = 'flex';

            // انیمیشن
            preview.style.opacity = '0';
            preview.style.transform = 'scale(0.9)';
            setTimeout(() => {
                preview.style.transition = 'all 0.4s ease';
                preview.style.opacity = '1';
                preview.style.transform = 'scale(1)';
            }, 50);
        };
        reader.readAsDataURL(file);
    }

    clearFileSelection() {
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('filePreview');

        if (this.fileInput) {
            this.fileInput.value = '';
        }

        preview.style.display = 'none';
        placeholder.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' بایت';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' کیلوبایت';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' مگابایت';
        }
    }

    setupCharacterCounters() {
        // عنوان (200 کاراکتر)
        if (this.titleInput) {
            const titleCount = document.getElementById('titleCount');
            this.titleInput.addEventListener('input', () => {
                const count = this.titleInput.value.length;
                if (titleCount) {
                    titleCount.textContent = PersianMaintenanceUtils.toPersianNumbers(count);
                }
            });
        }

        // توضیحات
        if (this.descriptionInput) {
            const descCount = document.getElementById('descCount');
            this.descriptionInput.addEventListener('input', () => {
                const count = this.descriptionInput.value.length;
                if (descCount) {
                    descCount.textContent = PersianMaintenanceUtils.toPersianNumbers(count);
                }
            });
        }
    }

    setupFormValidation() {
        // تبدیل اعداد فارسی قبل از ارسال
        if (this.form) {
            this.form.addEventListener('submit', () => {
                const inputs = this.form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    if (input.type !== 'file') {
                        input.value = PersianMaintenanceUtils.toEnglishNumbers(input.value);
                    }
                });
            });
        }
    }

    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        const fieldName = field.id.replace('id_', '');

        this.clearFieldError(field);

        // عنوان
        if (fieldName === 'title') {
            if (value.length < 5) {
                this.showFieldError(field, 'عنوان باید حداقل ۵ کاراکتر باشد');
                return false;
            }
            if (value.length > 200) {
                this.showFieldError(field, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد');
                return false;
            }
        }

        // توضیحات
        if (fieldName === 'description') {
            if (value.length < 10) {
                this.showFieldError(field, 'توضیحات باید حداقل ۱۰ کاراکتر باشد');
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

    setupQuickFill() {
        const quickFillBtn = document.getElementById('useMyRoom');
        if (!quickFillBtn) return;

        quickFillBtn.addEventListener('click', () => {
            const roomSelect = document.querySelector('#id_room');
            const roomId = quickFillBtn.dataset.roomId;

            if (roomSelect && roomId) {
                roomSelect.value = roomId;

                // انیمیشن
                roomSelect.style.transform = 'scale(1.05)';
                roomSelect.style.borderColor = 'var(--success)';

                setTimeout(() => {
                    roomSelect.style.transform = '';
                }, 300);

                this.showNotification('اتاق شما انتخاب شد!', 'success');
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = ارسال
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.form) {
                    this.form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape = پاک کردن فرم
            if (e.key === 'Escape') {
                if (confirm('آیا می‌خواهید فرم را پاک کنید؟')) {
                    this.form?.reset();
                    this.clearFileSelection();
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
        const titleValid = this.validateField(this.titleInput);
        const descValid = this.validateField(this.descriptionInput);

        // بررسی فایل
        if (!this.fileInput || !this.fileInput.files || this.fileInput.files.length === 0) {
            e.preventDefault();
            this.showNotification('لطفاً تصویر مشکل را آپلود کنید', 'error');
            return false;
        }

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
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }

    animateElements() {
        const elements = [
            { el: document.querySelector('.page-header'), delay: 100 },
            { el: document.querySelector('.form-card'), delay: 250 },
            { el: document.querySelector('.help-card'), delay: 400 }
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
            animation: slideInLeft 0.4s ease;
            backdrop-filter: blur(10px);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.persianMaintenanceForm = new PersianMaintenanceForm();
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

window.PersianMaintenanceUtils = PersianMaintenanceUtils;

console.log('🔧 سیستم فرم تعمیرات بارگذاری شد');