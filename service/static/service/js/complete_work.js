/**
 * Start Work Form Enhancement
 * Provides interactive features for the start work form
 */

class StartWorkForm {
    constructor() {
        this.form = document.getElementById('startWorkForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.notesField = document.querySelector('#id_expert_notes');
        this.charCounter = document.getElementById('charCount');

        this.init();
    }

    init() {
        this.setupCharacterCounter();
        this.setupFormSubmission();
        this.setupAccessibility();
        console.log('Start Work Form initialized');
    }

    /**
     * Character counter for expert notes
     */
    setupCharacterCounter() {
        if (!this.notesField || !this.charCounter) return;

        const updateCounter = () => {
            const count = this.notesField.value.length;
            this.charCounter.textContent = count;
        };

        // Update on input
        this.notesField.addEventListener('input', updateCounter);
        this.notesField.addEventListener('paste', () => {
            setTimeout(updateCounter, 10);
        });

        // Initial update
        updateCounter();
    }

    /**
     * Form submission handling
     */
    setupFormSubmission() {
        if (!this.form || !this.submitBtn) return;

        this.form.addEventListener('submit', (e) => {
            // Show confirmation dialog
            const confirmed = confirm(
                'Are you ready to start work on this request?

' +
                'This will mark the request as "In Progress" and assign it to you.'
            );

            if (!confirmed) {
                e.preventDefault();
                return;
            }

            // Show loading state
            this.showLoadingState();

            // Store success message for next page
            sessionStorage.setItem('workStarted', 'true');
        });
    }

    /**
     * Show loading state on submit button
     */
    showLoadingState() {
        if (this.submitBtn) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        }
    }

    /**
     * Hide loading state on submit button
     */
    hideLoadingState() {
        if (this.submitBtn) {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels for better screen reader support
        if (this.notesField) {
            this.notesField.setAttribute('aria-describedby', 'notes-help char-counter');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e