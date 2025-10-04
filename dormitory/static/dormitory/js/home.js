// ===== Enhanced Dormitory Home System =====
class DormitoryHomeSystem {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.counters = document.querySelectorAll('.stat-number[data-count]');
        this.serviceCards = document.querySelectorAll('.service-card');
        this.accessCards = document.querySelectorAll('.access-card');
        this.heroButtons = document.querySelectorAll('.hero-buttons .btn');
        this.backToTopBtn = document.getElementById('backToTop');

        this.isCounterAnimated = false;
        this.isScrolling = false;
        this.lastScrollTop = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupIntersectionObserver();
        this.setupParticles();
        this.initAnimations();
        this.setupNavbarActiveState();
        this.preloadCriticalContent();

        console.log('🏛️ SBU Dormitory System Initialized Successfully');
    }

    bindEvents() {
        // Optimized scroll handling with requestAnimationFrame
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Scroll indicator
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', this.scrollToServices.bind(this));
        }

        // Back to top button
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', this.scrollToTop.bind(this));
        }

        // Mobile menu
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.addEventListener('click', this.handleMobileMenu.bind(this));
        }

        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll.bind(this));
        });

        // Enhanced button interactions
        this.heroButtons.forEach(btn => {
            btn.addEventListener('mouseenter', this.handleButtonHover.bind(this));
            btn.addEventListener('mouseleave', this.handleButtonLeave.bind(this));
        });

        // Card interactions
        this.setupCardInteractions();

        // Window resize
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Page visibility
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';

        // Navbar effects
        if (scrollTop > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }

        // Hide/show scroll indicator
        if (this.scrollIndicator) {
            if (scrollTop > 100) {
                this.scrollIndicator.style.opacity = '0';
                this.scrollIndicator.style.pointerEvents = 'none';
            } else {
                this.scrollIndicator.style.opacity = '1';
                this.scrollIndicator.style.pointerEvents = 'auto';
            }
        }

        // Back to top button
        if (this.backToTopBtn) {
            if (scrollTop > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }

        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && scrollTop < window.innerHeight) {
            const parallaxSpeed = scrollTop * 0.5;
            heroSection.style.transform = `translateY(${parallaxSpeed}px)`;
        }

        this.lastScrollTop = scrollTop;
    }

    scrollToServices() {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            const offsetTop = servicesSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleSmoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
            }
        }
    }

    handleMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse) {
            navbarCollapse.classList.toggle('show');
        }
    }

    setupNavbarActiveState() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate counters
                    if (entry.target.classList.contains('stat-item') && !this.isCounterAnimated) {
                        this.animateCounters();
                        this.isCounterAnimated = true;
                    }

                    // Add animation class to elements
                    entry.target.classList.add('animate-in');
                }
            });
        }, options);

        // Observe elements
        const elementsToObserve = document.querySelectorAll(
            '.stat-item, .service-card, .access-card, .feature-highlight, .testimonial-card'
        );
        elementsToObserve.forEach(el => observer.observe(el));
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                const currentValue = Math.floor(current);

                if (current >= target) {
                    counter.textContent = this.formatCounterValue(counter, target);
                } else {
                    counter.textContent = this.formatCounterValue(counter, currentValue);
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }

    formatCounterValue(counter, value) {
        const label = counter.closest('.stat-item')?.querySelector('.stat-label')?.textContent;

        if (label && label.includes('Satisfaction')) {
            return value + '%';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value;
    }

    setupCardInteractions() {
        // Access cards with advanced hover effects
        this.accessCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(card, e);
            });

            card.addEventListener('mousemove', (e) => {
                this.cardTiltEffect(card, e);
            });

            card.addEventListener('mouseleave', () => {
                this.resetCardTilt(card);
            });
        });

        // Service cards
        this.serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createGlowEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeGlowEffect(card);
            });
        });
    }

    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            background: rgba(13, 110, 253, 0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple 0.8s ease-out;
            pointer-events: none;
            z-index: 0;
        `;

        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 800);
    }

    cardTiltEffect(card, event) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
    }

    resetCardTilt(card) {
        card.style.transform = '';
    }

    createGlowEffect(element) {
        element.style.boxShadow = '0 20px 50px rgba(13, 110, 253, 0.4)';
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    removeGlowEffect(element) {
        element.style.boxShadow = '';
    }

    handleButtonHover(e) {
        const button = e.currentTarget;
        button.style.transform = 'translateY(-5px) scale(1.05)';
    }

    handleButtonLeave(e) {
        const button = e.currentTarget;
        button.style.transform = '';
    }

    setupParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }

    initAnimations() {
        // Fade in elements on page load
        const animatedElements = document.querySelectorAll('.hero-content, .hero-badge');

        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Press Escape to close mobile menu
            if (e.key === 'Escape') {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
            }

            // Tab key for keyboard navigation
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add focus styles
        if (!document.querySelector('#keyboard-nav-styles')) {
            const style = document.createElement('style');
            style.id = 'keyboard-nav-styles';
            style.textContent = `
                .keyboard-navigation *:focus {
                    outline: 3px solid var(--sbu-gold) !important;
                    outline-offset: 3px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleResize() {
        this.updateMobileMenu();
    }

    updateMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (window.innerWidth > 992 && navbarCollapse) {
            navbarCollapse.classList.remove('show');
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAnimations();
        } else {
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    preloadCriticalContent() {
        // Preload critical images
        const criticalImages = [
            '/static/dormitory/images/sbu-logo.png',
            '/static/dormitory/images/sbu-dormitory.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Utility: Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Utility: Debounce function
    debounce(func, delay) {
        let debounceTimer;
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Public methods
    triggerCounterAnimation() {
        if (!this.isCounterAnimated) {
            this.animateCounters();
            this.isCounterAnimated = true;
        }
    }

    resetAnimations() {
        this.isCounterAnimated = false;
        this.counters.forEach(counter => {
            counter.textContent = '0';
        });
    }
}

// ===== Enhanced Form Validation =====
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^09\d{9}$/;
        return re.test(phone);
    }

    static validateStudentNumber(studentNumber) {
        const re = /^\d{9}$/;
        return re.test(studentNumber);
    }

    static validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return re.test(password);
    }

    static showError(input, message) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        const error = formGroup.querySelector('.error-message') || document.createElement('div');
        error.className = 'error-message text-danger small mt-1';
        error.textContent = message;

        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(error);
        }

        input.classList.add('is-invalid');
    }

    static clearError(input) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        const error = formGroup.querySelector('.error-message');
        if (error) error.remove();
        input.classList.remove('is-invalid');
    }
}

