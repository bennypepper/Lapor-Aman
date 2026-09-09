/**
 * Lapor-Aman - Main Entry Point
 * Initializes all modules and handles global UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL ERROR BOUNDARY ---
    window.addEventListener('error', (event) => {
        console.error('Unhandled Global Error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
    });

    // --- CHECK SDK & CONFIG ---
    if (typeof window.firebaseServices === 'undefined') {
        console.error("Firebase SDK tidak termuat. Pastikan skrip inisialisasi ada di index.html");
        return;
    }

    if (typeof window.APP_CONFIG === 'undefined') {
        console.error("Config tidak termuat. Pastikan config.js ada dan dimuat sebelum script utama.");
        return;
    }

    // Initialize icons
    if (window.lucide) lucide.createIcons();

    // --- SETUP SERVICES ---
    const { auth, db, storage, authMethods, dbMethods, storageMethods } = window.firebaseServices;
    const config = window.APP_CONFIG;

    const services = {
        auth,
        db,
        storage,
        authMethods,
        dbMethods,
        storageMethods
    };

    // --- INITIALIZE UI MODULE ---
    // This handles FAQ, Scroll to Top, Mobile Menu, Entrance Animations, and Form Validation UX
    const uiModuleInstance = window.uiModule?.initUI();

    // --- INITIALIZE LOGIC MODULES ---
    const authModuleInstance = window.authModule?.initAuth(services, config);
    const reportModuleInstance = window.reportModule?.initReport(services, config, authModuleInstance);
    const chatModuleInstance = window.chatModule?.initChat(services, config);
    const trackingModuleInstance = window.trackingModule?.initTracking(services, config);

    // --- ACCESSIBILITY: Keyboard Navigation (Extended) ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close auth modal if open
            if (authModuleInstance) authModuleInstance.toggleAuthModal(false);
            
            // Close chat if open
            if (chatModuleInstance?.isOpen()) chatModuleInstance.toggleChat();
            
            // Close mobile menu if open
            if (uiModuleInstance?.mobileMenu) uiModuleInstance.mobileMenu.toggleMobileMenu(false);
        }
    });

    console.log(`Lapor-Aman v${config.APP_VERSION || '1.0.0'} initialized successfully`);
});
