import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const SOCKET_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://devapis.doorstephub.com').replace(/\/+$/, '');
    const token = localStorage.getItem('auth_token') || '';

    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to DoorstepHub Socket Server:', socket.id);
      // Register logged-in user
      const userStr = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const userId = u._id || u.id;
          if (userId) socket.emit('registerUser', userId);
        } catch (e) {}
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ Socket connection warning:', err.message);
    });
  }

  return socket;
};

export const joinConversationRoom = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('joinConversation', conversationId);
  }
};

export const leaveConversationRoom = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('leaveConversation', conversationId);
  }
};
