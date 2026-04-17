const CURRENT_HEALTH_SCORE = 29;
const PREVIOUS_HEALTH_SCORE = 27;
const HEALTH_SCORE_LABEL = "Developing";
const HEALTH_SCORE_TREND = "+2 from last month";
const BASELINE_HEALTH_SCORE = 23;
const HEALTH_SCORE_RING_RADIUS = 48;
const HEALTH_SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * HEALTH_SCORE_RING_RADIUS;
const CHAT_MESSAGE_AVATAR_SIZE = 34;
const SESSION_OPENER_TEXT =
  "CDO Hired & Onboarded is still the milestone that will determine whether the rest of Meridian's roadmap moves on time. What feels most at risk right now?";
const MONTHLY_PROGRESS_REPORT_PROMPT = "Generate my monthly progress report";
const REPORT_STORAGE_KEY = "lastReportMonth";

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const statusEl = document.getElementById("status");
const sendButtonEl = document.getElementById("send-button");
const layoutEl = document.querySelector(".layout");
const mobileMenuToggleEl = document.querySelector(".mobile-menu-toggle");
const sidebarOverlayEl = document.querySelector(".sidebar-overlay");
const dashboardReportDueEl = document.getElementById("dashboard-report-due");
const dashboardReportProgressFillEl = document.getElementById(
  "dashboard-report-progress-fill"
);
const dashboardReportButtonEl = document.getElementById("dashboard-report-button");
const dashboardReportBannerEl = document.getElementById("dashboard-report-banner");
const dashboardReportBannerLinkEl = document.getElementById(
  "dashboard-report-banner-link"
);
const dashboardReportBannerCloseEl = document.getElementById(
  "dashboard-report-banner-close"
);

const conversationHistory = [];
let conversationState = null;
let stateContext = null;
let thinkingMessageEl = null;
let activeRequestController = null;
let isRequestInFlight = false;

// Aria avatar SVG — single source of truth for the avatar appearance.
// Change width/height only; never touch the defs, gradients, or path data.
// Uses a unique uid per call so multiple instances don't share SVG IDs.
let _ariaAvatarUid = 0;
function ariaAvatarSVG(size) {
  const u = ++_ariaAvatarUid;
  return `<svg class="aria-avatar" width="${size}" height="${size}" viewBox="0 15 280 280" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke" style="filter:none;box-shadow:none;-webkit-filter:none;transform:translateZ(0);backface-visibility:hidden;"><defs><clipPath id="sphereClip_${u}"><circle cx="140" cy="155" r="108"/></clipPath><radialGradient id="gBase_${u}" cx="52%" cy="38%" r="72%" fx="52%" fy="32%"><stop offset="0%" stop-color="#ffb87a"/><stop offset="18%" stop-color="#f07640"/><stop offset="45%" stop-color="#e85018"/><stop offset="78%" stop-color="#d04010"/><stop offset="100%" stop-color="#b83208"/></radialGradient><radialGradient id="gBlue_${u}" cx="28%" cy="72%" r="58%" fx="25%" fy="70%"><stop offset="0%" stop-color="#b0bee8" stop-opacity="0.95"/><stop offset="35%" stop-color="#9aaada" stop-opacity="0.80"/><stop offset="65%" stop-color="#8898cc" stop-opacity="0.45"/><stop offset="100%" stop-color="#7888be" stop-opacity="0"/></radialGradient><radialGradient id="gViolet_${u}" cx="50%" cy="82%" r="42%"><stop offset="0%" stop-color="#c0b0e0" stop-opacity="0.60"/><stop offset="60%" stop-color="#a898d0" stop-opacity="0.25"/><stop offset="100%" stop-color="#9888c0" stop-opacity="0"/></radialGradient><radialGradient id="gPeach_${u}" cx="78%" cy="80%" r="38%"><stop offset="0%" stop-color="#f4c098" stop-opacity="0.65"/><stop offset="100%" stop-color="#eca878" stop-opacity="0"/></radialGradient><radialGradient id="gHighlight_${u}" cx="50%" cy="2%" r="58%"><stop offset="0%" stop-color="#fff5ee" stop-opacity="0.72"/><stop offset="55%" stop-color="#fff5ee" stop-opacity="0.18"/><stop offset="100%" stop-color="#fff5ee" stop-opacity="0"/></radialGradient><radialGradient id="gRim_${u}" cx="50%" cy="50%" r="50%"><stop offset="72%" stop-color="#000000" stop-opacity="0"/><stop offset="92%" stop-color="#000000" stop-opacity="0.14"/><stop offset="100%" stop-color="#000000" stop-opacity="0.32"/></radialGradient><radialGradient id="gHalo_${u}" cx="50%" cy="50%" r="50%"><stop offset="84%" stop-color="#e8d8cc" stop-opacity="0"/><stop offset="94%" stop-color="#e8d8cc" stop-opacity="0.35"/><stop offset="100%" stop-color="#d8c8bc" stop-opacity="0.55"/></radialGradient><filter id="fStarGlow_${u}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g><circle cx="140" cy="155" r="108" fill="url(#gBase_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gBlue_${u})" clip-path="url(#sphereClip_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gViolet_${u})" clip-path="url(#sphereClip_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gPeach_${u})" clip-path="url(#sphereClip_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gHighlight_${u})" clip-path="url(#sphereClip_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gRim_${u})" clip-path="url(#sphereClip_${u})"/><circle cx="140" cy="155" r="108" fill="url(#gHalo_${u})" clip-path="url(#sphereClip_${u})"/></g><path d="M 140,83 L 157,131 L 212,155 L 157,179 L 140,227 L 123,179 L 68,155 L 123,131 Z" fill="none" stroke="rgba(255,245,240,0.80)" stroke-width="3" stroke-linejoin="miter" stroke-miterlimit="10" filter="url(#fStarGlow_${u})"/></svg>`;
}

