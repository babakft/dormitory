/* ========================================
   FINAL ADMIN ENHANCEMENTS
   dormitory/static/admin/js/admin-final-enhancements.js
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Final Admin Enhancements Loading...');

    // Force Light Theme
    forceAdminLightTheme();

    // Enhanced Table Features
    enhanceAdminTables();

    // Status Badge Creation
    createStatusBadges();

    // Priority Indicators
    createPriorityIndicators();

    // Enhanced Search
    enhanceSearchFunctionality();

    // Table Improvements
    addTableHoverEffects();

    // Mobile Enhancements
    addMobileResponsiveness();

    console.log('✅ Admin Enhancements Complete!');
});

/**
 * Force Light Theme Override
 */
function forceAdminLightTheme() {
    // Remove any dark theme classes
    document.body.classList.remove('theme-dark', 'dark-mode');
    document.documentElement.classList.remove('theme-dark', 'dark-mode');

    // Force light theme styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* Force Light Theme */
        body, #container, .module, .results, #result_list,
        .paginator, #changelist-search, #changelist-filter {
            background: white !important;
            color: #333 !important;
        }

        /* Fix Layout */
        #changelist {
            display: flex !important;
            gap: 20px !important;
            align-items: flex-start !important;
        }

        #changelist .results {
            flex: 1 !important;
            min-width: 0 !important;
        }

        #changelist-filter {
            width: 280px !important;
            flex-shrink: 0 !important;
            order: 2 !important;
        }

        #changelist-search {
            order: 1 !important;
            flex-basis: 100% !important;
        }

        /* Table Headers */
        #result_list thead th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
        }

        #result_list tbody tr {
            background: white !important;
            color: #333 !important;
        }

        #result_list tbody tr:hover {
            background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%) !important;
        }

        /* Fix Table Alignment */
        #result_list .action-checkbox-column,
        #result_list .field-id {
            width: 80px !important;
            text-align: center !important;
            vertical-align: middle !important;
        }

        #result_list .action-checkbox {
            margin: 0 auto !important;
            display: block !important;
        }

        /* Filter Text Visibility */
        #changelist-filter a {
            color: #333 !important;
            background: rgba(0,0,0,0.02) !important;
            margin-bottom: 4px !important;
        }

        #changelist-filter a:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
        }

        /* Mobile Fixes */
        @media (max-width: 768px) {
            #changelist {
                flex-direction: column !important;
            }

            #changelist-filter {
                width: 100% !important;
                order: 3 !important;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Enhanced Table Features
 */
function enhanceAdminTables() {
    const table = document.getElementById('result_list');
    if (!table) return;

    // Add table wrapper for better styling
    if (!table.closest('.enhanced-table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'enhanced-table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    }

    // Enhance table headers
    const headers = table.querySelectorAll('thead th');
    headers.forEach(header => {
        // Add sort indicators
        const link = header.querySelector('a');
        if (link && !header.classList.contains('action-checkbox-column')) {
            header.classList.add('sortable-header');

            // Add hover effect
            header.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(135deg, #5a6fd8 0%, #6b5b95 100%)';
            });

            header.addEventListener('mouseleave', function() {
                this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            });
        }
    });

    console.log('📊 Table enhancements applied');
}

/**
 * Create Status Badges
 */
function createStatusBadges() {
    // Look for status columns and enhance them
    const statusCells = document.querySelectorAll('#result_list td');

    statusCells.forEach(cell => {
        const text = cell.textContent.trim().toLowerCase();

        // Status badges
        if (text === 'pending') {
            cell.innerHTML = '<span class="status-badge status-pending">Pending</span>';
        } else if (text === 'approved') {
            cell.innerHTML = '<span class="status-badge status-approved">Approved</span>';
        } else if (text === 'in progress' || text === 'in_progress') {
            cell.innerHTML = '<span class="status-badge status-in-progress">In Progress</span>';
        } else if (text === 'completed') {
            cell.innerHTML = '<span class="status-badge status-completed">Completed</span>';
        } else if (text === 'rejected') {
            cell.innerHTML = '<span class="status-badge status-rejected">Rejected</span>';
        }
    });

    console.log('🏷️ Status badges created');
}

/**
 * Create Priority Indicators
 */
