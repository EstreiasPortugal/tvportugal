// app.js (layout Dock inferior + pesquisa + favoritos ⭐ + mais canais)

// Helper: cria um "logo" SVG (data URI) quando não há ficheiro público fácil.
function svgLogo(text) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6d7cff"/>
        <stop offset="1" stop-color="#9b5cff"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>
    <rect x="10" y="18" width="200" height="84" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)"/>
    <text x="110" y="78" text-anchor="middle" font-family="Inter, Arial" font-size="54" font-weight="800" fill="url(#g)" filter="url(#s)">${text}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

// URLs "estáveis" do Wikimedia Commons (quando existe ficheiro público)
const commons = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

/**
 * Canais (nota: alguns "diretos" podem não permitir embed em iframe — depende de X-Frame-Options/region)
 * Atalhos:
 * 1-9,0 e também Q/W/E/R para os 4 canais extra RTP (Açores/Madeira/Memória/Internacional)
 */
const channels = [
  // RTP
  {
    key: "rtp1",
    name: "RTP1",
    hint: "Generalista",
    url: "https://www.rtp.pt/play/direto/rtp1",
    logo: commons("RTP1 - Logo 2016.svg"),
    hotkey: "1",
  },
  {
    key: "rtp2",
    name: "RTP2",
    hint: "Cultura",
    url: "https://www.rtp.pt/play/direto/rtp2",
    logo: commons("RTP2 2016 (Reduced Version).svg"),
    hotkey: "2",
  },
  {
    key: "rtp3",
    name: "RTP3",
    hint: "Notícias",
    url: "https://www.rtp.pt/play/direto/rtp3",
    logo: commons("RTP3 2016 (Reduced Version).svg"),
    hotkey: "3",
  },

  // Generalistas
  {
    key: "sic",
    name: "SIC",
    hint: "Generalista",
    url: "https://www.sic.pt/direto/",
    logo: svgLogo("SIC"),
    hotkey: "4",
  },
  {
    key: "tvi",
    name: "TVI",
    hint: "Generalista",
    url: "https://tvi.iol.pt/direto",
    logo: commons("Logótipo TVI.png"),
    hotkey: "5",
  },

  // Notícias / Geral
  {
    key: "cmtv",
    name: "CMTV",
    hint: "Notícias / Geral",
    url: "https://www.cmjornal.pt/multimedia/videos/direto-cmtv",
    logo: commons("CMTV.jpg"),
    hotkey: "6",
  },
  {
    key: "sicn",
    name: "SIC Notícias",
    hint: "Notícias",
    url: "https://sicnoticias.pt/direto/",
    logo: commons("SIC Notícias (2023).svg"),
    hotkey: "7",
  },
  {
    key: "cnnp",
    name: "CNN Portugal",
    hint: "Notícias",
    url: "https://cnnportugal.iol.pt/direto",
    logo: commons("CNN Portugal.svg"),
    hotkey: "8",
  },

  // Desporto / Outros
  {
    key: "canal11",
    name: "Canal 11",
    hint: "Desporto",
    url: "https://canal11.pt/direto",
    logo: commons("Logo Canal 11 FPF.svg"),
    hotkey: "9",
  },
  {
    key: "portocanal",
    name: "Porto Canal",
    hint: "Região / Geral",
    url: "https://portocanal.sapo.pt/direto",
    logo: commons("Porto Canal logo.jpg"),
    hotkey: "0",
  },

  // +4 canais (RTP Play) — se algum logo falhar, usamos SVG bonito/consistente
  {
    key: "rtpacores",
    name: "RTP Açores",
    hint: "Regional",
    url: "https://www.rtp.pt/play/direto/rtpacores",
    logo: svgLogo("RTP Açores"),
    hotkey: "q",
  },
  {
    key: "rtpmadeira",
    name: "RTP Madeira",
    hint: "Regional",
    url: "https://www.rtp.pt/play/direto/rtpmadeira",
    logo: svgLogo("RTP Madeira"),
    hotkey: "w",
  },
  {
    key: "rtpmemoria",
    name: "RTP Memória",
    hint: "Arquivo / Clássicos",
    url: "https://www.rtp.pt/play/direto/rtpmemoria",
    logo: svgLogo("RTP Memória"),
    hotkey: "e",
  },
  {
    key: "rtpinternacional",
    name: "RTP Internacional",
    hint: "Diáspora",
    url: "https://www.rtp.pt/play/direto/rtpinternacional",
    logo: svgLogo("RTP Int."),
    hotkey: "r",
  },
];

const els = {
  list: document.getElementById("channel-list"),
  frame: document.getElementById("channel-frame"),
  title: document.getElementById("channel-title"),
  btnReload: document.getElementById("btn-reload"),
  btnFullscreen: document.getElementById("btn-fullscreen"),
  clock: document.getElementById("clock"),
  search: document.getElementById("search"),
  clearSearch: document.getElementById("clear-search"),
  favOnly: document.getElementById("fav-only"),
};

