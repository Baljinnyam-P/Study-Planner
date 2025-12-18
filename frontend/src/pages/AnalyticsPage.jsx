// -------------------------------------------------------------
// Why: Provide study analytics: completion, priorities, and activity charts.
// -------------------------------------------------------------
import React from 'react'
import api from '../api/axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']

export default function AnalyticsPage(){
  const [tasks, setTasks] = React.useState([])
  React.useEffect(()=>{
    (async ()=>{ try { const res = await api.get('/tasks'); setTasks(res.data) } catch {} })()
  }, [])
  const completed = tasks.filter(t=>t.completed).length
  const pending = tasks.length - completed
  const pieData = [ { name:'Completed', value: completed }, { name:'Pending', value: pending } ]
  const priorityBuckets = [1,2,3,4,5].map(p=>({ priority: p, count: tasks.filter(t=>t.priority===p).length }))
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">Completion</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">Tasks by Priority</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={priorityBuckets}>
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
