// Persian Dormitory Management System - JavaScript

// Convert numbers to Persian
function toPersianNumbers(str) {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';

    for (let i = 0; i < englishDigits.length; i++) {
        str = str.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
    }
    return str;
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
    const startTime = Date.now();
    const startValue = 0;

    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const current = Math.floor(easeOut * target);
        element.textContent = toPersianNumbers(current.toString());

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = toPersianNumbers(target.toString());
        }
    }

    updateCounter();
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Fade in animation
            if (entry.target.classList.contains('fade-in')) {
                entry.target.classList.add('visible');
            }

            // Counter animation
            if (entry.target.classList.contains('stat-card')) {
                const counter = entry.target.querySelector('.stat-number');
                const target = parseInt(counter.getAttribute('data-target'));

                // Add delay for stagger effect
                const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                setTimeout(() => {
                    animateCounter(counter, target);
                }, delay);

                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');

    navLinks.classList.toggle('active');
    menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
}

// Dropdown menu functionality
function setupDropdown() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('active');

            // Close other dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('active');
                }
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Smooth scrolling
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Navbar scroll effect
function handleScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Observe elements for animations
    document.querySelectorAll('.fade-in, .stat-card').forEach(item => {
        observer.observe(item);
    });

    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', toggleMobileMenu);

    // Setup dropdown functionality
    setupDropdown();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target !== '#') {
                smoothScroll(target);
            }

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                const navLinks = document.getElementById('navLinks');
                if (navLinks.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navLinks = document.getElementById('navLinks');
        const menuToggle = document.getElementById('menuToggle');
        const navbar = document.querySelector('.navbar');

        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const navLinks = document.getElementById('navLinks');
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    console.log('🏛️ سامانه خوابگاه دانشگاه شهید باهنر آماده است');
});

// Form validation helper (for future use)
function validatePersianInput(input) {
    // Remove English numbers and replace with Persian
    input.value = toPersianNumbers(input.value);
}

// Utility function for showing Persian notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 20px;
        background: ${type === 'error' ? 'var(--error)' : 'var(--success)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        font-family: 'Vazirmatn', sans-serif;
        direction: rtl;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add slide in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Example usage for Persian date formatting
function formatPersianDate(date) {
    const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    // This is a simple example - you'd want to use a proper Persian calendar library
    const month = persianMonths[date.getMonth()];
    const day = toPersianNumbers(date.getDate().toString());
    const year = toPersianNumbers(date.getFullYear().toString());

    return `${day} ${month} ${year}`;
}

// Button click handlers
function handleServiceCardClick(serviceName) {
    console.log(`خدمت ${serviceName} انتخاب شد`);
    showNotification(`در حال هدایت به بخش ${serviceName}...`);

    // Here you would typically redirect to the service page
    // window.location.href = `/services/${serviceName}`;
}

// Enhanced form validation for Persian content
function validateForm(formData) {
    const errors = [];

    // Validate required fields
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('نام باید حداقل ۲ کاراکتر باشد');
    }

    // Validate Persian phone numbers
    if (formData.phone) {
        const phonePattern = /^09[0-9]{9}$/;
        if (!phonePattern.test(formData.phone)) {
            errors.push('شماره تلفن باید با ۰۹ شروع شده و ۱۱ رقم باشد');
        }
    }

    // Validate student ID
    if (formData.studentId) {
        const studentIdPattern = /^[0-9]{8,10}$/;
        if (!studentIdPattern.test(formData.studentId)) {
            errors.push('شماره دانشجویی باید بین ۸ تا ۱۰ رقم باشد');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Utility functions for working with Persian text
const PersianUtils = {
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
        // Remove extra spaces and normalize Persian characters
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
    }
};

// Loading state management
function showLoading(element) {
    const originalText = element.textContent;
    element.innerHTML = '<span class="loading-spinner"></span> در حال پردازش...';
    element.disabled = true;

    return function hideLoading() {
        element.textContent = originalText;
        element.disabled = false;
    };
}

// API call wrapper with Persian error handling
async function makeAPICall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`خطا ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(
            error.message || 'خطا در برقراری ارتباط با سرور',
            'error'
        );
        throw error;
    }
}

// Keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        if (navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    }

    // Alt + 1-5 for quick navigation
    if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const sections = ['#home', '#services', '#features', '#stats', '#contact'];
        const targetSection = sections[parseInt(e.key) - 1];
        if (targetSection) {
            smoothScroll(targetSection);
        }
    }
});

// Performance monitoring
function logPerformanceMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                console.log('Performance Metrics:', {
                    'Page Load Time': `${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`,
                    'DOM Content Loaded': `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`,
                    'Total Load Time': `${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`
                });
            }, 0);
        });
    }
}

// Initialize performance monitoring
logPerformanceMetrics();

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // You might want to send this to your error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    // You might want to send this to your error tracking service
});

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global use
window.DormitorySystem = {
    showNotification,
    toPersianNumbers,
    validateForm,
    PersianUtils,
    showLoading,
    makeAPICall,
    formatPersianDate
};