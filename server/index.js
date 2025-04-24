const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store video IDs for each room
const roomData = {};

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store the user's room and name
  let currentRoom = null;
  let currentUserName = null;

  // Handle room joining
  socket.on('join-room', ({ roomId, name }) => {
    currentRoom = roomId;
    currentUserName = name;
    socket.join(roomId);
    console.log(`User ${name} (${socket.id}) joined room ${roomId}`);

    // Ensure room data exists before proceeding
    if (!roomData[roomId]) {
      roomData[roomId] = { messages: [] }; // Initialize the room with an empty messages array
    }

    // Send the video ID to the new user if it exists
    if (roomData[roomId].videoId) {
      socket.emit('video-id', roomData[roomId].videoId);
    }

    // Send the current chat messages for the room when someone joins
    socket.emit('chat-messages', roomData[roomId].messages);
  });

  // Handle play, pause, seek events
  socket.on('play', (roomId) => {
    //For debugging:
    console.log(`User ${currentUserName} (${socket.id}) played the video in room ${roomId}`);
    
    socket.to(roomId).emit('play');
  });

  socket.on('pause', (roomId) => {
    // For debugging:
    console.log(`User ${currentUserName} (${socket.id}) paused the video in room ${roomId}`);
    
    socket.to(roomId).emit('pause');
  });

  // Handle seeking in the video
  socket.on('seek', ({ roomId, time }) => {
    socket.to(roomId).emit('seek', time);  // Broadcast to all other users in the room
  });

  // Handle chat message
  socket.on('chat-message', ({ roomId, message, name }) => {
    // Ensure room data exists before pushing messages
    if (!roomData[roomId]) {
      roomData[roomId] = { messages: [] }; // Initialize the room with an empty messages array
    }
    const chatMessage = { name, message };
    roomData[roomId].messages.push(chatMessage);

    // Broadcast the message to all clients in the room
    socket.to(roomId).emit('chat-message', chatMessage);
  });

  // Handle video loading for the room (when first user loads a video)
  socket.on('load-video', ({ roomId, videoId }) => {
    if (!roomData[roomId]) {
      roomData[roomId] = {}; // Ensure the room exists before setting the video ID
    }
    roomData[roomId].videoId = videoId;

    // Broadcast video ID to all clients in the room
    socket.to(roomId).emit('video-id', videoId);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (currentRoom && currentUserName) {
      console.log(`User ${currentUserName} (${socket.id}) disconnected from room ${currentRoom}`);
      // Notify other users in the room
      socket.to(currentRoom).emit('chat-message', {
        name: 'System',
        message: `${currentUserName} has left the room.`,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
