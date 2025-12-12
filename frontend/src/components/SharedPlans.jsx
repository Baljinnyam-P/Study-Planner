// -------------------------------------------------------------
// SharedPlans Component to display and manage shared study plans
// Why: This component lists shared study plans within a group, allowing users to search, filter, join, view, or delete plans.
//Provides an organized view of shared plans for easy access.
//Enables searching and filtering to quickly find relevant plans.
import React from "react";

const SharedPlans = ({ plans, onJoin, onDelete, onView }) => {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');
  // Format date human-friendly, handle missing/invalid
  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "No date";
    const today = new Date();
    const diff = date - today;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7 && days > 1) return `In ${days} days`;
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const filtered = (plans || [])
    .filter(p => (category === 'all' ? true : p.category === category))
    .filter(p => !query || (p.title || '').toLowerCase().includes(query.toLowerCase()));

  if (!filtered || filtered.length === 0) {
    return (
      <div className="mt-6 p-6 text-center rounded-xl border border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700">
          No shared plans yet
        </h3>
        <p className="text-gray-500 mt-1">
          Create a plan and share it with your group!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Shared Study Plans</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search plans..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          >
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Category dot */}
              <div
                className={`w-3 h-3 rounded-full 
                ${plan.category === "math" ? "bg-blue-500" : ""}
                ${plan.category === "science" ? "bg-green-500" : ""}
                ${plan.category === "history" ? "bg-yellow-500" : ""}
                ${plan.category === "other" ? "bg-purple-500" : ""}
              `}
              ></div>

              {/* Title + Date */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {plan.title}
                  {plan.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border
                      ${plan.status === 'upcoming' ? 'border-blue-200 text-blue-600 bg-blue-50' : ''}
                      ${plan.status === 'in-progress' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : ''}
                      ${plan.status === 'done' ? 'border-green-200 text-green-700 bg-green-50' : ''}`}
                    >
                      {plan.status}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {/* Show top-level due date for group plans, fallback to plan.date if not present */}
                  {formatDate(plan.due || plan.date)}
                </p>
              </div>
            </div>

            {/* Member avatars */}
            <div className="flex gap-2">
              {plan.members?.map((m, index) => (
                <div
                  key={index}
                  className="w-9 h-9 bg-gray-200 text-gray-700 flex items-center justify-center rounded-full font-semibold"
                >
                  {m?.[0]?.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                  onClick={() => plan && plan.id ? onView(plan) : alert('Invalid plan: missing ID')}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition"
                >
                  View
                </button>

                <button
                  onClick={() => plan && plan.id ? onJoin(plan) : alert('Invalid plan: missing ID')}
                  className="px-3 py-1.5 rounded-lg border border-green-200 text-green-600 font-medium hover:bg-green-50 transition"
                >
                  Join
                </button>

                <button
                  onClick={() => plan && plan.id ? onDelete(plan) : alert('Invalid plan: missing ID')}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition"
                >
                  Delete
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedPlans;
