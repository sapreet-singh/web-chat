const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users (max 2 for this chat)
let connectedUsers = [];
let connectedIPs = new Set(); // Track IP addresses to prevent duplicate connections
const MAX_USERS = 2;
const PREDEFINED_USERNAMES = ['Singh', 'Kaur'];

// Helper function to get client IP
function getClientIP(socket) {
    return socket.handshake.headers['x-forwarded-for'] ||
           socket.handshake.headers['x-real-ip'] ||
           socket.conn.remoteAddress ||
           socket.handshake.address;
}

// Helper function to check if chat is ready (both users connected)
function isChatReady() {
    return connectedUsers.length === MAX_USERS;
}

// Handle socket connections
io.on('connection', (socket) => {
    const clientIP = getClientIP(socket);

    // Check if room is full
    if (connectedUsers.length >= MAX_USERS) {
        socket.emit('room_full', 'Chat room is full. Only 2 users allowed.');
        socket.disconnect();
        return;
    }

    // Check if this IP is already connected (prevent same user connecting multiple times)
    if (connectedIPs.has(clientIP)) {
        socket.emit('duplicate_connection', 'You are already connected from another tab/window. Only one connection per user is allowed.');
        socket.disconnect();
        return;
    }

    // Add user to connected users with predefined names
    const userIndex = connectedUsers.length; // Get index before adding user
    const assignedUsername = PREDEFINED_USERNAMES[userIndex];

    // Add to connected users and IPs
    connectedUsers.push({
        id: socket.id,
        username: assignedUsername,
        ip: clientIP,
        connectedAt: new Date()
    });
    connectedIPs.add(clientIP);

    // Check if chat is now ready
    const chatReady = isChatReady();

    // Notify all users about current user count and chat status
    io.emit('user_count', connectedUsers.length);
    io.emit('chat_status', {
        ready: chatReady,
        usersConnected: connectedUsers.length,
        maxUsers: MAX_USERS
    });

    // Notify user about successful connection
    socket.emit('connected', {
        username: connectedUsers.find(user => user.id === socket.id).username,
        userCount: connectedUsers.length,
        chatReady: chatReady
    });

    // If chat is ready, notify all users
    if (chatReady) {
        io.emit('chat_ready', 'Both users are now connected! You can start chatting.');
    }

    // Username change functionality removed - using fixed usernames Singh/Kaur

    // Handle chat messages - only allow when both users are connected
    socket.on('chat_message', (data) => {
        const user = connectedUsers.find(user => user.id === socket.id);

        // Check if user exists and chat is ready
        if (!user) {
            socket.emit('message_error', 'User not found. Please refresh and try again.');
            return;
        }

        if (!isChatReady()) {
            socket.emit('message_error', 'Chat is not ready. Waiting for both users to connect.');
            return;
        }

        const now = new Date();
        const messageData = {
            username: user.username,
            message: data.message,
            timestamp: now.toLocaleTimeString(),
            fullTimestamp: now.toLocaleString(),
            date: now.toLocaleDateString()
        };

        // Broadcast message to all users
        io.emit('chat_message', messageData);
    });

    // Handle typing indicator - only allow when both users are connected
    socket.on('typing', (isTyping) => {
        const user = connectedUsers.find(user => user.id === socket.id);

        // Only show typing indicator when chat is ready
        if (user && isChatReady()) {
            socket.broadcast.emit('user_typing', {
                username: user.username,
                isTyping
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        // Remove user from connected users
        const userIndex = connectedUsers.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
            const disconnectedUser = connectedUsers[userIndex];

            // Remove from connected users and IPs
            connectedUsers.splice(userIndex, 1);
            connectedIPs.delete(disconnectedUser.ip);

            // Check if chat is no longer ready
            const chatReady = isChatReady();

            // Notify remaining users
            io.emit('user_disconnected', {
                username: disconnectedUser.username,
                userCount: connectedUsers.length
            });
            io.emit('user_count', connectedUsers.length);
            io.emit('chat_status', {
                ready: chatReady,
                usersConnected: connectedUsers.length,
                maxUsers: MAX_USERS
            });

            // If chat is no longer ready, notify remaining users
            if (!chatReady && connectedUsers.length > 0) {
                io.emit('chat_not_ready', 'Chat disabled. Waiting for another user to join...');
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server running on http://localhost:${PORT}`);
});
