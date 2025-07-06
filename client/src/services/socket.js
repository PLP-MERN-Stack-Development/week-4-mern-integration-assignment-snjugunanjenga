// src/services/socket.js - Socket.io client setup
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
});

export default socket;