function renderStaticAriaAvatars() {
  document.querySelectorAll("[data-aria-avatar-size]").forEach((el) => {
    const size = Number(el.getAttribute("data-aria-avatar-size"));
    el.innerHTML = ariaAvatarSVG(size);
  });
}

const sendArrowIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 12l8-8 8 8M12 4v16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>
`;

const stopIcon = `
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5"></rect>
  </svg>
`;

const reportDueTodayIcon = `
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M11.5 2.5L5.5 10h4l-1 7.5 6-8h-4l1-7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

function applyHealthScoreContent() {
  const ringOffset =
    HEALTH_SCORE_RING_CIRCUMFERENCE * (1 - CURRENT_HEALTH_SCORE / 100);
  const scoreSinceEngagement = CURRENT_HEALTH_SCORE - BASELINE_HEALTH_SCORE;

  document.querySelectorAll("[data-health-score-ring]").forEach((ringEl) => {
    ringEl.style.setProperty(
      "--donut-circumference",
      `${HEALTH_SCORE_RING_CIRCUMFERENCE}`
    );
    ringEl.style.setProperty("--donut-offset", `${ringOffset}`);
    ringEl.style.strokeDasharray = `${HEALTH_SCORE_RING_CIRCUMFERENCE}`;
    ringEl.style.strokeDashoffset = `${ringOffset}`;
  });

  // Update the arc fade gradient endpoint so the gradient always runs from
  // the arc start (transparent) to the arc midpoint (full opacity).
  // SVG extends the last stop beyond 100%, keeping the tip fully opaque.
  const arcAngle = (CURRENT_HEALTH_SCORE / 100) * 2 * Math.PI;
  const midAngle = arcAngle / 2;
  const gradX2 = (60 + HEALTH_SCORE_RING_RADIUS * Math.cos(midAngle)).toFixed(2);
  const gradY2 = (60 + HEALTH_SCORE_RING_RADIUS * Math.sin(midAngle)).toFixed(2);
  document.querySelectorAll("[data-arc-fade-grad]").forEach((grad) => {
    grad.setAttribute("x2", gradX2);
    grad.setAttribute("y2", gradY2);
  });

  document.querySelectorAll("[data-health-score-current]").forEach((el) => {
    el.textContent = String(CURRENT_HEALTH_SCORE);
  });

  document.querySelectorAll("[data-health-score-label]").forEach((el) => {
    el.textContent = HEALTH_SCORE_LABEL;
  });

  document.querySelectorAll("[data-health-score-trend]").forEach((el) => {
    el.textContent = HEALTH_SCORE_TREND;
  });

  document
    .querySelectorAll("[data-health-score-since-engagement]")
    .forEach((el) => {
      el.textContent = `${scoreSinceEngagement >= 0 ? "+" : ""}${scoreSinceEngagement}`;
    });

  const textBySelector = new Map([
    ["[data-health-score-pill-baseline]", `Oct '24: ${BASELINE_HEALTH_SCORE}`],
    ["[data-health-score-pill-previous]", `Mar '26: ${PREVIOUS_HEALTH_SCORE}`],
    ["[data-health-score-pill-current]", `Apr '26: ${CURRENT_HEALTH_SCORE}`],
    [
      "[data-health-score-report-current]",
      `↑ ${PREVIOUS_HEALTH_SCORE} → ${CURRENT_HEALTH_SCORE}`,
    ],
    [
      "[data-health-score-report-previous]",
      `↑ ${BASELINE_HEALTH_SCORE} → ${PREVIOUS_HEALTH_SCORE}`,
    ],
    ["[data-health-score-report-baseline]", `→ ${BASELINE_HEALTH_SCORE}/100`],
    ["[data-health-score-history-current]", `${CURRENT_HEALTH_SCORE}/100`],
    ["[data-health-score-history-previous]", `${PREVIOUS_HEALTH_SCORE}/100`],
    ["[data-health-score-history-baseline]", `${BASELINE_HEALTH_SCORE}/100`],
  ]);

  textBySelector.forEach((text, selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = text;
    });
  });
}

