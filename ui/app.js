const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const statusEl = document.getElementById("status");
const sendButtonEl = document.getElementById("send-button");

const conversationHistory = [];

function addMessage(role, content) {
  const messageEl = document.createElement("article");
  messageEl.className = `message ${role}`;
  messageEl.textContent = content;
  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setBusyState(isBusy) {
  inputEl.disabled = isBusy;
  sendButtonEl.disabled = isBusy;
  statusEl.textContent = isBusy
    ? "Thinking through your assessment..."
    : "Ready when you are.";
}

async function sendMessage(content) {
  conversationHistory.push({ role: "user", content });
  addMessage("user", content);
  setBusyState(true);

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    conversationHistory.push({ role: "assistant", content: data.reply });
    addMessage("agent", data.reply);
  } catch (error) {
    addMessage(
      "agent",
      "I ran into a problem reaching the advisor. Please check your API setup and try again."
    );
    statusEl.textContent = error.message;
  } finally {
    setBusyState(false);
    inputEl.focus();
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = inputEl.value.trim();
  if (!content) {
    return;
  }

  inputEl.value = "";
  await sendMessage(content);
});

addMessage(
  "agent",
  "Welcome. Tell me a bit about your industry and role, and we’ll begin the readiness assessment."
);
