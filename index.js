function formatTaskbarTime(date) {
	return date.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	});
}

function updateTaskbarClock() {
	const clock = document.getElementById("taskbar-clock");
	if (!clock) {
		return;
	}

	clock.textContent = formatTaskbarTime(new Date());
}

function setupBadgeFallback() {
	const badgeImages = Array.from(document.querySelectorAll("img[data-badge]"));

	if (!badgeImages.length) {
		return;
	}

	badgeImages.forEach(function (img) {
		img.dataset.badgeVisible = "false";

		img.addEventListener("load", function () {
			img.dataset.badgeVisible = "true";
			img.closest(".badge-link").style.display = "inline-flex";
		});

		img.addEventListener("error", function () {
			img.dataset.badgeVisible = "false";
			img.closest(".badge-link").style.display = "none";
		});

		if (img.complete && img.naturalWidth > 0) {
			img.dataset.badgeVisible = "true";
		} else if (img.complete) {
			img.closest(".badge-link").style.display = "none";
		}
	});
}

function setupWinampMiniPlayer() {
	const shell = document.querySelector("[data-winamp]");
	if (!shell) {
		return;
	}

	const audio = document.getElementById("winamp-audio");
	const timeEl = document.getElementById("winamp-time");
	const trackEl = document.getElementById("winamp-track");
	const progress = document.getElementById("winamp-progress-fill");
	const buttons = Array.from(shell.querySelectorAll(".winamp-btn"));

	if (!(audio instanceof HTMLAudioElement)) {
		return;
	}

	const songSrc = "images/audio/track-01.mp3";
	audio.src = songSrc;

	const pad2 = function (value) {
		return String(value).padStart(2, "0");
	};

	const render = function () {
		const current = Math.floor(audio.currentTime || 0);
		const mins = Math.floor(current / 60);
		const secs = current % 60;
		const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
		timeEl.textContent = pad2(mins) + ":" + pad2(secs);
		progress.style.width = duration > 0
			? Math.min(100, (audio.currentTime / duration) * 100) + "%"
			: "0%";
	};

	const setActive = function (action) {
		buttons.forEach(function (btn) {
			btn.classList.toggle("active", btn.dataset.action === action);
		});
	};

	audio.addEventListener("timeupdate", render);
	audio.addEventListener("loadedmetadata", render);
	audio.addEventListener("error", function () {
		setActive("stop");
		trackEl.textContent = "MISSING FILE";
	});

	shell.addEventListener("click", function (event) {
		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.classList.contains("winamp-btn")) {
			return;
		}

		const action = target.dataset.action;

		if (action === "play") {
			audio.play().then(function () {
				setActive("play");
			}).catch(function () {
				setActive("pause");
			});
		}

		if (action === "pause") {
			audio.pause();
			setActive("pause");
		}

		if (action === "stop") {
			audio.pause();
			audio.currentTime = 0;
			setActive("stop");
			render();
		}
	});

	setActive("stop");
	render();
}


function setupCardCollapsing() {
	const cards = Array.from(document.querySelectorAll("section .card"));

	cards.forEach(function (card) {
		const title = card.querySelector(":scope > h2, :scope > h3");
		if (!title || card.querySelector(":scope > .card-collapse-btn")) {
			return;
		}

		const button = document.createElement("button");
		button.type = "button";
		button.className = "card-collapse-btn";
		button.textContent = "-";
		button.setAttribute("aria-label", "Collapse section");
		button.setAttribute("aria-expanded", "true");

		button.addEventListener("click", function () {
			const collapsed = card.classList.toggle("collapsed");
			button.textContent = collapsed ? "+" : "-";
			button.setAttribute("aria-label", collapsed ? "Expand section" : "Collapse section");
			button.setAttribute("aria-expanded", collapsed ? "false" : "true");
		});

		card.insertBefore(button, title.nextSibling);
	});
}


updateTaskbarClock();
setInterval(updateTaskbarClock, 1000);
setupBadgeFallback();
setupWinampMiniPlayer();
setupCardCollapsing();