function scrollMessagesToBottom() {
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: "smooth",
  });
}

function getCurrentReportMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthDayYear(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function updateMonthlyProgressReportUI() {
  const now = new Date();
  const currentMonthKey = getCurrentReportMonth(now);
  const lastReportMonth = localStorage.getItem(REPORT_STORAGE_KEY);
  const reportGeneratedThisMonth = lastReportMonth === currentMonthKey;
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const monthProgress = Math.min((dayOfMonth / totalDaysInMonth) * 100, 100);
  const firstOfNextMonth = new Date(year, month + 1, 1);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilNextReport = Math.max(
    0,
    Math.ceil((firstOfNextMonth - now) / msPerDay)
  );

  if (dashboardReportProgressFillEl) {
    dashboardReportProgressFillEl.style.width = `${monthProgress}%`;
  }

  if (dashboardReportDueEl) {
    dashboardReportDueEl.classList.toggle("is-due-today", !reportGeneratedThisMonth);
    if (reportGeneratedThisMonth) {
      dashboardReportDueEl.textContent = `Next report due in ${daysUntilNextReport} day${
        daysUntilNextReport === 1 ? "" : "s"
      } — ${formatMonthDayYear(firstOfNextMonth)}`;
    } else {
      dashboardReportDueEl.innerHTML = `${reportDueTodayIcon}<span>Report due today — Aria is ready to generate</span>`;
    }
  }

  if (dashboardReportBannerEl) {
    dashboardReportBannerEl.hidden = reportGeneratedThisMonth;
  }
}

async function triggerMonthlyProgressReportFlow() {
  if (typeof showPage === "function") {
    showPage("askaria");
  }
  if (isRequestInFlight) {
    return;
  }
  inputEl.value = "";
  autoResizeInput();
  await sendMessage(MONTHLY_PROGRESS_REPORT_PROMPT);
}

function autoResizeInput() {
  inputEl.style.height = "auto";
  inputEl.style.height = `${Math.min(inputEl.scrollHeight, 150)}px`;
}

function setSidebarOpen(isOpen) {
  if (!layoutEl) {
    return;
  }

  layoutEl.classList.toggle("sidebar-open", isOpen);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderMarkdown(content) {
  const lines = content.split("\n");
  const blocks = [];
  let paragraphLines = [];
  let unorderedItems = [];
  let orderedItems = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push(`<p>${formatInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  }

  function flushUnorderedList() {
    if (unorderedItems.length === 0) {
      return;
    }

    blocks.push(
      `<ul>${unorderedItems
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")}</ul>`
    );
    unorderedItems = [];
  }

  function flushOrderedList() {
    if (orderedItems.length === 0) {
      return;
    }

    blocks.push(
      `<ol>${orderedItems
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")}</ol>`
    );
    orderedItems = [];
  }

  function flushAll() {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    if (line === "---") {
      flushAll();
      blocks.push("<hr />");
      continue;
    }

    if (line.startsWith("## ")) {
      flushAll();
      blocks.push(`<h3>${formatInlineMarkdown(line.slice(3))}</h3>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushAll();
      blocks.push(`<h2>${formatInlineMarkdown(line.slice(2))}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      flushOrderedList();
      unorderedItems.push(line.slice(2));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushUnorderedList();
      orderedItems.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    flushUnorderedList();
    flushOrderedList();
    paragraphLines.push(line);
  }

  flushAll();

  return blocks.join("");
}

function addMessage(role, content) {
  const isUser = role === "user";
  const messageEl = document.createElement("article");
  messageEl.className = `message-row ${isUser ? "user" : "agent"}`;

  const avatarEl = document.createElement("div");
  avatarEl.className = `message-avatar ${isUser ? "user" : "agent"}`;
  if (isUser) {
    avatarEl.textContent = "JW";
  } else {
  avatarEl.innerHTML = ariaAvatarSVG(CHAT_MESSAGE_AVATAR_SIZE);
  }

  const bodyEl = document.createElement("div");
  bodyEl.className = "message-body";

  const messageBubbleEl = document.createElement("article");
  messageBubbleEl.className = `message ${isUser ? "user" : "agent"}`;
  if (isUser) {
    messageBubbleEl.textContent = content;
  } else {
    messageBubbleEl.innerHTML = renderMarkdown(content);
  }

  bodyEl.appendChild(messageBubbleEl);

  if (isUser) {
    messageEl.appendChild(bodyEl);
    messageEl.appendChild(avatarEl);
  } else {
    messageEl.appendChild(avatarEl);
    messageEl.appendChild(bodyEl);
  }

  messagesEl.appendChild(messageEl);
  scrollMessagesToBottom();
}

function showThinkingIndicator() {
  if (thinkingMessageEl) {
    return;
  }

  const messageEl = document.createElement("article");
  messageEl.className = "message-row agent thinking-row";

  const avatarEl = document.createElement("div");
  avatarEl.className = "message-avatar agent";
  avatarEl.innerHTML = ariaAvatarSVG(CHAT_MESSAGE_AVATAR_SIZE);

  const bodyEl = document.createElement("div");
  bodyEl.className = "message-body";

  const indicatorEl = document.createElement("div");
  indicatorEl.className = "thinking-indicator";
  indicatorEl.setAttribute("aria-label", "Aria is thinking");

  bodyEl.appendChild(indicatorEl);
  messageEl.appendChild(avatarEl);
  messageEl.appendChild(bodyEl);

  messagesEl.appendChild(messageEl);
  scrollMessagesToBottom();
  thinkingMessageEl = messageEl;
}

function hideThinkingIndicator() {
  if (!thinkingMessageEl) {
    return;
  }

  thinkingMessageEl.remove();
  thinkingMessageEl = null;
}

function setBusyState(isBusy) {
  isRequestInFlight = isBusy;
  statusEl.textContent = isBusy
    ? "Thinking through your assessment..."
    : "Ready when you are.";
  sendButtonEl.innerHTML = isBusy ? stopIcon : sendArrowIcon;
  sendButtonEl.setAttribute(
    "aria-label",
    isBusy ? "Stop response" : "Send message"
  );
  sendButtonEl.setAttribute(
    "title",
    isBusy ? "Stop response" : "Send message"
  );
}

async function sendMessage(content) {
  conversationHistory.push({ role: "user", content });
  addMessage("user", content);
  setBusyState(true);
  showThinkingIndicator();
  activeRequestController = new AbortController();

  try {
    const response = await fetch("/api/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: activeRequestController.signal,
      body: JSON.stringify({
        route: "chat",
        messages: conversationHistory,
        conversationState,
        stateContext,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    conversationState = data.conversationState ?? null;
    stateContext = data.stateContext ?? null;
    hideThinkingIndicator();
    conversationHistory.push({ role: "assistant", content: data.reply });
    addMessage("agent", data.reply);

    if (
      content.trim().toLowerCase() ===
      MONTHLY_PROGRESS_REPORT_PROMPT.toLowerCase()
    ) {
      localStorage.setItem(REPORT_STORAGE_KEY, getCurrentReportMonth());
      updateMonthlyProgressReportUI();
    }

    checkEscalation(data);
  } catch (error) {
    hideThinkingIndicator();

    if (error.name === "AbortError") {
      statusEl.textContent = "Response stopped.";
      return;
    }

    addMessage(
      "agent",
      "I ran into a problem reaching the advisor. Please check your API setup and try again."
    );
    statusEl.textContent = error.message;
  } finally {
    activeRequestController = null;
    hideThinkingIndicator();
    setBusyState(false);
    inputEl.focus();
  }
}

inputEl.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();

  if (isRequestInFlight) {
    return;
  }

  const content = inputEl.value.trim();
  if (!content) {
    return;
  }

  inputEl.value = "";
  autoResizeInput();
  await sendMessage(content);
});

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isRequestInFlight) {
    activeRequestController?.abort();
    return;
  }

  const content = inputEl.value.trim();
  if (!content) {
    return;
  }

  inputEl.value = "";
  autoResizeInput();
  await sendMessage(content);
});

inputEl.addEventListener("input", () => {
  autoResizeInput();
});

mobileMenuToggleEl?.addEventListener("click", () => {
  const isOpen = layoutEl?.classList.contains("sidebar-open");
  setSidebarOpen(!isOpen);
});

sidebarOverlayEl?.addEventListener("click", () => {
  setSidebarOpen(false);
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    setSidebarOpen(false);
  });
});

