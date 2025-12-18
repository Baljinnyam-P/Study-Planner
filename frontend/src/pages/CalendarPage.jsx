// -------------------------------------------------------------
// Why: Visual calendar for scheduling and quick overview of plan items per day.
// -------------------------------------------------------------
import React from 'react';
import api from '../api/axios';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  // Pad start
  const padStart = first.getDay();
  for (let i = 0; i < padStart; i++) days.unshift(null);
  // Pad end
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function CalendarPage() {
  const today = new Date();
  const [plans, setPlans] = React.useState([]);
  const [month, setMonth] = React.useState(today.getMonth());
  const [year, setYear] = React.useState(today.getFullYear());
  const [hoveredDay, setHoveredDay] = React.useState(null);
  const days = React.useMemo(() => getMonthDays(year, month), [year, month]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.data);
      } catch {}
    })();
  }, []);

  // Aggregate tasks by date string (YYYY-MM-DD)
  const taskMap = {};
  for (const p of plans) {
    const content = p.content || {};
    Object.entries(content).forEach(([dayLabel, items]) => {
      // Try to parse dayLabel as a date, fallback to sequential mapping
      let date = null;
      if (/\d{4}-\d{2}-\d{2}/.test(dayLabel)) date = dayLabel;
      else {
        // fallback: map Day 1, Day 2, ... to this month
        const idx = parseInt(dayLabel.replace(/\D/g, '')) - 1;
        if (!isNaN(idx) && idx < days.length && days[idx]) {
          date = days[idx].toISOString().slice(0, 10);
        }
      }
      if (date) {
        if (!taskMap[date]) taskMap[date] = [];
        if (Array.isArray(items)) taskMap[date].push(...items);
      }
    });
  }

  function changeMonth(delta) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth); setYear(newYear);
    setHoveredDay(null);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => changeMonth(-1)} className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-lg font-bold">&#8592;</button>
        <div className="font-semibold text-lg" style={{ color: 'var(--accent-color)' }}>{today.toLocaleString(undefined, { month: 'long' })} {year}</div>
        <button onClick={() => changeMonth(1)} className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-lg font-bold">&#8594;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = d.toISOString().slice(0, 10);
          const tasks = taskMap[dateStr] || [];
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div
              key={i}
              className={`glass-card p-2 h-28 flex flex-col justify-between items-start relative group transition border-2 ${isToday ? 'border-[var(--accent-color)]' : 'border-transparent'} ${tasks.length ? 'hover:shadow-lg' : ''}`}
              onMouseEnter={() => setHoveredDay(i)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold mb-1 w-full flex justify-between items-center">
                <span>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                {tasks.length > 0 && (
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent-color)' }}></span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-200">
                {tasks.length === 0 ? <span className="opacity-60">No tasks</span> :
                  <span className="font-semibold">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>}
              </div>
              {/* Popover for tasks */}
              {hoveredDay === i && tasks.length > 0 && (
                <div className="absolute left-0 top-12 z-20 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-3 animate-fadeIn border border-[var(--accent-color)]" style={{ minHeight: 40 }}>
                  <div className="font-bold mb-1 text-[var(--accent-color)]">Tasks</div>
                  <ul className="text-xs max-h-32 overflow-y-auto">
                    {tasks.map((t, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">{t.task}</span>
                        {typeof t.priority === 'number' && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-color)', color: '#fff' }}>
                            {t.priority === 1 ? 'High' : t.priority === 2 ? 'Medium' : 'Low'}
                          </span>
                        )}
                        <span className="ml-2 text-gray-400">{t.duration} min</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
