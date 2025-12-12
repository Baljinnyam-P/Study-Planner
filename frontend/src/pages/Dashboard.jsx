// -------------------------------------------------------------
// Why: This page displays the user's dashboard with an overview of plans and tasks.
// Provides a central place for users to see their study progress.
// -------------------------------------------------------------

import React, { useEffect, useState } from 'react'
import TaskListDnd from '../components/TaskListDnd'
import api from '../api/axios'
import Banner from '../components/Banner'
import { useBanner } from '../hooks/useBanner'

function TaskForm({ onCreate }){
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState(30)
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(3)
  async function submit(e){
    e.preventDefault()
    const payload = { title, estimate_minutes: estimate, priority }
    if (dueDate) payload.due_date = dueDate
    const res = await api.post('/tasks', payload)
    onCreate(res.data)
    setTitle(''); setEstimate(30); setDueDate(''); setPriority(3)
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2 items-end">
      <input required value={title} onChange={e=>setTitle(e.target.value)} className="border p-2 flex-1" placeholder="New task title" />
      <input type="number" value={estimate} onChange={e=>setEstimate(e.target.value)} className="w-24 border p-2" placeholder="Minutes" />
      <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="border p-2" />
      <select value={priority} onChange={e=>setPriority(Number(e.target.value))} className="border p-2 w-28">
        <option value={1}>High</option>
        <option value={2}>Medium</option>
        <option value={3}>Low</option>
      </select>
      <button className="bg-blue-600 text-white px-3 rounded">Add</button>
    </form>
  )
}

export default function Dashboard(){
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({ completed: '', priority: '', due_today: '' })
  const banner = useBanner()

  async function load(){
    try {
      const params = {}
      if (filters.completed) params.completed = filters.completed
      // Map label to value for backend
      if (filters.priority === 'high') params.priority = 1;
      else if (filters.priority === 'medium') params.priority = 2;
      else if (filters.priority === 'low') params.priority = 3;
      if (filters.due_today) params.due_today = filters.due_today
      const res = await api.get('/tasks', { params })
      setTasks(res.data)
    } catch (e) {
      banner.show(e?.response?.data?.msg || 'Failed to load tasks', 'error')
    }
  }

  useEffect(()=>{ load() }, [filters])

  async function createTask(newTask){ setTasks(prev=>[newTask, ...prev]); banner.show('Task added', 'success') }
  async function deleteTask(id){
    try { await api.delete(`/tasks/${id}`); setTasks(prev=>prev.filter(t=>t.id!==id)); banner.show('Task deleted', 'success') }
    catch (e) { banner.show(e?.response?.data?.msg || 'Delete failed', 'error') }
  }
  async function markComplete(task){
    if (task.completed) return;
    try {
      const res = await api.post(`/tasks/${task.id}/complete`)
      setTasks(tasks.map(t=>t.id===task.id?res.data:t))
      banner.show('Marked complete', 'success')
    } catch (e) {
      banner.show(e?.response?.data?.msg || 'Failed to mark complete', 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Banner msg={banner.msg} type={banner.type} />
      <div className="mt-4"><TaskForm onCreate={createTask} /></div>
      <div className="mt-6 flex gap-4 flex-wrap items-center">
        <label className="flex items-center gap-1 text-sm">Completed:
          <select value={filters.completed} onChange={e=>setFilters(f=>({...f, completed: e.target.value}))} className="border p-1">
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-sm">Priority:
          <select value={filters.priority} onChange={e=>setFilters(f=>({...f, priority: e.target.value}))} className="border p-1">
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-sm">Due Today:
          <select value={filters.due_today} onChange={e=>setFilters(f=>({...f, due_today: e.target.value}))} className="border p-1">
            <option value="">All</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <button onClick={load} className="ml-auto bg-gray-200 px-3 py-1 rounded text-sm">Refresh</button>
      </div>
      {/* Drag-and-drop and inline editing task list */}
      <TaskListDnd
        tasks={tasks}
        onEdit={async (id, vals) => {
          try {
            const res = await api.put(`/tasks/${id}`, vals);
            setTasks(prev => prev.map(t => t.id === id ? res.data : t));
            banner.show('Task updated', 'success');
          } catch (e) {
            banner.show(e?.response?.data?.msg || 'Update failed', 'error');
          }
        }}
        onDelete={deleteTask}
        onMarkComplete={markComplete}
        onReorder={async (fromIdx, toIdx) => {
          // Reorder in UI
          const updated = Array.from(tasks);
          const [moved] = updated.splice(fromIdx, 1);
          updated.splice(toIdx, 0, moved);
          setTasks(updated);
          // Optionally: persist order to backend if supported
        }}
      />
    </div>
  )
}
