// -------------------------------------------------------------
// Why: This page displays all of a user's study plans for easy management.
//
// Why this design?
//Centralizes plan listing and management for clarity.
//Makes it easy to add plan filtering, sorting, or sharing features.
//Follows SPA best practices for modular, page-based UI.
// -------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import Banner from '../components/Banner'
import { useBanner } from '../hooks/useBanner'
const dayColors = [
  'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-purple-100',
  'bg-orange-100', 'bg-teal-100', 'bg-indigo-100', 'bg-red-100', 'bg-gray-100'
];

export default function PlansPage(){
  const [plans, setPlans] = useState([])
  const [modalPlan, setModalPlan] = useState(null)
  const banner = useBanner()
  async function load(){
    try { const res = await api.get('/plans'); setPlans(res.data) }
    catch (e) { banner.show(e?.response?.data?.msg || 'Failed to load plans', 'error') }
  }
  useEffect(()=>{ load() }, [])
  async function deletePlan(id){
    try { await api.delete(`/plans/${id}`); setPlans(plans.filter(p=>p.id!==id)); banner.show('Plan deleted', 'success') }
    catch (e) { banner.show(e?.response?.data?.msg || 'Delete failed', 'error') }
  }
  function PlanModal({ plan, onClose }) {
    if (!plan) return null;
    const days = Object.entries(plan.content || {});
    // Debug log
    // eslint-disable-next-line no-console
    console.log('PlanModal plan.content:', plan.content);
    const columns = Math.min(Math.max(days.length, 1), 5);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6 relative overflow-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">&times;</button>
          <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
          <div className="text-sm text-gray-500 mb-4">Generated: {new Date(plan.generated_at).toLocaleString()}</div>
          <div
            className="gap-6"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(220px, 1fr))`,
              rowGap: '1.5rem',
              columnGap: '1.5rem',
              maxWidth: '100%',
            }}
          >
            {days.map(([day, items], dayIdx) => (
              <div key={day} className={`rounded p-3 ${dayColors[dayIdx % dayColors.length]}`} style={{minWidth:0}}>
                <div className="font-bold mb-2">{day}</div>
                {Array.isArray(items) && items.length > 0 ? (
                  items.map((it, idx) => (
                    <div key={idx} className="bg-white rounded shadow p-2 mb-2 flex flex-col gap-1">
                      <div className="font-semibold">{it.task}</div>
                      <div className="text-xs text-gray-600">{it.duration} mins
                        {typeof it.priority === 'number' && (
                          <>
                            {' | Priority: '}
                            <span className={
                              it.priority === 1 ? 'text-red-600 font-bold' :
                              it.priority === 2 ? 'text-yellow-600 font-semibold' :
                              'text-green-700'
                            }>
                              {it.priority === 1 ? 'High' : it.priority === 2 ? 'Medium' : 'Low'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="italic text-gray-400">No tasks for this day</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">Your Plans</h1>
      <Banner msg={banner.msg} type={banner.type} />
      <div className="mt-4 space-y-4">
        {plans.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow hover:ring-2 hover:ring-blue-300 cursor-pointer transition" onClick={() => setModalPlan(p)}>
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">{new Date(p.generated_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={e => { e.stopPropagation(); deletePlan(p.id); }} className="text-red-600">Delete</button>
              </div>
            </div>
            {/* Mini grid preview: horizontal scroll, all days, summary only */}
            <div className="mt-3 overflow-x-auto">
              <div style={{ display: 'flex', gap: '0.5rem', minWidth: 0 }}>
                {Object.entries(p.content).map(([day, items], dayIdx) => (
                  <div key={day} className={`rounded p-2 ${dayColors[dayIdx % dayColors.length]}`} style={{ minWidth: 120 }}>
                    <div className="font-bold text-xs mb-1 truncate">{day}</div>
                    {items.slice(0, 2).map((it, idx) => (
                      <div key={idx} className="bg-white rounded shadow p-1 mb-1 text-xs truncate">
                        {it.task}
                      </div>
                    ))}
                    {items.length > 2 && <div className="text-xs text-gray-400">+{items.length - 2} more</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <PlanModal plan={modalPlan} onClose={() => setModalPlan(null)} />
    </div>
  )
}
