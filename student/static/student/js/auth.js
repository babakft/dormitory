/**
 * Persian Dormitory Authentication System - Enhanced Beautiful Version with Background
 * Enhanced authentication functionality with Persian language support and beautiful animations
 */

// Enhanced Persian Utility Functions
const PersianUtils = {
    // Convert English numbers to Persian
    toPersianNumbers: function(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';

        for (let i = 0; i < englishDigits.length; i++) {
            str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
        }
        return str;
    },

    // Convert Persian numbers to English
    toEnglishNumbers: function(str) {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';

        for (let i = 0; i < persianDigits.length; i++) {
            str = str.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        }
        return str;
    },

    // Clean Persian text
    cleanPersianText: function(text) {
        return text
            .replace(/ي/g, 'ی')  // Replace Arabic ي with Persian ی
            .replace(/ك/g, 'ک')  // Replace Arabic ك with Persian ک
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    },

    // Validate Persian text
    isPersianText: function(text) {
        const persianPattern = /^[\u0600-\u06FF\s]+$/;
        return persianPattern.test(text);
    },

    // Validate Iranian mobile number
    validateIranianMobile: function(number) {
        const cleanNumber = this.toEnglishNumbers(number.replace(/[\s\-]/g, ''));
        const mobilePattern = /^09[0-9]{9}$/;
        return mobilePattern.test(cleanNumber);
    },

    // Validate student ID
    validateStudentId: function(id) {
        const cleanId = this.toEnglishNumbers(id.replace(/[\s\-]/g, ''));
        const studentIdPattern = /^[0-9]{8,12}$/;
        return studentIdPattern.test(cleanId);
    }
};

class EnhancedPersianAuth {
    constructor() {
        this.validationRules = {
            student_number: {
                required: true,
                validator: (value) => PersianUtils.validateStudentId(value),
                message: 'شماره دانشجویی باید بین ۸ تا ۱۲ رقم باشد'
            },
            username: {
                required: true,
                minLength: 3,
                maxLength: 20,
                message: 'نام کاربری باید بین ۳ تا ۲۰ کاراکتر باشد'
            },
            email: {
                required: true,
                validator: (value) => this.validateEmail(value),
                message: 'لطفاً یک آدرس ایمیل معتبر وارد کنید'
            },
            phone: {
                required: false,
                validator: (value) => !value || PersianUtils.validateIranianMobile(value),
                message: 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد'
            },
            password1: {
                required: true,
                minLength: 8,
                validator: (value) => this.validatePassword(value),
                message: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف و اعداد باشد'
            },
            password2: {
                required: true,
                validator: (value, form) => value === form.password1?.value,
                message: 'تکرار رمز عبور مطابقت ندارد'
            }
        };

        this.init();
    }

    init() {
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupPasswordStrength();
        this.addFormClasses();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.animateElements();
        this.autoCloseDjangoMessages();
        this.setupParallaxEffects();
        this.initializeAnimations();

        console.log('🏛️ سامانه احراز هویت فارسی پیشرفته با بک‌گراند زیبا آماده است');
    }

    createBeautifulBackground() {
        // ایجاد اشکال هندسی
        this.createGeometricShapes();

        // ایجاد خطوط متحرک
        this.createAnimatedLines();

        // ایجاد ذرات شناور
        this.createFloatingParticles();

        // ایجاد افکت‌های اضافی
        this.createAdditionalEffects();
    }

