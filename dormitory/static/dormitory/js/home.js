// static/dormitory/js/home.js

class DormitoryHomeSystem {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.counters = document.querySelectorAll('.stat-number[data-count]');
        this.serviceCards = document.querySelectorAll('.service-card');
        this.accessCards = document.querySelectorAll('.access-card');
        this.heroButtons = document.querySelectorAll('.hero-buttons .btn');

        this.isCounterAnimated = false;
        this.isScrolling = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupIntersectionObserver();
        this.setupParallaxEffect();
        this.preloadCriticalContent();

        // Initialize AOS (Animate On Scroll) effects
        this.initAnimations();

        console.log('🏛️ SBU Dormitory System Initialized');
    }

    bindEvents() {
        // Scroll events
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));

        // Scroll indicator click
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', this.scrollToServices.bind(this));
        }

        // Mobile menu handling
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        if (navbarToggler) {
            navbarToggler.addEventListener('click', this.handleMobileMenu.bind(this));
        }

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll.bind(this));
        });

        // Button hover effects
        this.heroButtons.forEach(btn => {
            btn.addEventListener('mouseenter', this.handleButtonHover.bind(this));
            btn.addEventListener('mouseleave', this.handleButtonLeave.bind(this));
        });

        // Card interaction effects
        this.setupCardInteractions();

        // Window resize handling
        window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 250));

        // Page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Navbar scroll effect
        if (scrollTop > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }

        // Hide scroll indicator after scrolling
        if (scrollTop > 100 && this.scrollIndicator) {
            this.scrollIndicator.style.opacity = '0';
            this.scrollIndicator.style.pointerEvents = 'none';
        } else if (this.scrollIndicator) {
            this.scrollIndicator.style.opacity = '1';
            this.scrollIndicator.style.pointerEvents = 'auto';
        }

        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && scrollTop < window.innerHeight) {
            const parallaxSpeed = scrollTop * 0.5;
            heroSection.style.transform = `translateY(${parallaxSpeed}px)`;
        }
    }

    scrollToServices() {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            servicesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    handleSmoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    }

    handleMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse) {
            navbarCollapse.classList.toggle('show');
        }
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate counters when stats section is visible
                    if (entry.target.classList.contains('stat-item') && !this.isCounterAnimated) {
                        this.animateCounters();
                        this.isCounterAnimated = true;
                    }

                    // Animate cards when they come into view
                    if (entry.target.classList.contains('service-card') ||
                        entry.target.classList.contains('access-card')) {
                        entry.target.classList.add('animate-in');
                    }
                }
            });
        }, options);

        // Observe elements
        document.querySelectorAll('.stat-item, .service-card, .access-card').forEach(el => {
            observer.observe(el);
        });
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current >= target) {
                    if (counter.closest('.stat-item').querySelector('.stat-label').textContent === 'Satisfaction Rate') {
                        counter.textContent = target + '%';
                    } else {
                        counter.textContent = target;
                    }
                } else {
                    const currentValue = Math.floor(current);
                    if (counter.closest('.stat-item').querySelector('.stat-label').textContent === 'Satisfaction Rate') {
                        counter.textContent = currentValue + '%';
                    } else {
                        counter.textContent = currentValue;
                    }
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }

    setupCardInteractions() {
        // Access cards
        this.accessCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createRippleEffect(card);
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

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-effect');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: rgba(13, 110, 253, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.appendChild(ripple);

        // Add ripple animation keyframes if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createGlowEffect(element) {
        element.style.boxShadow = '0 15px 35px rgba(13, 110, 253, 0.3)';
        element.style.transition = 'all 0.3s ease';
    }

    removeGlowEffect(element) {
        element.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
    }

    handleButtonHover(e) {
        const button = e.currentTarget;
        button.style.transform = 'translateY(-3px) scale(1.05)';
    }

    handleButtonLeave(e) {
        const button = e.currentTarget;
        button.style.transform = 'translateY(0) scale(1)';
    }

    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.hero-section::before');

        window.addEventListener('scroll', this.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }

    initAnimations() {
        // Add entrance animations to elements
        const animatedElements = document.querySelectorAll('.hero-content, .access-card, .service-card');

        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
            element.style.transition = 'all 0.6s ease';

            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    handleResize() {
        // Recalculate any size-dependent features
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
            // Pause any running animations when tab is not visible
            this.pauseAnimations();
        } else {
            // Resume animations when tab becomes visible
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    preloadCriticalContent() {
        // Preload critical images or resources
        const criticalImages = [
            // Add any critical image URLs here
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Utility function for throttling events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Utility function for debouncing events
    debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    // Public method to manually trigger counter animation
    triggerCounterAnimation() {
        if (!this.isCounterAnimated) {
            this.animateCounters();
            this.isCounterAnimated = true;
        }
    }

    // Public method to reset animations
    resetAnimations() {
        this.isCounterAnimated = false;
        this.counters.forEach(counter => {
            counter.textContent = '0';
        });
    }
}

// Enhanced form validation for any forms on the page
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
}

// Accessibility enhancements
class AccessibilityEnhancer {
    static init() {
        // Add keyboard navigation support
        this.addKeyboardNavigation();

        // Add ARIA labels where needed
        this.addAriaLabels();

        // Add focus indicators
        this.addFocusIndicators();
    }

    static addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    static addAriaLabels() {
        // Add ARIA labels to buttons without text
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim()) {
                btn.setAttribute('aria-label', 'Interactive button');
            }
        });

        // Add ARIA labels to links
        document.querySelectorAll('a:not([aria-label])').forEach(link => {
            if (!link.textContent.trim() && link.querySelector('i')) {
                link.setAttribute('aria-label', 'Navigation link');
            }
        });
    }

    static addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance monitoring
class PerformanceMonitor {
    static init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('📊 Page Load Performance:', {
                        'Load Time': `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
                        'DOM Content Loaded': `${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`,
                        'Total Time': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`
                    });
                }, 0);
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main system
    window.dormitoryHome = new DormitoryHomeSystem();

    // Initialize accessibility enhancements
    AccessibilityEnhancer.init();

    // Initialize performance monitoring
    PerformanceMonitor.init();

    // Add any additional initialization here
    console.log('🎓 Welcome to Shahid Bahonar University Dormitory System');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up any running intervals or timeouts
    console.log('👋 Thanks for visiting SBU Dormitory System');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DormitoryHomeSystem, FormValidator, AccessibilityEnhancer };
}