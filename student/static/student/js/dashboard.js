/* student/static/student/js/dashboard.js - FIXED STATUS FILTERING */

/**
 * Student Dashboard Enhancements - WORKING VERSION
 */

class StudentDashboard {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎓 Initializing Student Dashboard...');

        // Initialize components
        this.initializeCardAnimations();
        this.initializeStatusFilters();  // ← FIXED THIS
        this.initializeTooltips();
        this.initializeFormEnhancements();

        console.log('✅ Dashboard loaded successfully');
    }

    // =============================================================================
    // FIXED Status Filter System
    // =============================================================================
    initializeStatusFilters() {
        console.log('🔍 Setting up status filters...');

        // Get all filter radio buttons
        const filterButtons = document.querySelectorAll('input[name="statusFilter"]');
        console.log(`Found ${filterButtons.length} filter buttons`);

        // Add event listeners to each filter button
        filterButtons.forEach(button => {
            button.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const filterValue = e.target.id;
                    console.log(`🔄 Filtering by: ${filterValue}`);
                    this.filterRequestsByStatus(filterValue);
                }
            });
        });

        // Add search functionality
        this.addRequestSearch();
    }

    filterRequestsByStatus(status) {
        // Get all request cards
        const requestCards = document.querySelectorAll('.request-card');
        console.log(`📋 Found ${requestCards.length} request cards`);

        let visibleCount = 0;

        requestCards.forEach(card => {
            // Get the status from data attribute
            const cardStatus = card.dataset.status;
            console.log(`Card status: ${cardStatus}, Filter: ${status}`);

            // Determine if card should be visible
            let shouldShow = false;

            if (status === 'all') {
                shouldShow = true;
            } else if (status === 'pending') {
                shouldShow = cardStatus === 'pending';
            } else if (status === 'in_progress') {
                shouldShow = cardStatus === 'in_progress' || cardStatus === 'approved';
            } else if (status === 'completed') {
                shouldShow = cardStatus === 'completed';
            } else if (status === 'rejected') {
                shouldShow = cardStatus === 'rejected';
            }

            // Show/hide the card with animation
            if (shouldShow) {
                card.style.display = 'block';
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';

                // Animate in
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);

                visibleCount++;
            } else {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-10px)';

                // Hide after animation
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Update filter feedback
        this.updateFilterFeedback(status, visibleCount);
    }

    updateFilterFeedback(status, count) {
        // Create or update feedback element
        let feedback = document.getElementById('filterFeedback');

        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'filterFeedback';
            feedback.className = 'alert alert-info mt-2';

            // Insert after filter buttons
            const filterContainer = document.querySelector('.btn-group');
            if (filterContainer) {
                filterContainer.parentNode.insertBefore(feedback, filterContainer.nextSibling);
            }
        }

        // Update feedback text
        const statusText = this.getStatusDisplayName(status);
        feedback.innerHTML = `
            <i class="fas fa-filter"></i>
            Showing <strong>${count}</strong> ${statusText} request${count !== 1 ? 's' : ''}
        `;

        // Auto-hide feedback after 3 seconds
        setTimeout(() => {
            if (feedback && feedback.parentNode) {
                feedback.style.opacity = '0.7';
            }
        }, 3000);
    }

    getStatusDisplayName(status) {
        const statusNames = {
            'all': 'total',
            'pending': 'pending',
            'in_progress': 'active',
            'completed': 'completed',
            'rejected': 'rejected'
        };
        return statusNames[status] || status;
    }

    addRequestSearch() {
        // Add search input above the requests
        const requestsCard = document.querySelector('.dashboard-card .card-header h5');
        if (requestsCard && !document.getElementById('requestSearch')) {
            const searchHTML = `
                <div class="mt-3 mb-2">
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" id="requestSearch"
                               placeholder="Search requests by title or description...">
                    </div>
                </div>
            `;

            requestsCard.parentNode.insertAdjacentHTML('afterend', searchHTML);

            // Add search functionality
            const searchInput = document.getElementById('requestSearch');
            searchInput.addEventListener('input', (e) => {
                this.searchRequests(e.target.value);
            });
        }
    }

    searchRequests(searchTerm) {
        const requestCards = document.querySelectorAll('.request-card');
        const term = searchTerm.toLowerCase().trim();

        let visibleCount = 0;

        requestCards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
            const searchText = title + ' ' + description;

            const shouldShow = !term || searchText.includes(term);

            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update search feedback
        this.updateSearchFeedback(term, visibleCount);
    }

    updateSearchFeedback(term, count) {
        let feedback = document.getElementById('searchFeedback');

        if (!feedback) {
            feedback = document.createElement('small');
            feedback.id = 'searchFeedback';
            feedback.className = 'text-muted d-block mb-2';

            const searchInput = document.getElementById('requestSearch');
            if (searchInput) {
                searchInput.parentNode.parentNode.insertAdjacentElement('afterend', feedback);
            }
        }

        if (term) {
            feedback.textContent = `Found ${count} request(s) matching "${term}"`;
            feedback.style.display = 'block';
        } else {
            feedback.style.display = 'none';
        }
    }

    // =============================================================================
    // Card Animations
    // =============================================================================
    initializeCardAnimations() {
        const cards = document.querySelectorAll('.dashboard-card, .stats-card, .request-card');

        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // =============================================================================
    // Tooltips
    // =============================================================================
    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));

        tooltipTriggerList.forEach(element => {
            if (!element.getAttribute('data-bs-toggle')) {
                element.setAttribute('data-bs-toggle', 'tooltip');
                new bootstrap.Tooltip(element);
            }
        });

        // Add helpful tooltips to status badges
        const statusBadges = document.querySelectorAll('[class*="status-"], .badge');
        statusBadges.forEach(badge => {
            if (!badge.hasAttribute('title')) {
                const status = badge.textContent.trim().toLowerCase();
                const tooltipText = this.getStatusTooltip(status);
                if (tooltipText) {
                    badge.setAttribute('title', tooltipText);
                    badge.setAttribute('data-bs-toggle', 'tooltip');
                    new bootstrap.Tooltip(badge);
                }
            }
        });
    }

    getStatusTooltip(status) {
        const tooltips = {
            'pending': 'Request is waiting for admin review',
            'approved': 'Request approved, awaiting expert assignment',
            'in progress': 'Work is currently being done',
            'completed': 'Request has been completed',
            'rejected': 'Request was not approved'
        };

        return tooltips[status] || null;
    }

    // =============================================================================
    // Form Enhancements
    // =============================================================================
    initializeFormEnhancements() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('a.btn, button.btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Only add loading for certain actions
                if (button.href && (button.href.includes('create') || button.href.includes('detail'))) {
                    this.addButtonLoading(button);
                }
            });
        });
    }

    addButtonLoading(button) {
        const originalText = button.textContent;
        const icon = button.querySelector('i');

        if (icon) {
            icon.className = 'fas fa-spinner fa-spin';
        }

        // Restore after 2 seconds (navigation should happen before this)
        setTimeout(() => {
            if (icon) {
                icon.className = icon.dataset.originalClass || 'fas fa-eye';
            }
            button.textContent = originalText;
        }, 2000);
    }

    // =============================================================================
    // Utility Functions
    // =============================================================================
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// =============================================================================
// Initialize Dashboard
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Create dashboard instance
    window.studentDashboard = new StudentDashboard();

    // Test filter functionality
    console.log('🧪 Testing filter buttons...');
    const filterButtons = document.querySelectorAll('input[name="statusFilter"]');
    console.log(`Filter buttons found: ${filterButtons.length}`);

    filterButtons.forEach(button => {
        console.log(`Button: ${button.id} - ${button.checked ? 'checked' : 'unchecked'}`);
    });

    console.log('🎓 Dashboard initialization complete');
});

// =============================================================================
// Global Functions
// =============================================================================
function testStatusFilter(status) {
    if (window.studentDashboard) {
        window.studentDashboard.filterRequestsByStatus(status);
    }
}

function showToast(message, type = 'info') {
    if (window.studentDashboard) {
        window.studentDashboard.showToast(message, type);
    }
}