/**
 * Lapor-Aman - Admin Dashboard Logic
 * Handles report management, user data decryption, and CSV export
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- CHECK SDK & CONFIG ---
    if (typeof window.firebaseAdminServices === 'undefined') {
        console.error("Firebase SDK Error: admin services not found.");
        return;
    }

    if (typeof window.APP_CONFIG === 'undefined') {
        console.error("Config not loaded. Make sure config.js is included before admin.js");
        return;
    }

    const { auth, db, authMethods, dbMethods } = window.firebaseAdminServices;
    const { onAuthStateChanged, signOut } = authMethods;
    const { collection, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion } = dbMethods;
    const config = window.APP_CONFIG;

    // --- UI ELEMENTS ---
    const adminContent = document.getElementById('admin-content');
    const authGate = document.getElementById('auth-gate');
    const loadingOverlay = document.getElementById('loading-overlay');
    const reportsTable = document.getElementById('reports-table-body');
    const usersTable = document.getElementById('users-table-body');

    // Lightbox
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img-content');
    const closeImageModalBtn = document.getElementById('close-image-modal');

    // Tabs
    const tabReports = document.getElementById('tab-reports');
    const tabUsers = document.getElementById('tab-users');
    const viewReports = document.getElementById('view-reports');
    const viewUsers = document.getElementById('view-users');

    // Controls
    const decryptBtn = document.getElementById('decrypt-btn');
    const keyInput = document.getElementById('decryption-key-input');
    const downloadCsvBtn = document.getElementById('download-csv');
    const logoutBtn = document.getElementById('logout-btn');

    // State
    let allReports = [];
    let allUsers = [];

    const showLoading = (show) => {
        if (loadingOverlay) loadingOverlay.classList.toggle('hidden', !show);
    };

    // --- AUTHENTICATION ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'index.html';
            });
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user && user.email === config.ADMIN_EMAIL) {
            if (authGate) authGate.classList.add('hidden');
            if (adminContent) adminContent.classList.remove('hidden');
            loadReports();
        } else {
            if (authGate) authGate.classList.remove('hidden');
            if (adminContent) adminContent.classList.add('hidden');
        }
    });

    // --- LIGHTBOX ---
    function openImageModal(url) {
        if (!modalImg || !imageModal) return;
        modalImg.src = url;
        imageModal.classList.remove('hidden');
    }

    if (closeImageModalBtn) {
        closeImageModalBtn.addEventListener('click', () => {
            imageModal.classList.add('hidden');
            modalImg.src = '';
        });
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.classList.add('hidden');
                modalImg.src = '';
            }
        });
    }

    // --- TABS ---
    function switchTab(tabId) {
        const isReports = tabId === 'reports';
        
        // Update View
        viewReports?.classList.toggle('hidden', !isReports);
        viewUsers?.classList.toggle('hidden', isReports);
        
        // Update Tab Buttons (Tailwind classes)
        const activeClasses = ['text-white', 'bg-slate-800', 'border-slate-700'];
        const inactiveClasses = ['text-slate-400', 'hover:text-white', 'hover:bg-slate-800/50'];
        
        if (isReports) {
            tabReports?.classList.add(...activeClasses);
            tabReports?.classList.remove(...inactiveClasses);
            tabUsers?.classList.add(...inactiveClasses);
            tabUsers?.classList.remove(...activeClasses);
        } else {
            tabUsers?.classList.add(...activeClasses);
            tabUsers?.classList.remove(...inactiveClasses);
            tabReports?.classList.add(...inactiveClasses);
            tabReports?.classList.remove(...activeClasses);
        }
    }

    if (tabReports) tabReports.addEventListener('click', () => switchTab('reports'));
    if (tabUsers) tabUsers.addEventListener('click', () => switchTab('users'));

    // --- REPORT MANAGEMENT ---
    async function loadReports() {
        showLoading(true);
        try {
            const snap = await getDocs(collection(db, "reports"));
            allReports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

            renderReports(allReports);
        } catch (e) {
            console.error("Error loading reports:", e);
            if (reportsTable) reportsTable.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-red-400 font-mono">Gagal memuat data laporan.</td></tr>';
        } finally {
            showLoading(false);
        }
    }

    function renderReports(reports) {
        if (!reportsTable) return;
        
        reportsTable.innerHTML = '';
        
        if (reports.length === 0) {
            reportsTable.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500 font-mono">Belum ada laporan masuk.</td></tr>';
            return;
        }

        reports.forEach(r => {
            const date = r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-';
            
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-800 hover:bg-slate-900/50 transition-colors';
            
            // Status Options
            const statusOptions = ['BARU', 'DIVERIFIKASI', 'DITINDAKLANJUTI', 'SELESAI', 'DITOLAK']
                .map(opt => `<option value="${opt}" ${r.status === opt ? 'selected' : ''}>${opt}</option>`)
                .join('');

            tr.innerHTML = `
                <td class="px-5 py-4 font-mono text-cyan-400 text-xs">${r.ticketId}</td>
                <td class="px-5 py-4 text-xs text-slate-400">${date}</td>
                <td class="px-5 py-4 truncate max-w-[200px]" title="${r.websiteUrl}">
                    <a href="${r.websiteUrl}" target="_blank" class="hover:text-cyan-400 transition-colors flex items-center gap-1">
                        <i data-lucide="external-link" class="w-3 h-3"></i> ${r.websiteUrl}
                    </a>
                </td>
                <td class="px-5 py-4 text-sm">${r.reporterName}</td>
                <td class="px-5 py-4 text-center">
                    ${r.evidenceUrl ? `
                        <button class="view-proof-btn text-cyan-500 hover:text-cyan-400 underline text-xs" data-url="${r.evidenceUrl}">
                            Lihat
                        </button>
                    ` : '<span class="text-slate-600">-</span>'}
                </td>
                <td class="px-5 py-4">
                    <select class="status-select bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 outline-none focus:border-cyan-500" data-id="${r.id}">
                        ${statusOptions}
                    </select>
                </td>
                <td class="px-5 py-4 text-center">
                    <button class="delete-report-btn text-slate-600 hover:text-red-500 transition-colors" data-id="${r.id}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;

            // Event Listeners
            tr.querySelector('.status-select')?.addEventListener('change', (e) => updateReportStatus(r.id, e.target.value));
            tr.querySelector('.delete-report-btn')?.addEventListener('click', () => deleteReport(r.id));
            tr.querySelector('.view-proof-btn')?.addEventListener('click', (e) => openImageModal(e.target.dataset.url));

            reportsTable.appendChild(tr);
        });

        if (window.lucide) lucide.createIcons();
    }

    async function updateReportStatus(docId, newStatus) {
        if (!confirm(`Ubah status laporan menjadi ${newStatus}?`)) {
            loadReports(); // Reset UI
            return;
        }

        showLoading(true);
        try {
            const reportRef = doc(db, "reports", docId);
            await updateDoc(reportRef, {
                status: newStatus,
                statusHistory: arrayUnion({
                    status: newStatus,
                    timestamp: new Date(),
                    note: `Status diubah oleh admin.`
                })
            });
            
            // Update local state
            const rIndex = allReports.findIndex(r => r.id === docId);
            if (rIndex !== -1) allReports[rIndex].status = newStatus;
            
            renderReports(allReports);
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui status.");
        } finally {
            showLoading(false);
        }
    }

    async function deleteReport(docId) {
        if (!confirm("Hapus laporan ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) return;

        showLoading(true);
        try {
            await deleteDoc(doc(db, "reports", docId));
            allReports = allReports.filter(r => r.id !== docId);
            renderReports(allReports);
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus laporan.");
        } finally {
            showLoading(false);
        }
    }

    // --- CSV EXPORT ---
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', () => {
            if (allReports.length === 0) return alert("Tidak ada data untuk diekspor.");

            const headers = ["Ticket ID", "Timestamp", "Website URL", "Reporter Name", "Reporter Email", "Status", "Details"];
            const rows = allReports.map(r => [
                r.ticketId,
                r.createdAt ? new Date(r.createdAt.seconds * 1000).toISOString() : '',
                `"${r.websiteUrl}"`,
                `"${r.reporterName}"`,
                r.reporterEmail,
                r.status,
                `"${(r.details || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `laporan_laporaman_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // --- USER DATA DECRYPTION ---
    if (decryptBtn) {
        decryptBtn.addEventListener('click', async () => {
            const key = keyInput?.value;
            if (!key) return alert("Masukkan kunci dekripsi AES-256!");

            showLoading(true);
            try {
                const snap = await getDocs(collection(db, "users"));
                allUsers = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

                if (!usersTable) return;
                usersTable.innerHTML = '';

                allUsers.forEach(u => {
                    let decrypted = {};
                    let isError = false;

                    const fields = ['fullname', 'nik', 'phone', 'address'];
                    fields.forEach(field => {
                        try {
                            const bytes = CryptoJS.AES.decrypt(u[field] || "", key);
                            decrypted[field] = bytes.toString(CryptoJS.enc.Utf8);
                            if (!decrypted[field] && u[field]) throw new Error("Key Salah");
                        } catch (e) {
                            decrypted[field] = "TERKUNCI";
                            isError = true;
                        }
                    });

                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-slate-800 hover:bg-slate-900/50 transition-colors';
                    tr.innerHTML = `
                        <td class="px-5 py-4 ${isError ? 'text-red-500 italic' : 'font-bold text-white'}">${decrypted.fullname || '-'}</td>
                        <td class="px-5 py-4 font-mono text-xs">${decrypted.nik || '-'}</td>
                        <td class="px-5 py-4 text-sm">${u.username || '-'}</td>
                        <td class="px-5 py-4 text-xs text-slate-400">${u.email}</td>
                        <td class="px-5 py-4 text-sm">${decrypted.phone || '-'}</td>
                        <td class="px-5 py-4 truncate max-w-[150px]" title="${decrypted.address}">${decrypted.address || '-'}</td>
                        <td class="px-5 py-4 flex items-center gap-3 justify-center">
                            <button class="view-history-btn text-cyan-400 hover:underline text-xs" data-email="${u.email}">Riwayat</button>
                            <button class="delete-user-btn text-slate-600 hover:text-red-500 transition-colors" data-id="${u.uid}">
                                <i data-lucide="user-minus" class="w-4 h-4"></i>
                            </button>
                        </td>
                    `;

                    tr.querySelector('.view-history-btn')?.addEventListener('click', (e) => showUserHistory(e.target.dataset.email));
                    tr.querySelector('.delete-user-btn')?.addEventListener('click', () => deleteUser(u.uid));

                    usersTable.appendChild(tr);
                });

                if (window.lucide) lucide.createIcons();

            } catch (e) {
                console.error(e);
                alert("Gagal memuat atau mendekripsi data. Pastikan kunci Anda benar.");
            } finally {
                showLoading(false);
            }
        });
    }

    async function deleteUser(uid) {
        if (!confirm("Hapus pengguna ini secara permanen?")) return;

        showLoading(true);
        try {
            await deleteDoc(doc(db, "users", uid));
            if (decryptBtn) decryptBtn.click(); // Refresh table
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus pengguna.");
        } finally {
            showLoading(false);
        }
    }

    async function showUserHistory(email) {
        const container = document.getElementById('user-history-container');
        const content = document.getElementById('history-content');
        const usernameDisplay = document.getElementById('history-username');

        if (!container || !content || !usernameDisplay) return;

        container.classList.remove('hidden');
        usernameDisplay.textContent = email;
        content.innerHTML = '<div class="flex justify-center py-8"><div class="loader"></div></div>';

        try {
            const userReports = allReports.filter(r => r.reporterEmail === email);

            if (userReports.length === 0) {
                content.innerHTML = '<p class="text-center py-8 text-slate-500 italic">Pengguna ini belum pernah mengirimkan laporan.</p>';
                return;
            }

            let html = '<ul class="space-y-3">';
            userReports.forEach(r => {
                const statusColor = r.status === 'DITOLAK' ? 'text-red-500' : 'text-cyan-400';
                html += `
                    <li class="bg-slate-950/50 p-4 rounded border border-slate-800">
                        <div class="flex justify-between mb-2">
                            <span class="font-mono text-cyan-500 text-xs">${r.ticketId}</span>
                            <span class="text-[10px] text-slate-600 font-mono">${new Date(r.createdAt.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <p class="text-sm text-slate-300 font-medium mb-1">Status: <span class="${statusColor}">${r.status}</span></p>
                        <p class="text-xs text-slate-500 truncate">${r.websiteUrl}</p>
                    </li>
                `;
            });
            html += '</ul>';
            content.innerHTML = html;
        } catch (e) {
            content.innerHTML = '<p class="text-red-400 text-center py-8">Terjadi kesalahan saat memuat riwayat.</p>';
        }
    }
});
