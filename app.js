import { SITE, FEATURED, CREATORS } from "./config.js";
import { cdnImage, imageFallback } from "./utils.js";

const DESIGN = document.body.dataset.design || "default";
const state = { hair: null, vibe: null, new: null, niche: null, sort: null };
const grid = document.getElementById("friendsGrid");
const emptyState = document.getElementById("emptyState");
const overlay = document.getElementById("sheetOverlay");
const sheet = document.getElementById("bottomSheet");
const btnOpen = document.getElementById("btnOpenFilter");
const btnClear = document.getElementById("sheetClear");
const btnApply = document.getElementById("sheetApply");
const countEl = document.getElementById("filterCount");
const pillsEl = document.getElementById("activePills");
const resultsEl = document.getElementById("resultsCount");

const pillLabels = {
  hair: { blonde: "Blonde", brunette: "Brunette", multicolor: "Multicolor" },
  vibe: {
    "girl-next-door": "GND",
    alt: "Alt",
    sporty: "Sporty",
    glam: "Glam",
    preppy: "Preppy",
  },
  new: { new: "New" },
  niche: { egirl: "E-Girl", latina: "Latina", mixed: "Mixed", white: "White" },
  sort: { az: "A→Z", za: "Z→A" },
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function bindImageFallback(img, name) {
  img.addEventListener("error", () => {
    if (img.dataset.fallbackApplied === "true") return;
    const nextSrc = imageFallback(name);
    if (!nextSrc || img.src === nextSrc) return;
    img.dataset.fallbackApplied = "true";
    img.src = nextSrc;
  });
}

function creatorImageMarkup(name, src, eager = false) {
  const resolved = cdnImage(src);
  const loading = eager ? "eager" : "lazy";
  return `<img src="${resolved}" alt="${name}" loading="${loading}" decoding="async">`;
}

function newBadgeMarkup(isNew) {
  return isNew ? '<span class="new-badge">NEW</span>' : "";
}

function featuredInnerMarkup() {
  const imgSrc = cdnImage(FEATURED.img);
  const img = creatorImageMarkup(FEATURED.name, FEATURED.img, true);
  const newBadge = FEATURED.isNew ? '<span class="bestie-new-badge">NEW</span>' : "";

  if (DESIGN === "d1") {
    return `
      <div class="bestie-inner bestie-inner--editorial">
        <div class="bestie-img-wrap bestie-img-wrap--hero">
          ${img}
          ${newBadge}
          <div class="bestie-hero-overlay">
            <p class="bestie-eyebrow">Featured Creator</p>
            <div class="bestie-name">${FEATURED.name}</div>
            <div class="bestie-bio">${FEATURED.bio}</div>
            <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">View Profile</button>
          </div>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d2") {
    return `
      <div class="bestie-inner bestie-inner--social">
        <div class="bestie-img-wrap">
          ${img}
          ${newBadge}
        </div>
        <div class="bestie-info">
          <div class="bestie-name">${FEATURED.name}</div>
          <div class="bestie-bio">${FEATURED.bio}</div>
          <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">View Profile</button>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d3") {
    return `
      <div class="bestie-inner bestie-inner--cinema">
        <div class="bestie-img-wrap bestie-img-wrap--cinema">
          ${img}
          ${newBadge}
        </div>
        <div class="bestie-info">
          <p class="bestie-eyebrow">Spotlight</p>
          <div class="bestie-name">${FEATURED.name}</div>
          <div class="bestie-bio">${FEATURED.bio}</div>
          <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">Discover ${FEATURED.name}</button>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d4") {
    return `
      <div class="bestie-inner bestie-inner--bento">
        <div class="bestie-img-wrap">
          ${img}
          ${newBadge}
        </div>
        <div class="bestie-info">
          <div class="bestie-name">${FEATURED.name}</div>
          <div class="bestie-bio">${FEATURED.bio}</div>
          <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">Open Profile →</button>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d5") {
    return `
      <div class="bestie-inner bestie-inner--showcase">
        <div class="bestie-img-wrap bestie-img-wrap--showcase">
          ${img}
          ${newBadge}
          <div class="bestie-showcase-gradient"></div>
          <div class="bestie-info bestie-info--overlay">
            <div class="bestie-name">${FEATURED.name}</div>
            <div class="bestie-bio">${FEATURED.bio}</div>
            <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">View Profile</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="bestie-inner">
      <div class="bestie-img-wrap">
        <img src="${imgSrc}" alt="${FEATURED.name}" loading="eager" decoding="async">
        ${newBadge}
      </div>
      <div class="bestie-info">
        <div class="bestie-name">${FEATURED.name}</div>
        <div class="bestie-bio">${FEATURED.bio}</div>
        <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">View Profile →</button>
      </div>
    </div>
  `;
}

function cardInnerMarkup(creator) {
  const img = creatorImageMarkup(creator.name, creator.img);
  const badge = newBadgeMarkup(creator.isNew);

  if (DESIGN === "d1") {
    return `
      <div class="card-media card-media--portrait">
        ${img}
        <div class="card-overlay">
          ${badge}
          <div class="card-name">${creator.name}</div>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d2") {
    return `
      ${badge}
      <div class="card-media card-media--square">
        ${img}
      </div>
      <div class="card-name">${creator.name}</div>
    `;
  }

  if (DESIGN === "d3") {
    return `
      <div class="card-media card-media--tall">
        ${img}
        <div class="card-overlay card-overlay--hover">
          ${badge}
          <div class="card-name">${creator.name}</div>
          <span class="card-cta-hint">View profile</span>
        </div>
      </div>
    `;
  }

  if (DESIGN === "d4") {
    return `
      ${badge}
      <div class="card-media card-media--bento">
        ${img}
      </div>
      <div class="card-meta">
        <div class="card-name">${creator.name}</div>
        <span class="card-vibe">${creator.vibe.replace(/-/g, " ")}</span>
      </div>
    `;
  }

  if (DESIGN === "d5") {
    return `
      <div class="card-media card-media--showcase">
        ${img}
        <div class="card-overlay card-overlay--bottom">
          ${badge}
          <div class="card-name">${creator.name}</div>
        </div>
      </div>
    `;
  }

  return `
    ${badge}
    <div class="card-media">${img}</div>
    <div class="card-name">${creator.name}</div>
  `;
}

function renderFeatured() {
  const wrap = document.getElementById("featuredBestie");
  wrap.innerHTML = featuredInnerMarkup();
  const featuredImg = wrap.querySelector("img");
  if (featuredImg) bindImageFallback(featuredImg, FEATURED.name);
  wrap.querySelector(".bestie-cta").addEventListener("click", () => window.open(FEATURED.profileUrl, "_blank"));
}

function renderStories() {
  const rail = document.getElementById("storiesRail");
  if (!rail) return;

  const picks = shuffle([...CREATORS]).slice(0, 14);
  rail.innerHTML = `
    <div class="stories-track">
      ${picks
        .map(
          (creator) => `
        <button type="button" class="story-item" data-profile="${creator.profileUrl}" data-name="${creator.name}">
          <span class="story-ring${creator.isNew ? " story-ring--new" : ""}">
            <img src="${cdnImage(creator.img)}" alt="${creator.name}" loading="lazy" decoding="async">
          </span>
          <span class="story-label">${creator.name.split(" ")[0]}</span>
        </button>
      `
        )
        .join("")}
    </div>
  `;

  rail.querySelectorAll(".story-item").forEach((item) => {
    bindImageFallback(item.querySelector("img"), item.dataset.name);
    item.addEventListener("click", () => window.open(item.dataset.profile, "_blank"));
  });
}

function renderCards() {
  shuffle(CREATORS).forEach((creator) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.hair = creator.hair;
    card.dataset.vibe = creator.vibe;
    card.dataset.niche = creator.niche;
    card.dataset.isNew = creator.isNew ? "true" : "false";
    card.dataset.name = creator.name;
    card.dataset.profile = creator.profileUrl;
    card.innerHTML = cardInnerMarkup(creator);

    const img = card.querySelector("img");
    if (img) bindImageFallback(img, creator.name);
    grid.appendChild(card);
  });
}

function openSheet() {
  overlay.classList.add("visible");
  sheet.classList.add("open");
  document.body.classList.add("sheet-open");
}

function closeSheet() {
  overlay.classList.remove("visible");
  sheet.classList.remove("open");
  document.body.classList.remove("sheet-open");
}

function matchesFilters(card) {
  if (state.hair && card.dataset.hair !== state.hair) return false;
  if (state.vibe && card.dataset.vibe !== state.vibe) return false;
  if (state.new === "new" && card.dataset.isNew !== "true") return false;
  if (state.niche && card.dataset.niche !== state.niche) return false;
  return true;
}

function getVisibleCount() {
  return [...grid.querySelectorAll(".card")].filter((card) => matchesFilters(card)).length;
}

function updateClearBtn() {
  btnClear.classList.toggle("visible", Object.values(state).some((value) => value !== null));
}

function updateApplyBtn() {
  const count = getVisibleCount();
  btnApply.textContent = `Show ${count} creator${count !== 1 ? "s" : ""}`;
}

function updateChipVisibility() {
  const allCards = [...grid.querySelectorAll(".card")];
  document.querySelectorAll(".chip").forEach((chip) => {
    const group = chip.dataset.group;
    const value = chip.dataset.value;
    if (group === "sort") {
      chip.style.display = "";
      return;
    }
    const testState = { ...state, [group]: value };
    const count = allCards.filter((card) => {
      if (testState.hair && card.dataset.hair !== testState.hair) return false;
      if (testState.vibe && card.dataset.vibe !== testState.vibe) return false;
      if (testState.new === "new" && card.dataset.isNew !== "true") return false;
      if (testState.niche && card.dataset.niche !== testState.niche) return false;
      return true;
    }).length;
    chip.style.display = count === 0 ? "none" : "";
  });
}

function renderPills() {
  pillsEl.innerHTML = "";
  Object.entries(state).forEach(([group, value]) => {
    if (!value) return;
    const label = pillLabels[group]?.[value] || value;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "active-pill";
    pill.textContent = `${label} ×`;
    pill.addEventListener("click", () => {
      state[group] = null;
      document.querySelectorAll(`.chip[data-group="${group}"]`).forEach((chip) => {
        chip.classList.remove("selected");
      });
      applyFilters();
    });
    pillsEl.appendChild(pill);
  });
}

function applyFilters() {
  const featuredWrap = document.getElementById("featuredBestie");
  const featured = featuredWrap?.closest(".bestie-of-day");
  if (featured) {
    featured.style.display = Object.values(state).some((value) => value !== null) ? "none" : "";
  }

  const allCards = [...grid.querySelectorAll(".card")];
  const visible = allCards.filter((card) => matchesFilters(card));
  const hidden = allCards.filter((card) => !visible.includes(card));

  if (state.sort === "az") visible.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
  if (state.sort === "za") visible.sort((a, b) => b.dataset.name.localeCompare(a.dataset.name));

  hidden.forEach((card) => card.classList.add("hidden"));
  visible.forEach((card) => {
    card.classList.remove("hidden");
    grid.appendChild(card);
  });
  grid.appendChild(emptyState);
  emptyState.style.display = visible.length === 0 ? "block" : "none";

  const activeCount = Object.values(state).filter((value) => value !== null).length;
  countEl.textContent = activeCount;
  btnOpen.classList.toggle("has-filters", activeCount > 0);
  resultsEl.textContent = activeCount > 0 ? `Showing ${visible.length} of ${allCards.length} creators` : "";
  renderPills();
  updateApplyBtn();
  updateChipVisibility();
}

function bindBookmarkCallout() {
  const el = document.getElementById("bookmark-callout");
  const copy = document.getElementById("bookmark-copy");
  if (!el || !copy) return;

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isChrome = /chrome/.test(ua) && !/edge|edg|opr/.test(ua);
  const isSafari = /safari/.test(ua) && !isChrome;
  const isMac = /macintosh/.test(ua);

  el.style.top = el.style.right = el.style.bottom = el.style.left = "auto";

  if (isIOS && isSafari) {
    el.style.bottom = "4px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    copy.textContent = "Add Page To Bookmarks ↓";
  } else if (isAndroid) {
    el.style.bottom = "90px";
    el.style.right = "16px";
    copy.textContent = 'Tap ⋮ then "Add Bookmark"';
  } else if (isMac && isSafari) {
    el.style.top = "14px";
    el.style.left = "20px";
    copy.textContent = 'Click Share ↑ then "Add Bookmark"';
  } else {
    el.style.top = "14px";
    el.style.right = "20px";
    copy.innerHTML = 'Click the <span class="bookmark-star">⭐</span> to add to bookmarks';
  }
}

function bindEvents() {
  btnOpen.addEventListener("click", openSheet);
  overlay.addEventListener("click", closeSheet);
  btnApply.addEventListener("click", () => {
    applyFilters();
    closeSheet();
  });

  btnClear.addEventListener("click", () => {
    Object.keys(state).forEach((key) => {
      state[key] = null;
    });
    document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("selected"));
    updateClearBtn();
    updateApplyBtn();
    updateChipVisibility();
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      if (state[group] === value) {
        state[group] = null;
        chip.classList.remove("selected");
      } else {
        document.querySelectorAll(`.chip[data-group="${group}"]`).forEach((item) => {
          item.classList.remove("selected");
        });
        state[group] = value;
        chip.classList.add("selected");
      }
      updateClearBtn();
      updateApplyBtn();
      updateChipVisibility();
    });
  });

  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;
    window.open(card.dataset.profile, "_blank");
  });

  const viewAllBar = document.getElementById("viewAllBar");
  if (viewAllBar) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          viewAllBar.classList.toggle("hidden", window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    });

    document.getElementById("viewAllBtn").addEventListener("click", () => {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

const siteName = document.getElementById("siteName");
if (siteName) siteName.textContent = SITE.name;
const heroTitle = document.getElementById("heroTitle");
if (heroTitle) heroTitle.textContent = SITE.tagline;
const heroSubtitle = document.getElementById("heroSubtitle");
if (heroSubtitle?.firstChild) heroSubtitle.firstChild.textContent = `${SITE.subtitle} `;
document.getElementById("badgePopular").textContent = SITE.badges[0] || "Popular";
document.getElementById("badgeTrusted").textContent = SITE.badges[1] || "Trusted Creators";
document.getElementById("filterHint").textContent = SITE.filterHint;

renderFeatured();
renderStories();
renderCards();
bindEvents();
bindBookmarkCallout();
updateApplyBtn();
updateChipVisibility();