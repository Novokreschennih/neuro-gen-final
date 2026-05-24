document.addEventListener("DOMContentLoaded", () => {
	const DEFAULT_BOT = "sethubble_biz_bot";
	const DEFAULT_PARTNER_ID = "p_qdr";
	const DEFAULT_PARTNER_AFID = "1123";
	const BASE_API_URL =
		"https://d5dsbah1d4ju0glmp9d0.3zvepvee.apigw.yandexcloud.net/";
	const API_URL = BASE_API_URL + "?action=web-chat";
	const WEB_CHAT_URL = "/ai/";
	const VK_COMMUNITY_URL = "https://vk.me/club237421168";

	// === Безопасная обёртка для localStorage (не падает в приватном режиме Safari) ===
	const Storage = {
		get: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
		set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} },
	};

	// === CSS TOGGLE LOGIC (Динамический контент) ===
	const urlParams = new URLSearchParams(window.location.search);
	const userRole = urlParams.get("role");
	const bodyContainer = document.getElementById("body-container");

	if (bodyContainer) {
		if (userRole === "agent") {
			bodyContainer.classList.add("show-agent");
		} else if (userRole === "online") {
			bodyContainer.classList.add("show-online");
		} else if (userRole === "b2b" || userRole === "offline") {
			bodyContainer.classList.add("show-offline");
			const footerText = document.getElementById("footer-text");
			if (footerText)
				footerText.textContent =
					'NEUROGEN © 2026 | Официальный партнёр — ООО "НейроДиджитал"';
		} else {
			bodyContainer.classList.add("show-universal");
		}
	}

	// === Инициализация параметров ===
	let partnerId = null;
	let partnerAfid = null;
	let refBot = null;
	let currentSessionId = Storage.get("neurogen_web_session");
	if (!currentSessionId) {
		currentSessionId = `web_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
		Storage.set("neurogen_web_session", currentSessionId);
	}

	let encodedId = urlParams.get("page");
	let refFromUrl = urlParams.get("ref");
	let afidFromUrl = urlParams.get("afid");

	const fromHex = (hex) => {
		try {
			if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
			if (hex.length % 2 !== 0) return null;
			let str = "";
			for (let i = 0; i < hex.length; i += 2) {
				str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
			}
			return str;
		} catch (e) {
			return null;
		}
	};

	if (encodedId) {
		const decoded = fromHex(encodedId);
		partnerId =
			decoded && decoded.length > 1 ? decoded.trim() : encodedId.trim();
		if (partnerId) Storage.set("neurogen_partner_id", partnerId);
	} else if (refFromUrl) {
		partnerId = refFromUrl.trim();
		if (partnerId) Storage.set("neurogen_partner_id", partnerId);
	}

	if (!partnerId) {
		partnerId =
			Storage.get("neurogen_partner_id") || DEFAULT_PARTNER_ID;
	}

	if (afidFromUrl && /^\d{1,10}$/.test(afidFromUrl)) {
		partnerAfid = afidFromUrl.trim();
		Storage.set("neurogen_partner_afid", partnerAfid);
	}

	if (!partnerAfid) {
		partnerAfid =
			Storage.get("neurogen_partner_afid") || DEFAULT_PARTNER_AFID;
	}

	const storedBot = Storage.get("neurogen_partner_bot");
	refBot = storedBot && storedBot !== "sethubble_bot" ? storedBot : DEFAULT_BOT;

	// === ДИНАМИЧЕСКИЕ КАНАЛЫ (Запрос к API) ===
	async function fetchPublicConfig() {
		try {
			const res = await fetch(`${BASE_API_URL}?action=get_public_config`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ page: partnerId }),
			});
			const config = await res.json();
			if (!config || config.error) throw new Error("Invalid config");

			const btnVK = document.getElementById("btnVK");
			if (btnVK && !config.vk) btnVK.classList.add("hidden");
			const btnChoiceVK = document.getElementById("btnChoiceVK");
			if (btnChoiceVK && !config.vk) btnChoiceVK.classList.add("hidden");

			const badge = document.getElementById("partner-badge");
			const nameEl = document.getElementById("partner-name");
			if (badge && nameEl && config.first_name) {
				nameEl.textContent = `${config.first_name} (ID: ${config.sh_user_id || "Скрыт"})`;
				badge.classList.remove("hidden");
				badge.classList.add("flex");
			}
		} catch (e) {
			const badge = document.getElementById("partner-badge");
			const nameEl = document.getElementById("partner-name");
			if (badge && nameEl && partnerId !== DEFAULT_PARTNER_ID) {
				nameEl.textContent = String(partnerId).toUpperCase();
				badge.classList.remove("hidden");
				badge.classList.add("flex");
			}
		}
	}
	fetchPublicConfig();

	// === Логика модального окна ===
	const modal = document.getElementById("leadModal");
	const modalContent = document.getElementById("modalContent");
	const btnOpenList = document.querySelectorAll(".js-open-modal");
	const btnClose = document.getElementById("closeModal");
	const stepEmail = document.getElementById("stepEmail");
	const stepChoice = document.getElementById("stepChoice");
	const emailForm = document.getElementById("emailForm");
	const emailInput = document.getElementById("userEmail");

	if (!modal) return;

	const urlStep = urlParams.get("step");
	const storedEmail = Storage.get("neurogen_email");
	const emailVerified =
		Storage.get("neurogen_email_verified") === "true" ||
		Storage.get("neurogen_email_submitted") === "true";

	function openModal() {
		// --- СБРОС СОСТОЯНИЙ (Фикс наложения) ---
		const blocks = [stepEmail, stepChoice, document.getElementById("stepWelcome"), document.getElementById("email-submitted")];
		blocks.forEach(block => { if(block) block.classList.add("hidden"); });

		// Разблокируем кнопку, если она зависла в режиме "ОТПРАВКА"
		const submitEmailBtn = document.getElementById("submitEmailBtn");
		if (submitEmailBtn) {
			submitEmailBtn.disabled = false;
			submitEmailBtn.innerHTML = "ПРОДОЛЖИТЬ";
		}

		modal.classList.remove("hidden");
		// Плавное появление
		setTimeout(() => {
			modal.classList.remove("opacity-0");
			modalContent.classList.add("modal-enter-active");
		}, 10);

		// --- ЛОГИКА ОТОБРАЖЕНИЯ НУЖНОГО ШАГА ---
		const isReturning = emailVerified && storedEmail;
		const userName = Storage.get("neurogen_name");

		if (urlStep === "channels") {
			stepChoice.classList.remove("hidden");
		} else if (isReturning) {
			// Returning user — приветствие + выбор каналов
			const welcomeBlock = document.getElementById("stepWelcome");
			if (welcomeBlock) {
				welcomeBlock.classList.remove("hidden");
				const nameEl = document.getElementById("welcomeName");
				if (nameEl) nameEl.textContent = userName || "друг";
			} else {
				// Fallback: если welcomeBlock ещё не создан — показываем stepChoice
				stepChoice.classList.remove("hidden");
			}
		} else {
			// New user — ввод Email
			stepEmail.classList.remove("hidden");
			emailInput.focus();
		}
	}

	function closeModal() {
		modal.classList.add("opacity-0");
		modalContent.classList.remove("modal-enter-active");
		setTimeout(() => {
			modal.classList.add("hidden");
		}, 300);
	}

	btnOpenList.forEach((btn) => btn.addEventListener("click", openModal));
	if (btnClose) btnClose.addEventListener("click", closeModal);
	modal.addEventListener("click", (e) => {
		if (e.target === modal) closeModal();
	});

	if (urlStep === "channels") {
		if (!emailVerified || !storedEmail) {
			window.location.href = "/";
		} else {
			openModal();
		}
	}

	if (emailForm) {
		emailForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const email = emailInput.value.trim();
			const name = document.getElementById("userName")?.value.trim();
			const emailError = document.getElementById("emailError");
			const submitEmailBtn = document.getElementById("submitEmailBtn");

			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
				if (emailError) emailError.classList.remove("hidden");
				return;
			}
			if (emailError) emailError.classList.add("hidden");
			if (submitEmailBtn) {
				submitEmailBtn.innerHTML =
					'<span class="animate-pulse">ОТПРАВКА...</span>';
				submitEmailBtn.disabled = true;
			}

			try {
				const res = await fetch(API_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						isEmail: true,
						email: email,
						first_name: name,
						partner_id: partnerId,
						afid: partnerAfid,
						sessionId: currentSessionId,
						role: userRole,
					}),
				});
				if (res.ok) {
					const data = await res.json();
					if (data.token) Storage.set("neurogen_jwt", data.token);
				}
			} catch (err) {}

			Storage.set("neurogen_email", email);
			Storage.set("neurogen_name", name);
			Storage.set("neurogen_email_submitted", "true");

			stepEmail.classList.add("hidden");
			stepChoice.classList.add("hidden");
			const emailSubmittedEl = document.getElementById("email-submitted");
			if (emailSubmittedEl) {
		emailSubmittedEl.classList.remove("hidden");
		emailSubmittedEl.innerHTML = `<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-green-500/20">✉️</div><h3 class="text-2xl font-bold text-white mb-2">Проверь свою почту!</h3><p class="text-sm text-gray-400 mb-2">Мы отправили ссылку для подтверждения на:</p><p class="text-lg font-bold text-green-400 mb-4" id="submitted-email-value"></p><p class="text-xs text-gray-500">Перейди по ссылке в письме, чтобы подтвердить email и продолжить настройку.</p></div>`;
		const emailDisplay = document.getElementById("submitted-email-value");
		if (emailDisplay) emailDisplay.textContent = email;
			}
		});
	}

	// Переходы на платформы — stepWelcome (returning user)
	const btnTgl = document.getElementById("btnTelegram");
	if (btnTgl) {
		btnTgl.addEventListener("click", () => {
			window.open(
				`https://t.me/${refBot}?start=${partnerId}__${currentSessionId}|a${partnerAfid}`,
				"_blank",
			);
		});
	}

	const btnVk = document.getElementById("btnVK");
	if (btnVk) {
		btnVk.addEventListener("click", () => {
			window.open(
				`${VK_COMMUNITY_URL}?ref=${partnerId}__${currentSessionId}|a${partnerAfid}`,
				"_blank",
			);
		});
	}

	const btnWb = document.getElementById("btnWeb");
	if (btnWb) {
		btnWb.addEventListener("click", () => {
			const email = storedEmail || emailInput?.value.trim();
			let url = `${WEB_CHAT_URL}?ref=${partnerId}&afid=${partnerAfid}&session_id=${currentSessionId}`;
			if (userRole === "b2b" || userRole === "offline") url += `&role=b2b`;
			if (email) url += `&email=${encodeURIComponent(email)}`;
			window.open(url, "_blank");
		});
	}

	// Переходы на платформы — stepChoice (urlStep=channels)
	const btnChoiceTgl = document.getElementById("btnChoiceTelegram");
	if (btnChoiceTgl) {
		btnChoiceTgl.addEventListener("click", () => {
			window.open(
				`https://t.me/${refBot}?start=${partnerId}__${currentSessionId}|a${partnerAfid}`,
				"_blank",
			);
		});
	}

	const btnChoiceVk = document.getElementById("btnChoiceVK");
	if (btnChoiceVk) {
		btnChoiceVk.addEventListener("click", () => {
			window.open(
				`${VK_COMMUNITY_URL}?ref=${partnerId}__${currentSessionId}|a${partnerAfid}`,
				"_blank",
			);
		});
	}

	const btnChoiceWb = document.getElementById("btnChoiceWeb");
	if (btnChoiceWb) {
		btnChoiceWb.addEventListener("click", () => {
			let url = `${WEB_CHAT_URL}?ref=${partnerId}&afid=${partnerAfid}&session_id=${currentSessionId}`;
			if (userRole === "b2b" || userRole === "offline") url += `&role=b2b`;
			if (storedEmail) url += `&email=${encodeURIComponent(storedEmail)}`;
			window.open(url, "_blank");
		});
	}
});
