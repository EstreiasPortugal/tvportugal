const channels = {
  rtp1: {
    name: "RTP1",
    hint: "Generalista",
    url: "https://www.rtp.pt/play/direto/rtp1",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/RTP1_-_Logo_2016.svg",
  },
  rtp2: {
    name: "RTP2",
    hint: "Cultura",
    url: "https://www.rtp.pt/play/direto/rtp2",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/RTP2_logo_2016.svg",
  },
  rtp3: {
    name: "RTP3",
    hint: "Notícias",
    url: "https://www.rtp.pt/play/direto/rtp3",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RTP3_logo.svg",
  },
};

const cards = document.querySelectorAll(".channel-card");
const frame = document.getElementById("channel-frame");
const title = document.getElementById("channel-title");
const btnReload = document.getElementById("btn-reload");
const btnFullscreen = document.getElementById("btn-fullscreen");
const clock = document.getElementById("clock");

function setActive(channelKey, { save = true } = {}) {
  const channel = channels[channelKey];
  if (!channel) return;

  // Active UI
  cards.forEach((c) => c.classList.toggle("active", c.dataset.channel === channelKey));

  // Title + iframe
  title.textContent = channel.name;

  // Force refresh (helps when iframe caches)
  frame.src = channel.url;

  if (save) localStorage.setItem("tv_channel", channelKey);
}

function hydrateLogos() {
  cards.forEach((card) => {
    const key = card.dataset.channel;
    const img = card.querySelector(".channel-card__logo");
    if (img && channels[key]) img.src = channels[key].logo;
  });
}

function setupClicks() {
  cards.forEach((card) => {
    card.addEventListener("click", () => setActive(card.dataset.channel));
  });
}

function setupHotkeys() {
  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    if (e.key === "1") setActive("rtp1");
    if (e.key === "2") setActive("rtp2");
    if (e.key === "3") setActive("rtp3");
    if (e.key.toLowerCase() === "r") frame.src = frame.src; // quick reload
  });
}

function setupActions() {
  btnReload?.addEventListener("click", () => {
    frame.src = frame.src;
  });

  btnFullscreen?.addEventListener("click", () => {
    const el = frame;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  });
}

function setupClock() {
  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    clock.textContent = `${hh}:${mm}`;
  };
  tick();
  setInterval(tick, 30_000);
}

hydrateLogos();
setupClicks();
setupHotkeys();
setupActions();
setupClock();

// Restore last channel
const saved = localStorage.getItem("tv_channel");
setActive(saved || "rtp1", { save: false });
