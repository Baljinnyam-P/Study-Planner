
// Why: This component lets users manage in-app group invites, allowing collaboration and engagement.

import React, { useEffect, useState } from 'react';
import { getPendingInvites, respondToInvite } from '../api/axios';
import Banner from './Banner';
import { useBanner } from '../hooks/useBanner';
import { apiMsg } from '../api/errors';

export default function InvitesPanel() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const banner = useBanner();

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    setLoading(true);
    banner.clear();
    try {
      const res = await getPendingInvites();
      // Only show pending invites (minimal, robust)
      setInvites(Array.isArray(res.data) ? res.data.filter(inv => inv.status === 'pending') : []);
    } catch (e) {
      banner.show(apiMsg(e) || 'Failed to load invites', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(inviteId, action) {
    banner.clear();
    try {
      await respondToInvite(inviteId, action);
      loadInvites();
      banner.show(action === 'accept' ? 'Invite accepted' : 'Invite declined', 'success');
    } catch (e) {
      if (e?.response?.status === 404) {
        banner.show('Invite not found or already handled.', 'error');
        loadInvites();
      } else {
        banner.show(apiMsg(e) || 'Failed to respond', 'error');
      }
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="font-semibold mb-2">Pending Group Invites</h2>
      <Banner msg={banner.msg} type={banner.type} />
      {loading ? <div>Loading...</div> : (
        invites.length === 0 ? <div className="text-gray-500">No invites.</div> : (
          <ul className="space-y-2">
            {invites.map(inv => (
              <li key={inv.id} className="flex items-center justify-between">
                <span>Group #{inv.group_id} (Invited by User #{inv.inviter_id})</span>
                <span>
                  <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleRespond(inv.id, 'accept')}>Accept</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleRespond(inv.id, 'decline')}>Decline</button>
                </span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
