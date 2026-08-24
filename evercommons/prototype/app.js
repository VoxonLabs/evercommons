const views = {
  onboarding: document.querySelector("#view-onboarding"),
  feed: document.querySelector("#view-feed"),
  upload: document.querySelector("#view-upload"),
  profile: document.querySelector("#view-profile"),
  report: document.querySelector("#view-report"),
  safety: document.querySelector("#view-safety"),
  creator: document.querySelector("#view-creator"),
  capacity: document.querySelector("#view-capacity"),
};

const posts = [
  {
    id: "harbor",
    title: "Harbor walk",
    by: "sample.creator",
    poster: "a",
    caption: "Placeholder clip. No real user media.",
    explicit: false,
    feeds: ["following", "latest"],
  },
  {
    id: "workshop",
    title: "Workshop light",
    by: "sample.maker",
    poster: "b",
    caption: "Sample following feed item.",
    explicit: false,
    feeds: ["following", "latest", "discovery"],
  },
  {
    id: "market",
    title: "Morning market",
    by: "sample.news",
    poster: "c",
    caption: "Chronological sample.",
    explicit: false,
    feeds: ["latest", "discovery"],
  },
  {
    id: "ceramics",
    title: "Studio ceramic series",
    by: "sample.craft",
    poster: "a",
    caption: "Curated showcase post from creator's personal export archive.",
    explicit: false,
    feeds: ["following", "latest", "discovery"],
    archiveOrigin: {
      platform: "Instagram archive",
      likes: "1.4k",
      date: "2025-04",
    },
  },
  {
    id: "restricted",
    title: "Restricted sample",
    by: "sample.safety",
    poster: "explicit",
    caption: "Tagged explicit so safety controls can be tested.",
    explicit: true,
    feeds: ["discovery"],
  },
];

const state = {
  feed: "following",
  explicit: sessionStorage.getItem("ec-explicit") || "hide",
  following: false,
  blocked: false,
  muted: false,
};

function routeName() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "" || hash === "onboarding") {
    return sessionStorage.getItem("ec-demo") ? "feed" : "onboarding";
  }
  return views[hash] ? hash : "feed";
}

function showView(name) {
  for (const [key, node] of Object.entries(views)) {
    const active = key === name;
    node.hidden = !active;
  }
  for (const link of document.querySelectorAll(".nav a")) {
    const isCurrent = link.dataset.nav === name;
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
  if (name === "feed") {
    renderFeeds();
  }
  if (name === "safety") {
    const selected = document.querySelector(`input[name="explicit"][value="${state.explicit}"]`);
    if (selected) {
      selected.checked = true;
    }
    renderLists();
  }
}

function renderFeeds() {
  for (const kind of ["following", "latest", "discovery"]) {
    const root = document.querySelector(`#feed-${kind}`);
    root.innerHTML = "";
    if (kind === "discovery") {
      root.append(adCard());
    }
    for (const post of posts.filter((item) => item.feeds.includes(kind))) {
      root.append(postCard(post));
    }
    root.hidden = kind !== state.feed;
  }
  for (const tab of document.querySelectorAll(".tabs button")) {
    tab.setAttribute("aria-selected", String(tab.dataset.feed === state.feed));
  }
}

function postCard(post) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.explicit = String(post.explicit);
  if (post.explicit && state.explicit === "hide") {
    article.classList.add("hidden-explicit");
  }
  if (post.explicit && state.explicit === "blur") {
    article.classList.add("blurred-explicit");
  }
  const poster = document.createElement("div");
  poster.className = `poster ${post.poster}`;
  poster.setAttribute("role", "img");
  poster.setAttribute("aria-label", `Placeholder poster for ${post.title}`);
  const title = document.createElement("h2");
  title.textContent = post.title;
  const meta = document.createElement("p");
  meta.textContent = `${post.by} · sample`;
  const caption = document.createElement("p");
  caption.textContent = post.caption;
  article.append(poster, title, meta, caption);
  if (post.archiveOrigin) {
    const badge = document.createElement("div");
    badge.className = "archive-badge";
    const tag = document.createElement("span");
    tag.className = "badge-tag";
    tag.textContent = "Archived Post";
    const detail = document.createTextNode(
      ` Origin metric: ~${post.archiveOrigin.likes} likes on ${post.archiveOrigin.platform} (${post.archiveOrigin.date}) · `,
    );
    const note = document.createElement("small");
    note.textContent = "Feed neutral";
    badge.append(tag, detail, note);
    article.append(badge);
  }
  if (post.explicit && state.explicit === "blur") {
    const warn = document.createElement("p");
    warn.className = "warn";
    warn.textContent = "Explicit sample hidden behind a blur.";
    article.prepend(warn);
  }
  return article;
}

