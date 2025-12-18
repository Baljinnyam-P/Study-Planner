// NotificationBell.jsx
// Why: Shows a bell icon with unread count and a dropdown of notifications for user engagement.

import React, { useEffect, useState, useRef } from 'react';
import { getNotifications, markNotificationRead, respondToInvite, deleteNotification } from '../api/axios';
import { extractInviteIdFromMessage } from '../utils/notification';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const bellRef = useRef();

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 60s
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh on socket-driven notify events
  useEffect(()=>{
    function onNotify(){ loadNotifications() }
    window.addEventListener('sp-notify', onNotify)
    return ()=> window.removeEventListener('sp-notify', onNotify)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (e) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  //Mark notification as read
  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications(n => n.map(note => note.id === id ? { ...note, read: true } : note));
    } catch {}
  }
  // Delete notification
  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      setNotifications(n => n.filter(note => note.id !== id));
    } catch {}
  }
  // Handle invite accept/decline from notification
  async function handleInviteAction(inviteId, action, notifId) {
    setActionError('');
    try {
      await respondToInvite(inviteId, action);
      await handleMarkRead(notifId);
      await loadNotifications();
    } catch (e) {
      setActionError(e?.response?.data?.msg || 'Could not process invite. It may have already been handled.');
      await loadNotifications();
    }
  }

  // Only show latest (pending) invites and unread notifications
  const filteredNotifications = notifications.filter(n => n.type !== 'invite' || !n.read);
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={bellRef}>
      <button onClick={() => setOpen(o => !o)} className="relative focus:outline-none">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
        )}
      </button>
      {/* When bell is clicked, show dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>
          {loading ? <div className="p-3">Loading...</div> : error ? <div className="p-3 text-red-600">{error}</div> : (
            <>
              {actionError && <div className="p-3 text-red-600">{actionError}</div>}
              {filteredNotifications.length === 0 ? <div className="p-3 text-gray-500">No notifications.</div> : (
                <ul className="max-h-80 overflow-y-auto divide-y">
                  {filteredNotifications.map(note => (
                    <li key={note.id} className={`p-3 flex justify-between items-center ${note.read ? 'bg-gray-50' : ''}`}>
                      <div>
                        <div className="text-sm">{note.message || note.type}</div>
                        <div className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</div>
                      </div>
                      {!note.read && (
                        note.type === 'invite' ? (() => {
                          const inviteId = note.invite_id ?? extractInviteIdFromMessage(note.message);
                          return inviteId ? (
                            <span className="flex gap-2">
                              <button className="text-xs text-green-600" onClick={() => handleInviteAction(inviteId, 'accept', note.id)}>Accept</button>
                              <button className="text-xs text-red-600" onClick={() => handleInviteAction(inviteId, 'decline', note.id)}>Decline</button>
                            </span>
                          ) : <button className="text-xs text-blue-600" onClick={() => handleMarkRead(note.id)}>Mark read</button>;
                        })() : (
                          <span className="flex gap-2">
                            { /* Mark as read and Delete buttons for other notifications */ }
                            <button className="text-xs text-blue-600" onClick={() => handleMarkRead(note.id)}>Mark read</button>
                            <button className="text-xs text-red-600" onClick={() => handleDelete(note.id)}>Delete</button>
                          </span>
                        )
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
