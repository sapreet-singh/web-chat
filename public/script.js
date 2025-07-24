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

// Variables
let currentUsername = 'Guest';
let isTyping = false;
let typingTimeout;

// Socket Event Listeners
socket.on('connected', (data) => {
    console.log('Connected with data:', data);
    currentUsername = data.username;
    usernameDisplay.textContent = currentUsername;
    addSystemMessage(`Welcome! You are ${currentUsername}`);

    if (data.userCount === 1) {
        addSystemMessage('Waiting for another user to join...');
    }
});

socket.on('user_count', (count) => {
    userCountDisplay.textContent = count;
    
    if (count === 2) {
        addSystemMessage('Chat room is now full. You can start chatting!');
    }
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

// User rename functionality removed - using fixed usernames Singh/Kaur

socket.on('room_full', (message) => {
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
    
    if (message) {
        socket.emit('chat_message', { message });
        messageInput.value = '';
        
        // Stop typing indicator
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', false);
        }
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
