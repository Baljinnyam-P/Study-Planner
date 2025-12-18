# -------------------------------------------------------------
# Why: Centralize Socket.IO event handlers for real-time features
# (presence, live editing, notifications) separate from REST routes.
# -------------------------------------------------------------
from flask import request
from .extensions import socketio
from .extensions import db
from .models import Notification

# In-memory presence map: { room: { sid: user_info } }
presence = {}

def _room_key(kind: str, identifier: str|int) -> str:
    return f"{kind}:{identifier}"

@socketio.on('join')
def handle_join(data):
    room = data.get('room')
    user = data.get('user')
    if not room:
        return
    socketio.join_room(room)
    presence.setdefault(room, {})[request.sid] = user or {}
    socketio.emit('presence', list(presence.get(room, {}).values()), to=room)

@socketio.on('leave')
def handle_leave(data):
    room = data.get('room')
    if not room:
        return
    socketio.leave_room(room)
    if room in presence and request.sid in presence[room]:
        presence[room].pop(request.sid, None)
        if not presence[room]:
            presence.pop(room, None)
        else:
            socketio.emit('presence', list(presence[room].values()), to=room)

@socketio.on('disconnect')
def handle_disconnect():
    # Remove from all rooms on disconnect
    empty_rooms = []
    for room, members in presence.items():
        if request.sid in members:
            members.pop(request.sid, None)
            if members:
                socketio.emit('presence', list(members.values()), to=room)
            else:
                empty_rooms.append(room)
    for r in empty_rooms:
        presence.pop(r, None)

def emit_plan_updated(plan_id: int, payload: dict):
    room = _room_key('plan', plan_id)
    socketio.emit('plan_updated', payload, to=room)

def notify_user(user_id: int, message: str, type: str = 'info', invite_id: int | None = None):
    note = Notification(user_id=user_id, message=message, type=type, invite_id=invite_id)
    db.session.add(note)
    db.session.commit()
    user_room = _room_key('user', user_id)
    socketio.emit('notify', {
        'id': note.id,
        'message': note.message,
        'type': note.type,
        'invite_id': note.invite_id,
        'created_at': note.created_at.isoformat()
    }, to=user_room)
