// -------------------------------------------------------------
// Why: This page provides the login form and handles user authentication.
// Why this design?
//Centralizes login logic and error handling for clarity.
//Makes it easy to update or extend authentication UI.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()
  const [err, setErr] = useState(null)

  async function onSubmit(e){
    e.preventDefault()
    try {
      await login(email, password)
      nav('/dashboard')
    } catch (e){
      setErr(e.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full p-2 border" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 border" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full p-2 bg-blue-600 text-white rounded">Login</button>
        {err && <div className="text-red-600">{err}</div>}
      </form>
    </div>
  )
}
