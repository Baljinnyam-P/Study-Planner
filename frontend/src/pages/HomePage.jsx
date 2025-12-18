import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-none">
      <div className="glass-card max-w-2xl w-full p-10 flex flex-col items-center text-center animate-fadeIn">
        <div className="mb-6 animate-float">
          <svg width="72" height="72" viewBox="0 0 48 48" fill="none" className="mx-auto" style={{ color: 'var(--accent-color)' }}>
            <rect x="4" y="10" width="40" height="28" rx="8" fill="currentColor" opacity=".10"/>
            <rect x="12" y="18" width="24" height="12" rx="4" fill="currentColor"/>
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity=".12"/>
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg" style={{ color: 'var(--accent-color)' }}>StudyPlanner</h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-6">
          The modern, collaborative way to plan, track, and achieve your study goals. Effortlessly organize tasks, generate smart study plans, and collaborate with peers—all in a beautiful, intuitive interface.
        </p>
        <ul className="text-left text-gray-600 dark:text-gray-300 mb-8 space-y-2">
          <li><span className="font-semibold" style={{ color: 'var(--accent-color)' }}>• Round-robin</span> plan generation</li>
          <li><span className="font-semibold" style={{ color: 'var(--accent-color)' }}>• Drag-and-drop</span> task scheduling</li>
          <li><span className="font-semibold" style={{ color: 'var(--accent-color)' }}>• Group collaboration</span> and invites</li>
          <li><span className="font-semibold" style={{ color: 'var(--accent-color)' }}>• Color-coded, responsive UI</span></li>
          <li><span className="font-semibold" style={{ color: 'var(--accent-color)' }}>• Secure authentication</span> and privacy</li>
        </ul>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <Link to="/register" className="bg-[var(--accent-color)] hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg shadow transition text-lg">Get Started</Link>
          <Link to="/login" className="bg-white dark:bg-gray-900 border border-[var(--accent-color)] text-[var(--accent-color)] font-bold py-3 px-8 rounded-lg shadow hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg">Login</Link>
        </div>
      </div>
      <footer className="mt-10 text-gray-400 dark:text-gray-500 text-xs">&copy; {new Date().getFullYear()} StudyPlanner &mdash; Built for productivity and collaboration</footer>
    </div>
  );
}
