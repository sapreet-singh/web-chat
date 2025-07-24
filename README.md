# Two-Person Web Chat Interface

A simple, real-time web chat application built with Node.js, Express, and Socket.IO that allows exactly two users to chat with each other.

## Features

- **Real-time messaging** using WebSocket connections
- **Two-user limit** - only 2 people can chat at once
- **Username customization** - users can change their display names
- **Typing indicators** - see when the other person is typing
- **Connection status** - shows user count and connection state
- **Responsive design** - works on desktop and mobile devices
- **Clean UI** - modern, gradient-based design

## Project Structure

```
web-chat/
├── package.json          # Project dependencies and scripts
├── server.js            # Node.js server with Socket.IO
├── public/
│   ├── index.html       # Main HTML page
│   ├── style.css        # CSS styles
│   └── script.js        # Client-side JavaScript
└── README.md           # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

3. Open your browser and go to:
```
http://localhost:3000
```

## How to Use

1. **Start the server** using `npm start`
2. **Open two browser windows/tabs** and navigate to `http://localhost:3000`
3. **Change usernames** by clicking the "Change Name" button
4. **Start chatting** - messages appear in real-time
5. **See typing indicators** when the other person is typing

## Technical Details

### Backend (server.js)
- Express.js server serving static files
- Socket.IO for real-time WebSocket communication
- User management (max 2 users)
- Message broadcasting
- Typing indicator handling

### Frontend (public/)
- **index.html**: Clean, responsive HTML structure
- **style.css**: Modern CSS with gradients and animations
- **script.js**: Socket.IO client handling all real-time features

### Key Features Implementation
- **User limit**: Server tracks connected users and rejects excess connections
- **Real-time messaging**: Socket.IO events for instant message delivery
- **Typing indicators**: Debounced typing events with automatic timeout
- **Username changes**: Dynamic username updates with notifications
- **Connection handling**: Graceful disconnect/reconnect management

## Customization

You can easily customize:
- **Port**: Change `PORT` in server.js or set environment variable
- **User limit**: Modify `MAX_USERS` constant in server.js
- **Styling**: Edit public/style.css for different colors/layout
- **Features**: Add new Socket.IO events for additional functionality

## Browser Support

Works in all modern browsers that support:
- WebSocket connections
- ES6 JavaScript features
- CSS Grid and Flexbox