autoResizeInput();
setBusyState(false);
applyHealthScoreContent();
renderStaticAriaAvatars();
updateMonthlyProgressReportUI();

dashboardReportButtonEl?.addEventListener("click", () => {
  triggerMonthlyProgressReportFlow();
});

dashboardReportBannerLinkEl?.addEventListener("click", () => {
  triggerMonthlyProgressReportFlow();
});

dashboardReportBannerCloseEl?.addEventListener("click", () => {
  if (dashboardReportBannerEl) {
    dashboardReportBannerEl.hidden = true;
  }
});

// --- Suggestion chips ---
const CHIP_TEXTS = [
  "What are my biggest risks right now?",
  "I have a board meeting coming up",
  "Run my monthly health check-in",
  "Linda is blocking the CVCP again",
];

let chipsRowEl = null;
let userHasSentMessage = false;

function showSuggestionChips(afterEl) {
  if (chipsRowEl) return; // already shown
  chipsRowEl = document.createElement("div");
  chipsRowEl.className = "suggestion-chips";

  CHIP_TEXTS.forEach(function (text) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = text;
    chip.addEventListener("click", function () {
      inputEl.value = text;
      autoResizeInput();
      hideChips();
      formEl.dispatchEvent(new Event("submit", { cancelable: true }));
    });
    chipsRowEl.appendChild(chip);
  });

  // Insert as sibling after the opening message row in messagesEl
  if (afterEl && afterEl.parentNode === messagesEl) {
    messagesEl.insertBefore(chipsRowEl, afterEl.nextSibling);
  } else {
    messagesEl.appendChild(chipsRowEl);
  }
}