    createGeometricShapes() {
        // حذف اشکال قبلی اگر وجود داشته باشد
        const existingShapes = document.querySelector('.geometric-shapes');
        if (existingShapes) {
            existingShapes.remove();
        }

        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'geometric-shapes';

        // شکل 1 - دایره قرمز
        const shape1 = document.createElement('div');
        shape1.className = 'shape shape-1';
        shape1.style.cssText = `
            width: 120px;
            height: 120px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border-radius: 50%;
            position: absolute;
            top: 10%;
            left: 10%;
            opacity: 0.1;
            animation: float1 12s ease-in-out infinite;
        `;

        // شکل 2 - مربع آبی
        const shape2 = document.createElement('div');
        shape2.className = 'shape shape-2';
        shape2.style.cssText = `
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #4834d4, #686de0);
            border-radius: 20%;
            position: absolute;
            top: 20%;
            right: 15%;
            opacity: 0.1;
            animation: float2 15s ease-in-out infinite;
        `;

        // شکل 3 - بیضی سبز
        const shape3 = document.createElement('div');
        shape3.className = 'shape shape-3';
        shape3.style.cssText = `
            width: 150px;
            height: 60px;
            background: linear-gradient(45deg, #00d2d3, #54a0ff);
            border-radius: 50px;
            position: absolute;
            bottom: 20%;
            left: 20%;
            opacity: 0.1;
            animation: float3 18s ease-in-out infinite;
        `;

        // شکل 4 - مثلث صورتی
        const shape4 = document.createElement('div');
        shape4.className = 'shape shape-4';
        shape4.style.cssText = `
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #ff9ff3, #f368e0);
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            position: absolute;
            top: 60%;
            right: 25%;
            opacity: 0.1;
            animation: float4 14s ease-in-out infinite;
        `;

        // شکل 5 - مربع نارنجی
        const shape5 = document.createElement('div');
        shape5.className = 'shape shape-5';
        shape5.style.cssText = `
            width: 90px;
            height: 90px;
            background: linear-gradient(45deg, #feca57, #ff9f43);
            border-radius: 15px;
            position: absolute;
            top: 70%;
            left: 60%;
            opacity: 0.1;
            animation: float5 16s ease-in-out infinite;
        `;

        // شکل 6 - متوازی‌الاضلاع آبی
        const shape6 = document.createElement('div');
        shape6.className = 'shape shape-6';
        shape6.style.cssText = `
            width: 70px;
            height: 70px;
            background: linear-gradient(45deg, #48dbfb, #0abde3);
            clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
            position: absolute;
            top: 30%;
            left: 50%;
            opacity: 0.1;
            animation: float6 13s ease-in-out infinite;
        `;

        shapesContainer.appendChild(shape1);
        shapesContainer.appendChild(shape2);
        shapesContainer.appendChild(shape3);
        shapesContainer.appendChild(shape4);
        shapesContainer.appendChild(shape5);
        shapesContainer.appendChild(shape6);

        document.body.appendChild(shapesContainer);
    }

    createAnimatedLines() {
        // حذف خطوط قبلی اگر وجود داشته باشد
        const existingLines = document.querySelector('.animated-lines');
        if (existingLines) {
            existingLines.remove();
        }

        const linesContainer = document.createElement('div');
        linesContainer.className = 'animated-lines';
        linesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        for (let i = 1; i <= 3; i++) {
            const line = document.createElement('div');
            line.className = `line line-${i}`;
            line.style.cssText = `
                position: absolute;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: moveLine 8s linear infinite;
            `;

            if (i === 1) {
                line.style.cssText += `
                    width: 2px;
                    height: 200px;
                    top: -200px;
                    left: 20%;
                    animation-delay: 0s;
                `;
            } else if (i === 2) {
                line.style.cssText += `
                    width: 1px;
                    height: 150px;
                    top: -150px;
                    left: 50%;
                    animation-delay: 2s;
                `;
            } else {
                line.style.cssText += `
                    width: 2px;
                    height: 180px;
                    top: -180px;
                    left: 80%;
                    animation-delay: 4s;
                `;
            }

            linesContainer.appendChild(line);
        }

        document.body.appendChild(linesContainer);
    }

