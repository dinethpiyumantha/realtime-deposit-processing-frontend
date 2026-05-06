import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

/**
 * Singleton Socket.IO client connected to the /deposits namespace.
 * autoConnect: false — caller decides when to connect/disconnect.
 */
export const depositsSocket = io(`${BASE_URL}/deposits`, {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
})