// ===== Accessibility Enhancements =====
class AccessibilityEnhancer {
    static init() {
        this.addAriaLabels();
        this.enhanceFocusIndicators();
        this.setupSkipLinks();
    }

    static addAriaLabels() {
        // Add ARIA labels to buttons without text
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Interactive button');
            }
        });

        // Add ARIA labels to icon links
        document.querySelectorAll('a:not([aria-label])').forEach(link => {
            if (!link.textContent.trim() && link.querySelector('i')) {
                link.setAttribute('aria-label', 'Navigation link');
            }
        });
    }

    static enhanceFocusIndicators() {
        // Already handled in setupKeyboardNavigation
    }

    static setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            left: -9999px;
            z-index: 999;
            padding: 1em;
            background: var(--primary-color);
            color: white;
            text-decoration: none;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.left = '0';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.left = '-9999px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// ===== Performance Monitor =====
class PerformanceMonitor {
    static init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const paint = performance.getEntriesByType('paint');

                    console.log('📊 Page Performance Metrics:', {
                        'Load Time': `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
                        'DOM Ready': `${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`,
                        'Total Load': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
                        'First Paint': paint[0] ? `${Math.round(paint[0].startTime)}ms` : 'N/A',
                        'First Contentful Paint': paint[1] ? `${Math.round(paint[1].startTime)}ms` : 'N/A'
                    });
                }, 0);
            });
        }
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main system
    window.dormitoryHome = new DormitoryHomeSystem();

    // Initialize accessibility
    AccessibilityEnhancer.init();

    // Initialize performance monitoring
    PerformanceMonitor.init();

    console.log('🎓 Welcome to Shahid Bahonar University Dormitory System');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('👋 Thanks for visiting SBU Dormitory System');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DormitoryHomeSystem,
        FormValidator,
        AccessibilityEnhancer,
        PerformanceMonitor
    };
}