function hideChips() {
  if (chipsRowEl) {
    chipsRowEl.remove();
    chipsRowEl = null;
  }
}

// --- Chat opening message ---
function loadChatOpener() {
  // Show a pulsing placeholder while loading
  const placeholderRow = document.createElement("article");
  placeholderRow.className = "message-row agent";

  const avatarEl = document.createElement("div");
  avatarEl.className = "message-avatar agent";
  avatarEl.innerHTML = ariaAvatarSVG(CHAT_MESSAGE_AVATAR_SIZE);

  const bodyEl = document.createElement("div");
  bodyEl.className = "message-body";
  const placeholder = document.createElement("div");
  placeholder.className = "opener-placeholder";
  bodyEl.appendChild(placeholder);

  placeholderRow.appendChild(avatarEl);
  placeholderRow.appendChild(bodyEl);
  messagesEl.appendChild(placeholderRow);
  scrollMessagesToBottom();

  // Replace placeholder row with real message
  messagesEl.removeChild(placeholderRow);
  addMessage("agent", SESSION_OPENER_TEXT);

  // Show chips after the opening message row (sibling in messagesEl)
  var allRows = messagesEl.querySelectorAll(".message-row.agent");
  var lastRow = allRows[allRows.length - 1] || null;
  showSuggestionChips(lastRow);
}

