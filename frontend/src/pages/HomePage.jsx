import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">StudyPlanner</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          The modern, collaborative way to plan, track, and achieve your study goals. Effortlessly organize tasks, generate smart study plans, and collaborate with peers—all in a beautiful, intuitive interface.
        </p>
        <ul className="text-left text-gray-600 mb-8 space-y-2">
          <li><span className="font-semibold text-blue-600">• AI-powered</span> plan generation</li>
          <li><span className="font-semibold text-blue-600">• Drag-and-drop</span> task scheduling</li>
          <li><span className="font-semibold text-blue-600">• Group collaboration</span> and invites</li>
          <li><span className="font-semibold text-blue-600">• Color-coded, responsive UI</span></li>
          <li><span className="font-semibold text-blue-600">• Secure authentication</span> and privacy</li>
        </ul>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition">Get Started</Link>
          <Link to="/login" className="bg-white border border-blue-600 text-blue-700 font-bold py-3 px-8 rounded-lg shadow hover:bg-blue-50 transition">Login</Link>
        </div>
      </div>
      <footer className="mt-10 text-gray-400 text-xs">&copy; {new Date().getFullYear()} StudyPlanner &mdash; Built for productivity and collaboration</footer>
    </div>
  )
}
