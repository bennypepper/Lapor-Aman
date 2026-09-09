/**
 * Report Module for Lapor-Aman
 * Handles report submission, file upload, and PDF generation
 */

/**
 * Initialize report functionality
 * @param {object} services - Firebase services
 * @param {object} config - App configuration
 * @param {object} authModule - Auth module instance
 */
function initReport(services, config, authModule) {
    const { auth, db, storage, dbMethods, storageMethods } = services;
    const { collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp, orderBy, limit } = dbMethods;
    const { ref, uploadBytes, getDownloadURL } = storageMethods;

    // Elements
    const reportForm = document.getElementById('reportForm');
    const fileUploadInput = document.getElementById('file-upload-input');
    const fileNameDisplay = document.getElementById('file-name');
    const reportError = document.getElementById('report-error');
    const successMessage = document.getElementById('success-message');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const userDashboardList = document.getElementById('user-dashboard-list');
    const userDashboardLoading = document.getElementById('user-dashboard-loading');
    const userDashboardEmpty = document.getElementById('user-dashboard-empty');

    // State
    let lastTicketData = null;
    let turnstileToken = null;
    const rateLimiter = new utils.RateLimiter();

    /**
     * Handle file upload input change
     */
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
            }
        });
    }

    /**
     * Generate PDF report
     */
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            if (!lastTicketData || !window.jspdf) {
                utils.showToast("Data tiket tidak tersedia", "error");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Colors
            const navyColor = [15, 23, 42];
            const grayColor = [100, 116, 139];
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const centerX = pageWidth / 2;
            const margin = 15;
            const footerHeight = 40;
            const maxPageY = pageHeight - margin - footerHeight;

            // Draw border
            const drawBorder = () => {
                doc.setLineWidth(1.5);
                doc.setDrawColor(...navyColor);
                doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            };

            drawBorder();

            // Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(...navyColor);
            doc.text("LaporAman", centerX, 25, null, null, "center");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...grayColor);
            doc.text("Platform Pengaduan Resmi Aktivitas Judi Online Indonesia", centerX, 32, null, null, "center");
            doc.text("Didukung oleh Komdigi & POLRI", centerX, 37, null, null, "center");

            // Separator
            doc.setLineWidth(0.5);
            doc.setDrawColor(200);
            doc.line(margin, 45, pageWidth - margin, 45);

            // Ticket box
            const boxY = 70;
            const boxHeight = 25;
            const boxWidth = 140;
            const boxX = (pageWidth - boxWidth) / 2;

            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(...navyColor);
            doc.setLineWidth(0.5);
            doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

            doc.setFontSize(10);
            doc.setTextColor(...grayColor);
            doc.text("NOMOR TIKET:", centerX, boxY + 8, null, null, "center");

            doc.setFont("courier", "bold");
            doc.setFontSize(18);
            doc.setTextColor(...navyColor);
            doc.text(lastTicketData.ticketId, centerX, boxY + 18, null, null, "center");

            // Details
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

                const splitValue = doc.splitTextToSize(value, maxRightWidth);
                doc.text(splitValue, rightColX, yPos);

                yPos += (splitValue.length * 6) + 8;
            };

            printRow("Tanggal Pelaporan:", new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }));
            printRow("Status Awal:", "DITERIMA / MENUNGGU VERIFIKASI");
            printRow("Kategori:", "Perjudian Online");
            yPos += 5;
            doc.setDrawColor(230);
            doc.line(leftColX, yPos, pageWidth - 25, yPos);
            yPos += 15;
            printRow("URL / Website:", lastTicketData.website);

            // Multi-page description
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...navyColor);
            doc.text("Keterangan:", leftColX, yPos);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(60);

            const detailsText = doc.splitTextToSize(lastTicketData.details, maxRightWidth);

            for (let i = 0; i < detailsText.length; i++) {
                if (yPos > maxPageY) {
                    doc.addPage();
                    drawBorder();
                    yPos = 30;
                }
                doc.text(detailsText[i], rightColX, yPos);
                yPos += 6;
            }

            // Footer
            const drawFooter = () => {
                const footerYStart = pageHeight - 45;
                doc.setLineWidth(0.5);
                doc.setDrawColor(200);
                doc.line(margin, footerYStart, pageWidth - margin, footerYStart);

                doc.setFontSize(8);
                doc.setTextColor(150);
                const disclaimer = [
                    "PERHATIAN:",
                    "1. Dokumen ini adalah bukti sah bahwa laporan Anda telah tercatat di sistem kami.",
                    "2. Simpan Nomor Tiket untuk memantau status tindak lanjut.",
                    "3. Laporan palsu dapat dikenakan sanksi sesuai dengan UU ITE."
                ];

                let disY = footerYStart + 10;
                disclaimer.forEach(line => {
                    doc.text(line, 20, disY);
                    disY += 5;
                });

                doc.text(`Dicetak otomatis pada: ${new Date().toLocaleString()}`, pageWidth - 20, pageHeight - 15, null, null, "right");
            };

            drawFooter();
            doc.save(`LaporAman_Tiket_${lastTicketData.ticketId}.pdf`);
            utils.showToast("PDF berhasil diunduh!", "success");
        });
    }

    /**
     * Load user report history
     * @param {string} userId - User ID
     */
    async function loadUserHistory(userId) {
        if (!userDashboardList) return;

        userDashboardLoading?.classList.remove('hidden');
        userDashboardList.innerHTML = '';
        userDashboardEmpty?.classList.add('hidden');

        try {
            const q = query(collection(db, "reports"), where("reporterUid", "==", userId));
            const querySnapshot = await getDocs(q);

            userDashboardLoading?.classList.add('hidden');

            if (querySnapshot.empty) {
                userDashboardEmpty?.classList.remove('hidden');
            } else {
                const reports = querySnapshot.docs.map(doc => doc.data())
                    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

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
                if (window.lucide) lucide.createIcons();
            }
        } catch (error) {
            console.error("Error loading history:", error);
            if (userDashboardLoading) {
                userDashboardLoading.innerHTML = '<span class="text-red-400 text-sm">Gagal memuat riwayat.</span>';
            }
        }
    }

    /**
     * Handle report form submission
     */
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (reportError) reportError.classList.add('hidden');

            // Check rate limit
            const rateCheck = rateLimiter.isAllowed('report', config.RATE_LIMITS?.FORM_SUBMISSION || 60000);
            if (!rateCheck.allowed) {
                utils.showToast(`Tunggu ${rateCheck.remaining} detik sebelum mengirim lagi`, "error");
                return;
            }

            if (!auth.currentUser) {
                authModule.toggleAuthModal(true);
                return;
            }

            const formData = new FormData(reportForm);
            const turnstileResponse = formData.get('cf-turnstile-response');

            if (!turnstileResponse && !turnstileToken) {
                utils.showToast("Mohon selesaikan CAPTCHA.", "error");
                return;
            }

            showLoading(document.getElementById('loading-overlay'), true);

            const website = document.getElementById('website')?.value || '';
            const details = document.getElementById('report_details')?.value || '';
            const isAnonymous = document.getElementById('anonymous')?.checked || false;
            const file = fileUploadInput?.files[0];
            let evidenceUrl = null;

            try {
                // Upload file if exists
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error("File terlalu besar (Max 5MB).");
                    }

                    let finalBlob;
                    try {
                        finalBlob = await utils.compressImage(file);
                    } catch (compressErr) {
                        console.warn("Kompresi gagal, upload file asli:", compressErr);
                        finalBlob = file;
                    }

                    if (!finalBlob) finalBlob = file;

                    const storageRef = ref(storage, `evidence/${Date.now()}_img.jpg`);
                    const snapshot = await uploadBytes(storageRef, finalBlob);
                    evidenceUrl = await getDownloadURL(snapshot.ref);
                }

                // Generate ticket ID
                const ticketId = utils.generateTicketId();

                // Get reporter name
                let reporterName = "User";
                if (isAnonymous) {
                    reporterName = "Anonim";
                } else {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    if (userDoc.exists()) {
                        reporterName = userDoc.data().username || auth.currentUser.email;
                    }
                }

                // Submit report
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

                // Store data for PDF
                lastTicketData = { ticketId, website, details };

                // Reset form
                reportForm.reset();
                if (fileUploadInput) fileUploadInput.value = '';
                if (fileNameDisplay) fileNameDisplay.textContent = "";
                if (window.turnstile) window.turnstile.reset();
                turnstileToken = null;

                // Show success
                const ticketIdElement = document.getElementById('success-ticket-id');
                if (ticketIdElement) ticketIdElement.textContent = ticketId;
                if (successMessage) successMessage.classList.remove('hidden');
                utils.showToast("Laporan berhasil dikirim!", "success");

                // Refresh history
                loadUserHistory(auth.currentUser.uid);

            } catch (error) {
                console.error("Report Error:", error);
                if (reportError) {
                    if (error.code === 'storage/unknown' || error.message?.includes('network')) {
                        reportError.textContent = "Gagal upload: Masalah koneksi atau konfigurasi server (CORS).";
                    } else {
                        reportError.textContent = "Gagal: " + (error.message || "Kesalahan jaringan.");
                    }
                    reportError.classList.remove('hidden');
                }
                utils.showToast("Gagal mengirim laporan. Cek log.", "error");
            } finally {
                showLoading(document.getElementById('loading-overlay'), false);
            }
        });
    }

    // Turnstile callback
    window.onTurnstileSuccess = (token) => {
        console.log("Turnstile Verified");
        turnstileToken = token;
        if (reportError) reportError.classList.add('hidden');
    };

    return {
        loadUserHistory,
        getLastTicketData: () => lastTicketData
    };
}

// Export for modular usage
window.reportModule = { initReport };
