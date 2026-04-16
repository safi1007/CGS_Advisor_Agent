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
    var orbImg = document.createElement("img");
    orbImg.src = "aria-orb.svg";
    orbImg.alt = "Aria";
    avatarEl.appendChild(orbImg);
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
  const thinkOrbImg = document.createElement("img");
  thinkOrbImg.src = "aria-orb.svg";
  thinkOrbImg.alt = "Aria";
  avatarEl.appendChild(thinkOrbImg);

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

// --- Chat opening message (fetched from session-opener) ---
async function loadChatOpener() {
  // Show a pulsing placeholder while loading
  const placeholderRow = document.createElement("article");
  placeholderRow.className = "message-row agent";

  const avatarEl = document.createElement("div");
  avatarEl.className = "message-avatar agent";
  const orbImg = document.createElement("img");
  orbImg.src = "aria-orb.svg";
  orbImg.alt = "Aria";
  avatarEl.appendChild(orbImg);

  const bodyEl = document.createElement("div");
  bodyEl.className = "message-body";
  const placeholder = document.createElement("div");
  placeholder.className = "opener-placeholder";
  bodyEl.appendChild(placeholder);

  placeholderRow.appendChild(avatarEl);
  placeholderRow.appendChild(bodyEl);
  messagesEl.appendChild(placeholderRow);
  scrollMessagesToBottom();

  let openerText = "";
  try {
    const response = await fetch("/api/index?route=session-opener");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    openerText = data.opener || data.text || data.message || "";
  } catch (_err) {
    openerText = "Welcome back James. Ready to continue your transformation journey.";
  }

  // Replace placeholder row with real message
  messagesEl.removeChild(placeholderRow);
  addMessage("agent", openerText);

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

// --- Session opener briefing card (Dashboard only) ---
async function loadSessionOpener() {
  const textEl = document.getElementById("aria-briefing-text");
  if (!textEl) return;

  try {
    const response = await fetch("/api/index?route=session-opener");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    const opener = data.opener || data.text || data.message || "";
    textEl.textContent = opener;
  } catch (_err) {
    textEl.textContent =
      "Welcome back James. Ready to continue your transformation journey.";
  }
}

loadSessionOpener();
