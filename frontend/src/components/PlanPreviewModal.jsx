// -------------------------------------------------------------
// Why: This component displays a modal for previewing a generated or existing plan.
//
// Why this design?
//   - Allows users to review and edit plans before saving or committing changes.
//   - Supports inline editing and drag-and-drop for a modern, interactive UX.
//   - Keeps preview logic separate from main planner for maintainability.
// -------------------------------------------------------------
import React, { useState } from "react";
import PlanPreviewEditor from "./PlanPreviewEditor";

export default function PlanPreviewModal({ plan, open, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(plan);
  React.useEffect(() => { setDraft(plan); }, [plan]);
  if (!open || !plan) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        <h2 className="text-xl font-bold mb-4">Plan {editMode ? 'Editor' : 'Preview'}</h2>
        <div className="overflow-y-auto max-h-96">
          {plan.title && <div className="font-semibold mb-2">{plan.title}</div>}
          {editMode ? (
            <PlanPreviewEditor plan={draft} onChange={setDraft} />
          ) : plan.content ? (
            Object.entries(plan.content).map(([day, items]) => (
              <div key={day} className="mb-4">
                <h3 className="font-medium">{day}</h3>
                <ul className="list-disc ml-6">
                  {items.map((it, idx) => (
                    <li key={idx}>
                      {it.task} — {it.duration} mins
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
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : <div>No plan content.</div>}
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={() => { setEditMode(false); }} className="bg-blue-500 text-white px-4 py-2 rounded">Done Editing</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
          )}
          <button onClick={() => onSave(editMode ? draft : plan)} className="bg-green-600 text-white px-4 py-2 rounded">Save Plan</button>
        </div>
      </div>
    </div>
  );
}
