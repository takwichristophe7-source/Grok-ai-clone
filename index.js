// Configuration
const API_CONFIG = {
    invoke_url: "https://integrate.api.nvidia.com/v1/chat/completions",
    api_key: "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",
    model: "moonshotai/kimi-k2.5",
    stream: true,
    max_tokens: 1024,
    temperature: 0.8,
    top_p: 0.95
};

// DOM Elements
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const messagesContainer = document.getElementById('messages');
const chatArea = document.getElementById('chat-area');
const homePage = document.getElementById('home-page');
const featureButtons = document.querySelectorAll('.feature-btn');

// State
let isWaitingForResponse = false;

// Event Listeners
sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && userInput.value.trim() && !isWaitingForResponse) {
        handleSendMessage();
    }
});

voiceBtn.addEventListener('click', () => {
    addMessageToChat('Voice input not yet implemented', 'assistant');
});

featureButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const feature = e.currentTarget.getAttribute('data-feature');
        const featureMessages = {
            'deep-search': 'Search the latest news about AI developments',
            'imagine': 'Create an image of a futuristic city',
            'personas': 'Help me choose the best persona for coding',
            'voice': 'Switch to voice mode'
        };
        userInput.value = featureMessages[feature] || '';
        userInput.focus();
    });
});

// Main Functions
async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (!message || isWaitingForResponse) return;
    
    isWaitingForResponse = true;
    sendBtn.disabled = true;
    userInput.value = '';
    
    // Hide home page when first message is sent
    if (messagesContainer.children.length === 0) {
        homePage.classList.add('hidden');
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Get AI response
    try {
        await getAIResponse(message);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat(`Error: ${error.message}`, 'assistant');
    } finally {
        isWaitingForResponse = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

async function getAIResponse(userMessage) {
    const payload = {
        "model": API_CONFIG.model,
        "messages": [{"role": "user", "content": userMessage}],
        "max_tokens": API_CONFIG.max_tokens,
        "temperature": API_CONFIG.temperature,
        "top_p": API_CONFIG.top_p,
        "stream": false
    };

    const headers = {
        "Authorization": `Bearer ${API_CONFIG.api_key}`,
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(API_CONFIG.invoke_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        addMessageToChat(assistantMessage, 'assistant');

    } catch (error) {
        console.error('API Error:', error);
        
        // Fallback message when API fails
        const fallbackMessage = `I'm having trouble connecting to the API. Make sure:
1. Your API key is valid
2. You have internet connection
3. If using on localhost, you may need to set up a backend proxy to avoid CORS issues.

For now, here's a demo response: This is a working Grok AI clone interface! To make it fully functional, you'll need to set up a backend server that proxies requests to the NVIDIA API.`;
        
        addMessageToChat(fallbackMessage, 'assistant');
    }
}

function addMessageToChat(content, role) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = content;
    
    messageElement.appendChild(contentElement);
    messagesContainer.appendChild(messageElement);
    
    // Auto-scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
    
    return messageElement;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Grok AI Clone loaded successfully');
    userInput.focus();
});
