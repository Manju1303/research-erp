import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (socket && socket.connected) {
    return socket;
  }

  const token =
    localStorage.getItem('scriptara_token') ||
    localStorage.getItem('inzovate_token');

  if (!token) return null;

  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  // Strip trailing /api/v1 to get origin
  const origin = rawUrl.replace(/\/api\/v1\/?$/, '');

  socket = io(`${origin}/realtime`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to Scriptara Realtime WebSocket:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Realtime connection error:', err.message);
  });

  return socket;
}

export function subscribeToProject(projectId: string) {
  const s = getRealtimeSocket();
  if (s) {
    s.emit('project:subscribe', { projectId });
  }
}

export function unsubscribeFromProject(projectId: string) {
  const s = getRealtimeSocket();
  if (s) {
    s.emit('project:unsubscribe', { projectId });
  }
}

export function disconnectRealtimeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
