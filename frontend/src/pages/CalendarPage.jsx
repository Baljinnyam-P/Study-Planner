// -------------------------------------------------------------
// Why: Visual calendar for scheduling and quick overview of plan items per day.
// -------------------------------------------------------------
import React from 'react'
import api from '../api/axios'

function getMonthDays(reference = new Date()){
  const y = reference.getFullYear(); const m = reference.getMonth()
  const first = new Date(y, m, 1); const last = new Date(y, m+1, 0)
  const days = []
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d))
  return { days, y, m }
}

export default function CalendarPage(){
  const [plans, setPlans] = React.useState([])
  const { days, y, m } = React.useMemo(()=>getMonthDays(new Date()), [])
  React.useEffect(()=>{
    (async ()=>{
      try { const res = await api.get('/plans'); setPlans(res.data) } catch {}
    })()
  }, [])

  // naive aggregation: assume Day N keys in content; map to current month positions
  const counts = {}
  for (const p of plans){
    const content = p.content || {}
    Object.entries(content).forEach(([dayLabel, items], idx)=>{
      // just spread across the month sequentially
      const dayIndex = idx % days.length
      counts[dayIndex] = (counts[dayIndex] || 0) + (Array.isArray(items)? items.length : 0)
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i)=> (
          <div key={i} className="bg-white rounded shadow p-3 h-24">
            <div className="text-xs text-gray-500">{d.toLocaleDateString(undefined,{ month:'short', day:'numeric'})}</div>
            <div className="mt-2 text-sm">Tasks: <span className="font-semibold">{counts[i] || 0}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
