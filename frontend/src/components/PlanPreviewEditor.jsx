// -------------------------------------------------------------
// Why: This component provides an editable interface for plans in the preview modal.
//
// Why this design?
//   - Enables inline editing, drag-and-drop, and task management within the modal.
//   - Keeps editing logic modular and reusable for different plan types.
//   - Supports advanced features (task add/delete, reschedule) for user flexibility.
// -------------------------------------------------------------
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const dayColors = [
  'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-purple-100',
  'bg-orange-100', 'bg-teal-100', 'bg-indigo-100', 'bg-red-100', 'bg-gray-100'
];

export default function PlanPreviewEditor({ plan, onChange }) {
  // plan.content: { day1: [taskObj, ...], day2: [...], ... }
  const [localPlan, setLocalPlan] = React.useState(plan);

  React.useEffect(() => { setLocalPlan(plan); }, [plan]);

  function handleDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const days = Object.keys(localPlan.content);
    const sourceDay = days[source.droppableId];
    const destDay = days[destination.droppableId];
    const updated = { ...localPlan.content };
    const [moved] = updated[sourceDay].splice(source.index, 1);
    updated[destDay].splice(destination.index, 0, moved);
    const newPlan = { ...localPlan, content: updated };
    setLocalPlan(newPlan);
    onChange(newPlan);
  }

  function handleTaskEdit(day, idx, field, value) {
    const updated = { ...localPlan.content };
    updated[day][idx] = { ...updated[day][idx], [field]: value };
    const newPlan = { ...localPlan, content: updated };
    setLocalPlan(newPlan);
    onChange(newPlan);
  }

  function handleTaskDelete(day, idx) {
    const updated = { ...localPlan.content };
    updated[day] = updated[day].filter((_, i) => i !== idx);
    const newPlan = { ...localPlan, content: updated };
    setLocalPlan(newPlan);
    onChange(newPlan);
  }

  // Add new task state
  const [newTask, setNewTask] = React.useState("");
  const [newDuration, setNewDuration] = React.useState(30);
  const [newPriority, setNewPriority] = React.useState(3);
  const [addDay, setAddDay] = React.useState("");

  function handleAddTask(e) {
    e.preventDefault();
    if (!addDay || !newTask.trim()) return;
    const updated = { ...localPlan.content };
    updated[addDay] = [
      ...updated[addDay],
      { task: newTask.trim(), duration: Number(newDuration), priority: Number(newPriority) }
    ];
    const newPlan = { ...localPlan, content: updated };
    setLocalPlan(newPlan);
    onChange(newPlan);
    setNewTask(""); setNewDuration(30); setNewPriority(3);
  }

  // Responsive grid: wrap to 2 rows if >5 days, 3 rows if >10, etc.
  const days = Object.entries(localPlan.content);
  const columns = Math.min(days.length, 5);
  const rows = Math.ceil(days.length / 5);
  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className="gap-6"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(240px, 1fr))`,
            gridAutoRows: '1fr',
            rowGap: '1.5rem',
            columnGap: '1.5rem',
            maxWidth: '100%',
          }}
        >
          {days.map(([day, items], dayIdx) => (
            <Droppable droppableId={String(dayIdx)} key={day}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded p-3 min-w-[220px] ${dayColors[dayIdx % dayColors.length]}`}
                >
                  <div className="font-bold mb-2">{day}</div>
                  {items.map((it, idx) => (
                    <Draggable draggableId={day + '-' + idx} index={idx} key={day + '-' + idx}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`bg-white rounded shadow p-2 mb-2 flex flex-col gap-1 relative ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                        >
                          <button onClick={() => handleTaskDelete(day, idx)} className="absolute top-1 right-1 text-xs text-red-500">&times;</button>
                          <input
                            className="font-semibold w-full border-b mb-1"
                            value={it.task}
                            onChange={e => handleTaskEdit(day, idx, 'task', e.target.value)}
                          />
                          <div className="flex gap-2 text-xs items-center">
                            <input
                              type="number"
                              className="border p-1 w-16"
                              value={it.duration}
                              onChange={e => handleTaskEdit(day, idx, 'duration', e.target.value)}
                            />
                            <select
                              className="border p-1"
                              value={it.priority}
                              onChange={e => handleTaskEdit(day, idx, 'priority', Number(e.target.value))}
                            >
                              <option value={1}>High</option>
                              <option value={2}>Medium</option>
                              <option value={3}>Low</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {/* Add new task form for this day */}
                  <form className="mt-2 flex flex-col gap-1" onSubmit={handleAddTask}>
                    <input type="hidden" value={day} />
                    <input
                      className="border p-1 text-xs"
                      placeholder="New task title"
                      value={addDay === day ? newTask : ""}
                      onFocus={() => setAddDay(day)}
                      onChange={e => { setAddDay(day); setNewTask(e.target.value); }}
                    />
                    {addDay === day && (
                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          className="border p-1 w-14 text-xs"
                          placeholder="Mins"
                          value={newDuration}
                          onChange={e => setNewDuration(e.target.value)}
                        />
                        <select
                          className="border p-1 text-xs"
                          value={newPriority}
                          onChange={e => setNewPriority(e.target.value)}
                        >
                          <option value={1}>High</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Low</option>
                        </select>
                        <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded text-xs">Add</button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