const LS = {
  channel: "tv_channel",
  favs: "tv_favorites",
  favOnly: "tv_fav_only",
  query: "tv_query",
};

function loadFavs() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS.favs) || "[]"));
  } catch {
    return new Set();
  }
}
function saveFavs(set) {
  localStorage.setItem(LS.favs, JSON.stringify([...set]));
}

let favs = loadFavs();

let state = {
  active: localStorage.getItem(LS.channel) || "rtp1",
  query: localStorage.getItem(LS.query) || "",
  favOnly: localStorage.getItem(LS.favOnly) === "1",
};

function matchesQuery(ch, q) {
  if (!q) return true;
  const hay = `${ch.name} ${ch.hint}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderList() {
  const q = state.query.trim();
  const items = channels
    .filter((ch) => matchesQuery(ch, q))
    .filter((ch) => !state.favOnly || favs.has(ch.key));

  els.list.innerHTML = "";

  items.forEach((ch) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `channel-pill${ch.key === state.active ? " active" : ""}`;
    card.dataset.channel = ch.key;

    const logo = document.createElement("img");
    logo.className = "channel-pill__logo";
    logo.alt = `Logo ${ch.name}`;
    logo.loading = "lazy";
    logo.src = ch.logo;

    // Se um logo do Commons falhar, cai para SVG
    logo.addEventListener(
      "error",
      () => {
        logo.src = svgLogo(ch.name);
      },
      { once: true }
    );

    const meta = document.createElement("div");
    meta.className = "channel-pill__meta";
    meta.innerHTML = `
      <div class="channel-pill__name">${ch.name}</div>
      <div class="channel-pill__hint">${ch.hint}</div>
    `;

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = `fav-btn${favs.has(ch.key) ? " is-fav" : ""}`;
    favBtn.title = favs.has(ch.key) ? "Remover dos favoritos" : "Adicionar aos favoritos";
    favBtn.setAttribute("aria-label", favBtn.title);
    favBtn.textContent = "★";

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (favs.has(ch.key)) favs.delete(ch.key);
      else favs.add(ch.key);
      saveFavs(favs);
      renderList();
    });

    card.appendChild(logo);
    card.appendChild(meta);
    card.appendChild(favBtn);

    card.addEventListener("click", () => setActive(ch.key));
    els.list.appendChild(card);
  });
}

function setActive(key, { save = true } = {}) {
  const ch = channels.find((c) => c.key === key);
  if (!ch) return;

  state.active = key;

  // UI
  els.title.textContent = ch.name;

  // Carrega stream (força refresh)
  els.frame.src = ch.url;

  if (save) localStorage.setItem(LS.channel, key);

  renderList();
}

function setupSearch() {
  if (!els.search) return;

  els.search.value = state.query;

  if (els.favOnly) els.favOnly.setAttribute("aria-pressed", String(state.favOnly));
  if (els.clearSearch) els.clearSearch.style.opacity = els.search.value ? "1" : "0.6";

  els.search.addEventListener("input", () => {
    state.query = els.search.value;
    localStorage.setItem(LS.query, state.query);
    if (els.clearSearch) els.clearSearch.style.opacity = els.search.value ? "1" : "0.6";
    renderList();
  });

  els.clearSearch?.addEventListener("click", () => {
    els.search.value = "";
    state.query = "";
    localStorage.setItem(LS.query, "");
    els.search.focus();
    els.clearSearch.style.opacity = "0.6";
    renderList();
  });

  els.favOnly?.addEventListener("click", () => {
    state.favOnly = !state.favOnly;
    localStorage.setItem(LS.favOnly, state.favOnly ? "1" : "0");
    els.favOnly.setAttribute("aria-pressed", String(state.favOnly));
    renderList();
  });
}

function setupHotkeys() {
  window.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName;
    if (tag && ["INPUT", "TEXTAREA"].includes(tag)) return;

    if (e.key.toLowerCase() === "r") {
      // NOTA: 'r' está a ser usado como hotkey para RTP Internacional;
      // para recarregar, usa Shift+R.
      if (e.shiftKey) els.frame.src = els.frame.src;
      return;
    }

    if (e.key.toLowerCase() === "shift") return;

    const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const ch = channels.find((c) => String(c.hotkey).toLowerCase() === pressed);
    if (ch) setActive(ch.key);
  });
}

function setupActions() {
  els.btnReload?.addEventListener("click", () => {
    els.frame.src = els.frame.src;
  });

  els.btnFullscreen?.addEventListener("click", () => {
    const el = els.frame;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  });
}

function setupClock() {
  if (!els.clock) return;
  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    els.clock.textContent = `${hh}:${mm}`;
  };
  tick();
  setInterval(tick, 30_000);
}

// Init
setupSearch();
setupHotkeys();
setupActions();
setupClock();
renderList();
setActive(state.active, { save: false });
