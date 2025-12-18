// -------------------------------------------------------------
// Why: Centralize Socket.IO client connection for real-time updates,
// presence, and notifications across the app.
// -------------------------------------------------------------
import { io } from 'socket.io-client'

// Use same env var as axios to avoid mismatch
const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
// Strip trailing /api if present to get server origin
const origin = base.replace(/\/api\/?$/, '')

let socket

export function getSocket(){
  if (!socket){
    socket = io(origin, { withCredentials: true })
  }
  return socket
}

export function joinRoom(room, user){
  const s = getSocket()
  s.emit('join', { room, user })
}

export function leaveRoom(room){
  const s = getSocket()
  s.emit('leave', { room })
}