// Hide chips when user sends their first message
var _origSendMessage = sendMessage;
sendMessage = async function (content) {
  if (!userHasSentMessage) {
    userHasSentMessage = true;
    hideChips();
  }
  return _origSendMessage(content);
};

loadChatOpener();

// --- Dashboard hero greeting + session opener ---
function loadSessionOpener() {
  // Time-based greeting
  const greetingEl = document.getElementById("dash-greeting");
  if (greetingEl) {
    const hour = new Date().getHours();
    const salutation =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    greetingEl.textContent = `${salutation}, James.`;
  }

  const textEl = document.getElementById("aria-briefing-text");
  if (!textEl) return;
  textEl.textContent = SESSION_OPENER_TEXT;
}

loadSessionOpener();

// ── Integrations connect state ──────────────────────────────────────────────
const integrationState = { gmail: true, gcal: true };

function applyIntegrationState() {
  document.querySelectorAll(".intg-connect-btn[data-intg-id]").forEach((btn) => {
    const id = btn.getAttribute("data-intg-id");
    if (integrationState[id]) {
      setConnected(btn);
    }
    btn.addEventListener("click", () => {
      if (integrationState[id]) return;
      integrationState[id] = true;
      setConnected(btn);
    });
  });
}

function setConnected(btn) {
  btn.classList.add("connected");
  btn.textContent = "Connected";
  btn.disabled = true;
}

applyIntegrationState();

// ── Escalation banner ────────────────────────────────────────────────────────
const ESCALATION_PHRASES = [
  "sarah should be",
  "bring sarah in",
  "human consultant",
  "escalating this",
  "beyond what aria",
  "i want to flag",
  "this warrants",
  "prepare a briefing",
];

let escalationShown = false;
let escalationDismissed = false;

function checkEscalation(data) {
  if (escalationShown || escalationDismissed) return;

  const replyLower = (data.reply || "").toLowerCase();
  const triggeredByPhrase = ESCALATION_PHRASES.some((p) => replyLower.includes(p));
  const triggeredByFlag = data.escalationDetected === true;

  if (!triggeredByPhrase && !triggeredByFlag) return;

  const banner = document.getElementById("escalation-banner");
  if (!banner) return;

  escalationShown = true;
  banner.style.display = "flex";
  banner.style.animation = "none";
  // Force reflow so re-adding animation plays from scratch
  void banner.offsetWidth;
  banner.style.animation = "slideDown 0.3s ease";
}

(function initEscalationBanner() {
  const banner = document.getElementById("escalation-banner");
  const contactBtn = document.getElementById("escalation-contact-btn");
  const dismissBtn = document.getElementById("escalation-dismiss-btn");
  if (!banner || !contactBtn || !dismissBtn) return;

  contactBtn.addEventListener("click", () => {
    window.location.href =
      `mailto:sarah.chen@cgsadvisors.com` +
      `?subject=CGS%20Momentum%20Escalation%20%E2%80%94%20Meridian%20Automotive` +
      `&body=Hi%20Sarah%2C%0A%0AAria%20has%20flagged%20a%20situation%20in%20my%20CGS%20Momentum%20session%20that%20may%20need%20your%20direct%20involvement.%0A%0AClient%3A%20James%20Whitfield%2C%20Meridian%20Automotive%0ADate%3A%20${encodeURIComponent(new Date().toLocaleDateString())}%0A%0APlease%20review%20when%20you%20have%20a%20moment.%0A%0AJames`;
  });

  dismissBtn.addEventListener("click", () => {
    escalationDismissed = true;
    banner.style.animation = "escalationFadeOut 0.25s ease forwards";
    setTimeout(() => { banner.style.display = "none"; }, 260);
  });
})();

