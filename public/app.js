const CURRENT_HEALTH_SCORE = 29;
const PREVIOUS_HEALTH_SCORE = 27;
const HEALTH_SCORE_LABEL = "Developing";
const HEALTH_SCORE_TREND = "+2 from last month";
const BASELINE_HEALTH_SCORE = PREVIOUS_HEALTH_SCORE - 2;
const HEALTH_SCORE_RING_RADIUS = 48;
const HEALTH_SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * HEALTH_SCORE_RING_RADIUS;
const CHAT_MESSAGE_AVATAR_SIZE = 34;
const SESSION_OPENER_TEXT =
  "CDO Hired & Onboarded is still the milestone that will determine whether the rest of Meridian's roadmap moves on time. What feels most at risk right now?";

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const statusEl = document.getElementById("status");
const sendButtonEl = document.getElementById("send-button");
const layoutEl = document.querySelector(".layout");
const mobileMenuToggleEl = document.querySelector(".mobile-menu-toggle");
const sidebarOverlayEl = document.querySelector(".sidebar-overlay");

const conversationHistory = [];
let conversationState = null;
let stateContext = null;
let thinkingMessageEl = null;
let activeRequestController = null;
let isRequestInFlight = false;

// Aria avatar SVG — single source of truth for the avatar appearance.
// Change width/height only; never touch the defs, gradients, or path data.
function ariaAvatarSVG(size) {
  return `<svg class="aria-avatar" width="${size}" height="${size}" viewBox="0 15 280 280" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke" style="filter:none;box-shadow:none;-webkit-filter:none;transform:translateZ(0);backface-visibility:hidden;"><defs><clipPath id="sphereClip"><circle cx="140" cy="155" r="108"/></clipPath><radialGradient id="gBase" cx="52%" cy="38%" r="72%" fx="52%" fy="32%"><stop offset="0%" stop-color="#ffb87a"/><stop offset="18%" stop-color="#f07640"/><stop offset="45%" stop-color="#e85018"/><stop offset="78%" stop-color="#d04010"/><stop offset="100%" stop-color="#b83208"/></radialGradient><radialGradient id="gBlue" cx="28%" cy="72%" r="58%" fx="25%" fy="70%"><stop offset="0%" stop-color="#b0bee8" stop-opacity="0.95"/><stop offset="35%" stop-color="#9aaada" stop-opacity="0.80"/><stop offset="65%" stop-color="#8898cc" stop-opacity="0.45"/><stop offset="100%" stop-color="#7888be" stop-opacity="0"/></radialGradient><radialGradient id="gViolet" cx="50%" cy="82%" r="42%"><stop offset="0%" stop-color="#c0b0e0" stop-opacity="0.60"/><stop offset="60%" stop-color="#a898d0" stop-opacity="0.25"/><stop offset="100%" stop-color="#9888c0" stop-opacity="0"/></radialGradient><radialGradient id="gPeach" cx="78%" cy="80%" r="38%"><stop offset="0%" stop-color="#f4c098" stop-opacity="0.65"/><stop offset="100%" stop-color="#eca878" stop-opacity="0"/></radialGradient><radialGradient id="gHighlight" cx="50%" cy="2%" r="58%"><stop offset="0%" stop-color="#fff5ee" stop-opacity="0.72"/><stop offset="55%" stop-color="#fff5ee" stop-opacity="0.18"/><stop offset="100%" stop-color="#fff5ee" stop-opacity="0"/></radialGradient><radialGradient id="gRim" cx="50%" cy="50%" r="50%"><stop offset="72%" stop-color="#000000" stop-opacity="0"/><stop offset="92%" stop-color="#000000" stop-opacity="0.14"/><stop offset="100%" stop-color="#000000" stop-opacity="0.32"/></radialGradient><radialGradient id="gHalo" cx="50%" cy="50%" r="50%"><stop offset="84%" stop-color="#e8d8cc" stop-opacity="0"/><stop offset="94%" stop-color="#e8d8cc" stop-opacity="0.35"/><stop offset="100%" stop-color="#d8c8bc" stop-opacity="0.55"/></radialGradient><filter id="fStarGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g><circle cx="140" cy="155" r="108" fill="url(#gBase)"/><circle cx="140" cy="155" r="108" fill="url(#gBlue)" clip-path="url(#sphereClip)"/><circle cx="140" cy="155" r="108" fill="url(#gViolet)" clip-path="url(#sphereClip)"/><circle cx="140" cy="155" r="108" fill="url(#gPeach)" clip-path="url(#sphereClip)"/><circle cx="140" cy="155" r="108" fill="url(#gHighlight)" clip-path="url(#sphereClip)"/><circle cx="140" cy="155" r="108" fill="url(#gRim)" clip-path="url(#sphereClip)"/><circle cx="140" cy="155" r="108" fill="url(#gHalo)" clip-path="url(#sphereClip)"/></g><path d="M 140,83 L 157,131 L 212,155 L 157,179 L 140,227 L 123,179 L 68,155 L 123,131 Z" fill="none" stroke="rgba(255,245,240,0.80)" stroke-width="3" stroke-linejoin="miter" stroke-miterlimit="10" filter="url(#fStarGlow)"/></svg>`;
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
