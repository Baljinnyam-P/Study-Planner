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

export default function Navbar(){
  const { user, logout } = useAuth()
  const { dark, setDark, accent, setAccent } = useTheme()
  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="font-bold">StudyPlanner</Link>
          {user && <>
            <Link to="/planner" className="text-sm">Planner</Link>
            <Link to="/plans" className="text-sm">Plans</Link>
            <Link to="/calendar" className="text-sm">Calendar</Link>
            <Link to="/analytics" className="text-sm">Analytics</Link>
            <Link to="/groups" className="text-sm">Groups</Link>
          </>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <button onClick={()=>setDark(!dark)} className="px-2 py-1 border rounded">
              {dark ? 'Light' : 'Dark'}
            </button>
            <select value={accent} onChange={e=>setAccent(e.target.value)} className="border rounded px-2 py-1">
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="emerald">Emerald</option>
              <option value="rose">Rose</option>
            </select>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="text-sm">Hi, {user.fullname.split(' ')[0]}</span>
              <button onClick={logout} className="text-sm text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
