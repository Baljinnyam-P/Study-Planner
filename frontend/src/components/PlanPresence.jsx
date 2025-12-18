// -------------------------------------------------------------
// Why: Show who is currently viewing/editing a plan in real-time
// using Socket.IO presence events.
// -------------------------------------------------------------
import React from 'react'
import { getSocket, joinRoom, leaveRoom } from '../lib/socket'

export default function PlanPresence({ planId, currentUser }){
  const [members, setMembers] = React.useState([])
  React.useEffect(()=>{
    if (!planId) return
    const room = `plan:${planId}`
    const s = getSocket()
    const onPresence = (list)=> setMembers(Array.isArray(list)? list : [])
    s.on('presence', onPresence)
    joinRoom(room, { id: currentUser?.id, name: currentUser?.fullname })
    return ()=>{
      leaveRoom(room)
      s.off('presence', onPresence)
    }
  }, [planId, currentUser?.id])

  if (!planId) return null
  return (
    <div className="text-xs text-gray-600">
      <span className="font-medium">Live:</span> {members.map(m=>m?.name || 'User').join(', ') || 'Just you'}
    </div>
  )
}
