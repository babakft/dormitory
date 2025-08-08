/**
 * Ticket Chat JavaScript
 * Enhanced real-time chat functionality with WebSocket integration
 */

class TicketChat {
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
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            charCount: document.getElementById('charCount'),
            closeTicketBtn: document.getElementById('closeTicketBtn')
        };

        this.init();
    }

    /**
     * Initialize the chat system
     */
    init() {
        this.connectWebSocket();
        this.bindEvents();
        this.setupCharacterCounter();
        this.setupAutoResize();
        this.setupKeyboardShortcuts();
        this.setupCloseTicketHandler();

        console.log('🚀 Ticket Chat initialized for ticket #' + this.ticketId);
    }

    /**
     * Connect to WebSocket
     */
    connectWebSocket() {
        if (this.isConnecting) return;

        this.isConnecting = true;
        this.updateConnectionStatus('connecting');

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/ticket/${this.ticketId}/`;

        console.log('🔗 Connecting to WebSocket:', wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);
            this.setupWebSocketHandlers();
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.handleConnectionError();
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupWebSocketHandlers() {
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.updateConnectionStatus('connected');
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            this.processMessageQueue();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 Received:', data);
                this.handleMessage(data);
            } catch (error) {
                console.error('❌ Error parsing message:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('❌ WebSocket disconnected:', event.code, event.reason);
            this.updateConnectionStatus('disconnected');
            this.isConnecting = false;

            // Don't attempt reconnection if the close was intentional (code 1000)
            if (event.code !== 1000) {
                this.attemptReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('🚨 WebSocket error:', error);
            this.isConnecting = false;
            this.handleConnectionError();
        };
    }

    /**
     * Handle WebSocket messages
     */
    handleMessage(data) {
        switch(data.type) {
            case 'message_history':
                this.displayMessageHistory(data.messages);
                break;
            case 'message':
                this.displayMessage(data.message);
                this.playNotificationSound();
                break;
            case 'ticket_closed':
                this.handleTicketClosed(data.message);
                break;
            case 'typing_indicator':
                this.handleTypingIndicator(data);
                break;
            case 'error':
                this.showError(data.message);
                break;
            default:
                console.log('❓ Unknown message type:', data.type);
        }
    }

    /**
     * Handle ticket closed event
     */
    handleTicketClosed(message) {
        // Disable chat input
        if (this.elements.messageInput) {
            this.elements.messageInput.disabled = true;
            this.elements.messageInput.placeholder = 'This ticket is closed';
        }
        if (this.elements.sendButton) {
            this.elements.sendButton.disabled = true;
        }

        // Show closure message
        this.showNotification(message, 'warning');
        this.updateConnectionStatus('closed');

        // Reload page to show updated UI after 3 seconds
        setTimeout(() => {
            location.reload();
        }, 3000);
    }

    /**
     * Display message history
     */
    displayMessageHistory(messages) {
        const container = this.elements.chatMessages;
        container.innerHTML = '';

        if (messages.length === 0) {
            this.showEmptyState();
        } else {
            messages.forEach(message => this.displayMessage(message, false));
        }

        this.scrollToBottom();
    }

    /**
     * Display a single message
     */
    displayMessage(message, animate = true) {
        const container = this.elements.chatMessages;

        // Remove empty state if present
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.author_type}`;

        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px)';
        }

        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = this.getAvatarText(message.author);

        // Create content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message.content;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';

        const date = new Date(message.created_at);
        const timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        infoDiv.innerHTML = `
            <span>${this.escapeHtml(message.author)}</span>
            ${message.is_admin_message ? '<span class="admin-badge">Admin</span>' : ''}
            <span>•</span>
            <span>${timeString}</span>
        `;

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(infoDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        container.appendChild(messageDiv);

        // Animate if requested
        if (animate) {
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 50);
        }

        this.scrollToBottom();
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const container = this.elements.chatMessages;
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h3 class="empty-title">No messages yet</h3>
                <p class="empty-description">Start the conversation by sending a message below!</p>
            </div>
        `;
    }

    /**
     * Send a message
     */
    async sendMessage() {
        const input = this.elements.messageInput;
        const message = input.value.trim();

        if (!message) return;

        // Validate message length
        if (message.length > 1000) {
            this.showNotification('Message is too long (max 1000 characters)', 'danger');
            return;
        }

        // Disable input temporarily
        this.setInputState(false);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('📤 Sending message:', message);

            try {
                this.ws.send(JSON.stringify({
                    type: 'chat_message',
                    message: message
                }));

                input.value = '';
                this.updateCharacterCount();
                this.resizeInput();
            } catch (error) {
                console.error('❌ Error sending message:', error);
                this.showError('Failed to send message. Please try again.');
            }
        } else {
            // Queue message if not connected
            this.messageQueue.push(message);
            this.showNotification('Message queued. Reconnecting...', 'warning');
            input.value = '';
        }

        // Re-enable input
        setTimeout(() => {
            this.setInputState(true);
            input.focus();
        }, 500);
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        if (this.messageQueue.length > 0) {
            console.log('📤 Processing queued messages:', this.messageQueue.length);

            this.messageQueue.forEach(message => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        type: 'chat_message',
                        message: message
                    }));
                }
            });

            this.messageQueue = [];
            this.showNotification('Queued messages sent!', 'success');
        }
    }

    /**
     * Setup event listeners
     */
    bindEvents() {
        // Send button click
        if (this.elements.sendButton) {
            this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Input enter key
        if (this.elements.messageInput) {
            this.elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Input events for character counting
            this.elements.messageInput.addEventListener('input', () => {
                this.updateCharacterCount();
                this.resizeInput();
                this.handleTyping();
            });

            // Focus input on load
            setTimeout(() => {
                this.elements.messageInput.focus();
            }, 500);
        }

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Page hidden - pausing chat');
            } else {
                console.log('📱 Page visible - resuming chat');
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    this.connectWebSocket();
                }
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close(1000, 'Page unload');
            }
        });
    }

    /**
     * Setup character counter
     */
    setupCharacterCounter() {
        this.updateCharacterCount();
    }

    /**
     * Update character count display
     */
    updateCharacterCount() {
        if (!this.elements.charCount || !this.elements.messageInput) return;

        const count = this.elements.messageInput.value.length;
        this.elements.charCount.textContent = count;

        // Update styling based on character count
        const counter = this.elements.charCount.parentElement;
        counter.classList.remove('warning', 'danger');

        if (count > 900) {
            counter.classList.add('danger');
        } else if (count > 800) {
            counter.classList.add('warning');
        }
    }

    /**
     * Setup auto-resize for input
     */
    setupAutoResize() {
        if (!this.elements.messageInput) return;

        this.elements.messageInput.addEventListener('input', () => {
            this.resizeInput();
        });
    }

    /**
     * Resize input based on content
     */
    resizeInput() {
        const input = this.elements.messageInput;
        if (!input) return;

        input.style.height = 'auto';
        input.style.height = Math.min(Math.max(input.scrollHeight, 50), 120) + 'px';
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to clear input
            if (e.key === 'Escape' && this.elements.messageInput) {
                this.elements.messageInput.value = '';
                this.updateCharacterCount();
                this.resizeInput();
            }

            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }

            // Ctrl/Cmd + R to refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                location.reload();
            }
        });
    }

    /**
     * Setup close ticket handler
     */
    setupCloseTicketHandler() {
        if (this.elements.closeTicketBtn) {
            this.elements.closeTicketBtn.addEventListener('click', () => {
                this.closeTicket();
            });
        }
    }

    /**
     * Close ticket functionality
     */
    async closeTicket() {
        const confirmed = confirm(
            'Are you sure you want to close this ticket?\n\n' +
            'Once closed, no more messages can be sent.'
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
                this.showNotification('Ticket closed successfully', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                throw new Error('Failed to close ticket');
            }
        } catch (error) {
            console.error('❌ Error closing ticket:', error);
            this.showError('Failed to close ticket. Please try again.');
        }
    }

    /**
     * Handle typing indicator
     */
    handleTyping() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Clear previous timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }

        // Send typing start if not already typing
        if (!this.isTyping) {
            this.isTyping = true;
            this.ws.send(JSON.stringify({
                type: 'typing_start'
            }));
        }

        // Set timer to send typing stop
        this.typingTimer = setTimeout(() => {
            this.isTyping = false;
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'typing_stop'
                }));
            }
        }, 2000);
    }

    /**
     * Handle typing indicator from other users
     */
    handleTypingIndicator(data) {
        // Implementation for showing typing indicators
        // This would show "Admin is typing..." etc.
        console.log('👀 Typing indicator:', data);
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(status) {
        const statusElement = this.elements.connectionStatus;
        const input = this.elements.messageInput;
        const sendButton = this.elements.sendButton;

        if (!statusElement) return;

        const statusContent = statusElement.querySelector('.status-content');
        const statusText = statusContent.querySelector('.status-text');

        // Update status classes
        statusElement.className = `connection-status ${status}`;

        switch(status) {
            case 'connected':
                statusText.textContent = 'Connected - Real-time chat active';
                this.setInputState(true);
                break;
            case 'closed':
                statusText.textContent = 'Ticket Closed - No messages can be sent';
                this.setInputState(false, 'This ticket is closed');
                break;
            case 'disconnected':
                statusText.textContent = 'Disconnected - Attempting to reconnect...';
                this.setInputState(false, 'Reconnecting...');
                break;
            case 'connecting':
                statusText.textContent = 'Connecting...';
                this.setInputState(false, 'Connecting...');
                break;
        }
    }

    /**
     * Set input state (enabled/disabled)
     */
    setInputState(enabled, placeholder = 'Type your message...') {
        if (this.elements.messageInput) {
            this.elements.messageInput.disabled = !enabled;
            this.elements.messageInput.placeholder = placeholder;
        }
        if (this.elements.sendButton) {
            this.elements.sendButton.disabled = !enabled;
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

            setTimeout(() => {
                if (!this.isConnecting) {
                    this.connectWebSocket();
                }
            }, delay);
        } else {
            this.updateConnectionStatus('disconnected');
            this.showError('Connection lost. Please refresh the page to continue chatting.');
        }
    }

    /**
     * Handle connection errors
     */
    handleConnectionError() {
        this.updateConnectionStatus('disconnected');
        this.showError('Unable to connect to chat server. Please check your internet connection.');
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        if (this.elements.chatMessages) {
            setTimeout(() => {
                this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
            }, 100);
        }
    }

    /**
     * Get avatar text for user
     */
    getAvatarText(author) {
        return author.charAt(0).toUpperCase();
    }

    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'danger');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
                <button type="button" class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Show with animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        // Only play sound if page is not visible
        if (document.hidden) {
            try {
                // Create a simple beep sound
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
                console.log('🔇 Could not play notification sound:', error);
            }
        }
    }

    /**
     * Destroy the chat instance
     */
    destroy() {
        if (this.ws) {
            this.ws.close(1000, 'Chat destroyed');
        }

        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }

        console.log('🗑️ Ticket Chat destroyed');
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicketChat;
}

// Additional utility styles for notifications
const notificationStyles = `
.notification-toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
}

.notification-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.alert-success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #34d399;
}

.alert-danger {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}

.alert-warning {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
}

.alert-info {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #60a5fa;
}
`;

// Inject notification styles
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);