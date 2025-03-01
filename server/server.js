
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle user registration
  socket.on('register_user', (userProfile) => {
    try {
      // Check if username contains "admin"
      if (userProfile.username.toLowerCase().includes('admin')) {
        socket.emit('registration_error', 'The username "admin" is reserved and cannot be used');
        return;
      }
      
      // Check if username is already taken by an online user
      let isUsernameTaken = false;
      connectedUsers.forEach((user) => {
        if (user.username.toLowerCase() === userProfile.username.toLowerCase() && 
            user.socketId !== socket.id && 
            user.isOnline) {
          isUsernameTaken = true;
        }
      });
      
      if (isUsernameTaken) {
        socket.emit('registration_error', 'This username is already taken. Please choose another one');
        return;
      }
      
      // Store user with their socket ID
      connectedUsers.set(socket.id, {
        ...userProfile,
        socketId: socket.id,
        isOnline: true,
        lastSeen: new Date()
      });
      
      // Send success response
      socket.emit('registration_success', {
        ...userProfile,
        id: socket.id
      });
      
      // Broadcast updated users list to all clients
      io.emit('users_update', getOnlineUsers());
      
      console.log(`User registered: ${userProfile.username}`);
    } catch (error) {
      console.error('Error registering user:', error);
      socket.emit('registration_error', 'Server error during registration');
    }
  });
  
  // Handle chat messages
  socket.on('send_message', (messageData) => {
    try {
      const { to, content } = messageData;
      const sender = connectedUsers.get(socket.id);
      
      if (!sender) {
        socket.emit('error', 'You are not registered');
        return;
      }
      
      const messageObject = {
        id: Date.now().toString(),
        sender: sender.username,
        senderId: socket.id,
        content,
        timestamp: new Date()
      };
      
      // If it's a direct message to someone
      if (to) {
        // Send to specific user
        socket.to(to).emit('receive_message', messageObject);
        // Also send back to sender
        socket.emit('receive_message', messageObject);
      } else {
        // Broadcast to all (global chat)
        io.emit('receive_message', messageObject);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    try {
      const user = connectedUsers.get(socket.id);
      if (user) {
        // Update user status to offline
        connectedUsers.set(socket.id, {
          ...user,
          isOnline: false,
          lastSeen: new Date()
        });
        
        // Remove user after some time (e.g., 1 hour)
        setTimeout(() => {
          connectedUsers.delete(socket.id);
        }, 60 * 60 * 1000);
        
        // Broadcast updated users list
        io.emit('users_update', getOnlineUsers());
        console.log(`User disconnected: ${user.username}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
  
  // Handle user typing status
  socket.on('typing', (data) => {
    socket.to(data.to).emit('user_typing', {
      userId: socket.id,
      isTyping: data.isTyping
    });
  });
  
  // Handle user blocking
  socket.on('block_user', (userId) => {
    try {
      // Emit to the blocked user that they've been blocked
      socket.to(userId).emit('blocked_by', socket.id);
      
      // Could also store this in a database for persistence
      console.log(`User ${socket.id} blocked user ${userId}`);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  });
});

// Helper function to get online users
function getOnlineUsers() {
  const users = [];
  connectedUsers.forEach((user, id) => {
    users.push({
      id,
      username: user.username,
      age: user.age,
      gender: user.gender,
      country: user.country,
      flag: user.flag,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    });
  });
  return users;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
