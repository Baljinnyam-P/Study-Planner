// -------------------------------------------------------------
// Why: This file provides a React context for authentication state and logic.
//
// Why this design?
//   - Centralizes auth logic (login, logout, user info) for the whole app.
//   - Enables protected routes and user-specific UI.
//   - Makes it easy to update or extend authentication features.
import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)
export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadUser(){
    const token = localStorage.getItem('access_token')
    if (!token){ setLoading(false); return; }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ loadUser() }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    await loadUser()
    return res
  }

  const register = async (fullname, email, password) => {
    const res = await api.post('/auth/register', { fullname, email, password })
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    await loadUser()
    return res
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
