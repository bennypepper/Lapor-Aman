/**
 * Tracking Module for Lapor-Aman
 * Handles report tracking and status timeline display
 */

/**
 * Initialize tracking functionality
 * @param {object} services - Firebase services
 * @param {object} config - App configuration
 */
function initTracking(services, config) {
    const { db, dbMethods } = services;
    const { collection, getDocs, query, where } = dbMethods;

    // Elements
    const trackBtn = document.getElementById('track-btn');
    const ticketInput = document.getElementById('ticket-input');
    const trackingResultContainer = document.getElementById('tracking-result-container');

    // State
    const rateLimiter = new utils.RateLimiter();

    /**
     * Render tracking result with timeline
     * @param {object} data - Report data
     */
    function renderTrackingResult(data) {
        if (!trackingResultContainer) return;

        // Status color mapping
        const statusColors = {
            'BARU': 'text-blue-400',
            'DIVERIFIKASI': 'text-yellow-400',
            'DITINDAKLANJUTI': 'text-orange-400',
            'SELESAI': 'text-green-400',
            'DITOLAK': 'text-red-500 font-bold'
        };

        const statusClass = statusColors[data.status] || 'text-cyan-400';

        // Build timeline HTML
        let timelineHtml = '';
        if (data.statusHistory && data.statusHistory.length > 0) {
            timelineHtml = `<div class="mt-8 relative border-l-2 border-slate-700 ml-3 md:ml-4 pl-6 md:pl-8 space-y-8">`;

            data.statusHistory.forEach((historyItem, index) => {
                const dateStr = utils.formatDate(historyItem.timestamp.seconds * 1000);
                let dotColor = "bg-slate-700 border-slate-900 text-slate-500";
                let icon = "clock";

                if (historyItem.status === 'SELESAI') {
                    dotColor = "bg-green-500 border-green-900 text-white";
                    icon = "check";
                } else if (historyItem.status === 'DITOLAK') {
                    dotColor = "bg-red-500 border-red-900 text-white";
                    icon = "x";
                } else if (index === data.statusHistory.length - 1) {
                    dotColor = "bg-cyan-500 border-cyan-900 text-white ring-4 ring-cyan-500/20";
                    icon = "loader-2";
                }

                timelineHtml += `
                    <div class="relative">
                        <div class="absolute -left-[35px] md:-left-[43px] mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${dotColor} z-10">
                            <i data-lucide="${icon}" class="w-3 h-3 ${index === data.statusHistory.length - 1 && icon === 'loader-2' ? 'animate-spin' : ''}"></i>
                        </div>
                        <p class="text-xs font-mono text-slate-500 mb-1">${dateStr}</p>
                        <p class="text-sm font-bold text-slate-200 tracking-wider">${historyItem.status}</p>
                        ${historyItem.note ? `<p class="text-sm text-slate-400 mt-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 leading-relaxed">${utils.sanitizeHTML(historyItem.note)}</p>` : ''}
                    </div>
                `;
            });
            timelineHtml += `</div>`;
        }

        // Status badge with decorative elements
        const statusDecoration = data.status === 'SELESAI'
            ? '<div class="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full pointer-events-none"></div>'
            : data.status === 'DITOLAK'
                ? '<div class="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full pointer-events-none"></div>'
                : '';

        trackingResultContainer.innerHTML = `
            <div class="card-bg p-6 md:p-8 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden">
                ${statusDecoration}
                
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    Status Saat Ini: 
                    <span class="${statusClass}">${data.status}</span>
                </h3>
                
                <div class="flex flex-col sm:flex-row sm:gap-6 gap-2 mb-6 border-b border-slate-800 pb-6">
                    <div>
                        <p class="text-xs font-mono text-slate-500 uppercase tracking-widest">Nomor Tiket</p>
                        <p class="text-slate-300 font-mono font-medium">${utils.sanitizeHTML(data.ticketId)}</p>
                    </div>
                    <div class="sm:border-l sm:border-slate-800 sm:pl-6">
                        <p class="text-xs font-mono text-slate-500 uppercase tracking-widest">Website Tersangka</p>
                        <p class="text-slate-300 truncate max-w-[200px]">${utils.sanitizeHTML(data.websiteUrl)}</p>
                    </div>
                </div>

                <h4 class="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Perjalanan Laporan</h4>
                ${timelineHtml}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    /**
     * Show skeleton loading state
     */
    function showSkeleton() {
        if (!trackingResultContainer) return;
        trackingResultContainer.innerHTML = `
            <div class="card-bg p-6 rounded-xl border border-slate-700 animate-pulse">
                <div class="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
                <div class="h-4 bg-slate-700/70 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-slate-700/50 rounded w-2/3 mb-6"></div>
                <div class="pt-4 border-t border-slate-700">
                    <div class="h-3 bg-slate-700/40 rounded w-1/4"></div>
                </div>
            </div>
        `;
    }

    /**
     * Handle tracking lookup
     */
    if (trackBtn) {
        trackBtn.addEventListener('click', async () => {
            const ticketId = ticketInput?.value.trim();

            if (!ticketId) {
                utils.showToast("Masukkan ID tiket!", "error");
                return;
            }

            // Check rate limit
            const rateCheck = rateLimiter.isAllowed('tracking', config.RATE_LIMITS?.TRACKING_LOOKUP || 10000);
            if (!rateCheck.allowed) {
                utils.showToast(`Tunggu ${rateCheck.remaining} detik`, "error");
                return;
            }

            // Show skeleton
            showSkeleton();

            try {
                const q = query(collection(db, "reports"), where("ticketId", "==", ticketId));
                const snap = await getDocs(q);

                if (snap.empty) {
                    trackingResultContainer.innerHTML = `
                        <div class="p-4 bg-red-900/50 text-red-200 rounded-lg text-center border border-red-800">
                            <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2"></i>
                            Tiket tidak ditemukan. Periksa kembali nomor tiket Anda.
                        </div>
                    `;
                    utils.showToast("Tiket tidak ditemukan", "error");
                } else {
                    const data = snap.docs[0].data();
                    renderTrackingResult(data);
                    utils.showToast("Laporan ditemukan", "success");
                }
            } catch (e) {
                console.error(e);
                trackingResultContainer.innerHTML = `
                    <div class="p-4 bg-red-900/40 text-red-300 border border-red-800 rounded-lg text-sm flex items-center gap-3">
                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        Terjadi kesalahan saat melacak laporan. Silakan coba lagi nanti.
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                utils.showToast("Error saat melacak", "error");
            }
        });
    }

    return {};
}

// Export for modular usage
window.trackingModule = { initTracking };
