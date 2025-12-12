// -------------------------------------------------------------
// Why: This page provides the main study plan editor, including drag-and-drop,
// plan preview, and editing features.
//Centralizes all plan editing and generation logic for user workflows.
//Supports advanced features (drag-and-drop, inline editing, preview modal).
//Makes it easy to extend with new editor tools or collaboration features.
import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import PlanPreviewModal from '../components/PlanPreviewModal'

export default function PlannerPage(){
  const [tasks, setTasks] = useState([])
  const [days, setDays] = useState(3)
  const [plan, setPlan] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ (async ()=>{ const res = await api.get('/tasks'); setTasks(res.data) })() }, [])

  async function generatePlan(){
    setLoading(true)
    try{
      const payload = { task_ids: tasks.map(t=>t.id), days, save: false }
      const res = await api.post('/plans/generate', payload)
      setPlan(res.data)
      setShowPreview(true)
    } catch(e){
      alert('Generate failed: ' + (e.response?.data?.msg || e.message))
    } finally { setLoading(false) }
  }

  async function savePlan(editedPlan){
    const planToSave = editedPlan || plan;
    if (!planToSave) return;
    setLoading(true)
    try {
      // If plan has an id, update it; otherwise, create new
      if (planToSave.id) {
        await api.put(`/plans/${planToSave.id}`, {
          title: planToSave.title || 'Saved Plan',
          content: planToSave.content
        });
      } else {
        await api.post('/plans', {
          title: planToSave.title || 'Saved Plan',
          content: planToSave.content
        });
      }
      setShowPreview(false);
      alert('Plan saved!');
    } catch(e){
      alert('Save failed: ' + (e.response?.data?.msg || e.message))
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Study Planner</h1>
      <div className="mt-4 flex items-center gap-3">
        <label>Days</label>
        <input type="number" value={days} onChange={e=>setDays(e.target.value)} className="w-24 p-2 border" />
        <button disabled={loading} onClick={generatePlan} className="px-4 py-2 bg-green-600 text-white rounded">Generate</button>
      </div>
      <PlanPreviewModal
        plan={plan}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onSave={savePlan}
      />
      <div className="mt-6">
        {!plan && <div className="text-sm text-gray-500">No plan yet — generate one from your tasks.</div>}
      </div>
    </div>
  )
}
