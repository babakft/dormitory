/**
 * سیستم لاگین متخصصان - طراحی مشابه Register دانشجو
 * Enhanced Service Expert Login System with Beautiful Background
 */

class EnhancedServiceLogin {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.usernameInput = null;
        this.passwordInput = null;
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
        console.log('🔧 Enhanced Service Expert Login System initializing...');

        this.cacheElements();
        this.createBeautifulBackground();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupKeyboardShortcuts();
        this.animateElements();
        this.autoCloseDjangoMessages();
        this.setupParallaxEffects();

        console.log('✅ Service Expert Login System ready');
    }

    cacheElements() {
        this.form = document.getElementById('expertLoginForm');
        this.submitBtn = document.getElementById('loginBtn');
        this.usernameInput = document.querySelector('input[name="username"]');
        this.passwordInput = document.querySelector('input[name="password"]');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    createBeautifulBackground() {
        this.createGeometricShapes();
        this.createAnimatedLines();
        this.createFloatingParticles();
        this.initializeAnimations();
    }

    createGeometricShapes() {
        const existingShapes = document.querySelector('.geometric-shapes');
        if (existingShapes) existingShapes.remove();

        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'geometric-shapes';
        shapesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;

        const shapes = [
            { size: 120, color: '#ff6b6b', top: '10%', left: '10%', animation: 'float1 12s' },
            { size: 80, color: '#4834d4', top: '20%', right: '15%', animation: 'float2 15s' },
            { size: 150, color: '#00d2d3', bottom: '20%', left: '20%', animation: 'float3 18s' },
            { size: 100, color: '#ff9ff3', top: '60%', right: '25%', animation: 'float4 14s' },
            { size: 90, color: '#feca57', top: '70%', left: '60%', animation: 'float5 16s' }
        ];

        shapes.forEach((config, index) => {
            const shape = document.createElement('div');
            shape.className = `shape shape-${index + 1}`;
            shape.style.cssText = `
                position: absolute;
                width: ${config.size}px;
                height: ${config.size}px;
                background: linear-gradient(45deg, ${config.color}, ${config.color}88);
                border-radius: ${index % 2 === 0 ? '50%' : '20%'};
                opacity: 0.1;
                animation: ${config.animation} ease-in-out infinite;
            `;

            Object.assign(shape.style, {
                top: config.top || 'auto',
                bottom: config.bottom || 'auto',
                left: config.left || 'auto',
                right: config.right || 'auto'
            });

            shapesContainer.appendChild(shape);
        });

        document.body.appendChild(shapesContainer);
    }

    createAnimatedLines() {
        const existingLines = document.querySelector('.animated-lines');
        if (existingLines) existingLines.remove();

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
                width: ${i === 2 ? '1px' : '2px'};
                height: ${200 - i * 20}px;
                top: -${200 - i * 20}px;
                left: ${i * 30}%;
                animation-delay: ${(i - 1) * 2}s;
            `;
            linesContainer.appendChild(line);
        }

        document.body.appendChild(linesContainer);
    }

    createFloatingParticles() {
        const existingParticles = document.querySelector('.floating-particles');
        if (existingParticles) existingParticles.remove();

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
                left: ${i * 8}%;
                animation: floatParticle ${8 + (i % 5)}s linear infinite;
                animation-delay: ${i * 0.5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        document.body.appendChild(particlesContainer);
    }

    initializeAnimations() {
        if (document.querySelector('#background-animations')) return;

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

            @keyframes moveLine {
                0% { transform: translateY(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(100vh); opacity: 0; }
            }

            @keyframes floatParticle {
                0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
                10% { opacity: 1; transform: scale(1); }
                90% { opacity: 1; }
                100% { transform: translateY(-100px) translateX(50px) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setupParallaxEffects() {
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

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', () => {
                this.clearFieldError(this.usernameInput);
            });
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => {
                this.clearFieldError(this.passwordInput);
            });
        }

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAlert(e.target.closest('.alert'));
            });
        });
    }

    setupFormValidation() {
        if (this.usernameInput) {
            this.usernameInput.addEventListener('blur', () => {
                this.validateUsername();
            });
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', () => {
                this.validatePassword();
            });
        }
    }

    validateUsername() {
        if (!this.usernameInput) return true;

        const value = this.usernameInput.value.trim();

        if (value.length === 0) {
            this.showFieldError(this.usernameInput, 'شناسه کارمند الزامی است');
            return false;
        }

        if (value.length < 3) {
            this.showFieldError(this.usernameInput, 'شناسه کارمند باید حداقل ۳ کاراکتر باشد');
            return false;
        }

        this.clearFieldError(this.usernameInput);
        return true;
    }

    validatePassword() {
        if (!this.passwordInput) return true;

        const value = this.passwordInput.value;

        if (value.length === 0) {
            this.showFieldError(this.passwordInput, 'رمز عبور الزامی است');
            return false;
        }

        if (value.length < 4) {
            this.showFieldError(this.passwordInput, 'رمز عبور باید حداقل ۴ کاراکتر باشد');
            return false;
        }

        this.clearFieldError(this.passwordInput);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const wrapper = field.closest('.input-wrapper') || field.parentElement;
        wrapper.insertAdjacentElement('afterend', errorDiv);

        field.style.borderColor = 'var(--error)';

        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    clearFieldError(field) {
        const wrapper = field.closest('.input-wrapper') || field.parentElement;
        const existingError = wrapper.nextElementSibling;

        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }

        field.style.borderColor = '';
    }

    setupPasswordToggle() {
        window.togglePassword = (fieldId) => {
            const field = document.getElementById(fieldId);
            const icon = document.getElementById('toggleIcon');

            if (field) {
                const isPassword = field.type === 'password';
                field.type = isPassword ? 'text' : 'password';

                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }

                const toggleBtn = document.querySelector('.toggle-password');
                if (toggleBtn) {
                    toggleBtn.style.transform = 'translateY(-50%) scale(0.9) rotate(180deg)';
                    setTimeout(() => {
                        toggleBtn.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
                    }, 200);
                }
            }
        };
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target === this.usernameInput) {
                e.preventDefault();
                if (this.passwordInput) {
                    this.passwordInput.focus();
                }
            }

            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                if (this.passwordInput) {
                    window.togglePassword(this.passwordInput.id);
                }
            }
        });
    }

    animateElements() {
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

        const features = document.querySelectorAll('.feature-list li');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(-30px)';

            setTimeout(() => {
                feature.style.transition = 'all 0.5s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 800 + (index * 150));
        });

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

        this.animateStatCounters();
    }

    animateStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(element => {
            const targetText = element.dataset.target || element.textContent;
            const hasNumber = /\d+/.test(targetText);

            if (hasNumber) {
                const match = targetText.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[1]);
                    this.animateCounter(element, target, targetText);
                }
            }
        });
    }

    animateCounter(element, target, originalText) {
        const duration = 2000;
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.textContent = originalText.replace(/\d+/, current);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = originalText;

                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    handleFormSubmit(e) {
        if (this.isSubmitting) {
            e.preventDefault();
            return false;
        }

        const usernameValid = this.validateUsername();
        const passwordValid = this.validatePassword();

        if (!usernameValid || !passwordValid) {
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
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;

            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'flex';
            }
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;

            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'none';
            }
        }
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
                        type === 'success' ? 'linear-gradient(135deg, #4caf50, #388e3c)' :
                        'linear-gradient(135deg, #2196f3, #1976d2)'};
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            font-weight: 600;
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedServiceLogin = new EnhancedServiceLogin();

    setTimeout(() => {
        const firstInput = document.querySelector('input[name="username"]');
        if (firstInput) {
            firstInput.focus();
            firstInput.style.transform = 'scale(1.02)';
            setTimeout(() => {
                firstInput.style.transform = '';
            }, 300);
        }
    }, 1200);
});

// انیمیشن‌های اضافی
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animStyle);

// Export برای استفاده در سایر ماژول‌ها
window.closeAlert = function(element) {
    if (window.enhancedServiceLogin) {
        window.enhancedServiceLogin.closeAlert(element);
    }
};

console.log('🔧 Enhanced Service Expert Login System loaded successfully');