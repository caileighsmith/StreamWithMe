# Stream With Me!

**Stream With Me** is a collaborative YouTube watch party application that allows users to watch YouTube videos together in real-time while chatting with each other. The app ensures video synchronization across all participants and provides a seamless experience for group viewing.

## Features

- **Real-Time Video Synchronization**: Ensures all users in the room are watching the video at the same playback position.
- **Chat Functionality**: Users can send and receive messages in real-time while watching videos.
- **Room Management**: Users can create or join rooms to watch videos together.
- **Dynamic Video Loading**: Load YouTube videos by entering a video link.
- **User Notifications**: Displays messages when users join or leave the room.

## How to Use

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd StreamWithMe
   ```

2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    node server/index.js
    ```
4. Open application in the brwoser:
    ```
    http://localhost:3000
    ```
5. Enter a room ID to join or create a room.

6. Load a YouTube video by entering its link.

7. Chat and enjoy synchronized video playback with others in the room.

## Technologies Used
- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Node.js, Express.js
- Real-Time Communication: Socket.IO
- YouTube Integration: YouTube IFrame API

## Future Improvements
- Add user authentication for personalized experiences.
- Support for multiple video platforms.
- Enhanced UI/UX for better usability.

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.