// ── Sync all derived counts from DOM ────────────────────────────────────────
// Call this whenever content is added or removed anywhere. It reads the live
// DOM so you never have to manually update a count string again — just add or
// remove the relevant HTML element and call syncUICounts().
function syncUICounts() {
  // ── Reports page: total document count in the page header ──
  const reportsHeaderCount = document.querySelector("#page-reports .page-header > span");
  if (reportsHeaderCount) {
    const total = document.querySelectorAll("#page-reports .rcard").length;
    // Preserve the "· Last generated …" portion so it doesn't get wiped
    const existing = reportsHeaderCount.textContent;
    const datePart = existing.includes("Last generated")
      ? existing.slice(existing.indexOf("Last generated"))
      : null;
    reportsHeaderCount.textContent =
      `${total} document${total !== 1 ? "s" : ""}` +
      (datePart ? ` · ${datePart}` : "");
  }

  // ── Reports page: per-section counts ──
  document.querySelectorAll("#page-reports .reports-section").forEach((section) => {
    const countEl = section.querySelector(".reports-section-count");
    if (!countEl) return;
    const n = section.querySelectorAll(".rcard").length;
    const keepScroll = countEl.textContent.includes("scroll");
    countEl.textContent = `${n} document${n !== 1 ? "s" : ""}${keepScroll ? " · scroll →" : ""}`;
  });

  // ── Integrations page: available count ──
  const intgLabel = document.querySelector("#page-brain-integrations .intg-section-label");
  if (intgLabel) {
    const n = document.querySelectorAll("#page-brain-integrations .intg-card").length;
    intgLabel.textContent = `AVAILABLE (${n})`;
  }

  // ── Knowledge Base: active document count shown in the section label ──
  const kbLabel = document.querySelector("#page-brain-knowledge .kb-section-count");
  if (kbLabel) {
    const n = document.querySelectorAll("#kb-table tbody tr").length;
    kbLabel.textContent = `${n} document${n !== 1 ? "s" : ""}`;
  }

  // ── Memory: row count shown in the section label ──
  const memLabel = document.querySelector("#page-brain-memory .mem-section-count");
  if (memLabel) {
    const n = document.querySelectorAll("#mem-table tbody tr").length;
    memLabel.textContent = `${n} entr${n !== 1 ? "ies" : "y"}`;
  }
}

