document.addEventListener('DOMContentLoaded', () => {
    // --- CEK SDK ---
    if (typeof window.firebaseServices === 'undefined') {
        console.error("Firebase SDK tidak termuat. Pastikan skrip inisialisasi ada di index.html dan dimuat sebelum script.js");
        return;
    }

    // Initialize Icons
    lucide.createIcons();

    // --- SETUP FIREBASE ---
    const { auth, db, storage, authMethods, dbMethods, storageMethods } = window.firebaseServices;
    const { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } = authMethods;
    const { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, serverTimestamp, updateDoc, arrayUnion, limit, orderBy } = dbMethods;
    const { ref, uploadBytes, getDownloadURL } = storageMethods;

    const ENCRYPTION_KEY = "YOUR_SECRET_PASSPHRASE"; //change it to your own secret key for encryption

    // --- ELEMENTS ---
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Auth Elements
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

    // Register Inputs
    const regFullname = document.getElementById('reg-fullname');
    const regNik = document.getElementById('reg-nik');
    const regUsername = document.getElementById('reg-username');
    const regPhone = document.getElementById('reg-phone');
    const regDob = document.getElementById('reg-dob');
    const regGender = document.getElementById('reg-gender');
    const regAddress = document.getElementById('reg-address');

    // Report Form
    const reportForm = document.getElementById('reportForm');
    const fileUploadInput = document.getElementById('file-upload-input');
    const fileNameDisplay = document.getElementById('file-name');
    const reportError = document.getElementById('report-error');
    const successMessage = document.getElementById('success-message');
    const nameInput = document.getElementById('name');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    // Chat
    const chatWindow = document.getElementById('chat-window');
    const chatToggleButton = document.getElementById('chat-toggle-button');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // Legal Modals Elements
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');
    const closePrivacyButtons = document.querySelectorAll('.close-privacy-modal');
    const closeTermsButtons = document.querySelectorAll('.close-terms-modal');
    
    // User Dashboard Elements
    const userDashboardList = document.getElementById('user-dashboard-list');
    const userDashboardLoading = document.getElementById('user-dashboard-loading');
    const userDashboardEmpty = document.getElementById('user-dashboard-empty');

    // Scroll to Top
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    let isRegisterMode = false;
    let turnstileToken = null; 
    let lastTicketData = null; // Store for PDF download

    // Helper Functions
    const showLoading = (show) => {
        if (loadingOverlay) loadingOverlay.classList.toggle('hidden', !show);
    };

    // --- TOAST NOTIFICATION ---
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        
        toast.innerHTML = `
            <i data-lucide="${icon}" class="w-6 h-6"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        // Remove after animation (5s total in css)
        setTimeout(() => {
            toast.remove();
        }, 5000);
    };

    // --- SCROLL TO TOP LOGIC ---
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- TURNSTILE CALLBACK ---
    window.onTurnstileSuccess = (token) => {
        console.log("Turnstile Verified");
        turnstileToken = token;
        if(reportError) reportError.classList.add('hidden');
    };

    // --- LOAD USER HISTORY ---
    const loadUserHistory = async (userId) => {
        if(!userDashboardList) return;
        
        userDashboardLoading.classList.remove('hidden');
        userDashboardList.innerHTML = '';
        userDashboardEmpty.classList.add('hidden');

        try {
            const q = query(collection(db, "reports"), where("reporterUid", "==", userId));
            const querySnapshot = await getDocs(q);

            userDashboardLoading.classList.add('hidden');

            if (querySnapshot.empty) {
                userDashboardEmpty.classList.remove('hidden');
            } else {
                // Client-side sorting because Firestore needs composite index for where + orderBy
                const reports = querySnapshot.docs.map(doc => doc.data())
                                .sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);

                reports.forEach(r => {
                    const statusColors = {
                        'BARU': 'text-blue-400',
                        'DIVERIFIKASI': 'text-yellow-400',
                        'DITINDAKLANJUTI': 'text-orange-400',
                        'SELESAI': 'text-green-400',
                        'DITOLAK': 'text-red-500 font-bold'
                    };
                    const colorClass = statusColors[r.status] || 'text-slate-400';
                    const date = r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('id-ID') : '-';

                    const item = document.createElement('div');
                    item.className = 'bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition';
                    item.innerHTML = `
                        <div class="flex justify-between items-start">
                            <span class="font-mono text-cyan-400 font-bold text-sm">${r.ticketId}</span>
                            <span class="text-xs text-slate-500">${date}</span>
                        </div>
                        <div class="mt-1 flex items-center gap-2">
                            <span class="text-xs font-semibold ${colorClass}">${r.status}</span>
                            ${r.status === 'DITOLAK' ? '<i data-lucide="x-circle" class="w-3 h-3 text-red-500"></i>' : ''}
                        </div>
                        <p class="text-xs text-slate-400 truncate mt-1">${r.websiteUrl}</p>
                    `;
                    userDashboardList.appendChild(item);
                });
                lucide.createIcons();
            }
        } catch (error) {
            console.error("Error loading history:", error);
            userDashboardLoading.innerHTML = '<span class="text-red-400 text-sm">Gagal memuat riwayat.</span>';
        }
    };

    // --- AUTH LOGIC ---
    onAuthStateChanged(auth, async (user) => {
        const loggedInView = document.getElementById('logged-in-view');
        const loggedOutView = document.getElementById('logged-out-view');
        const adminLink = document.getElementById('admin-dashboard-link');
        const adminLinkMobile = document.getElementById('admin-dashboard-link-mobile');
        const authNavBtn = document.getElementById('auth-nav-button');
        const authNavBtnMobile = document.getElementById('auth-nav-button-mobile');

        if (user) {
            if (loggedOutView) loggedOutView.classList.add('hidden');
            if (loggedInView) loggedInView.classList.remove('hidden');
            if (authNavBtn) authNavBtn.textContent = 'Keluar';
            if (authNavBtnMobile) authNavBtnMobile.textContent = 'Keluar';
            
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    if(nameInput) nameInput.value = userDoc.data().username || user.email;
                } else {
                    if(nameInput) nameInput.value = user.email;
                }
            } catch (e) {
                console.log("Error fetching user profile:", e);
                if(nameInput) nameInput.value = user.email;
            }

            if (user.email === 'example@mail.com') {
                if(adminLink) adminLink.classList.remove('hidden');
                if(adminLinkMobile) adminLinkMobile.classList.remove('hidden');
            }

            // Load User History Dashboard
            loadUserHistory(user.uid);

        } else {
            if (loggedOutView) loggedOutView.classList.remove('hidden');
            if (loggedInView) loggedInView.classList.add('hidden');
            if (authNavBtn) authNavBtn.textContent = 'Masuk / Daftar';
            if (authNavBtnMobile) authNavBtnMobile.textContent = 'Masuk / Daftar';
            if(adminLink) adminLink.classList.add('hidden');
            if(adminLinkMobile) adminLinkMobile.classList.add('hidden');
        }
    });

    const toggleAuthModal = (show) => {
        if (!authModal) return;
        if (show) {
            authModal.classList.remove('hidden');
            setTimeout(() => authModalContent.classList.remove('scale-95', 'opacity-0'), 10);
        } else {
            authModalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => authModal.classList.add('hidden'), 300);
        }
    };

    if (document.getElementById('auth-nav-button')) {
        document.getElementById('auth-nav-button').addEventListener('click', () => {
            if (auth.currentUser) signOut(auth);
            else toggleAuthModal(true);
        });
    }
    if (document.getElementById('auth-nav-button-mobile')) {
        document.getElementById('auth-nav-button-mobile').addEventListener('click', () => {
            if (auth.currentUser) signOut(auth);
            else toggleAuthModal(true);
        });
    }

    if (document.getElementById('close-auth-modal')) document.getElementById('close-auth-modal').addEventListener('click', () => toggleAuthModal(false));
    if (document.getElementById('login-prompt-button')) document.getElementById('login-prompt-button').addEventListener('click', () => toggleAuthModal(true));

    // --- FIX AUTH TOGGLE ---
    const updateAuthModalState = () => {
        if (isRegisterMode) {
            authTitle.textContent = 'Daftar Akun';
            authActionButton.textContent = 'Daftar';
            registerFields.classList.remove('hidden');
            confirmPasswordField.classList.remove('hidden');
            document.getElementById('auth-toggle-text').innerHTML = 'Sudah punya akun? <a href="#" id="auth-toggle-link" class="font-medium text-cyan-400 hover:underline">Masuk di sini</a>';
        } else {
            authTitle.textContent = 'Selamat Datang';
            authActionButton.textContent = 'Masuk';
            registerFields.classList.add('hidden');
            confirmPasswordField.classList.add('hidden');
            document.getElementById('auth-toggle-text').innerHTML = 'Belum punya akun? <a href="#" id="auth-toggle-link" class="font-medium text-cyan-400 hover:underline">Daftar sekarang</a>';
        }

        // Re-attach listener to the NEW link element created by innerHTML
        const newLink = document.getElementById('auth-toggle-link');
        if(newLink) {
             newLink.addEventListener('click', handleAuthToggle);
        }
    };

    const handleAuthToggle = (e) => {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        updateAuthModalState();
    };

    if (authToggleLink) {
        authToggleLink.addEventListener('click', handleAuthToggle);
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            authError.classList.add('hidden');
            showLoading(true);

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                if (isRegisterMode) {
                    if (password !== confirmPasswordInput.value) throw new Error("Konfirmasi password tidak cocok.");
                    if (!regFullname.value || !regNik.value || !regUsername.value || !regPhone.value || !regAddress.value) {
                        throw new Error("Semua data wajib diisi.");
                    }

                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    const encryptedData = {
                        fullname: CryptoJS.AES.encrypt(regFullname.value, ENCRYPTION_KEY).toString(),
                        nik: CryptoJS.AES.encrypt(regNik.value, ENCRYPTION_KEY).toString(),
                        phone: CryptoJS.AES.encrypt(regPhone.value, ENCRYPTION_KEY).toString(),
                        address: CryptoJS.AES.encrypt(regAddress.value, ENCRYPTION_KEY).toString(),
                        dob: regDob.value,
                        gender: regGender.value,
                        username: regUsername.value,
                        email: email,
                        createdAt: serverTimestamp()
                    };

                    await setDoc(doc(db, "users", user.uid), encryptedData);
                    showToast("Registrasi berhasil! Silakan masuk.", "success");
                    toggleAuthModal(false);
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                    toggleAuthModal(false);
                    showToast("Berhasil masuk!", "success");
                }
            } catch (error) {
                console.error("Auth Error:", error);
                let msg = error.message;
                if (error.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
                if (error.code === 'auth/wrong-password') msg = "Password salah.";
                if (error.code === 'auth/user-not-found') msg = "Akun tidak ditemukan.";
                authError.textContent = msg;
                authError.classList.remove('hidden');
                showToast(msg, "error");
            } finally {
                showLoading(false);
            }
        });
    }

    // --- LEGAL MODALS LOGIC ---
    function toggleModal(modal, show) {
        if(!modal) return;
        const content = modal.firstElementChild;
        if (show) {
            modal.classList.remove('hidden');
            setTimeout(() => content.classList.remove('scale-95', 'opacity-0'), 10);
        } else {
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    }

    if (privacyLink) privacyLink.addEventListener('click', (e) => { e.preventDefault(); toggleModal(privacyModal, true); });
    if (termsLink) termsLink.addEventListener('click', (e) => { e.preventDefault(); toggleModal(termsModal, true); });

    closePrivacyButtons.forEach(btn => btn.addEventListener('click', () => toggleModal(privacyModal, false)));
    closeTermsButtons.forEach(btn => btn.addEventListener('click', () => toggleModal(termsModal, false)));

    // Close on click outside
    [privacyModal, termsModal].forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) toggleModal(modal, false);
            });
        }
    });

    // --- PERBAIKAN UPLOAD GAMBAR (FIXED RACE CONDITION) ---
    async function compressAndStripMetadata(file) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout: Proses gambar terlalu lama.")), 5000); 

            if (!file.type.startsWith('image/')) {
                clearTimeout(timeout);
                reject(new Error("File bukan gambar."));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const MAX_WIDTH = 1280; 
                    const MAX_HEIGHT = 1280;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        clearTimeout(timeout);
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas toBlob failed."));
                        }
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = () => { clearTimeout(timeout); reject(new Error("Image load failed.")); };
                img.src = event.target.result;
            };
            
            reader.onerror = () => { clearTimeout(timeout); reject(new Error("FileReader failed.")); };
            reader.readAsDataURL(file);
        });
    }

    // --- PROFESSIONAL PDF GENERATION LOGIC (UPDATED) ---
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            if (!lastTicketData || !window.jspdf) return;
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // --- 1. NEW COLORS (Navy Brand) ---
            const navyColor = [15, 23, 42]; // Slate-900 (Brand Color)
            const grayColor = [100, 116, 139]; // Slate-500
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const centerX = pageWidth / 2;
            const margin = 15;
            const footerHeight = 40; // Height reserved for footer
            const maxPageY = pageHeight - margin - footerHeight; // Safe drawing limit

            // Helper to Draw Border
            const drawBorder = () => {
                doc.setLineWidth(1.5);
                doc.setDrawColor(...navyColor);
                doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            };

            // Start First Page
            drawBorder();

            // --- 2. UPDATED HEADER (LaporAman + Navy) ---
            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(...navyColor); // Changed from Green to Navy
            doc.text("LaporAman", centerX, 25, null, null, "center"); // Changed text case

            // Subtitle
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...grayColor);
            doc.text("Platform Pengaduan Resmi Aktivitas Judi Online Indonesia", centerX, 32, null, null, "center");
            doc.text("Didukung oleh Komdigi & POLRI", centerX, 37, null, null, "center");

            // Separator Line
            doc.setLineWidth(0.5);
            doc.setDrawColor(200);
            doc.line(margin, 45, pageWidth - margin, 45); 

            // --- DOCUMENT TITLE ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("BUKTI TANDA TERIMA LAPORAN", centerX, 60, null, null, "center");

            // --- TICKET BOX (Border updated to Navy) ---
            const boxY = 70;
            const boxHeight = 25;
            const boxWidth = 140;
            const boxX = (pageWidth - boxWidth) / 2;

            doc.setFillColor(241, 245, 249); // Slate-100 bg
            doc.setDrawColor(...navyColor); // Navy Border
            doc.setLineWidth(0.5);
            doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

            doc.setFontSize(10);
            doc.setTextColor(...grayColor);
            doc.text("NOMOR TIKET:", centerX, boxY + 8, null, null, "center");

            doc.setFont("courier", "bold");
            doc.setFontSize(18);
            doc.setTextColor(...navyColor);
            doc.text(lastTicketData.ticketId, centerX, boxY + 18, null, null, "center");

            // --- DETAILS SECTION ---
            let yPos = 110;
            const leftColX = 25;
            const rightColX = 85;
            const maxRightWidth = pageWidth - rightColX - 25;

            const printRow = (label, value) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(...navyColor);
                doc.text(label, leftColX, yPos);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(60);
                
                // Wrap text
                const splitValue = doc.splitTextToSize(value, maxRightWidth);
                doc.text(splitValue, rightColX, yPos);
                
                // Calculate next Y position
                yPos += (splitValue.length * 6) + 8; 
            };

            printRow("Tanggal Pelaporan:", new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }));
            printRow("Status Awal:", "DITERIMA / MENUNGGU VERIFIKASI");
            printRow("Kategori:", "Perjudian Online");
            
            // Divider
            yPos += 5;
            doc.setDrawColor(230);
            doc.line(leftColX, yPos, pageWidth - 25, yPos);
            yPos += 15;

            printRow("URL / Website:", lastTicketData.website);

            // --- 3. DYNAMIC "KETERANGAN" (MULTI-PAGE LOGIC) ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...navyColor);
            doc.text("Keterangan:", leftColX, yPos);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60);

            // Split the long description
            const detailsText = doc.splitTextToSize(lastTicketData.details, maxRightWidth);
            
            // Loop through each line of the description
            for (let i = 0; i < detailsText.length; i++) {
                // If we are getting too close to the footer area (collision risk)
                if (yPos > maxPageY) {
                    doc.addPage(); // Create new page
                    drawBorder(); // Draw border on new page
                    yPos = 30; // Reset Y position to top of new page
                }
                
                doc.text(detailsText[i], rightColX, yPos);
                yPos += 6; // Move down for next line
            }

            // --- FOOTER FUNCTION ---
            const drawFooter = () => {
                const footerYStart = pageHeight - 45; // Fixed position at bottom
                
                doc.setLineWidth(0.5);
                doc.setDrawColor(200);
                doc.line(margin, footerYStart, pageWidth - margin, footerYStart);

                doc.setFontSize(8);
                doc.setTextColor(150);
                const disclaimer = [
                    "PERHATIAN:",
                    "1. Dokumen ini adalah bukti sah bahwa laporan Anda telah tercatat di sistem kami.",
                    "2. Simpan Nomor Tiket Anda untuk memantau status tindak lanjut melalui fitur 'Lacak Laporan'.",
                    "3. Laporan palsu dapat dikenakan sanksi sesuai dengan UU ITE yang berlaku di Indonesia."
                ];
                
                let disY = footerYStart + 10;
                disclaimer.forEach(line => {
                    doc.text(line, 20, disY);
                    disY += 5;
                });

                // Timestamp
                doc.text(`Dicetak otomatis pada: ${new Date().toLocaleString()}`, pageWidth - 20, pageHeight - 15, null, null, "right");
            };

            // Draw footer ONLY on the last page (or current page after loop)
            drawFooter();

            // Save
            doc.save(`LaporAman_Tiket_${lastTicketData.ticketId}.pdf`);
            showToast("PDF berhasil diunduh!", "success");
        });
    }

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            reportError.classList.add('hidden');

            if (!auth.currentUser) {
                toggleAuthModal(true);
                return;
            }

            const formData = new FormData(reportForm);
            const turnstileResponse = formData.get('cf-turnstile-response');
            
            if (!turnstileResponse && !turnstileToken) {
               showToast("Mohon selesaikan CAPTCHA.", "error");
               return;
            }

            showLoading(true);
            
            const website = document.getElementById('website').value;
            const details = document.getElementById('report_details').value;
            const isAnonymous = document.getElementById('anonymous').checked;
            const file = fileUploadInput.files[0];
            let evidenceUrl = null;

            try {
                if (file) {
                    if (file.size > 5 * 1024 * 1024) throw new Error("File terlalu besar (Max 5MB).");

                    let finalBlob;
                    try {
                        console.log("Memulai kompresi gambar...");
                        finalBlob = await compressAndStripMetadata(file);
                        console.log("Kompresi berhasil.");
                    } catch (compressErr) {
                        console.warn("Kompresi gagal/timeout, mencoba upload file asli:", compressErr);
                        finalBlob = file; 
                    }
                    
                    if (!finalBlob) finalBlob = file;

                    console.log("Memulai upload ke Storage...");
                    const storageRef = ref(storage, `evidence/${Date.now()}_img.jpg`);
                    const snapshot = await uploadBytes(storageRef, finalBlob);
                    console.log("Upload berhasil, mengambil URL...");
                    evidenceUrl = await getDownloadURL(snapshot.ref);
                }

                const ticketId = `LP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;
                
                let reporterName = "User";
                if (isAnonymous) {
                    reporterName = "Anonim";
                } else {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    if (userDoc.exists()) reporterName = userDoc.data().username || auth.currentUser.email;
                }

                await addDoc(collection(db, "reports"), {
                    ticketId,
                    reporterUid: auth.currentUser.uid,
                    reporterEmail: auth.currentUser.email,
                    reporterName,
                    websiteUrl: website,
                    details,
                    evidenceUrl,
                    status: "BARU",
                    createdAt: serverTimestamp(),
                    statusHistory: [{ status: "BARU", timestamp: new Date() }]
                });

                // Simpan data untuk PDF
                lastTicketData = {
                    ticketId,
                    website,
                    details
                };

                reportForm.reset();
                fileNameDisplay.textContent = "";
                if (window.turnstile) window.turnstile.reset();
                turnstileToken = null;
                
                document.getElementById('success-ticket-id').textContent = ticketId;
                successMessage.classList.remove('hidden');
                showToast("Laporan berhasil dikirim!", "success");
                
                loadUserHistory(auth.currentUser.uid);

            } catch (error) {
                console.error("Report Error:", error);
                // Deteksi error CORS
                if (error.code === 'storage/unknown' || error.message.includes('network')) {
                    reportError.textContent = "Gagal upload: Masalah koneksi atau konfigurasi server (CORS).";
                } else {
                    reportError.textContent = "Gagal: " + (error.message || "Kesalahan jaringan.");
                }
                reportError.classList.remove('hidden');
                showToast("Gagal mengirim laporan. Cek log.", "error");
            } finally {
                showLoading(false); 
            }
        });
        
        fileUploadInput.addEventListener('change', function() {
            if(this.files.length > 0) fileNameDisplay.textContent = this.files[0].name;
        });
    }

    // --- CHAT LOGIC (SMART CONTEXT) ---
    const toggleChat = () => {
        if (!chatWindow) return;
        const isHidden = chatWindow.classList.contains('hidden');
        if (isHidden) {
            chatWindow.classList.remove('hidden');
            setTimeout(() => chatWindow.classList.remove('opacity-0', 'translate-y-4'), 10);
        } else {
            chatWindow.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => chatWindow.classList.add('hidden'), 300);
        }
    };
    if (chatToggleButton) chatToggleButton.addEventListener('click', toggleChat);
    if (closeChatButton) closeChatButton.addEventListener('click', toggleChat);

    // --- SMART AI RESPONSE FUNCTION ---
    async function getGeminiResponse(userQuery) {
        
        const apiKey = "YOUR_GEMINI_API_KEY"; // Replace with your own key for local testing
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        // 1. Build Context
        let userContext = "Pengguna belum login.";
        if (auth.currentUser) {
            userContext = `Pengguna Login: ID ${auth.currentUser.uid}, Email ${auth.currentUser.email}.`;
            
            // Try to get Name
            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    userContext += ` Username: ${userDoc.data().username || 'Tidak ada'}.`;
                }
                
                // Try to get LATEST report status
                const q = query(collection(db, "reports"), where("reporterUid", "==", auth.currentUser.uid), orderBy("createdAt", "desc"), limit(1));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const r = snap.docs[0].data();
                    userContext += ` Laporan Terakhir: Tiket ${r.ticketId}, Status ${r.status}, Website ${r.websiteUrl}.`;
                } else {
                    userContext += " Pengguna belum pernah melapor.";
                }
            } catch (e) {
                console.warn("Gagal ambil konteks:", e);
            }
        }

        // 2. System Prompt with Context
        const systemPrompt = `
        Anda adalah CS Virtual untuk "LaporAman", platform resmi pelaporan judi online di Indonesia.
        
        Tugas Anda:
        1. Menjawab pertanyaan seputar cara melapor, keamanan data, dan status laporan.
        2. Bersikap sopan, formal namun ramah, dan membantu.
        3. Gunakan data konteks di bawah untuk menjawab pertanyaan spesifik user (misal: "apa status laporan saya?").
        4. JANGAN menjawab hal di luar topik judi online atau keamanan siber.
        5. Gunakan format Markdown (bold, list) agar jawaban mudah dibaca.

        Konteks Data Pengguna Saat Ini:
        ${userContext}
        `;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: userQuery }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                })
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content) {
                 return result.candidates[0].content.parts[0].text;
            }
            return "Maaf, sistem sedang sibuk atau tidak mengerti pertanyaan Anda.";
        } catch (error) { return "Terjadi gangguan koneksi pada sistem AI."; }
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userInput = chatInput.value.trim();
            if (!userInput) return;
            
            // Render User Chat
            chatMessages.innerHTML += `
                <div class="flex justify-end mb-4">
                    <div class="bg-cyan-800 text-white p-3 rounded-l-lg rounded-br-lg max-w-xs text-sm">
                        ${userInput}
                    </div>
                </div>`;
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            typingIndicator.classList.remove('hidden');
            
            // Get Response
            const reply = await getGeminiResponse(userInput);
            
            // --- PARSE MARKDOWN TO HTML ---
            // Pastikan marked.js sudah dimuat di index.html
            let replyHtml = reply;
            if (typeof marked !== 'undefined' && marked.parse) {
                replyHtml = marked.parse(reply);
            } else {
                console.warn("Marked.js belum termuat, menampilkan text biasa.");
            }
            
            typingIndicator.classList.add('hidden');
            
            // Render Bot Chat
            chatMessages.innerHTML += `
                <div class="flex justify-start mb-4">
                    <div class="chat-bubble bg-slate-700 text-slate-200 p-3 rounded-r-lg rounded-bl-lg max-w-xs text-sm">
                        ${replyHtml}
                    </div>
                </div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // --- TRACKING LOGIC ---
    const trackBtn = document.getElementById('track-btn');
    if (trackBtn) {
        trackBtn.addEventListener('click', async () => {
            const ticketId = document.getElementById('ticket-input').value.trim();
            const container = document.getElementById('tracking-result-container');
            
            if(!ticketId) {
                showToast("Masukkan ID tiket!", "error");
                return;
            }
            showLoading(true);
            container.innerHTML = '';

            try {
                const q = query(collection(db, "reports"), where("ticketId", "==", ticketId));
                const snap = await getDocs(q);
                
                if (snap.empty) {
                    container.innerHTML = `<div class="p-4 bg-red-900/50 text-red-200 rounded-lg text-center">Tiket tidak ditemukan.</div>`;
                    showToast("Tiket tidak ditemukan", "error");
                } else {
                    const data = snap.docs[0].data();
                    
                    // --- STATUS LOGIC FOR TRACKING ---
                    let statusHtml = `<span class="text-cyan-400">${data.status}</span>`;
                    let cardBorder = "border-slate-700";

                    if (data.status === 'DITOLAK') {
                        // Jika DITOLAK: Teks merah, ada ikon X, kotak merah
                        statusHtml = `<span class="text-red-500 flex items-center gap-2">DITOLAK <i data-lucide="x-circle" class="w-5 h-5"></i></span>`;
                        cardBorder = "border-red-600 bg-red-900/20";
                    } else if (data.status === 'SELESAI') {
                        statusHtml = `<span class="text-green-400">${data.status}</span>`;
                    }

                    container.innerHTML = `
                        <div class="card-bg p-6 rounded-xl border ${cardBorder}">
                            <h3 class="text-xl font-bold text-white mb-2 flex items-center gap-2">Status: ${statusHtml}</h3>
                            <p class="text-slate-400 text-sm">Tiket: ${data.ticketId}</p>
                            <p class="text-slate-400 text-sm mt-1">Website: ${data.websiteUrl}</p>
                            <div class="mt-4 pt-4 border-t border-slate-700">
                                <p class="text-xs text-slate-500">Terakhir diperbarui: ${data.statusHistory ? new Date(data.statusHistory[data.statusHistory.length-1].timestamp.seconds * 1000).toLocaleString() : '-'}</p>
                            </div>
                        </div>
                    `;
                    lucide.createIcons(); // Re-init icons for the X circle
                    showToast("Laporan ditemukan", "success");
                }
            } catch (e) {
                console.error(e);
                container.innerHTML = `<div class="text-red-400">Terjadi kesalahan saat melacak.</div>`;
                showToast("Error saat melacak", "error");
            } finally {
                showLoading(false);
            }
        });
    }

    // FAQ & Mobile Menu
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

    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => document.getElementById('mobile-menu').classList.toggle('hidden'));
});