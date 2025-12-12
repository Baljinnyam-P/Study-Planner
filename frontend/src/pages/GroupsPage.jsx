// GroupsPage.jsx
// Why: This page enables users to collaborate by listing, creating, joining, and viewing study groups, fostering teamwork and engagement.

import React, { useEffect, useState } from 'react';
import { getGroups, createGroup, joinGroup, leaveGroup, getGroupMembers, } from '../api/axios';
import api from '../api/axios';
import Banner from '../components/Banner';
import { useBanner } from '../hooks/useBanner';
import { apiMsg } from '../api/errors';
import InvitesPanel from '../components/InvitesPanel';
import { useNavigate } from 'react-router-dom';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const banner = useBanner();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (e) {
      banner.show(apiMsg(e) || 'Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    banner.clear();
    try {
      await createGroup(newGroup);
      setShowCreate(false);
      setNewGroup({ name: '', description: '' });
      loadGroups();
      banner.show('Group created', 'success');
    } catch (e) {
      banner.show(apiMsg(e) || 'Create failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    banner.clear();
    try {
      await joinGroup(joinId);
      setJoinId('');
      loadGroups();
      banner.show('Joined group', 'success');
    } catch (e) {
      banner.show(apiMsg(e) || 'Join failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <InvitesPanel />
      <h1 className="text-2xl font-bold mb-4">Study Groups</h1>
      <Banner msg={banner.msg} type={banner.type} />
      <div className="mb-4 flex gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : 'Create Group'}
        </button>
        <form onSubmit={handleJoin} className="flex gap-2">
          <input type="number" placeholder="Group ID" value={joinId} onChange={e => setJoinId(e.target.value)} className="border p-2 w-32" />
          <button className="bg-green-600 text-white px-3 py-2 rounded" type="submit">Join</button>
        </form>
      </div>
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 bg-gray-50 p-4 rounded shadow">
          <div className="mb-2">
            <label className="block">Name</label>
            <input type="text" value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} className="border p-2 w-full" required />
          </div>
          <div className="mb-2">
            <label className="block">Description</label>
            <textarea value={newGroup.description} onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))} className="border p-2 w-full" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create</button>
        </form>
      )}
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {groups.length === 0 ? <div className="text-gray-500">No groups yet. Join or create one!</div> : (
            groups.map(g => (
              <GroupCard key={g.id} group={g} reload={loadGroups} onClick={() => navigate(`/groups/${g.id}`)} notify={banner.show} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, reload, onClick, notify }) {
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [leaving, setLeaving] = useState(false);
  async function loadMembers() {
    if (!showMembers) {
      const res = await getGroupMembers(group.id);
      setMembers(res.data);
    }
    setShowMembers(v => !v);
  }
  async function handleLeave() {
    setLeaving(true);
    try {
      await leaveGroup(group.id);
      reload();
      notify && notify('Left group', 'success');
    } catch (e) {
      notify && notify(apiMsg(e) || 'Leave failed', 'error');
    }
    setLeaving(false);
  }
  async function removeMember(userId) {
    try {
      await api.post(`/groups/${group.id}/members/${userId}/remove`);
      const res = await getGroupMembers(group.id);
      setMembers(res.data);
      notify && notify('Member removed', 'success');
    } catch (e) {
      notify && notify(apiMsg(e) || 'Failed to remove', 'error');
    }
  }
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <div onClick={onClick} className="cursor-pointer">
          <div className="font-semibold">{group.name}</div>
          <div className="text-sm text-gray-500">ID: {group.id}</div>
          <div className="text-xs text-gray-400">{group.description}</div>
        </div>
        <button className="text-red-600 text-sm" onClick={handleLeave} disabled={leaving}>Leave</button>
      </div>
      <button className="mt-2 text-blue-600 text-sm" onClick={loadMembers}>{showMembers ? 'Hide' : 'Show'} Members</button>
      {showMembers && (
        <ul className="mt-2 ml-4 list-disc text-sm">
          {members.map(m => (
            <li key={m.id} className="flex items-center gap-2">
              <span>{m.fullname || m.user_id} ({m.role})</span>
              <button className="text-xs text-red-600" onClick={() => removeMember(m.user_id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
