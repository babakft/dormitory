/**
 * چت تیکت فارسی با WebSocket - طراحی یکپارچه
 * Persian Ticket Chat with Full WebSocket Support
 */

// ===== توابع کمکی فارسی =====
const PersianChatUtils = {
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
    },

    formatTime: function(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${this.toPersianNumbers(hours.toString().padStart(2, '0'))}:${this.toPersianNumbers(minutes.toString().padStart(2, '0'))}`;
    }
};

// ===== کلاس اصلی چت =====
class PersianTicketChat {
    constructor(ticketId, csrfToken) {
        this.ticketId = ticketId;
        this.csrfToken = csrfToken;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnecting = false;
        this.messageQueue = [];
        this.typingTimer = null;
        this.isTyping = false;

        // DOM elements
        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            statusText: null,
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            charCount: document.getElementById('charCount'),
            closeTicketBtn: document.getElementById('closeTicketBtn')
        };

        this.init();
    }

    /**
     * راه‌اندازی اولیه
     */
    init() {
        console.log('💬 راه‌اندازی چت فارسی تیکت #' + this.ticketId);

        // یافتن status-text
        if (this.elements.connectionStatus) {
            this.elements.statusText = this.elements.connectionStatus.querySelector('.status-text');
        }

        this.createBeautifulBackground();
        this.animateElements();
        this.connectWebSocket();
        this.bindEvents();
        this.setupCharacterCounter();
        this.setupAutoResize();
        this.setupKeyboardShortcuts();
        this.setupCloseTicketHandler();
    }

    /**
     * ایجاد بک‌گراند زیبا
     */
    createBeautifulBackground() {
        // اشکال از قبل در HTML هستند
        // اضافه کردن افکت Parallax
        this.addParallaxEffect();
    }

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
     * انیمیشن ورود عناصر
     */
    animateElements() {
        const elements = [
            { el: document.querySelector('.chat-header'), delay: 100 },
            { el: document.querySelector('.chat-main'), delay: 250 },
            { el: document.querySelector('.chat-actions'), delay: 400 }
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

    /**
     * اتصال به WebSocket
     */
    connectWebSocket() {
        if (this.isConnecting) {
            console.log('⏳ در حال اتصال...');
            return;
        }

        this.isConnecting = true;
        this.updateConnectionStatus('connecting');

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/ticket/${this.ticketId}/`;

        console.log('🔗 اتصال به WebSocket:', wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);
            this.setupWebSocketHandlers();
        } catch (error) {
            console.error('❌ خطا در اتصال WebSocket:', error);
            this.handleConnectionError();
        }
    }

    /**
     * تنظیم هندلرهای WebSocket
     */
    setupWebSocketHandlers() {
        // اتصال موفق
        this.ws.onopen = () => {
            console.log('✅ WebSocket متصل شد');
            this.updateConnectionStatus('connected');
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            this.processMessageQueue();
        };

        // دریافت پیام
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 پیام دریافت شد:', data);
                this.handleMessage(data);
            } catch (error) {
                console.error('❌ خطا در پردازش پیام:', error);
            }
        };

        // قطع اتصال
        this.ws.onclose = (event) => {
            console.log('❌ WebSocket قطع شد:', event.code, event.reason);
            this.updateConnectionStatus('disconnected');
            this.isConnecting = false;

            // تلاش برای اتصال مجدد (به جز کدهای عمدی)
            if (event.code !== 1000 && event.code !== 1001) {
                this.attemptReconnect();
            }
        };

        // خطای اتصال
        this.ws.onerror = (error) => {
            console.error('🚨 خطای WebSocket:', error);
            this.isConnecting = false;
            this.handleConnectionError();
        };
    }

    /**
     * مدیریت پیام‌های دریافتی
     */
    handleMessage(data) {
        switch(data.type) {
            case 'message_history':
                console.log('📚 تاریخچه پیام‌ها دریافت شد');
                this.displayMessageHistory(data.messages);
                break;

            case 'chat_message':
            case 'message':
                console.log('💬 پیام جدید');
                this.displayMessage(data.message || data);
                break;

            case 'ticket_closed':
                console.log('🔒 تیکت بسته شد');
                this.handleTicketClosed(data.message);
                break;

            case 'typing_indicator':
                console.log('⌨️ نشانگر تایپ');
                this.handleTypingIndicator(data);
                break;

            case 'error':
                console.error('❌ خطا از سرور:', data.message);
                this.showNotification(data.message, 'error');
                break;

            default:
                console.log('❓ نوع پیام ناشناخته:', data.type);
        }
    }

    /**
     * نمایش تاریخچه پیام‌ها
     */
    displayMessageHistory(messages) {
        const container = this.elements.chatMessages;
        container.innerHTML = '';

        if (!messages || messages.length === 0) {
            this.showEmptyState();
        } else {
            console.log(`📝 نمایش ${messages.length} پیام`);
            messages.forEach(message => this.displayMessage(message, false));
        }

        this.scrollToBottom();
    }

    /**
     * نمایش یک پیام
     */
    displayMessage(message, animate = true) {
        const container = this.elements.chatMessages;

        // حذف empty state
        const emptyState = container.querySelector('.empty-state, .loading-state');
        if (emptyState) {
            emptyState.remove();
        }

        // ایجاد المان پیام
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.author_type || (message.is_admin_message ? 'admin' : 'user')}`;

        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px) scale(0.95)';
        }

        // آواتار
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = this.getAvatarText(message.author);

        // محتوای پیام
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message.content || message.message;

        // اطلاعات پیام
        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';

        const timeString = PersianChatUtils.formatTime(message.created_at || new Date());
        const isAdmin = message.is_admin_message || message.author_type === 'admin';

        infoDiv.innerHTML = `
            <span>${this.escapeHtml(message.author)}</span>
            ${isAdmin ? '<span class="admin-badge">مدیر</span>' : ''}
            <span>•</span>
            <span>${timeString}</span>
        `;

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(infoDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        container.appendChild(messageDiv);

        // انیمیشن
        if (animate) {
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0) scale(1)';
            }, 50);
        }

        this.scrollToBottom();

        // پخش صدای اعلان (فقط برای پیام‌های جدید)
        if (animate) {
            this.playNotificationSound();
        }
    }

    /**
     * نمایش حالت خالی
     */
    showEmptyState() {
        const container = this.elements.chatMessages;
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments empty-icon"></i>
                <h3 class="empty-title">هنوز پیامی وجود ندارد</h3>
                <p class="empty-description">اولین پیام را ارسال کنید!</p>
            </div>
        `;
    }

    /**
     * ارسال پیام
     */
    async sendMessage() {
        const input = this.elements.messageInput;
        const message = input.value.trim();

        if (!message) {
            this.showNotification('لطفاً پیامی وارد کنید', 'warning');
            return;
        }

        // بررسی طول پیام
        if (message.length > 1000) {
            this.showNotification('پیام بیش از حد طولانی است (حداکثر ۱۰۰۰ کاراکتر)', 'error');
            return;
        }

        // غیرفعال کردن موقت
        this.setInputState(false);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📤 ارسال پیام:', message);

            try {
                this.ws.send(JSON.stringify({
                    type: 'chat_message',
                    message: message
                }));

                // پاک کردن ورودی
                input.value = '';
                this.updateCharacterCount();
                this.resizeInput();

                console.log('✅ پیام ارسال شد');
            } catch (error) {
                console.error('❌ خطا در ارسال پیام:', error);
                this.showNotification('خطا در ارسال پیام. دوباره تلاش کنید.', 'error');
            }
        } else {
            // اضافه کردن به صف
            console.log('📥 اضافه به صف پیام‌ها');
            this.messageQueue.push(message);
            this.showNotification('پیام در صف قرار گرفت. در حال اتصال مجدد...', 'warning');
            input.value = '';
            this.updateCharacterCount();
        }

        // فعال کردن مجدد
        setTimeout(() => {
            this.setInputState(true);
            input.focus();
        }, 500);
    }

    /**
     * پردازش صف پیام‌ها
     */
    processMessageQueue() {
        if (this.messageQueue.length > 0) {
            console.log(`📤 ارسال ${this.messageQueue.length} پیام از صف`);

            this.messageQueue.forEach(message => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        type: 'chat_message',
                        message: message
                    }));
                }
            });

            this.messageQueue = [];
            this.showNotification('پیام‌های صف ارسال شدند!', 'success');
        }
    }

    /**
     * مدیریت بستن تیکت
     */
    handleTicketClosed(message) {
        console.log('🔒 مدیریت بستن تیکت');

        // غیرفعال کردن ورودی
        this.setInputState(false, 'این تیکت بسته شده است');
        this.updateConnectionStatus('closed');

        // نمایش اعلان
        this.showNotification(message || 'تیکت توسط مدیر بسته شد', 'warning');

        // بارگذاری مجدد صفحه بعد از 3 ثانیه
        setTimeout(() => {
            console.log('🔄 بارگذاری مجدد صفحه...');
            location.reload();
        }, 3000);
    }

    /**
     * به‌روزرسانی وضعیت اتصال
     */
    updateConnectionStatus(status) {
        const statusElement = this.elements.connectionStatus;
        const statusText = this.elements.statusText;

        if (!statusElement || !statusText) return;

        // حذف کلاس‌های قبلی
        statusElement.className = 'connection-status';
        statusElement.classList.add(status);

        const statusMessages = {
            'connected': 'متصل - چت زنده فعال است',
            'disconnected': 'قطع شده - در حال تلاش برای اتصال مجدد...',
            'connecting': 'در حال اتصال...',
            'closed': 'تیکت بسته شده - امکان ارسال پیام وجود ندارد'
        };

        statusText.textContent = statusMessages[status] || status;

        console.log(`📡 وضعیت: ${status}`);
    }

    /**
     * فعال/غیرفعال کردن ورودی
     */
    setInputState(enabled, placeholder = 'پیام خود را بنویسید...') {
        if (this.elements.messageInput) {
            this.elements.messageInput.disabled = !enabled;
            this.elements.messageInput.placeholder = placeholder;
        }
        if (this.elements.sendButton) {
            this.elements.sendButton.disabled = !enabled;
        }
    }

    /**
     * تلاش برای اتصال مجدد
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ حداکثر تلاش برای اتصال مجدد');
            this.updateConnectionStatus('disconnected');
            this.showNotification('اتصال قطع شد. لطفاً صفحه را رفرش کنید.', 'error');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

        console.log(`🔄 تلاش ${this.reconnectAttempts} برای اتصال مجدد در ${delay}ms`);

        setTimeout(() => {
            if (!this.isConnecting) {
                this.connectWebSocket();
            }
        }, delay);
    }

    /**
     * مدیریت خطای اتصال
     */
    handleConnectionError() {
        this.updateConnectionStatus('disconnected');
        this.showNotification('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
    }

    /**
     * تنظیم رویدادها
     */
    bindEvents() {
        // دکمه ارسال
        if (this.elements.sendButton) {
            this.elements.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // فشردن Enter
        if (this.elements.messageInput) {
            this.elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // به‌روزرسانی شمارنده
            this.elements.messageInput.addEventListener('input', () => {
                this.updateCharacterCount();
                this.resizeInput();
            });

            // فوکوس اولیه
            setTimeout(() => {
                this.elements.messageInput.focus();
            }, 800);
        }

        // مدیریت visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 صفحه مخفی شد');
            } else {
                console.log('📱 صفحه نمایان شد');
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    this.connectWebSocket();
                }
            }
        });

        // مدیریت خروج از صفحه
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close(1000, 'Page unload');
            }
        });
    }

    /**
     * تنظیم شمارنده کاراکتر
     */
    setupCharacterCounter() {
        this.updateCharacterCount();
    }

    updateCharacterCount() {
        if (!this.elements.charCount || !this.elements.messageInput) return;

        const count = this.elements.messageInput.value.length;
        this.elements.charCount.textContent = PersianChatUtils.toPersianNumbers(count);

        // تغییر رنگ
        const parent = this.elements.charCount.parentElement;
        if (count > 900) {
            parent.style.color = 'var(--danger)';
        } else if (count > 800) {
            parent.style.color = 'var(--warning)';
        } else {
            parent.style.color = 'var(--text-secondary)';
        }
    }

    /**
     * تنظیم تغییر اندازه خودکار
     */
    setupAutoResize() {
        if (!this.elements.messageInput) return;

        this.elements.messageInput.addEventListener('input', () => {
            this.resizeInput();
        });
    }

    resizeInput() {
        const input = this.elements.messageInput;
        if (!input) return;

        input.style.height = 'auto';
        const newHeight = Math.min(Math.max(input.scrollHeight, 50), 150);
        input.style.height = newHeight + 'px';
    }

    /**
     * میانبرهای صفحه‌کلید
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape = پاک کردن
            if (e.key === 'Escape' && this.elements.messageInput) {
                this.elements.messageInput.value = '';
                this.updateCharacterCount();
                this.resizeInput();
            }

            // Ctrl/Cmd + Enter = ارسال
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    /**
     * تنظیم دکمه بستن تیکت
     */
    setupCloseTicketHandler() {
        if (!this.elements.closeTicketBtn) return;

        this.elements.closeTicketBtn.addEventListener('click', async () => {
            const confirmed = confirm(
                'آیا مطمئن هستید که می‌خواهید این تیکت را ببندید?\n\n' +
                'پس از بستن، امکان ارسال پیام وجود نخواهد داشت.'
            );

            if (!confirmed) return;

            try {
                const response = await fetch(`/ticket/admin-chat/${this.ticketId}/close/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.csrfToken,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    this.showNotification('تیکت با موفقیت بسته شد', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    throw new Error('Failed to close ticket');
                }
            } catch (error) {
                console.error('❌ خطا در بستن تیکت:', error);
                this.showNotification('خطا در بستن تیکت. دوباره تلاش کنید.', 'error');
            }
        });
    }

    /**
     * مدیریت نشانگر تایپ
     */
    handleTypingIndicator(data) {
        console.log('⌨️ نشانگر تایپ:', data);
        // می‌توانید نمایش "در حال تایپ..." را اضافه کنید
    }

    /**
     * اسکرول به پایین
     */
    scrollToBottom() {
        if (this.elements.chatMessages) {
            setTimeout(() => {
                this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
            }, 100);
        }
    }

    /**
     * دریافت متن آواتار
     */
    getAvatarText(author) {
        return author ? author.charAt(0).toUpperCase() : '?';
    }

    /**
     * Escape کردن HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        notification.className = 'notification-toast';
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
            font-size: 0.95rem;
            animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        const icons = {
            'success': '✓',
            'error': '✕',
            'warning': '!',
            'info': 'ℹ'
        };

        notification.innerHTML = `
            <span style="font-size: 1.3rem;">${icons[type]}</span>
            <span>${this.escapeHtml(message)}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    /**
     * پخش صدای اعلان
     */
    playNotificationSound() {
        // فقط اگر صفحه مخفی است
        if (!document.hidden) return;

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
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('🔇 خطا در پخش صدا:', error);
        }
    }

    /**
     * تخریب instance
     */
    destroy() {
        console.log('🗑️ تخریب چت');

        if (this.ws) {
            this.ws.close(1000, 'Chat destroyed');
        }

        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
    }
}

// ===== راه‌اندازی =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof TICKET_ID !== 'undefined' && typeof CSRF_TOKEN !== 'undefined') {
        console.log('🚀 راه‌اندازی چت برای تیکت #' + TICKET_ID);
        window.persianTicketChat = new PersianTicketChat(TICKET_ID, CSRF_TOKEN);
    } else {
        console.error('❌ TICKET_ID یا CSRF_TOKEN تعریف نشده است!');
    }
});

// ===== انیمیشن‌های اضافی =====
if (!document.querySelector('#chat-animations')) {
    const style = document.createElement('style');
    style.id = 'chat-animations';
    style.textContent = `
        @keyframes slideInLeft {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== Export =====
window.PersianChatUtils = PersianChatUtils;

console.log('✅ ماژول چت فارسی بارگذاری شد');