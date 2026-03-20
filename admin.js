document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.firebaseAdminServices === 'undefined') {
        console.error("Firebase SDK Error");
        return;
    }

    const { auth, db, authMethods, dbMethods } = window.firebaseAdminServices;
    const { onAuthStateChanged, signOut } = authMethods;
    const { collection, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion } = dbMethods;

    // UI Elements
    const adminContent = document.getElementById('admin-content');
    const authGate = document.getElementById('auth-gate');
    const loadingOverlay = document.getElementById('loading-overlay');
    const reportsTable = document.getElementById('reports-table-body');
    const usersTable = document.getElementById('users-table-body');
    
    // Lightbox Elements
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img-content');
    const closeImageModalBtn = document.getElementById('close-image-modal');
    
    // Tabs
    const tabReports = document.getElementById('tab-reports');
    const tabUsers = document.getElementById('tab-users');
    const viewReports = document.getElementById('view-reports');
    const viewUsers = document.getElementById('view-users');

    // Features
    const decryptBtn = document.getElementById('decrypt-btn');
    const keyInput = document.getElementById('decryption-key-input');
    const downloadCsvBtn = document.getElementById('download-csv');

    let allReports = [];
    let allUsers = [];

    const showLoading = (show) => loadingOverlay.classList.toggle('hidden', !show);

    // --- AUTH CHECK ---
    document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

    onAuthStateChanged(auth, (user) => {
        if (user && user.email === 'staffmeridiandigital@gmail.com') {
            authGate.classList.add('hidden');
            adminContent.classList.remove('hidden');
            loadReports();
        } else {
            authGate.classList.remove('hidden');
            adminContent.classList.add('hidden');
        }
    });

    // --- LIGHTBOX LOGIC ---
    window.openImageModal = (url) => {
        modalImg.src = url;
        imageModal.classList.remove('hidden');
    };
    
    closeImageModalBtn.addEventListener('click', () => {
        imageModal.classList.add('hidden');
        modalImg.src = '';
    });

    imageModal.addEventListener('click', (e) => {
        if(e.target === imageModal) {
            imageModal.classList.add('hidden');
            modalImg.src = '';
        }
    });

    // --- TABS LOGIC ---
    tabReports.addEventListener('click', () => {
        viewReports.classList.remove('hidden');
        viewUsers.classList.add('hidden');
        tabReports.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400');
        tabReports.classList.remove('text-slate-400');
        tabUsers.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400');
        tabUsers.classList.add('text-slate-400');
    });

    tabUsers.addEventListener('click', () => {
        viewReports.classList.add('hidden');
        viewUsers.classList.remove('hidden');
        tabUsers.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400');
        tabUsers.classList.remove('text-slate-400');
        tabReports.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400');
        tabReports.classList.add('text-slate-400');
    });

    // --- LOAD REPORTS ---
    async function loadReports() {
        showLoading(true);
        try {
            const snap = await getDocs(collection(db, "reports"));
            allReports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            
            renderReports(allReports);
        } catch (e) {
            console.error(e);
            reportsTable.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-red-400">Gagal memuat.</td></tr>';
        } finally {
            showLoading(false);
        }
    }

    function renderReports(reports) {
        let html = '';
        reports.forEach(r => {
            const date = r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString('id-ID') : '-';
            const proofBtn = r.evidenceUrl 
                ? `<button onclick="openImageModal('${r.evidenceUrl}')" class="text-cyan-400 hover:text-cyan-300 underline">Lihat</button>` 
                : '-';

            // Menambahkan status DITOLAK di dropdown
            html += `
                <tr class="border-b border-slate-700 hover:bg-slate-800">
                    <td class="px-6 py-4 font-mono text-cyan-400">${r.ticketId}</td>
                    <td class="px-6 py-4">${date}</td>
                    <td class="px-6 py-4 truncate max-w-xs"><a href="${r.websiteUrl}" target="_blank" class="hover:underline">${r.websiteUrl}</a></td>
                    <td class="px-6 py-4">${r.reporterName}</td>
                    <td class="px-6 py-4">${proofBtn}</td>
                    <td class="px-6 py-4">
                        <select data-id="${r.id}" class="status-select bg-slate-900 border border-slate-600 rounded px-2 py-1">
                            <option value="BARU" ${r.status === 'BARU' ? 'selected' : ''}>Baru</option>
                            <option value="DIVERIFIKASI" ${r.status === 'DIVERIFIKASI' ? 'selected' : ''}>Diverifikasi</option>
                            <option value="DITINDAKLANJUTI" ${r.status === 'DITINDAKLANJUTI' ? 'selected' : ''}>Ditindaklanjuti</option>
                            <option value="SELESAI" ${r.status === 'SELESAI' ? 'selected' : ''}>Selesai</option>
                            <option value="DITOLAK" ${r.status === 'DITOLAK' ? 'selected' : ''} class="text-red-400 font-bold">Ditolak</option>
                        </select>
                    </td>
                    <td class="px-6 py-4">
                        <button class="delete-report-btn text-red-500 hover:text-red-400 transition-colors" data-id="${r.id}" title="Hapus Laporan">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        reportsTable.innerHTML = html;
        lucide.createIcons();

        document.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', updateStatus);
        });
        
        document.querySelectorAll('.delete-report-btn').forEach(btn => {
            btn.addEventListener('click', deleteReport);
        });
    }

    async function updateStatus(e) {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        if(confirm("Ubah status?")) {
            showLoading(true);
            try {
                const ref = doc(db, "reports", id);
                await updateDoc(ref, {
                    status: newStatus,
                    statusHistory: arrayUnion({ status: newStatus, timestamp: new Date() })
                });
                const report = allReports.find(r => r.id === id);
                if(report) report.status = newStatus;
            } catch(err) {
                alert("Gagal update");
                e.target.value = e.target.defaultValue; 
            } finally {
                showLoading(false);
            }
        } else {
            e.target.value = e.target.defaultValue;
        }
    }

    async function deleteReport(e) {
        const btn = e.currentTarget;
        const id = btn.dataset.id;
        
        if(confirm("PERINGATAN: Hapus permanen?")) {
            showLoading(true);
            try {
                await deleteDoc(doc(db, "reports", id));
                allReports = allReports.filter(r => r.id !== id);
                renderReports(allReports);
            } catch (err) {
                alert("Gagal menghapus: " + err.message);
            } finally {
                showLoading(false);
            }
        }
    }

    // --- CSV EXPORT ---
    downloadCsvBtn.addEventListener('click', () => {
        if (allReports.length === 0) return alert("Tidak ada data.");
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Ticket ID,Date,Website,Reporter Name,Reporter Email,Status,Details\n";
        
        allReports.forEach(r => {
            const row = [
                r.ticketId,
                r.createdAt ? new Date(r.createdAt.seconds*1000).toISOString() : '',
                `"${r.websiteUrl}"`,
                `"${r.reporterName}"`,
                r.reporterEmail,
                r.status,
                `"${(r.details || '').replace(/"/g, '""')}"` 
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "laporan_judi_online.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- USER DATA ---
    decryptBtn.addEventListener('click', async () => {
        const key = keyInput.value;
        if (!key) return alert("Masukkan kunci enkripsi!");

        showLoading(true);
        try {
            const snap = await getDocs(collection(db, "users"));
            allUsers = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            
            let html = '';
            
            allUsers.forEach(u => {
                let decryptedName, decryptedNIK, decryptedPhone, decryptedAddress;

                try {
                    decryptedName = CryptoJS.AES.decrypt(u.fullname || "", key).toString(CryptoJS.enc.Utf8);
                    decryptedNIK = CryptoJS.AES.decrypt(u.nik || "", key).toString(CryptoJS.enc.Utf8);
                    decryptedPhone = CryptoJS.AES.decrypt(u.phone || "", key).toString(CryptoJS.enc.Utf8);
                    decryptedAddress = CryptoJS.AES.decrypt(u.address || "", key).toString(CryptoJS.enc.Utf8);
                    
                    if(!decryptedName) throw new Error("Key Salah");
                } catch (e) {
                    decryptedName = "<span class='text-red-500'>Terkunci/Key Salah</span>";
                    decryptedNIK = "******";
                    decryptedPhone = "******";
                    decryptedAddress = "******";
                }

                html += `
                    <tr class="border-b border-slate-700 hover:bg-slate-800">
                        <td class="px-6 py-4 font-bold text-white">${decryptedName}</td>
                        <td class="px-6 py-4 font-mono">${decryptedNIK}</td>
                        <td class="px-6 py-4">${u.username || '-'}</td>
                        <td class="px-6 py-4">${u.email}</td>
                        <td class="px-6 py-4">${decryptedPhone}</td>
                        <td class="px-6 py-4 truncate max-w-xs" title="${decryptedAddress}">${decryptedAddress}</td>
                        <td class="px-6 py-4 flex items-center gap-3">
                            <button class="view-history-btn text-cyan-400 hover:underline" data-email="${u.email}">Lihat Laporan</button>
                            <button class="delete-user-btn text-red-500 hover:text-red-400 transition-colors" data-id="${u.uid}" title="Hapus User">
                                <i data-lucide="trash-2" class="w-5 h-5"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            usersTable.innerHTML = html;
            lucide.createIcons();

            document.querySelectorAll('.view-history-btn').forEach(btn => {
                btn.addEventListener('click', (e) => showUserHistory(e.target.dataset.email));
            });
            
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', deleteUser);
            });

        } catch (e) {
            console.error(e);
            alert("Gagal memuat atau mendekripsi data.");
        } finally {
            showLoading(false);
        }
    });

    async function deleteUser(e) {
        const btn = e.currentTarget;
        const uid = btn.dataset.id;
        
        if(confirm("PERINGATAN: Hapus user permanen?")) {
            showLoading(true);
            try {
                await deleteDoc(doc(db, "users", uid));
                document.getElementById('decrypt-btn').click();
                alert("User dihapus.");
            } catch (err) {
                alert("Gagal menghapus: " + err.message);
            } finally {
                showLoading(false);
            }
        }
    }

    async function showUserHistory(email) {
        const container = document.getElementById('user-history-container');
        const content = document.getElementById('history-content');
        const usernameDisplay = document.getElementById('history-username');
        
        container.classList.remove('hidden');
        usernameDisplay.textContent = email;
        content.innerHTML = '<div class="loader mx-auto"></div>';

        try {
            const userReports = allReports.filter(r => r.reporterEmail === email);
            
            if (userReports.length === 0) {
                content.innerHTML = '<p class="text-slate-400">User ini belum pernah melapor.</p>';
                return;
            }

            let html = '<ul class="space-y-3">';
            userReports.forEach(r => {
                // Status color di history admin
                const statusColor = r.status === 'DITOLAK' ? 'text-red-500' : 'text-white';
                html += `
                    <li class="bg-slate-900 p-3 rounded border border-slate-700">
                        <div class="flex justify-between">
                            <span class="font-mono text-cyan-400 text-sm">${r.ticketId}</span>
                            <span class="text-xs text-slate-500">${new Date(r.createdAt.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <p class="text-sm ${statusColor} mt-1">Status: ${r.status}</p>
                        <p class="text-xs text-slate-400 truncate">${r.websiteUrl}</p>
                    </li>
                `;
            });
            html += '</ul>';
            content.innerHTML = html;
        } catch (e) {
            content.innerHTML = '<p class="text-red-400">Error memuat riwayat.</p>';
        }
    }
});