/**
 * UI Module for Lapor-Aman
 * Handles UI components, modals, and interactions
 */

/**
 * Initialize UI components
 */
function initUI() {
    // Elements
    const authModal = document.getElementById('auth-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');

    /**
     * Toggle modal visibility
     * @param {HTMLElement} modal - Modal element
     * @param {boolean} show - Show or hide
     */
    function toggleModal(modal, show) {
        if (!modal) return;
        const content = modal.firstElementChild;
        if (show) {
            modal.classList.remove('hidden');
            setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);
        } else {
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    }

    /**
     * Setup focus trap for accessibility
     * @param {HTMLElement} modalElement - Modal element
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleFocusTrap(modalElement, e) {
        const focusableElements = modalElement.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    // Setup focus trap for auth modal
    if (authModal) {
        authModal.addEventListener('keydown', (e) => {
            if (!authModal.classList.contains('hidden')) {
                handleFocusTrap(authModal, e);
            }
        });
    }

    /**
     * Initialize entrance animations
     */
    function initEntranceAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    }

    /**
     * Initialize FAQ accordion
     */
    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const wasActive = question.classList.contains('active');
                faqQuestions.forEach(q => {
                    q.classList.remove('active');
                    q.nextElementSibling.style.maxHeight = null;
                    q.querySelector('.icon-plus').classList.remove('rotate-45');
                });
                if (!wasActive) {
                    question.classList.add('active');
                    question.querySelector('.icon-plus').classList.add('rotate-45');
                    const answer = question.nextElementSibling;
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });
    }

    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-button');
        const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

        const toggleMobileMenu = (show) => {
            if (!mobileMenu || !mobileMenuOverlay) return;
            if (show) {
                mobileMenuOverlay.classList.remove('hidden');
                setTimeout(() => {
                    mobileMenuOverlay.classList.remove('opacity-0');
                    mobileMenu.classList.remove('translate-x-full');
                }, 10);
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenuOverlay.classList.add('opacity-0');
                mobileMenu.classList.add('translate-x-full');
                setTimeout(() => {
                    mobileMenuOverlay.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            }
        };

        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
        if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', () => toggleMobileMenu(false));
        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', () => toggleMobileMenu(false));

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => toggleMobileMenu(false));
        });

        return { toggleMobileMenu };
    }

    /**
     * Initialize scroll to top button
     */
    function initScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (!scrollToTopBtn) return;

        window.addEventListener('scroll', utils.debounce(() => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        }, 50));

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Initialize form validation UX
     */
    function initFormValidation() {
        const cyberInputs = document.querySelectorAll('.cyber-input');
        cyberInputs.forEach(input => {
            if (input.disabled) return;

            const validateInput = () => {
                if (!input.value && !input.required) {
                    input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
                    input.classList.remove('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/20');
                    return;
                }

                if (input.checkValidity()) {
                    input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
                    input.classList.add('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/20');
                } else {
                    input.classList.remove('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/20');
                    input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
                }
            };

            input.addEventListener('input', validateInput);
            input.addEventListener('blur', validateInput);
        });
    }

    // Initialize all UI components
    initEntranceAnimations();
    initFAQ();
    initScrollToTop();
    initFormValidation();
    const mobileMenu = initMobileMenu();

    return {
        toggleModal,
        mobileMenu
    };
}

// Export for modular usage
window.uiModule = { initUI };
