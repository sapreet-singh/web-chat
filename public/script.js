// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usernameDisplay = document.getElementById('username-display');
// const changeUsernameBtn = document.getElementById('change-username-btn'); // Removed - using fixed usernames
const userCountDisplay = document.getElementById('user-count');
const typingIndicator = document.getElementById('typing-indicator');
const typingUser = document.getElementById('typing-user');
// Username modal elements removed - using fixed usernames Singh/Kaur
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const connectionIndicator = document.getElementById('connection-indicator');
const chatStatusDisplay = document.getElementById('chat-status');

// Variables
let currentUsername = 'Guest';
let isTyping = false;
let typingTimeout;
let messageCount = 0;
let chatReady = false;

// Socket Event Listeners
socket.on('connected', (data) => {
    currentUsername = data.username;
    usernameDisplay.textContent = currentUsername;
    addSystemMessage(`Welcome! You are ${currentUsername}`);

    chatReady = data.chatReady || false;
    updateChatInterface();

    if (data.userCount === 1) {
        addSystemMessage('Waiting for another user to join...');
        disableChat('Waiting for another user to connect...');
    }
});

socket.on('user_count', (count) => {
    userCountDisplay.textContent = count;
});

socket.on('chat_status', (status) => {
    chatReady = status.ready;
    updateChatInterface();

    if (status.ready) {
        enableChat();
    } else {
        disableChat('Waiting for both users to connect...');
    }
});

socket.on('chat_ready', (message) => {
    addSystemMessage(message);
    enableChat();
});

socket.on('chat_not_ready', (message) => {
    addSystemMessage(message);
    disableChat('Chat disabled. Waiting for another user...');
});

socket.on('chat_message', (data) => {
    addMessage(data.username, data.message, data.timestamp, data.username === currentUsername, data.fullTimestamp, data.date);
});

socket.on('user_typing', (data) => {
    if (data.isTyping) {
        typingUser.textContent = data.username;
        typingIndicator.style.display = 'block';
    } else {
        typingIndicator.style.display = 'none';
    }
});

socket.on('user_disconnected', (data) => {
    addSystemMessage(`${data.username} has left the chat`);
    typingIndicator.style.display = 'none';
});

socket.on('room_full', (message) => {
    showStatus(message, 'error');
});

socket.on('duplicate_connection', (message) => {
    showStatus(message, 'warning');
});

socket.on('message_error', (message) => {
    showStatus(message, 'error');
});

socket.on('disconnect', () => {
    addSystemMessage('Disconnected from server');
    showStatus('Connection lost. Trying to reconnect...', 'error');
});

socket.on('connect', () => {
    hideStatus();
});

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', handleTyping);

// Username change functionality removed - using fixed usernames Singh/Kaur

// Username modal functionality removed - using fixed usernames Singh/Kaur

// Functions
function sendMessage() {
    const message = messageInput.value.trim();

    if (!chatReady) {
        showStatus('Chat is not ready. Both users must be connected to send messages.', 'warning');
        return;
    }

    if (message) {
        const formattedMessage = formatMessage(message);
        socket.emit('chat_message', { message: formattedMessage });
        messageInput.value = '';
        autoResizeTextarea();
        messageCount++;

        // Stop typing indicator
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', false);
        }

        // Add haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
}

// Chat control functions
function enableChat() {
    chatReady = true;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.placeholder = 'Type your message...';
    messageInput.classList.remove('disabled');
    sendBtn.classList.remove('disabled');

    // Update status display
    if (chatStatusDisplay) {
        chatStatusDisplay.textContent = 'Chat Ready';
        chatStatusDisplay.className = 'chat-status ready';
    }

    hideStatus();
}

function disableChat(reason = 'Chat is disabled') {
    chatReady = false;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    messageInput.placeholder = reason;
    messageInput.classList.add('disabled');
    sendBtn.classList.add('disabled');
    typingIndicator.style.display = 'none';

    // Update status display
    if (chatStatusDisplay) {
        chatStatusDisplay.textContent = 'Waiting...';
        chatStatusDisplay.className = 'chat-status waiting';
    }
}

function updateChatInterface() {
    if (chatReady) {
        enableChat();
    } else {
        disableChat('Waiting for both users to connect...');
    }
}

function addMessage(username, message, timestamp, isOwn, fullTimestamp, date) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;

    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-info">
            <span class="username">${username}</span>
            <span class="timestamp" title="${fullTimestamp || timestamp}">${timestamp}</span>
            ${date ? `<span class="date">${date}</span>` : ''}
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleTyping() {
    // Only send typing indicator if chat is ready
    if (!chatReady) return;

    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', true);
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', false);
    }, 1000);
}

// Enhanced message formatting
function formatMessage(text) {
    // Simple emoji shortcuts
    return text
        .replace(/:smile:/g, '😊')
        .replace(/:heart:/g, '❤️')
        .replace(/:thumbs_up:/g, '👍')
        .replace(/:thumbs_down:/g, '👎')
        .replace(/:laugh:/g, '😂')
        .replace(/:sad:/g, '😢')
        .replace(/:wink:/g, '😉')
        .replace(/:cool:/g, '😎');
}

// Username modal functions removed - using fixed usernames Singh/Kaur

function showStatus(message, type = 'info') {
    statusText.textContent = message;
    connectionStatus.className = `status-message ${type}`;
    connectionStatus.style.display = 'block';
}

function hideStatus() {
    connectionStatus.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
messageInput.focus();
