// -------------------------------------------------------------
// Why: This component renders the navigation bar for the app.
//Provides consistent navigation across all pages.
//Adapts to user authentication state (shows/hides links).
//Centralizes navigation logic for maintainability and UI consistency.
//Navbar Component to be used throughout the app

import React from 'react'
import NotificationBell from './NotificationBell'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, setDark, accent, setAccent } = useTheme();
  return (
    <nav className="navbar-glass sticky top-0 z-30 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-xl tracking-tight" style={{ color: 'var(--accent-color)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="inline-block" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" opacity=".12"/>
              <rect x="6" y="9" width="12" height="6" rx="2" fill="currentColor"/>
            </svg>
            StudyPlanner
          </Link>
          {user && <>
            <Link to="/planner" className="hover:text-accent font-medium transition">Planner</Link>
            <Link to="/plans" className="hover:text-accent font-medium transition">Plans</Link>
            <Link to="/calendar" className="hover:text-accent font-medium transition">Calendar</Link>
            <Link to="/analytics" className="hover:text-accent font-medium transition">Analytics</Link>
            <Link to="/groups" className="hover:text-accent font-medium transition">Groups</Link>
          </>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {/* Modern toggle switch for dark mode */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={dark} onChange={()=>setDark(!dark)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 transition-all peer-checked:bg-accent" />
              <span className="ml-2 text-xs select-none" style={{ color: 'var(--accent-color)' }}>{dark ? 'Dark' : 'Light'}</span>
            </label>
            <select value={accent} onChange={e=>setAccent(e.target.value)} className="border rounded px-2 py-1 focus:ring-2 focus:ring-accent focus:border-accent transition">
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="emerald">Emerald</option>
              <option value="rose">Rose</option>
            </select>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="text-sm font-semibold">Hi, {user.fullname.split(' ')[0]}</span>
              <button onClick={logout} className="text-sm font-semibold text-red-500 hover:underline">Logout</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-sm font-semibold hover:text-accent transition">Login</Link>
              <Link to="/register" className="text-sm font-semibold hover:text-accent transition">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
