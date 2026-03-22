/**
 * Chat Module for Lapor-Aman
 * Handles AI-powered chatbot functionality with smart context
 */

/**
 * Initialize chat functionality
 * @param {object} services - Firebase services
 * @param {object} config - App configuration
 */
function initChat(services, config) {
    const { auth, db, dbMethods } = services;
    const { doc, getDoc, collection, query, where, orderBy, limit, getDocs } = dbMethods;

    // Elements
    const chatWindow = document.getElementById('chat-window');
    const chatToggleButton = document.getElementById('chat-toggle-button');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // State
    const rateLimiter = new utils.RateLimiter();
    let isChatOpen = false;

    /**
     * Toggle chat window
     */
    function toggleChat() {
        if (!chatWindow) return;
        isChatOpen = !isChatOpen;

        if (isChatOpen) {
            chatWindow.classList.remove('hidden');
            setTimeout(() => {
                chatWindow.classList.remove('opacity-0', 'translate-y-4');
            }, 10);
        } else {
            chatWindow.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => {
                chatWindow.classList.add('hidden');
            }, 300);
        }
    }

    /**
     * Get AI response from Gemini
     * @param {string} userQuery - User's message
     * @returns {Promise<string>} - AI response
     */
    async function getGeminiResponse(userQuery) {
        const apiKey = config.GEMINI_API_KEY;
        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
            return "Maaf, layanan AI sedang tidak tersedia. Silakan hubungi admin untuk bantuan.";
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        // Build context
        let userContext = "Pengguna belum login.";
        if (auth.currentUser) {
            userContext = `Pengguna Login: ID ${auth.currentUser.uid}, Email ${auth.currentUser.email}.`;

            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    userContext += ` Username: ${userDoc.data().username || 'Tidak ada'}.`;
                }

                const q = query(
                    collection(db, "reports"),
                    where("reporterUid", "==", auth.currentUser.uid),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );
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

        // System prompt
        const systemPrompt = `
Anda adalah CS Virtual untuk "LaporAman", platform resmi pelaporan judi online di Indonesia.

Tugas Anda:
1. Menjawab pertanyaan seputar cara melapor, keamanan data, dan status laporan.
2. Bersikap sopan, formal namun ramah, dan membantu.
3. Gunakan data konteks di bawah untuk menjawab pertanyaan spesifik user.
4. JANGAN menjawab hal di luar topik judi online atau keamanan siber.
5. Gunakan format Markdown (bold, list) agar jawaban mudah dibaca.
6. Jawaban maksimal 150 kata.

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
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "Terjadi gangguan koneksi pada sistem AI. Silakan coba lagi nanti.";
        }
    }

    /**
     * Render message in chat
     * @param {string} text - Message text
     * @param {boolean} isUser - Is user message
     * @param {string} time - Time string
     */
    function renderMessage(text, isUser, time) {
        if (!chatMessages) return;

        let replyHtml = text;
        if (typeof marked !== 'undefined' && marked.parse) {
            const rawHtml = marked.parse(text);
            replyHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
        }

        if (isUser) {
            chatMessages.innerHTML += `
                <div class="flex items-start justify-end gap-3 mb-5">
                    <div class="flex flex-col items-end max-w-[85%]">
                        <div class="flex items-center justify-end gap-2 mb-1 pr-1">
                            <span class="text-[10px] text-slate-500 font-mono">${time}</span>
                            <span class="text-xs font-bold text-slate-300">Anda</span>
                        </div>
                        <div class="bg-cyan-800 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed">
                            ${utils.sanitizeHTML(text)}
                        </div>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-800 shadow-sm mt-1">
                        <i data-lucide="user" class="w-4 h-4 text-cyan-300"></i>
                    </div>
                </div>`;
        } else {
            chatMessages.innerHTML += `
                <div class="flex items-start gap-3 mb-5">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm mt-1">
                        <i data-lucide="bot" class="w-4 h-4 text-cyan-500"></i>
                    </div>
                    <div class="flex flex-col max-w-[85%]">
                        <div class="flex items-center gap-2 mb-1 pl-1">
                            <span class="text-xs font-bold text-slate-300">CS LaporAman</span>
                            <span class="text-[10px] text-slate-500 font-mono">${time}</span>
                        </div>
                        <div class="chat-bubble bg-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm text-sm leading-relaxed">
                            ${replyHtml}
                        </div>
                    </div>
                </div>`;
        }

        if (window.lucide) lucide.createIcons();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Handle chat form submission
     */
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userInput = chatInput?.value.trim();
            if (!userInput) return;

            // Check rate limit
            const rateCheck = rateLimiter.isAllowed('chat', config.RATE_LIMITS?.CHAT_MESSAGE || 5000);
            if (!rateCheck.allowed) {
                utils.showToast(`Tunggu ${rateCheck.remaining} detik`, "error");
                return;
            }

            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // Render user message
            renderMessage(userInput, true, timeStr);
            if (chatInput) chatInput.value = '';

            // Show typing indicator
            if (typingIndicator) typingIndicator.classList.remove('hidden');

            // Get AI response
            const reply = await getGeminiResponse(userInput);

            if (typingIndicator) typingIndicator.classList.add('hidden');

            const replyTimeStr = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

            // Render bot response
            renderMessage(reply, false, replyTimeStr);
        });
    }

    // Event listeners
    if (chatToggleButton) chatToggleButton.addEventListener('click', toggleChat);
    if (closeChatButton) closeChatButton.addEventListener('click', toggleChat);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isChatOpen) {
            toggleChat();
        }
    });

    return {
        toggleChat,
        isOpen: () => isChatOpen
    };
}

// Export for modular usage
window.chatModule = { initChat };