    createFloatingParticles() {
        // حذف ذرات قبلی اگر وجود داشته باشد
        const existingParticles = document.querySelector('.floating-particles');
        if (existingParticles) {
            existingParticles.remove();
        }

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

        for (let i = 1; i <= 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
                border-radius: 50%;
                left: ${(i * 8)}%;
                animation: floatParticle ${8 + (i % 5)}s linear infinite;
                animation-delay: ${i * 0.5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        document.body.appendChild(particlesContainer);
    }

    createAdditionalEffects() {
        // ایجاد حلقه‌های نورانی
        this.createGlowingRings();

        // ایجاد ستاره‌های چشمک زن
        this.createTwinklingStars();
    }

    createGlowingRings() {
        const ringsContainer = document.createElement('div');
        ringsContainer.className = 'glowing-rings';
        ringsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        for (let i = 1; i <= 3; i++) {
            const ring = document.createElement('div');
            ring.className = `ring ring-${i}`;
            ring.style.cssText = `
                position: absolute;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                animation: expandRing ${10 + i * 2}s ease-in-out infinite;
            `;

            if (i === 1) {
                ring.style.cssText += `
                    width: 200px;
                    height: 200px;
                    top: 30%;
                    right: 10%;
                    animation-delay: 0s;
                `;
            } else if (i === 2) {
                ring.style.cssText += `
                    width: 150px;
                    height: 150px;
                    bottom: 30%;
                    left: 15%;
                    animation-delay: 3s;
                `;
            } else {
                ring.style.cssText += `
                    width: 100px;
                    height: 100px;
                    top: 50%;
                    left: 50%;
                    animation-delay: 6s;
                `;
            }

            ringsContainer.appendChild(ring);
        }

        document.body.appendChild(ringsContainer);
    }

    createTwinklingStars() {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'twinkling-stars';
        starsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        for (let i = 1; i <= 15; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            starsContainer.appendChild(star);
        }

        document.body.appendChild(starsContainer);
    }

    initializeAnimations() {
        // اضافه کردن CSS انیمیشن‌ها
        if (!document.querySelector('#background-animations')) {
            const style = document.createElement('style');
            style.id = 'background-animations';
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

                @keyframes float6 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    25% { transform: translate(25px, -15px) rotate(90deg) scale(1.05); }
                    50% { transform: translate(-30px, 25px) rotate(180deg) scale(1.25); }
                    75% { transform: translate(15px, 30px) rotate(270deg) scale(0.95); }
                }

                @keyframes moveLine {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }

                @keyframes floatParticle {
                    0% {
                        transform: translateY(100vh) translateX(0) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) translateX(50px) scale(0);
                        opacity: 0;
                    }
                }

                @keyframes expandRing {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }

                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupParallaxEffects() {
        let ticking = false;

        const updateParallax = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const mouseX = e.clientX / window.innerWidth;
                    const mouseY = e.clientY / window.innerHeight;

                    // حرکت اشکال با ماوس
                    const shapes = document.querySelectorAll('.shape');
                    shapes.forEach((shape, index) => {
                        const speed = (index + 1) * 0.3;
                        const x = (mouseX - 0.5) * speed * 20;
                        const y = (mouseY - 0.5) * speed * 20;

                        const currentTransform = shape.style.transform || '';
                        const baseTransform = currentTransform.replace(/translate\([^)]*\)/g, '');
                        shape.style.transform = `translate(${x}px, ${y}px) ${baseTransform}`;
                    });

                    // حرکت ذرات با ماوس
                    const particles = document.querySelectorAll('.particle');
                    particles.forEach((particle, index) => {
                        const speed = 0.1;
                        const x = (mouseX - 0.5) * speed * 10;
                        const y = (mouseY - 0.5) * speed * 10;

                        const currentTransform = particle.style.transform || '';
                        const baseTransform = currentTransform.replace(/translate\([^)]*\)/g, '');
                        particle.style.transform = `translate(${x}px, ${y}px) ${baseTransform}`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('mousemove', updateParallax);
    }

    setupEventListeners() {
        // Form submission with enhanced effects
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Enhanced input field events
        const formControls = document.querySelectorAll('.form-control, input, select');
        formControls.forEach(control => {
            control.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            control.addEventListener('input', (e) => {
                this.handleInput(e.target);
                this.clearFieldError(e.target);
                this.addInputFeedback(e.target);
            });

            control.addEventListener('focus', (e) => {
                this.addFocusEffect(e.target);
            });
        });

        // Enhanced close alert functionality
        document.querySelectorAll('.close-btn, .alert .fa-times').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAlert(e.target.closest('.alert'));
            });
        });

        // Enhanced stat animations
        this.setupStatAnimations();

        // Feature list hover effects
        this.setupFeatureListEffects();
    }

    setupFeatureListEffects() {
        const featureItems = document.querySelectorAll('.feature-list li');
        featureItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(-8px) scale(1.02)';
                item.style.background = 'rgba(255, 255, 255, 0.2)';
                item.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(-5px) scale(1)';
                item.style.background = 'rgba(255, 255, 255, 0.08)';
                item.style.boxShadow = '';
            });
        });
    }

    addInputFeedback(field) {
        // Add real-time visual feedback
        const wrapper = field.closest('.input-wrapper');
        if (!wrapper) return;

        if (field.value.length > 0) {
            if (this.validateField(field, false)) {
                wrapper.style.borderColor = 'var(--success)';
                wrapper.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
            } else {
                wrapper.style.borderColor = 'var(--warning)';
                wrapper.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)';
            }
        } else {
            wrapper.style.borderColor = '';
            wrapper.style.boxShadow = '';
        }
    }

    setupFormValidation() {
        // Enhanced Persian number conversion with animation
        const numberFields = document.querySelectorAll('#id_student_number, #id_phone');
        numberFields.forEach(field => {
            field.addEventListener('input', (e) => {
                const persianValue = PersianUtils.toPersianNumbers(e.target.value);
                const englishValue = PersianUtils.toEnglishNumbers(e.target.value);

                e.target.dataset.englishValue = englishValue;

                if (e.target.value !== persianValue) {
                    e.target.value = persianValue;
                    // Add a subtle animation for number conversion
                    e.target.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        e.target.style.transform = '';
                    }, 200);
                }
            });

            field.closest('form')?.addEventListener('submit', () => {
                field.value = field.dataset.englishValue || PersianUtils.toEnglishNumbers(field.value);
            });
        });

        // Enhanced real-time validation
        const usernameField = document.getElementById('id_username');
        if (usernameField) {
            usernameField.addEventListener('input', (e) => {
                this.validateUsername(e.target.value, e.target);
            });
        }

        const emailField = document.getElementById('id_email');
        if (emailField) {
            emailField.addEventListener('input', (e) => {
                this.validateEmailField(e.target.value, e.target);
            });
        }
    }

    setupPasswordToggle() {
        window.togglePassword = (fieldId) => {
            const field = document.getElementById(fieldId);
            const icons = document.querySelectorAll('#toggleIcon, #toggleIcon1');
            const toggleBtn = document.querySelector('.toggle-password');

            if (field) {
                // Add beautiful animation
                if (toggleBtn) {
                    toggleBtn.style.transform = 'scale(0.9) rotate(180deg)';
                    setTimeout(() => {
                        toggleBtn.style.transform = 'scale(1) rotate(0deg)';
                    }, 200);
                }

                if (field.type === 'password') {
                    field.type = 'text';
                    icons.forEach(icon => {
                        icon.className = 'icon-eye-off';
                    });
                } else {
                    field.type = 'password';
                    icons.forEach(icon => {
                        icon.className = 'icon-eye';
                    });
                }
            }
        };
    }

    setupPasswordStrength() {
        const passwordField = document.getElementById('id_password1');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        if (passwordField && strengthFill && strengthText) {
            passwordField.addEventListener('input', (e) => {
                const strength = this.calculatePasswordStrength(e.target.value);
                this.updatePasswordStrength(strength, strengthFill, strengthText);
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score += 25;
        else feedback.push('حداقل ۸ کاراکتر');

        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('حروف کوچک');

        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('حروف بزرگ');

        if (/[0-9]/.test(password)) score += 25;
        else feedback.push('اعداد');

        if (/[^a-zA-Z0-9]/.test(password)) score += 10; // Special characters bonus

        let level = 'ضعیف';
        if (score >= 85) level = 'عالی';
        else if (score >= 75) level = 'قوی';
        else if (score >= 50) level = 'متوسط';
        else if (score >= 25) level = 'مقبول';

        return { score: Math.min(score, 100), level, feedback };
    }

    updatePasswordStrength(strength, fillElement, textElement) {
        fillElement.className = 'strength-fill';

        if (strength.score >= 85) {
            fillElement.classList.add('strong');
        } else if (strength.score >= 75) {
            fillElement.classList.add('strong');
        } else if (strength.score >= 50) {
            fillElement.classList.add('good');
        } else if (strength.score >= 25) {
            fillElement.classList.add('fair');
        } else {
            fillElement.classList.add('weak');
        }

        // Animate the fill
        fillElement.style.width = `${strength.score}%`;
        textElement.textContent = `قدرت رمز عبور: ${strength.level}`;

        // Add color animation
        setTimeout(() => {
            fillElement.style.opacity = '1';
        }, 100);
    }

    addFormClasses() {
        const fields = {
            id_student_number: { placeholder: 'شماره دانشجویی خود را وارد کنید' },
            id_username: { placeholder: 'نام کاربری خود را وارد کنید' },
            id_email: { placeholder: 'آدرس ایمیل خود را وارد کنید' },
            id_phone: { placeholder: 'شماره موبایل (اختیاری)' },
            id_password1: { placeholder: 'رمز عبور خود را وارد کنید' },
            id_password2: { placeholder: 'رمز عبور را مجدداً وارد کنید' },
            id_password: { placeholder: 'رمز عبور خود را وارد کنید' }
        };

        Object.entries(fields).forEach(([id, config]) => {
            const field = document.getElementById(id);
            if (field) {
                field.classList.add('form-control');
                field.placeholder = config.placeholder;
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('.form-control')) {
                const form = e.target.closest('form');
                if (form && this.validateForm(form)) {
                    form.submit();
                }
            }

            if (e.key === 'Escape') {
                this.clearForm();
            }

            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                const passwordField = document.querySelector('input[type="password"]');
                if (passwordField) {
                    window.togglePassword(passwordField.id);
                }
            }
        });
    }

    setupAccessibility() {
        const fields = document.querySelectorAll('.form-control');
        fields.forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label) {
                field.setAttribute('aria-describedby', `${field.id}-help`);
            }
        });
    }

    animateElements() {
        // Enhanced stagger animation for form elements
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(30px)';

            setTimeout(() => {
                group.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });

        // Enhanced sidebar animation
        const features = document.querySelectorAll('.feature-list li');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(30px)';

            setTimeout(() => {
                feature.style.transition = 'all 0.5s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(-5px)';
            }, 800 + (index * 150));
        });

        // Animate logo
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.opacity = '0';
            logo.style.transform = 'scale(0.8)';

            setTimeout(() => {
                logo.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                logo.style.opacity = '1';
                logo.style.transform = 'scale(1)';
            }, 300);
        }
    }

    setupStatAnimations() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    animateStatNumber(element) {
        const text = element.textContent;
        const hasNumber = /\d+/.test(text);

        if (hasNumber) {
            const match = text.match(/(\d+)/);
            if (match) {
                const number = parseInt(match[1]);
                let current = 0;
                const increment = number / 50; // Smoother animation
                const duration = 2000;
                const stepTime = duration / 50;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        element.textContent = PersianUtils.toPersianNumbers(number.toString());
                        clearInterval(timer);

                        // Add completion effect
                        element.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                        }, 200);
                    } else {
                        element.textContent = PersianUtils.toPersianNumbers(Math.floor(current).toString());
                    }
                }, stepTime);
            }
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('.form-control');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field, showError = true) {
        const fieldName = field.name || field.id.replace('id_', '');
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];

        if (!rules) return true;

        this.clearFieldError(field);

        if (rules.required && !value) {
            if (showError) {
                this.showFieldError(field, `${this.getFieldLabel(fieldName)} الزامی است`);
            }
            return false;
        }

        if (!value && !rules.required) {
            field.classList.add('valid');
            return true;
        }

        if (rules.minLength && value.length < rules.minLength) {
            if (showError) {
                this.showFieldError(field, rules.message);
            }
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            if (showError) {
                this.showFieldError(field, rules.message);
            }
            return false;
        }

        if (rules.validator && !rules.validator(value, field.form)) {
            if (showError) {
                this.showFieldError(field, rules.message);
            }
            return false;
        }

        field.classList.add('valid');
        field.classList.remove('invalid');
        return true;
    }

    validateUsername(username, field) {
        const cleanUsername = username.replace(/\s/g, '');

        if (cleanUsername.length >= 3) {
            if (/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
                field.classList.add('valid');
                field.classList.remove('invalid');
                this.addSuccessEffect(field);
            } else {
                field.classList.add('invalid');
                field.classList.remove('valid');
                this.showFieldError(field, 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد');
            }
        }
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    validateEmailField(email, field) {
        if (email.length > 0) {
            if (this.validateEmail(email)) {
                field.classList.add('valid');
                field.classList.remove('invalid');
                this.addSuccessEffect(field);
            } else {
                field.classList.add('invalid');
                field.classList.remove('valid');
            }
        }
    }

    validatePassword(password) {
        return password.length >= 8 &&
               /[a-zA-Z]/.test(password) &&
               /[0-9]/.test(password);
    }

    addSuccessEffect(field) {
        const wrapper = field.closest('.input-wrapper');
        if (wrapper) {
            wrapper.style.borderColor = 'var(--success)';
            wrapper.style.transform = 'scale(1.02)';
            setTimeout(() => {
                wrapper.style.transform = 'scale(1)';
            }, 200);
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        const inputWrapper = field.closest('.input-wrapper') || field.parentElement;
        inputWrapper.insertAdjacentElement('afterend', errorElement);

        field.classList.add('invalid');
        field.classList.remove('valid');

        // Enhanced error animation
        setTimeout(() => {
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateX(0)';
        }, 50);

        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.style.opacity = '0';
                setTimeout(() => errorElement.remove(), 300);
            }
        }, 5000);
    }

    clearFieldError(field) {
        const inputWrapper = field.closest('.input-wrapper') || field.parentElement;
        const existingError = inputWrapper.nextElementSibling;

        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }

        field.classList.remove('invalid');
    }

    addFocusEffect(field) {
        const inputWrapper = field.closest('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.style.transform = 'translateY(-3px) scale(1.02)';
            inputWrapper.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.15)';

            setTimeout(() => {
                inputWrapper.style.transform = 'translateY(-1px)';
            }, 200);
        }
    }

    handleInput(field) {
        if (field.id === 'id_student_number' || field.id === 'id_phone') {
            const persianValue = PersianUtils.toPersianNumbers(field.value);
            if (field.value !== persianValue) {
                field.value = persianValue;
            }
        }

        if (field.value.length > 0) {
            this.validateField(field, false);
        }
    }

    getFieldLabel(fieldName) {
        const labelMap = {
            student_number: 'شماره دانشجویی',
            username: 'نام کاربری',
            email: 'ایمیل',
            phone: 'تلفن همراه',
            password1: 'رمز عبور',
            password2: 'تکرار رمز عبور',
            password: 'رمز عبور'
        };
        return labelMap[fieldName] || fieldName;
    }

    async handleFormSubmit(e) {
        const form = e.currentTarget;

        if (!this.validateForm(form)) {
            e.preventDefault();
            this.showNotification('لطفاً خطاهای فرم را برطرف کنید', 'error');
            this.shakeForm(form);
            return false;
        }

        // Convert Persian numbers to English
        const numberFields = form.querySelectorAll('#id_student_number, #id_phone');
        numberFields.forEach(field => {
            field.value = PersianUtils.toEnglishNumbers(field.value);
        });

        this.showLoadingState(form);
    }

    shakeForm(form) {
        form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }

    showLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const originalText = submitBtn.textContent;
            submitBtn.dataset.originalText = originalText;
            submitBtn.textContent = 'در حال پردازش...';

            // Add beautiful loading effect
            submitBtn.style.background = 'linear-gradient(135deg, #1565c0, #0d47a1)';
        }
    }

    hideLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;

            if (submitBtn.dataset.originalText) {
                submitBtn.textContent = submitBtn.dataset.originalText;
                delete submitBtn.dataset.originalText;
            }

            submitBtn.style.background = '';
        }
    }

    clearForm() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();

            const formControls = form.querySelectorAll('.form-control');
            formControls.forEach(control => {
                control.classList.remove('valid', 'invalid');
                this.clearFieldError(control);
            });
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' : 'linear-gradient(135deg, #4caf50, #388e3c)'};
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            max-width: 350px;
            font-weight: 600;
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 4000);
    }

    closeAlert(alertElement) {
        if (alertElement) {
            alertElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            alertElement.style.opacity = '0';
            alertElement.style.transform = 'translateY(-20px) scale(0.95)';

            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 400);
        }
    }

    autoCloseDjangoMessages() {
        setTimeout(() => {
            const messages = document.querySelectorAll('.alert');
            messages.forEach((message, index) => {
                setTimeout(() => {
                    this.closeAlert(message);
                }, index * 200);
            });
        }, 8000);
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

    focus() {
        const firstInput = document.querySelector('.form-control');
        if (firstInput) {
            firstInput.focus();
        }
    }

    getFormData() {
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
            return new FormData(forms[0]);
        }
        return null;
    }
}

// Initialize the enhanced Persian authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedPersianAuth = new EnhancedPersianAuth();

    // Enhanced focus effect
    setTimeout(() => {
        const firstInput = document.querySelector('.form-control');
        if (firstInput) {
            firstInput.focus();
            firstInput.style.transform = 'scale(1.02)';
            setTimeout(() => {
                firstInput.style.transform = '';
            }, 300);
        }
    }, 1200);
});

// Export utilities
window.PersianUtils = PersianUtils;

// Global functions
window.closeAlert = function(element) {
    if (window.enhancedPersianAuth) {
        window.enhancedPersianAuth.closeAlert(element);
    }
};

// Enhanced visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('🏛️ صفحه احراز هویت مخفی شد');
    } else {
        console.log('🏛️ صفحه احراز هویت نمایان شد');
        if (window.enhancedPersianAuth) {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => window.enhancedPersianAuth.hideLoadingState(form));
        }
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('خطای JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('خطای Promise:', e.reason);
});

// Performance optimization
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // اجرای کارهای غیر ضروری در زمان بیکاری
        console.log('🏛️ بهینه‌سازی عملکرد انجام شد');
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedPersianAuth, PersianUtils };
}