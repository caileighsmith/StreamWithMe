let socket = io();
let player;
let roomId = '';
let playerReady = false;
let lastSeekTime = 0;
let userName = ''; // Store the user's name
const seekDebounceDelay = 1000; // Milliseconds delay before another seek event can be sent

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: '',
    events: {
      onReady: () => {
        playerReady = true;
      },
      onStateChange: onPlayerStateChange,
    },
  });
}

// Join the room
document.getElementById('joinBtn').addEventListener('click', () => {
  roomId = document.getElementById('roomInput').value;
  if (roomId) {
    userName = prompt("Enter your name:"); // Store the user's name
    if (userName) {
      socket.emit('join-room', { roomId, name: userName });
      socket.emit('chat-message', { roomId, message: `${userName} has joined the room.`, name: userName });
      appendChatMessage(`You: ${userName} has joined the room.`);
      updateUIForRoom(roomId); // Update the UI to reflect the room
    }
  }
});

const urlParser = (url) => {
  // Takes in a YouTube URL, returning the video ID
  if (!url) return null;
  let index = url.indexOf("v=");
  if (index === -1) return null;
  let videoId = url.substring(index + 2, url.length);
  return videoId;
};

// Load the video
document.getElementById('loadVideoBtn').addEventListener('click', () => {
  const videoId = urlParser(document.getElementById('videoInput').value.trim());

  if (playerReady && videoId) {
    player.loadVideoById(videoId);
    // Send the video ID to the server for syncing
    socket.emit('load-video', { roomId, videoId });
  }
});

// Handle state change from the YouTube player
function onPlayerStateChange(event) {
  if (!roomId) return;

  if (event.data === YT.PlayerState.PLAYING) {
    socket.emit('play', roomId);
  } else if (event.data === YT.PlayerState.PAUSED) {
    socket.emit('pause', roomId);
  }

  // Emit seek event if the video is seeking
  if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED) {
    const currentTime = player.getCurrentTime();

    // Avoid sending seek events too often, add a debounce
    if (Date.now() - lastSeekTime > seekDebounceDelay) {
      socket.emit('seek', { roomId, time: currentTime });
      lastSeekTime = Date.now(); // Update the last seek time
    }
  }
}

// Sync play/pause/seek with the room
socket.on('play', () => player.playVideo());
socket.on('pause', () => player.pauseVideo());

// Sync seek event across all clients in the room
socket.on('seek', (time) => {
  if (player && player.getCurrentTime() !== time) { // Prevent unnecessary seeking if already at the target time
    player.seekTo(time, true); // Seek to the new time
  }
});

// Handle receiving chat messages
socket.on('chat-message', ({ name, message }) => {
  appendChatMessage(`${name}: ${message}`);
});

// Handle receiving previous chat messages when joining the room
socket.on('chat-messages', (messages) => {
  messages.forEach((message) => {
    appendChatMessage(`${message.name}: ${message.message}`);
  });
});

// Handle receiving the video ID when someone joins the room
socket.on('video-id', (videoId) => {
  if (playerReady && videoId) {
    player.loadVideoById(videoId);
  }
});

// Handle sending chat messages
document.getElementById('sendChat').addEventListener('click', () => {
  const message = document.getElementById('chatInput').value;
  if (message && roomId) {
    socket.emit('chat-message', { roomId, message, name: userName });
    appendChatMessage(`You: ${message}`);
    document.getElementById('chatInput').value = '';
  }
});

// Append chat messages to chat box
function appendChatMessage(msg) {
  const chatBox = document.getElementById('chatBox');
  const messageElem = document.createElement('div');
  messageElem.textContent = msg;
  chatBox.appendChild(messageElem);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Update the UI to reflect the room
function updateUIForRoom(roomId) {
  // Display the room ID
  const roomDisplay = document.createElement('div');
  roomDisplay.id = 'roomDisplay';
  roomDisplay.textContent = `You are in room: ${roomId}`;
  document.body.insertBefore(roomDisplay, document.getElementById('player'));

  // Hide the room input and join button
  document.querySelector('.controls').style.display = 'none';

  // Show the chat section
  document.querySelector('.chat').style.display = 'block';
}

// Close the Room Controls card when the "X" button is clicked
document.getElementById('closeRoomControls').addEventListener('click', () => {
  const roomControlsCard = document.getElementById('roomControlsCard');
  const openRoomControlsButton = document.getElementById('openRoomControls');
  if (roomControlsCard) {
    roomControlsCard.style.display = 'none'; // Hide the card
    openRoomControlsButton.style.display = 'block'; // Show the "Open Room Controls" button
  }
});

// Reopen the Room Controls card when the "Open Room Controls" button is clicked
document.getElementById('openRoomControls').addEventListener('click', () => {
  const roomControlsCard = document.getElementById('roomControlsCard');
  const openRoomControlsButton = document.getElementById('openRoomControls');
  if (roomControlsCard) {
    roomControlsCard.style.display = 'block'; // Show the card
    openRoomControlsButton.style.display = 'none'; // Hide the "Open Room Controls" button
  }
});