function adCard() {
  const article = document.createElement("article");
  article.className = "ad";
  article.innerHTML =
    '<p class="ad-label">Sponsored · contextual</p><h2>Sample harbor tools</h2><p>Discovery can include a labeled sponsor card. It is not targeted from Shield claims.</p>';
  return article;
}

function renderLists() {
  const lists = document.querySelector("#lists");
  const parts = [];
  if (state.blocked) {
    parts.push("Blocked: local-demo (this demo profile).");
  }
  if (state.muted) {
    parts.push("Muted: local-demo (this demo profile).");
  }
  lists.className = parts.length ? "note" : "empty";
  lists.textContent = parts.join(" ") || "No blocked or muted accounts in this demo.";
}

function setStatus(id, text) {
  const node = document.querySelector(id);
  if (node) {
    node.textContent = text;
  }
}

document.querySelector(".tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("button[data-feed]");
  if (!tab) {
    return;
  }
  state.feed = tab.dataset.feed;
  renderFeeds();
});

document.querySelector("#upload-form").addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus(
    "#upload-status",
    "Upload blocked. RFC-0003 requires private intake, processed derivatives, quotas, and a kill switch first.",
  );
});

const archiveForm = document.querySelector("#archive-form");
if (archiveForm) {
  archiveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus(
      "#archive-status",
      "Archive import blocked in demo. Requires local client-side unpacking, selective showcase curation, and sanitized private intake slots.",
    );
  });
}

document.querySelector("#report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const reason = new FormData(event.target).get("reason");
  if (!reason) {
    setStatus("#report-status", "Choose a reason. Nothing is sent to a server.");
    return;
  }
  setStatus(
    "#report-status",
    `Demo report queued as “${reason}”. There is no live moderation backend.`,
  );
});

document.querySelector("#appeal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.reset();
  setStatus("#appeal-status", "Demo appeal queued. Decisions would include a reason and an expiry.");
});

document.querySelector("#view-safety").addEventListener("change", (event) => {
  if (event.target.name === "explicit") {
    state.explicit = event.target.value;
    sessionStorage.setItem("ec-explicit", state.explicit);
    renderFeeds();
  }
});

document.querySelector("#view-profile").addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (action === "follow") {
    state.following = !state.following;
    setStatus("#profile-status", state.following ? "Following sample creator." : "Unfollowed sample creator.");
  }
  if (action === "block") {
    state.blocked = !state.blocked;
    renderLists();
    setStatus("#profile-status", state.blocked ? "Blocked in this demo only." : "Unblocked.");
  }
  if (action === "mute") {
    state.muted = !state.muted;
    renderLists();
    setStatus("#profile-status", state.muted ? "Muted in this demo only." : "Unmuted.");
  }
});

document.querySelector("#why-ad").addEventListener("click", () => {
  const why = document.querySelector("#ad-why");
  why.hidden = !why.hidden;
});

window.addEventListener("hashchange", () => {
  const name = routeName();
  if (name !== "onboarding") {
    sessionStorage.setItem("ec-demo", "1");
  }
  showView(name);
});

if (!window.location.hash) {
  window.location.hash = sessionStorage.getItem("ec-demo") ? "#/feed" : "#/onboarding";
}
showView(routeName());
