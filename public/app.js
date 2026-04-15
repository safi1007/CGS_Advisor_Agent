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
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M4.5 10h8.2l-3.4-3.4 1.4-1.4 5.8 5.8-5.8 5.8-1.4-1.4 3.4-3.4H4.5z"></path>
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
  avatarEl.textContent = isUser ? "JW" : "A";

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
  avatarEl.textContent = "A";

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

addMessage(
  "agent",
  "Welcome. Tell me a bit about your industry and role, and we’ll begin the readiness assessment."
);
autoResizeInput();
setBusyState(false);
