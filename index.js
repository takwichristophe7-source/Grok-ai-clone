// ==========================================
// 1. CONFIGURATION
// ==========================================

// Get your free API key here: https://console.groq.com/keys
const API_KEY = "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"; //
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_TYPE = "llama-3.3-70b-versatile"; // good quality + speed in 2026
// Other good options: "mixtral-8x22b-32768", "gemma2-27b-it", "qwen-2.5-72b-instruct"

// ==========================================
// 2. DOM ELEMENT SELECTION
// ==========================================
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const messagesContainer = document.getElementById("messages");
const homePage = document.getElementById("home-page");
const chatArea = document.getElementById("chat-area");

// ==========================================
// 3. HELPER FUNCTIONS (UI)
// ==========================================

function appendMessage(text, sender) {
  if (!homePage.classList.contains("hidden")) {
    homePage.classList.add("hidden");
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  contentDiv.textContent = text;

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);

  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
}

function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "assistant");
  loadingDiv.innerHTML = `
    <div class="message-content">
      <div class="loading">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(loadingDiv);
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
  return loadingDiv;
}

// ==========================================
// 4. API INTERACTION
// ==========================================

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  userInput.value = "";

  const loadingElement = showLoading();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_TYPE,
        messages: [
          {
            role: "system",
            content:
              "You are Grok, a helpful and witty AI assistant built by xAI.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const aiReply = (data.choices?.[0]?.message?.content || "").trim();

    if (!aiReply) {
      throw new Error("Empty response from API");
    }

    loadingElement.remove();
    appendMessage(aiReply, "assistant");
  } catch (error) {
    console.error("Chat error:", error);
    loadingElement.remove();
    appendMessage(
      `Sorry — something went wrong:\n${error.message}\n\nCheck your API key and internet connection.`,
      "assistant",
    );
  }
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
