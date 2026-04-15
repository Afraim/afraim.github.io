// ============================================================
// AREAL — AI Agent for Afraim's Portfolio
// Powered by Groq API (llama-3.3-70b-versatile)
// ============================================================

const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── State ────────────────────────────────────────────────────
let chatHistory = [];
let isOpen = false;
let isTyping = false;
let hasGreeted = false;

// ── DOM Elements (set after DOMContentLoaded) ────────────────
let chatBubble, chatPanel, chatMessages, chatInput, sendBtn, closeBtn, suggestionChips;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  chatBubble   = document.getElementById("areal-bubble");
  chatPanel    = document.getElementById("areal-panel");
  chatMessages = document.getElementById("areal-messages");
  chatInput    = document.getElementById("areal-input");
  sendBtn      = document.getElementById("areal-send");
  closeBtn     = document.getElementById("areal-close");
  suggestionChips = document.getElementById("areal-suggestions");

  chatBubble.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", closeChat);
  sendBtn.addEventListener("click", handleSend);
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  chatInput.addEventListener("input", () => {
    sendBtn.disabled = chatInput.value.trim() === "";
  });

  // Proactive greeting after 2.5 seconds
  setTimeout(() => {
    showBubblePulse();
    setTimeout(() => {
      if (!hasGreeted) openChat(true);
    }, 4000);
  }, 2500);

  renderSuggestions();
});

// ── Bubble pulse to attract attention ─────────────────────────
function showBubblePulse() {
  chatBubble.classList.add("pulse");
  const badge = document.getElementById("areal-badge");
  if (badge) { badge.style.display = "flex"; badge.textContent = "1"; }
}

// ── Toggle ────────────────────────────────────────────────────
function toggleChat() {
  isOpen ? closeChat() : openChat(false);
}

function openChat(auto = false) {
  isOpen = true;
  chatPanel.classList.add("open");
  chatBubble.classList.remove("pulse");
  const badge = document.getElementById("areal-badge");
  if (badge) badge.style.display = "none";
  chatInput.focus();

  if (!hasGreeted) {
    hasGreeted = true;
    const opener = AREAL_OPENERS[Math.floor(Math.random() * AREAL_OPENERS.length)];
    setTimeout(() => appendMessage("areal", opener), auto ? 400 : 200);
  }
}

function closeChat() {
  isOpen = false;
  chatPanel.classList.remove("open");
}

// ── Suggestions ───────────────────────────────────────────────
function renderSuggestions() {
  if (!suggestionChips) return;
  suggestionChips.innerHTML = "";
  AREAL_SUGGESTED_QUESTIONS.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = q;
    btn.addEventListener("click", () => {
      chatInput.value = q;
      handleSend();
      suggestionChips.style.display = "none";
    });
    suggestionChips.appendChild(btn);
  });
}

// ── Send message ──────────────────────────────────────────────
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text || isTyping) return;

  chatInput.value = "";
  sendBtn.disabled = true;
  if (suggestionChips) suggestionChips.style.display = "none";

  appendMessage("user", text);
  chatHistory.push({ role: "user", content: text });

  showTypingIndicator();
  isTyping = true;

  try {
    const reply = await callGroq(chatHistory);
    removeTypingIndicator();
    appendMessage("areal", reply);
    chatHistory.push({ role: "assistant", content: reply });
    // Keep history manageable (last 20 messages)
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(chatHistory.length - 20);
  } catch (err) {
    removeTypingIndicator();
    appendMessage("areal", "Hmm, I hit a snag connecting to my brain. Try again in a moment! 🧠⚡");
    console.error("Groq error:", err);
  } finally {
    isTyping = false;
  }
}

// ── Groq API call ─────────────────────────────────────────────
async function callGroq(history) {
  const systemPrompt = `${AFRAIM_KNOWLEDGE}

IMPORTANT FORMATTING RULES:
- Keep responses concise (2–4 sentences usually) unless detail is asked for.
- Use markdown-lite: **bold** for emphasis, bullet points for lists.
- Include relevant links when helpful (GitHub, LinkedIn, live sites).
- When recommending hiring Afraim, be enthusiastic and specific about his value.
- Never fabricate information. If unsure, say "I don't have that specific info, but here's what I know..."
- Match the user's language exactly.`;

  const response = await fetch("https://vercel-api-jodd.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      history: [
        { role: "system", content: systemPrompt },
        ...history
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
  console.log("BACKEND ERROR:", data);
  throw new Error(data.error || "API error");
}

  return data.reply;
}

// ── Render messages ───────────────────────────────────────────
function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg msg--${role}`;

  const bubble = document.createElement("div");
  bubble.className = "msg__bubble";
  bubble.innerHTML = formatMessage(text);

  const time = document.createElement("span");
  time.className = "msg__time";
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Animate in
  requestAnimationFrame(() => wrapper.classList.add("visible"));
}

// ── Format message text (markdown-lite) ───────────────────────
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/, "<p>$1</p>");
}

// ── Typing indicator ──────────────────────────────────────────
function showTypingIndicator() {
  const el = document.createElement("div");
  el.className = "msg msg--areal typing-indicator";
  el.id = "typing-indicator";
  el.innerHTML = `<div class="msg__bubble"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  requestAnimationFrame(() => el.classList.add("visible"));
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}
