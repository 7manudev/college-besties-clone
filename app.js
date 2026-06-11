import { SITE, FEATURED, CREATORS } from "./config.js";
import { cdnImage, imageFallback } from "./utils.js";

const state = { hair: null, vibe: null, new: null, niche: null, sort: null };
let pendingLink = null;

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
const newsletterPopup = document.getElementById("newsletterPopup");
const emailInput = document.getElementById("newsletterEmail");
const ageCheckbox = document.getElementById("ageConfirm");
const continueBtn = document.getElementById("continueBtn");

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
  const fallback = imageFallback(name);
  img.addEventListener("error", () => {
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallback;
  }, { once: true });
}

function creatorImageMarkup(name, src) {
  const resolved = cdnImage(src);
  return `<div class="card-media"><img src="${resolved}" alt="${name}" loading="lazy" decoding="async"></div>`;
}

function renderFeatured() {
  const wrap = document.getElementById("featuredBestie");
  const imgSrc = cdnImage(FEATURED.img);
  wrap.innerHTML = `
    <div class="bestie-inner">
      <div class="bestie-img-wrap">
        <img src="${imgSrc}" alt="${FEATURED.name}" loading="eager" decoding="async">
        ${FEATURED.isNew ? '<span class="bestie-new-badge">NEW</span>' : ""}
      </div>
      <div class="bestie-info">
        <div class="bestie-name">${FEATURED.name}</div>
        <div class="bestie-bio">${FEATURED.bio}</div>
        <button type="button" class="bestie-cta" data-profile="${FEATURED.profileUrl}">View Profile →</button>
      </div>
    </div>
  `;

  const featuredImg = wrap.querySelector("img");
  bindImageFallback(featuredImg, FEATURED.name);
  wrap.querySelector(".bestie-cta").addEventListener("click", () => openGate(FEATURED.profileUrl));
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
    card.innerHTML = `
      ${creator.isNew ? '<span class="new-badge">NEW</span>' : ""}
      ${creatorImageMarkup(creator.name, creator.img)}
      <div class="card-name">${creator.name}</div>
    `;

    bindImageFallback(card.querySelector("img"), creator.name);
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
  const featured = document.getElementById("featuredBestie").closest(".bestie-of-day");
  featured.style.display = Object.values(state).some((value) => value !== null) ? "none" : "";

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

function openGate(link) {
  pendingLink = link || "#";
  document.body.classList.add("popup-open");
  newsletterPopup.style.display = "flex";
}

function closeGate() {
  document.body.classList.remove("popup-open");
  newsletterPopup.style.display = "none";
  pendingLink = null;
}

function updateContinueState() {
  continueBtn.disabled = !(ageCheckbox.checked && emailInput.value.trim().length > 3);
}

async function handleSubscribe(email) {
  if (!SITE.emailListId || SITE.emailListId === "YOUR_KLAVIYO_LIST_ID") {
    console.info("Klaviyo list id not configured — skipping subscribe call.");
    return;
  }

  await fetch("https://manage.kmail-lists.com/ajax/subscriptions/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({
      g: SITE.emailListId,
      email,
      $source: SITE.source,
      $fields: "source,age_confirmed",
      $consent: "email",
      site_source: SITE.source,
      source: SITE.source,
      age_confirmed: "true",
    }),
  });
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
    openGate(card.dataset.profile);
  });

  emailInput.addEventListener("input", updateContinueState);
  ageCheckbox.addEventListener("change", updateContinueState);

  document.getElementById("newsletterForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !ageCheckbox.checked) return;

    try {
      await handleSubscribe(email);
    } catch (error) {
      console.error("Subscribe failed", error);
    }

    if (pendingLink && pendingLink !== "#") {
      window.open(pendingLink, "_blank", "noopener,noreferrer");
    }
    closeGate();
  });

  document.getElementById("closePopup").addEventListener("click", closeGate);

  const viewAllBar = document.getElementById("viewAllBar");
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

document.getElementById("siteName").textContent = SITE.name;
document.getElementById("heroTitle").textContent = SITE.tagline;
document.getElementById("heroSubtitle").firstChild.textContent = `${SITE.subtitle} `;
document.getElementById("badgePopular").textContent = SITE.badges[0] || "Popular";
document.getElementById("badgeTrusted").textContent = SITE.badges[1] || "Trusted Creators";
document.getElementById("filterHint").textContent = SITE.filterHint;

renderFeatured();
renderCards();
bindEvents();
bindBookmarkCallout();
updateApplyBtn();
updateChipVisibility();