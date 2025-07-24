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
const MAX_USERS = 2;
const PREDEFINED_USERNAMES = ['Singh', 'Kaur'];

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Check if room is full
    if (connectedUsers.length >= MAX_USERS) {
        socket.emit('room_full', 'Chat room is full. Only 2 users allowed.');
        socket.disconnect();
        return;
    }

    // Add user to connected users with predefined names
    const userIndex = connectedUsers.length; // Get index before adding user
    const assignedUsername = PREDEFINED_USERNAMES[userIndex];
    console.log(`Assigning username: ${assignedUsername} to user ${socket.id} (index: ${userIndex})`);

    connectedUsers.push({
        id: socket.id,
        username: assignedUsername
    });

    // Notify all users about current user count
    io.emit('user_count', connectedUsers.length);
    
    // Notify user about successful connection
    socket.emit('connected', {
        username: connectedUsers.find(user => user.id === socket.id).username,
        userCount: connectedUsers.length
    });

    // Username change functionality removed - using fixed usernames Singh/Kaur

    // Handle chat messages
    socket.on('chat_message', (data) => {
        const user = connectedUsers.find(user => user.id === socket.id);
        if (user) {
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
        }
    });

    // Handle typing indicator
    socket.on('typing', (isTyping) => {
        const user = connectedUsers.find(user => user.id === socket.id);
        if (user) {
            socket.broadcast.emit('user_typing', {
                username: user.username,
                isTyping
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from connected users
        const userIndex = connectedUsers.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
            const disconnectedUser = connectedUsers[userIndex];
            connectedUsers.splice(userIndex, 1);
            
            // Notify remaining users
            io.emit('user_disconnected', {
                username: disconnectedUser.username,
                userCount: connectedUsers.length
            });
            io.emit('user_count', connectedUsers.length);
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server running on http://localhost:${PORT}`);
});
