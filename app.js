    `;
  }).join("");
}

function editingValue() {
  if (!state.editingBookmarkId) return "";
  const bookmark = videoBookmarks().find((item) => item.id === state.editingBookmarkId);
  return escapeHtml(bookmark?.name ?? "");
}

function bindPortalEvents() {
  document.querySelectorAll("[data-video-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeVideoId = button.dataset.videoId;
      state.editingBookmarkId = null;
      markRecent(state.activeVideoId);
      render();
    });
  });

  document.querySelector("[data-action='logout']").addEventListener("click", () => {
    localStorage.removeItem(STORAGE.student);
    state.student = null;
    render();
  });

  const video = document.querySelector("#lessonVideo");
  const form = document.querySelector("#bookmarkForm");
  const shield = document.querySelector("#privacyShield");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#bookmarkName").value.trim();
    const timestamp = video.currentTime || state.progress[state.activeVideoId]?.currentTime || 0;
    upsertBookmark(name, timestamp);
    render();
  });

  video.addEventListener("loadedmetadata", () => {
    state.progress[state.activeVideoId] = {
      ...(state.progress[state.activeVideoId] ?? {}),
      duration: video.duration || 0
    };
    save(STORAGE.progress, state.progress);
  });

  video.addEventListener("timeupdate", () => {
    state.progress[state.activeVideoId] = {
      currentTime: video.currentTime,
      duration: video.duration || state.progress[state.activeVideoId]?.duration || 0
    };
    save(STORAGE.progress, state.progress);
    updateProgressDisplay(video);
  });

  video.addEventListener("play", () => markRecent(state.activeVideoId));

  document.querySelectorAll("[data-bookmark-id]").forEach((button) => {
    button.addEventListener("click", () => handleBookmarkAction(button.dataset.action, button.dataset.bookmarkId));
  });

  if (!documentProtectionBound) {
    document.addEventListener("visibilitychange", () => document.querySelector("#privacyShield")?.classList.toggle("visible", document.hidden));
    window.addEventListener("blur", () => document.querySelector("#privacyShield")?.classList.add("visible"));
    window.addEventListener("focus", () => document.querySelector("#privacyShield")?.classList.remove("visible"));
    document.addEventListener("contextmenu", preventProtectedAction);
    document.addEventListener("copy", preventProtectedAction);
    document.addEventListener("keydown", handleProtectedKeys);
    documentProtectionBound = true;
  }
}

function restoreVideoPosition() {
  const video = document.querySelector("#lessonVideo");
  const stored = state.progress[state.activeVideoId]?.currentTime ?? 0;
  video.addEventListener("loadedmetadata", () => {
    if (stored > 0 && stored < video.duration - 3) {
      video.currentTime = stored;
    }
  }, { once: true });
}

function upsertBookmark(name, timestamp) {
  const videoId = state.activeVideoId;
  const existing = state.bookmarks[videoId] ?? [];

  if (state.editingBookmarkId) {
    state.bookmarks[videoId] = existing.map((bookmark) =>
      bookmark.id === state.editingBookmarkId ? { ...bookmark, name } : bookmark
    );
    state.editingBookmarkId = null;
  } else {
    const bookmark = {
      id: crypto.randomUUID(),
      videoId,
      name,
      timestamp,
      createdAt: new Date().toISOString()
    };
    state.bookmarks[videoId] = [...existing, bookmark];
  }

  save(STORAGE.bookmarks, state.bookmarks);
}

function handleBookmarkAction(action, bookmarkId) {
  const bookmark = videoBookmarks().find((item) => item.id === bookmarkId);
  if (!bookmark) return;

  if (action === "seek") {
    const video = document.querySelector("#lessonVideo");
    video.currentTime = bookmark.timestamp;
    video.play().catch(() => undefined);
  }

  if (action === "edit") {
    state.editingBookmarkId = bookmarkId;
    render();
    document.querySelector("#bookmarkName").focus();
  }

  if (action === "delete") {
    state.bookmarks[state.activeVideoId] = videoBookmarks().filter((item) => item.id !== bookmarkId);
    save(STORAGE.bookmarks, state.bookmarks);
    render();
  }
}

function markRecent(videoId) {
  state.recent = [videoId, ...state.recent.filter((id) => id !== videoId)].slice(0, 6);
  save(STORAGE.recent, state.recent);
}

function updateProgressDisplay(video) {
  const duration = video.duration || 0;
  const percent = duration ? Math.min(100, (video.currentTime / duration) * 100) : 0;
  const fill = document.querySelector(".progress-fill");
  const label = document.querySelector(".progress-row span:last-child");
  if (fill) fill.style.width = `${percent}%`;
  if (label) label.textContent = `${Math.round(percent)}%`;
}

function handleProtectedKeys(event) {
  const key = event.key.toLowerCase();
  const isPrintScreen = key === "printscreen";
  const isSaveOrPrint = (event.ctrlKey || event.metaKey) && ["s", "p"].includes(key);
  const isDevTools = key === "f12" || (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key));
  if (isPrintScreen || isSaveOrPrint || isDevTools) {
    event.preventDefault();
    showShieldTemporarily();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText("Screenshot capture is disabled for GVCC protected learning content.").catch(() => undefined);
    }
  }
}

function preventProtectedAction(event) {
  if (event.target.closest(".video-guard")) {
    event.preventDefault();
    showShieldTemporarily();
  }
}

function showShieldTemporarily() {
  const shield = document.querySelector("#privacyShield");
  if (!shield) return;
  shield.classList.add("visible");
  window.setTimeout(() => shield.classList.remove("visible"), 1300);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
