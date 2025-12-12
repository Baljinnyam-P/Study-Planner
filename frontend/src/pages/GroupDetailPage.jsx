// GroupDetailPage.jsx
// Why: This page shows detailed information about a specific study group, including members and shared study plans, to facilitate collaboration.
import { getGroupPlanTasks } from '../api/axios';
import React, { useEffect, useState } from 'react';
import SharedPlans from '../components/SharedPlans';
import PlanDetailModal from '../components/PlanDetailModal';
import { useParams, useNavigate } from 'react-router-dom';

import {
  getGroupMembers,
  getGroupPlans,
  sendGroupInvite,
  createGroupPlan,
  viewGroupPlan,
  deleteGroupPlan,
  joinGroupPlan,
  updateGroupPlan,
  getGroupPlanParticipants,
} from '../api/axios';

import Banner from '../components/Banner';
import { removeGroupMember } from '../api/group';
import { useBanner } from '../hooks/useBanner';
import { apiMsg } from '../api/errors';

// -----------------------------------------------------------
// GroupPlanForm (unchanged logic, cleaned slightly)
// -----------------------------------------------------------
function GroupPlanForm({ onCreate }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [task, setTask] = React.useState('');
  const [due, setDue] = React.useState('');
  const [duration, setDuration] = React.useState(30);
  const [tasks, setTasks] = React.useState([]);
  const [priority, setPriority] = React.useState(3);
  const [msg, setMsg] = React.useState('');

  function addTask(e) {
    e.preventDefault();
    if (!task) return;

    // Always send due as ISO string or null
    setTasks([
      ...tasks,
      { task, due: due ? new Date(due).toISOString().slice(0, 10) : null, duration, priority }
    ]);
    setTask('');
    setDue('');
    setDuration(30);
  }

  function removeTask(idx) {
    setTasks(tasks.filter((_, i) => i !== idx));
  }

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (t.length < 3) {
      setMsg('Title must be at least 3 characters');
      return;
    }
    if (tasks.length === 0) {
      setMsg('At least one task required');
      return;
    }
    // Normalize all due dates before sending
    const normTasks = tasks.map(tsk => ({
      ...tsk,
      due: tsk.due ? new Date(tsk.due).toISOString().slice(0, 10) : null,
      priority: typeof tsk.priority === 'number' ? tsk.priority : 3
    }));
    onCreate(t, normTasks, description);
  }

  return (
    <form onSubmit={submit} className="mb-4 bg-gray-50 p-3 rounded">
      <div className="mb-2">
        <label className="block text-sm">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 w-full"
          rows={2}
          placeholder="Optional description"
        />
      </div>

      <div className="mb-2 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs">Task</label>
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-xs">Due Date</label>
          <input
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
            className="border p-2"
          />
        </div>

        <div>
          <label className="block text-xs">Duration (min)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="border p-2 w-20"
          />
        </div>

        <select
          className="border p-2 w-24"
          value={priority}
          onChange={e => setPriority(parseInt(e.target.value, 10))}
        >
          <option value={1}>High</option>
          <option value={2}>Medium</option>
          <option value={3}>Low</option>
        </select>
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded"
          onClick={addTask}
          type="button"
        >
          Add
        </button>
      </div>

      {tasks.length > 0 && (
        <ul className="mb-2 text-xs">
          {tasks.map((t, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span>{t.task}</span>
              {t.due && <span className="text-gray-400">Due: {t.due}</span>}
              <span className="text-gray-400">{t.duration} min</span>
              <span className="text-gray-400">Priority: {t.priority === 1 ? 'High' : t.priority === 2 ? 'Medium' : 'Low'}</span>
              <button
                className="text-red-600 text-xs"
                type="button"
                onClick={() => removeTask(i)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
        Create
      </button>

      {msg && <span className="text-red-600 ml-2">{msg}</span>}
    </form>
  );
}

// -----------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------
export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [viewedPlan, setViewedPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inviteVal, setInviteVal] = useState('');
  const [planMsg, setPlanMsg] = useState('');

  const bannerInvites = useBanner();
  const bannerPlans = useBanner();

  // Load group details
  useEffect(() => {
    loadAll();
  }, [groupId]);

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const [mRes, pRes] = await Promise.all([
        getGroupMembers(groupId),
        getGroupPlans(groupId)
      ]);
      setMembers(mRes.data);
      setPlans(pRes.data);
    } catch (e) {
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }

  // Invite
  async function handleInvite(e) {
    e.preventDefault();
    bannerInvites.clear();

    try {
      await sendGroupInvite(groupId, inviteVal);
      bannerInvites.show('Invite sent!', 'success');
      setInviteVal('');
    } catch (e) {
      bannerInvites.show(apiMsg(e), 'error');
    }
  }

  // View plan
  async function handleViewPlan(planId) {
    setViewedPlan(null);
    try {
      const res = await viewGroupPlan(planId);
      const parts = await getGroupPlanParticipants(planId);
      const tasksRes = await getGroupPlanTasks(planId);
      const debugPlan = {
        id: planId, // Ensure id is always present for modal
        ...res.data,
        participants: parts.data,
        tasks: tasksRes.data,
        description: res.data.description || '', // Use top-level description
        due: res.data.due || res.data.content?.due || null,
      };
      setViewedPlan(debugPlan);
    } catch (e) {
      console.error('[handleViewPlan] Failed to load plan:', e, 'planId:', planId);
      setViewedPlan({ error: 'Failed to load plan', planId });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button className="mb-4 text-blue-600" onClick={() => navigate(-1)}>
        &larr; Back to Groups
      </button>

      <h1 className="text-2xl font-bold mb-2">Group #{groupId}</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Invite Section */}
          <form onSubmit={handleInvite} className="mb-6 flex gap-2 items-end">
            <div>
              <label className="block text-sm">Invite by username or email</label>
              <input
                type="text"
                value={inviteVal}
                onChange={e => setInviteVal(e.target.value)}
                className="border p-2 w-64"
                required
              />
            </div>

            <button
              className="bg-blue-600 text-white px-3 py-2 rounded"
              type="submit"
            >
              Send Invite
            </button>

            <Banner msg={bannerInvites.msg} type={bannerInvites.type} />
          </form>

          {/* Members */}
          <section className="mb-6">
            <h2 className="font-semibold mb-1">Members</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <div>
                    <div className="font-medium">{m.fullname}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        m.role === 'owner'
                          ? 'border-purple-200 text-purple-700 bg-purple-50'
                          : 'border-blue-200 text-blue-700 bg-blue-50'
                      }`}
                    >
                      {m.role}
                    </span>

                    <button
                      className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                      onClick={async () => {
                        try {
                          await removeGroupMember(groupId, m.user_id || m.id);
                          bannerInvites.show('Member removed', 'success');
                          loadAll();
                        } catch (e) {
                          bannerInvites.show(apiMsg(e), 'error');
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PLANS */}
          <section>
            <div className="flex items-center mb-1">
              <h2 className="font-semibold">Shared Plans</h2>

              <button
                className="ml-4 text-xs bg-green-600 text-white px-2 py-1 rounded"
                onClick={() => setShowPlanForm(v => !v)}
              >
                {showPlanForm ? 'Cancel' : 'New Plan'}
              </button>
            </div>

            {/* Plan create form */}
            {showPlanForm && (
              <GroupPlanForm
                onCreate={async (title, tasks, description) => {
                  setPlanMsg('');
                  try {
                    await createGroupPlan(groupId, {
                      title,
                      description,
                      content: { tasks },
                    });

                    setPlanMsg('Plan created!');
                    setShowPlanForm(false);
                    loadAll();
                  } catch (e) {
                    setPlanMsg(apiMsg(e));
                  }
                }}
              />
            )}

            <Banner msg={bannerPlans.msg} type={bannerPlans.type} />

            <SharedPlans
              plans={plans.map(p => ({
                ...p,
                // Use top-level due if present, fallback to content.due for legacy
                due: p.due || p.content?.due || null,
              }))}
              onView={plan => handleViewPlan(plan.id)}
              onJoin={async plan => {
                try {
                  await joinGroupPlan(plan.id);
                  bannerPlans.show(`Joined plan: ${plan.title}`, 'success');
                } catch (e) {
                  bannerPlans.show(apiMsg(e), 'error');
                }
              }}
              onDelete={async plan => {
                try {
                  await deleteGroupPlan(plan.id);
                  bannerPlans.show('Plan deleted', 'success');
                  loadAll();
                } catch (e) {
                  bannerPlans.show(apiMsg(e), 'error');
                }
              }}
            />

            {/* MODAL */}
            {viewedPlan && (
              <PlanDetailModal
                plan={viewedPlan}
                onClose={() => setViewedPlan(null)}
                onDelete={async planId => {
                  try {
                    await deleteGroupPlan(planId);
                    bannerPlans.show('Plan deleted', 'success');
                    setViewedPlan(null);
                    loadAll();
                  } catch (e) {
                    bannerPlans.show(apiMsg(e), 'error');
                  }
                }}
                onSaveTitle={async (planId, newTitle) => {
                  try {
                    const res = await updateGroupPlan(planId, {
                      title: newTitle,
                    });

                    setViewedPlan(v =>
                      v ? { ...v, title: res.data.title } : v
                    );

                    setPlans(prev =>
                      prev.map(p =>
                        p.id === planId
                          ? { ...p, title: res.data.title }
                          : p
                      )
                    );

                    bannerPlans.show('Plan title updated', 'success');
                  } catch (e) {
                    bannerPlans.show(apiMsg(e), 'error');
                  }
                }}
                onSaveContent={async (planId, content) => {
                  try {
                    // If content has a top-level due, send it as a top-level field
                    const payload = { ...content };
                    if (content.due !== undefined) payload.due = content.due;
                    await updateGroupPlan(planId, payload);
                    // Always reload the plan from backend for freshest data
                    const fresh = await viewGroupPlan(planId);
                    setViewedPlan(fresh.data);
                    setPlans(prev =>
                      prev.map(p =>
                        p.id === planId ? { ...p, ...fresh.data } : p
                      )
                    );
                    bannerPlans.show('Plan updated!', 'success');
                  } catch (e) {
                    bannerPlans.show(apiMsg(e), 'error');
                  }
                }}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