function createPriorityIndicators() {
    const priorityCells = document.querySelectorAll('#result_list td');

    priorityCells.forEach(cell => {
        const text = cell.textContent.trim().toLowerCase();

        // Priority indicators in table
        if (text === 'high') {
            cell.innerHTML = '<span class="priority-indicator priority-high">🔴 HIGH</span>';
        } else if (text === 'medium') {
            cell.innerHTML = '<span class="priority-indicator priority-medium">🟡 MEDIUM</span>';
        } else if (text === 'low') {
            cell.innerHTML = '<span class="priority-indicator priority-low">🟢 LOW</span>';
        } else if (text === 'not decided' || text === 'not_decided') {
            cell.innerHTML = '<span class="priority-indicator priority-not-decided">⚫ NOT DECIDED</span>';
        }
    });

    // Enhance priority filter links
    const filterLinks = document.querySelectorAll('#changelist-filter a');
    filterLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();

        if (text.includes('high')) {
            link.innerHTML = '🔴 ' + link.textContent;
            link.style.borderLeft = '4px solid #ff6b6b';
        } else if (text.includes('medium')) {
            link.innerHTML = '🟡 ' + link.textContent;
            link.style.borderLeft = '4px solid #ffa726';
        } else if (text.includes('low')) {
            link.innerHTML = '🟢 ' + link.textContent;
            link.style.borderLeft = '4px solid #66bb6a';
        } else if (text.includes('not decided') || text.includes('not_decided')) {
            link.innerHTML = '⚫ ' + link.textContent;
            link.style.borderLeft = '4px solid #bdbdbd';
        }
    });

    console.log('🎯 Priority indicators created');
}

/**
 * Enhanced Search Functionality
 */
function enhanceSearchFunctionality() {
    const searchBar = document.getElementById('searchbar');
    if (!searchBar) return;

    // Add search enhancements
    searchBar.setAttribute('placeholder', '🔍 Search maintenance requests...');

    // Add real-time search feedback
    let searchTimeout;
    searchBar.addEventListener('input', function() {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            if (query.length > 2) {
                // Visual feedback for search
                this.style.borderColor = '#28a745';
                this.style.backgroundColor = '#f8fff9';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.backgroundColor = 'white';
            }
        }, 300);
    });

    console.log('🔍 Search enhancements applied');
}

/**
 * Add Table Hover Effects
 */
function addTableHoverEffects() {
    const rows = document.querySelectorAll('#result_list tbody tr');

    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.005)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            this.style.zIndex = '10';
            this.style.position = 'relative';
        });

        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
            this.style.zIndex = 'auto';
            this.style.position = 'static';
        });
    });

    console.log('💫 Hover effects added');
}

/**
 * Mobile Responsiveness
 */
function addMobileResponsiveness() {
    if (window.innerWidth <= 768) {
        // Hide less important columns on mobile
        const table = document.getElementById('result_list');
        if (table) {
            const headers = table.querySelectorAll('thead th');
            const rows = table.querySelectorAll('tbody tr');

            // Hide columns beyond the 4th on mobile
            headers.forEach((header, index) => {
                if (index > 4) {
                    header.style.display = 'none';
                }
            });

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (index > 4) {
                        cell.style.display = 'none';
                    }
                });
            });
        }
    }

    console.log('📱 Mobile responsiveness applied');
}

/**
 * Add Keyboard Shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchBar = document.getElementById('searchbar');
            if (searchBar) {
                searchBar.focus();
                searchBar.select();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape') {
            const searchBar = document.getElementById('searchbar');
            if (searchBar && document.activeElement === searchBar) {
                searchBar.value = '';
                searchBar.blur();
            }
        }
    });

    console.log('⌨️ Keyboard shortcuts added');
}

/**
 * Add Loading States
 */
function addLoadingStates() {
    // Add loading state to forms
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('input[type="submit"], button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';

                // Add loading text
                const originalText = submitBtn.value || submitBtn.textContent;
                submitBtn.value = 'Processing...';
                submitBtn.textContent = 'Processing...';

                // Reset after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.value = originalText;
                    submitBtn.textContent = originalText;
                }, 5000);
            }
        });
    });

    console.log('⏳ Loading states added');
}

/**
 * Initialize all enhancements
 */
function initializeEnhancements() {
    // Add custom CSS for missing styles
    const customCSS = `
        <style>
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .status-pending {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            color: #856404;
            border: 1px solid #f5c6cb;
        }

        .status-approved {
            background: linear-gradient(135deg, #d1ecf1, #a2d2ff);
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        .status-in-progress {
            background: linear-gradient(135deg, #cce5ff, #a2d2ff);
            color: #004085;
            border: 1px solid #b8daff;
        }

        .status-completed {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status-rejected {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .priority-indicator {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            white-space: nowrap;
        }

        .priority-high {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            box-shadow: 0 2px 4px rgba(238, 90, 36, 0.3);
        }

        .priority-medium {
            background: linear-gradient(135deg, #ffa726, #ff9500);
            color: white;
            box-shadow: 0 2px 4px rgba(255, 149, 0, 0.3);
        }

        .priority-low {
            background: linear-gradient(135deg, #66bb6a, #4caf50);
            color: white;
            box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
        }

        .priority-not-decided {
            background: linear-gradient(135deg, #bdbdbd, #9e9e9e);
            color: white;
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', customCSS);
}

// Initialize everything
initializeEnhancements();
addKeyboardShortcuts();
addLoadingStates();