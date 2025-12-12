// -------------------------------------------------------------
// TaskListDnd Component for drag-and-drop task management
// Why: This component provides a drag-and-drop interface for managing a list of tasks, including inline editing, marking complete, and deletion.
// Why this design?
//Enhances user experience with intuitive drag-and-drop functionality.
//Supports inline editing for quick task updates.
//Centralizes task management logic for maintainability.
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function TaskListDnd({ tasks, onEdit, onDelete, onMarkComplete, onReorder }) {
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  function handleEditClick(task) {
    setEditId(task.id);
    setEditVals({
      title: task.title,
      estimate_minutes: task.estimate_minutes,
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      priority: task.priority || 3,
    });
  }

  function handleEditChange(e) {
    setEditVals({ ...editVals, [e.target.name]: e.target.value });
  }

  function handleEditSave(id) {
    onEdit(id, {
      ...editVals,
      estimate_minutes: Number(editVals.estimate_minutes),
      priority: Number(editVals.priority),
    });
    setEditId(null);
  }

  function handleDragEnd(result) {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    onReorder(result.source.index, result.destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasklist">
        {(provided) => (
          <ul className="mt-6 space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
            {tasks.map((t, idx) => (
              <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                {(prov, snapshot) => (
                  <li
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className={`p-3 bg-white rounded shadow flex justify-between items-center ${snapshot.isDragging ? "ring-2 ring-blue-400" : ""}`}
                  >
                    {editId === t.id ? (
                      <div className="flex flex-col gap-1 flex-1">
                        <input name="title" value={editVals.title} onChange={handleEditChange} className="border p-1 mb-1" />
                        <div className="flex gap-2">
                          <input name="estimate_minutes" type="number" value={editVals.estimate_minutes} onChange={handleEditChange} className="border p-1 w-20" />
                          <input name="due_date" type="date" value={editVals.due_date} onChange={handleEditChange} className="border p-1" />
                          <select name="priority" value={editVals.priority} onChange={handleEditChange} className="border p-1 w-24">
                            <option value={1}>High</option>
                            <option value={2}>Medium</option>
                            <option value={3}>Low</option>
                          </select>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleEditSave(t.id)} className="bg-green-600 text-white px-2 rounded text-xs">Save</button>
                          <button onClick={() => setEditId(null)} className="bg-gray-300 px-2 rounded text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-sm text-gray-500">
                          {t.estimate_minutes} mins
                          {t.due_date && ` | Due: ${t.due_date.slice(0,10)}`}
                          {typeof t.priority === 'number' && (
                            <>
                              {` | Priority: `}
                              <span className={
                                t.priority === 1 ? 'text-red-600 font-bold' :
                                t.priority === 2 ? 'text-yellow-600 font-semibold' :
                                'text-green-700'
                              }>
                                {t.priority === 1 ? 'High' : t.priority === 2 ? 'Medium' : 'Low'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      {editId !== t.id && (
                        <>
                          <button onClick={() => handleEditClick(t)} className="text-blue-600 text-xs">Edit</button>
                          <button onClick={()=>onMarkComplete(t)} disabled={t.completed} className={`text-sm ${t.completed ? 'text-green-600' : 'text-gray-700'}`}>{t.completed ? "Completed" : "Mark Complete"}</button>
                          <button onClick={()=>onDelete(t.id)} className="text-sm text-red-600">Delete</button>
                        </>
                      )}
                    </div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
