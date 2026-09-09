/**
 * Authentication Module for Lapor-Aman
 * Handles user registration, login, and session management
 */

/**
 * Initialize authentication functionality
 * @param {object} services - Firebase services
 * @param {object} config - App configuration
 */
function initAuth(services, config) {
    const { auth, db, authMethods, dbMethods } = services;
    const { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } = authMethods;
    const { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, serverTimestamp } = dbMethods;
    const ENCRYPTION_KEY = config.ENCRYPTION_KEY;

    // State
    let isRegisterMode = false;
    let currentUser = null;

    // Elements
    const authModal = document.getElementById('auth-modal');
    const authModalContent = document.getElementById('auth-modal-content');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authActionButton = document.getElementById('auth-action-button');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authError = document.getElementById('auth-error');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const registerFields = document.getElementById('register-fields');
    const authNavBtn = document.getElementById('auth-nav-button');
    const authNavBtnMobile = document.getElementById('auth-nav-button-mobile');

    // Register inputs
    const regFullname = document.getElementById('reg-fullname');
    const regNik = document.getElementById('reg-nik');
    const regUsername = document.getElementById('reg-username');
    const regPhone = document.getElementById('reg-phone');
    const regDob = document.getElementById('reg-dob');
    const regGender = document.getElementById('reg-gender');
    const regAddress = document.getElementById('reg-address');

    /**
     * Toggle auth modal visibility
     * @param {boolean} show - Show or hide modal
     */
    function toggleAuthModal(show) {
        if (!authModal) return;
        if (show) {
            authModal.classList.remove('hidden');
            setTimeout(() => authModalContent.classList.remove('scale-95', 'opacity-0'), 10);
        } else {
            authModalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => authModal.classList.add('hidden'), 300);
        }
    }

    /**
     * Update auth modal UI based on mode
     */
    function updateAuthModalState() {
        if (!authTitle || !authActionButton) return;

        if (isRegisterMode) {
            authTitle.textContent = 'Daftar Akun';
            authActionButton.textContent = 'Daftar';
            if (registerFields) registerFields.classList.remove('hidden');
            if (confirmPasswordField) confirmPasswordField.classList.remove('hidden');
            const toggleText = document.getElementById('auth-toggle-text');
            if (toggleText) {
                toggleText.innerHTML = 'Sudah punya akun? <a href="#" id="auth-toggle-link" class="font-medium text-cyan-400 hover:underline">Masuk di sini</a>';
            }
        } else {
            authTitle.textContent = 'Selamat Datang';
            authActionButton.textContent = 'Masuk';
            if (registerFields) registerFields.classList.add('hidden');
            if (confirmPasswordField) confirmPasswordField.classList.add('hidden');
            const toggleText = document.getElementById('auth-toggle-text');
            if (toggleText) {
                toggleText.innerHTML = 'Belum punya akun? <a href="#" id="auth-toggle-link" class="font-medium text-cyan-400 hover:underline">Daftar sekarang</a>';
            }
        }

        // Re-attach listener to the new link
        const newLink = document.getElementById('auth-toggle-link');
        if (newLink) {
            newLink.addEventListener('click', handleAuthToggle);
        }
    }

    /**
     * Toggle between login and register mode
     * @param {Event} e - Click event
     */
    function handleAuthToggle(e) {
        if (e) e.preventDefault();
        isRegisterMode = !isRegisterMode;
        updateAuthModalState();
        if (authError) authError.classList.add('hidden');
    }

    /**
     * Handle auth form submission
     * @param {Event} e - Submit event
     */
    async function handleAuthSubmit(e) {
        e.preventDefault();
        if (authError) authError.classList.add('hidden');
        showLoading(document.getElementById('loading-overlay'), true);

        const email = emailInput?.value || '';
        const password = passwordInput?.value || '';

        try {
            if (isRegisterMode) {
                // Registration mode
                if (password !== confirmPasswordInput?.value) {
                    throw new Error("Konfirmasi password tidak cocok.");
                }

                // Validate required fields
                if (!regFullname?.value || !regNik?.value || !regUsername?.value || !regPhone?.value || !regAddress?.value) {
                    throw new Error("Semua data wajib diisi.");
                }

                // Validate NIK
                if (!utils.isValidNIK(regNik.value)) {
                    throw new Error("NIK harus terdiri dari 16 digit angka.");
                }

                // Validate phone
                if (!utils.isValidPhone(regPhone.value)) {
                    throw new Error("Nomor telepon tidak valid.");
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Encrypt sensitive data before storing
                const encryptedData = {
                    fullname: CryptoJS.AES.encrypt(regFullname.value, ENCRYPTION_KEY).toString(),
                    nik: CryptoJS.AES.encrypt(regNik.value, ENCRYPTION_KEY).toString(),
                    phone: CryptoJS.AES.encrypt(regPhone.value, ENCRYPTION_KEY).toString(),
                    address: CryptoJS.AES.encrypt(regAddress.value, ENCRYPTION_KEY).toString(),
                    dob: regDob?.value || '',
                    gender: regGender?.value || '',
                    username: regUsername.value,
                    email: email,
                    createdAt: serverTimestamp()
                };

                await setDoc(doc(db, "users", user.uid), encryptedData);
                utils.showToast("Registrasi berhasil! Silakan masuk.", "success");
                toggleAuthModal(false);
                authForm?.reset();

            } else {
                // Login mode
                await signInWithEmailAndPassword(auth, email, password);
                toggleAuthModal(false);
                utils.showToast("Berhasil masuk!", "success");
            }
        } catch (error) {
            console.error("Auth Error:", error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
            if (error.code === 'auth/wrong-password') msg = "Password salah.";
            if (error.code === 'auth/user-not-found') msg = "Akun tidak ditemukan.";
            if (error.code === 'auth/invalid-email') msg = "Email tidak valid.";
            if (error.code === 'auth/weak-password') msg = "Password terlalu lemah (min 6 karakter).";

            if (authError) {
                authError.textContent = msg;
                authError.classList.remove('hidden');
            }
            utils.showToast(msg, "error");
        } finally {
            showLoading(document.getElementById('loading-overlay'), false);
        }
    }

    /**
     * Handle auth state changes
     * @param {Function} onStateChange - Callback for state change
     */
    function setupAuthStateListener(onStateChange) {
        onAuthStateChanged(auth, async (user) => {
            currentUser = user;

            const loggedInView = document.getElementById('logged-in-view');
            const loggedOutView = document.getElementById('logged-out-view');
            const authNavBtn = document.getElementById('auth-nav-button');
            const authNavBtnMobile = document.getElementById('auth-nav-button-mobile');
            const nameInput = document.getElementById('name');
            const welcomeMessage = document.getElementById('welcome-back-message');

            if (user) {
                // User is logged in
                if (loggedOutView) loggedOutView.classList.add('hidden');
                if (loggedInView) loggedInView.classList.remove('hidden');
                if (authNavBtn) authNavBtn.textContent = 'Keluar';
                if (authNavBtnMobile) authNavBtnMobile.textContent = 'Keluar';

                // Fetch user profile
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (nameInput) nameInput.value = userData.username || user.email;
                        if (welcomeMessage) {
                            welcomeMessage.textContent = `Selamat datang, ${userData.username || user.email.split('@')[0]}!`;
                        }
                    } else {
                        if (nameInput) nameInput.value = user.email;
                        if (welcomeMessage) welcomeMessage.textContent = 'Selamat datang!';
                    }
                } catch (e) {
                    console.log("Error fetching user profile:", e);
                    if (nameInput) nameInput.value = user.email;
                    if (welcomeMessage) welcomeMessage.textContent = 'Selamat datang!';
                }

                // Trigger callback if provided
                if (onStateChange) onStateChange(user, true);

            } else {
                // User is logged out
                if (loggedOutView) loggedOutView.classList.remove('hidden');
                if (loggedInView) loggedInView.classList.add('hidden');
                if (authNavBtn) authNavBtn.textContent = 'Masuk / Daftar';
                if (authNavBtnMobile) authNavBtnMobile.textContent = 'Masuk / Daftar';

                // Trigger callback if provided
                if (onStateChange) onStateChange(null, false);
            }
        });
    }

    /**
     * Check if current user is admin
     * @returns {boolean} - True if admin
     */
    function isAdmin() {
        return currentUser?.email === config.ADMIN_EMAIL;
    }

    /**
     * Get current user
     * @returns {object|null} - Current user or null
     */
    function getCurrentUser() {
        return currentUser;
    }

    // Initialize event listeners
    if (authNavBtn) {
        authNavBtn.addEventListener('click', () => {
            if (auth.currentUser) {
                signOut(auth);
                utils.showToast("Berhasil keluar!", "success");
            } else {
                toggleAuthModal(true);
            }
        });
    }

    if (authNavBtnMobile) {
        authNavBtnMobile.addEventListener('click', () => {
            if (auth.currentUser) {
                signOut(auth);
                utils.showToast("Berhasil keluar!", "success");
            } else {
                toggleAuthModal(true);
            }
        });
    }

    if (document.getElementById('close-auth-modal')) {
        document.getElementById('close-auth-modal').addEventListener('click', () => toggleAuthModal(false));
    }

    if (document.getElementById('login-prompt-button')) {
        document.getElementById('login-prompt-button').addEventListener('click', () => toggleAuthModal(true));
    }

    if (authToggleLink) {
        authToggleLink.addEventListener('click', handleAuthToggle);
    }

    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal && !authModal.classList.contains('hidden')) {
            toggleAuthModal(false);
        }
    });

    return {
        toggleAuthModal,
        isAdmin,
        getCurrentUser,
        setupAuthStateListener
    };
}

// Export for modular usage
window.authModule = { initAuth };
