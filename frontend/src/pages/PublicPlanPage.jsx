// -------------------------------------------------------------
// Why: Public read-only view for shared plans accessed via public_id.
// -------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicPlan } from '../api/axios'

const dayColors = [
  'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-purple-100',
  'bg-orange-100', 'bg-teal-100', 'bg-indigo-100', 'bg-red-100', 'bg-gray-100'
];

export default function PublicPlanPage(){
  const { publicId } = useParams()
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(){
      try {
        const res = await getPublicPlan(publicId)
        setPlan(res.data)
      } catch (e){
        setError(e?.response?.data?.msg || 'Plan not found')
      }
    }
    load()
  }, [publicId])

  if (error){
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card p-6 rounded">
          <div className="text-red-600 font-semibold mb-2">{error}</div>
          <Link to="/" className="text-blue-600">Go Home</Link>
        </div>
      </div>
    )
  }

  if (!plan){
    return <div className="p-6">Loading...</div>
  }

  const days = Object.entries(plan.content || {})
  const columns = Math.min(Math.max(days.length, 1), 5)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="glass-card rounded p-6">
        <div className="mb-2 text-sm text-gray-500">Shared plan (read-only)</div>
        <h1 className="text-2xl font-bold mb-2">{plan.title}</h1>
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
                  <div key={idx} className="glass-card rounded p-2 mb-2 flex flex-col gap-1">
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
  )
}