// ── Knowledge Base — upload drop zone ───────────────────────────────────────
(function () {
  const dropzone = document.getElementById("kb-dropzone");
  const fileInput = document.getElementById("kb-file-input");
  if (!dropzone || !fileInput) return;

  function addUploadingRow(name) {
    const tbody = document.querySelector("#kb-table tbody");
    if (!tbody) return;
    const ext = name.split(".").pop().toUpperCase() || "FILE";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="kb-name">
        <svg class="kb-file-icon" viewBox="0 0 16 20" fill="none">
          <path d="M9 1H3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7L9 1z" stroke="#6b7a8d" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9 1 9 7 15 7" stroke="#6b7a8d" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${name}
      </td>
      <td><span class="kb-type-badge">${ext}</span></td>
      <td class="kb-meta">Just now</td>
      <td class="kb-meta">—</td>
      <td><span class="kb-status-processing"><span class="kb-dot-processing"></span>Processing</span></td>`;
    tbody.appendChild(tr);
    syncUICounts(); // KB document count updates immediately on upload
    // After 2s switch to Active
    setTimeout(() => {
      const statusCell = tr.querySelector("td:last-child");
      statusCell.innerHTML = `<span class="kb-status-active"><span class="kb-dot"></span>Active</span>`;
    }, 2000);
  }

  function handleFiles(files) {
    Array.from(files).forEach((f) => addUploadingRow(f.name));
  }

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });
  fileInput.addEventListener("change", () => { handleFiles(fileInput.files); fileInput.value = ""; });

  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
  });
})();

// ── Memory — delete row ──────────────────────────────────────────────────────
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".mem-del-btn");
  if (!btn) return;
  const row = btn.closest("tr");
  if (!row) return;
  row.style.transition = "opacity 0.2s ease";
  row.style.opacity = "0";
  setTimeout(() => { row.remove(); syncUICounts(); }, 200);
});

// ── Doc sidebar ─────────────────────────────────────────────────────────────
function openDocSidebar() {
  var el = document.getElementById('doc-sidebar');
  if (el) el.classList.add('open');
}

function closeDocSidebar() {
  var el = document.getElementById('doc-sidebar');
  if (el) el.classList.remove('open');
}

function downloadDocContent() {
  var lines = [
    'BOARD BRIEFING: DIGITAL TRANSFORMATION PROGRESS',
    'Meridian Automotive Group · April 2026 · CONFIDENTIAL',
    '',
    'EXECUTIVE SUMMARY',
    'Meridian Automotive Group has made measured but deliberate progress across its digital',
    'transformation agenda since programme inception in October 2024. With sixteen months of',
    'engagement now complete, the overall maturity score sits at 29/100 — placing the',
    'organisation in the Developing band — with clear upward momentum as the CDO hire',
    'approaches final decision.',
    '',
    'The primary lever for accelerated improvement remains the People dimension, which',
    'continues to hold at A1 due to the absence of senior digital leadership. A confirmed CDO',
    'appointment in Q2 2026 is expected to unlock meaningful score movement across all four',
    'dimensions within 60 days of onboarding.',
    '',
    'TRANSFORMATION STATUS',
    'Dimension   | Score | Status',
    '------------|-------|------------------',
    'Strategy    | A2    | Stable',
    'People      | A1    | Critical blocker',
    'Process     | A2    | Stable',
    'Technology  | A2    | Stable',
    '',
    'TOP THREE RISKS',
    '1. CDO hire delay — final-round decision must close by end of April 2026 to preserve',
    '   Q2 momentum targets.',
    '2. OEM integration timeline — external dependency on Tier 1 partner roadmap creates a',
    '   six-week uncertainty window for the data infrastructure build-out.',
    '3. Board alignment gap — two board members remain uncommitted on the Phase 2 investment',
    '   case; a briefing and Q&A session is recommended before the June planning cycle.',
    '',
    'DECISIONS REQUIRED',
    '1. Approve CDO final-round candidates and confirm offer authority with the CEO and CHRO',
    '   before the end of Q2.',
    '',
    '---',
    'Prepared with intelligence support from CGS Momentum / Aria',
  ];
  var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'Q2_2026_Board_Briefing.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Mock doc delivery message — injected after the session opener
(function addMockDocMessage() {
  var row = document.createElement('article');
  row.className = 'message-row agent';

  var avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar agent';
  avatarEl.innerHTML = ariaAvatarSVG(CHAT_MESSAGE_AVATAR_SIZE);

  var bodyEl = document.createElement('div');
  bodyEl.className = 'message-body';

  var bubbleEl = document.createElement('article');
  bubbleEl.className = 'message agent';
  bubbleEl.textContent = 'Your board briefing is ready. I have covered your milestone status, the top three risks for Northlake, and the two decisions you need from this meeting.';

  var chipEl = document.createElement('div');
  chipEl.className = 'doc-chip';
  chipEl.setAttribute('role', 'button');
  chipEl.setAttribute('tabindex', '0');
  chipEl.setAttribute('aria-label', 'Q2 2026 Board Briefing — click to preview');
  chipEl.innerHTML =
    '<div class="doc-chip-icon">' +
      '<svg width="11" height="11" viewBox="0 0 20 20" fill="rgba(255,255,255,0.9)">' +
        '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>' +
      '</svg>' +
    '</div>' +
    '<span class="doc-chip-name">Q2 2026 Board Briefing</span>' +
    '<button class="doc-chip-dl" type="button">↓ PDF</button>';

  chipEl.addEventListener('click', function(e) {
    if (e.target.classList.contains('doc-chip-dl')) {
      e.stopPropagation();
      downloadDocContent();
    } else {
      openDocSidebar();
    }
  });
  chipEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDocSidebar(); }
  });

  bodyEl.appendChild(bubbleEl);
  bodyEl.appendChild(chipEl);
  row.appendChild(avatarEl);
  row.appendChild(bodyEl);
  messagesEl.appendChild(row);
})();

// ── Initial sync — run once DOM is fully read ────────────────────────────────
// Any future HTML edit (new rcard, new intg-card, etc.) is automatically
// reflected in all count labels without touching JS.
syncUICounts();
