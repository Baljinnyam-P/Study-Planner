// Modal for viewing and editing plan details
// Why: This component allows users to view and edit details of a study plan, including tasks, description, and due date.
// Why this design?
//Provides an intuitive interface for managing plan details.
// Supports inline editing of tasks and plan metadata.
//Enables collaboration by displaying participants.
import React from "react";
import {
  getGroupPlanTasks,
  createGroupPlanTask,
  updateGroupPlanTask,
  deleteGroupPlanTask,
} from "../api/axios";

export default function PlanDetailModal({
  plan,
  onClose,
  onSaveTitle,
  onSaveContent,
  onDelete,
}) {
  if (!plan) return null;

  // ------------------------------
  // STATES
  // ------------------------------
  const [editTasks, setEditTasks] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [newTask, setNewTask] = React.useState("");
  const [newDuration, setNewDuration] = React.useState(30);
  const [newDue, setNewDue] = React.useState("");
  const [newPriority, setNewPriority] = React.useState(3);
  const [desc, setDesc] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // ------------------------------
  // INIT TASKS & PLAN INFO
  // ------------------------------
  React.useEffect(() => {
    const parseDate = (raw) => {
      if (!raw) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      const d = new Date(raw);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    };

    const init = Array.isArray(plan.tasks)
      ? plan.tasks.map((t) => ({
          id: t.id,
          task: t.task || t.text || "",
          duration: parseInt(t.duration || t.time || 30, 10),
          notes: t.notes || "",
          due: parseDate(t.due),
          priority: typeof t.priority === "number" ? t.priority : 3,
        }))
      : [];

    setEditTasks(init);
    setDesc(plan.description || "");
    setDueDate(parseDate(plan.due));
  }, [plan]);

  // ------------------------------
  // FETCH BACKEND TASKS
  // ------------------------------
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!plan?.id) return;
      try {
        const res = await getGroupPlanTasks(plan.id);
        if (mounted) setTasks(res.data || []);
      } catch {
        if (mounted) setTasks([]);
      }
    }
    load();
    return () => (mounted = false);
  }, [plan]);

  // ------------------------------
  // EDIT HELPERS
  // ------------------------------
  const updateTask = (i, field, value) => {
    setEditTasks((items) =>
      items.map((t, idx) =>
        idx === i
          ? { ...t, [field]: field === "duration" ? parseInt(value || 0, 10) : value }
          : t
      )
    );
  };

  const removeTask = (i) => {
    setEditTasks((items) => items.filter((_, idx) => idx !== i));
  };

  const addNew = () => {
    if (!newTask.trim()) return;
    setEditTasks((prev) => [
      ...prev,
      {
        task: newTask.trim(),
        duration: parseInt(newDuration || 30, 10),
        due: newDue || "",
        notes: "",
        priority: newPriority,
      },
    ]);
    setNewTask("");
    setNewDuration(30);
    setNewDue("");
    setNewPriority(3);
  };

  // ------------------------------
  // SAVE
  // ------------------------------
  const saveContent = async () => {
    if (!plan?.id) return setError("Missing plan ID");
    setSaving(true);

    try {
      const original = tasks || [];
      const originalById = Object.fromEntries(original.map((t) => [t.id, t]));
      const editedById = Object.fromEntries(editTasks.filter((t) => t.id).map((t) => [t.id, t]));

      // Create new
      for (const t of editTasks) {
        if (!t.id && t.task) await createGroupPlanTask(plan.id, t);
      }

      // Update existing
      for (const t of editTasks) {
        if (t.id) {
          const o = originalById[t.id];
          if (
            !o ||
            o.task !== t.task ||
            o.duration !== t.duration ||
            o.notes !== t.notes ||
            String(o.due || "") !== String(t.due || "") ||
            o.priority !== t.priority
          ) {
            await updateGroupPlanTask(plan.id, t.id, t);
          }
        }
      }

      // Delete removed
      for (const o of original) {
        if (o.id && !editedById[o.id]) await deleteGroupPlanTask(plan.id, o.id);
      }

      // Save plan
      await onSaveContent(plan.id, {
        description: desc,
        due: dueDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <input
            className="text-xl font-semibold w-full border-b border-transparent focus:border-blue-400 focus:outline-none mr-4"
            defaultValue={plan.title}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val.length < 3) return setError("Title must be at least 3 characters");
              if (val !== plan.title) onSaveTitle(plan.id, val);
            }}
          />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          {/* DESCRIPTION */}
          <label className="block text-sm text-gray-600">Description</label>
          <textarea
            className="w-full border rounded px-2 py-1 text-sm mt-1"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />

          {/* DUE DATE */}
          <div className="mt-4">
            <label className="block text-sm text-gray-600">Due Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 mt-1"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* TASK LIST */}
          <h3 className="text-lg font-semibold mt-6 mb-3">Study Tasks</h3>

          {editTasks.map((t, i) => (
            <div key={i} className="border rounded-lg p-3 bg-gray-50 mb-3">
              <div className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                <input
                  className="col-span-4 border rounded px-2 py-1 text-sm min-w-0"
                  value={t.task}
                  placeholder="Task"
                  onChange={(e) => updateTask(i, "task", e.target.value)}
                />
                <input
                  type="date"
                  className="col-span-2 border rounded px-2 py-1 text-xs min-w-0"
                  value={t.due}
                  onChange={(e) => updateTask(i, "due", e.target.value)}
                />
                <input
                  type="number"
                  className="col-span-2 border rounded px-2 py-1 text-xs min-w-0"
                  value={t.duration}
                  min={1}
                  placeholder="Duration"
                  onChange={(e) => updateTask(i, "duration", e.target.value)}
                />
                <select
                  className="col-span-2 border rounded px-2 py-1 text-xs min-w-0 bg-white"
                  value={t.priority}
                  onChange={(e) => updateTask(i, "priority", parseInt(e.target.value))}
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
                <button
                  className="col-span-2 text-red-600 text-xs px-2 py-1 hover:underline min-w-0"
                  onClick={() => removeTask(i)}
                >
                  Remove
                </button>
              </div>
              <input
                className="w-full mt-2 border rounded px-2 py-1 text-xs"
                placeholder="Notes (optional)"
                value={t.notes}
                onChange={(e) => updateTask(i, "notes", e.target.value)}
              />
            </div>
          ))}

          {/* ADD TASK */}
          <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 mt-4 rounded-lg">
            <input
              className="col-span-4 border rounded px-2 py-1 text-sm min-w-0"
              placeholder="New task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <input
              type="date"
              className="col-span-2 border rounded px-2 py-1 min-w-0"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
            />
            <input
              type="number"
              className="col-span-2 border rounded px-2 py-1 min-w-0"
              value={newDuration}
              min={1}
              placeholder="Duration"
              onChange={(e) => setNewDuration(e.target.value)}
            />
            <select
              className="col-span-2 border rounded px-2 py-1 min-w-0 bg-white"
              value={newPriority}
              onChange={(e) => setNewPriority(parseInt(e.target.value))}
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
            <button
              onClick={addNew}
              className="col-span-2 bg-blue-600 text-white rounded px-3 py-1 min-w-0"
            >
              Add
            </button>
          </div>

          {/* PARTICIPANTS */}
          {Array.isArray(plan.participants) && plan.participants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Participants</h3>
              <div className="flex gap-2 flex-wrap">
                {plan.participants.map((p) => (
                  <span key={p.id} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {p.fullname || `User #${p.user_id}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          {onDelete && (
            <button
              onClick={() => onDelete(plan.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={saveContent}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}