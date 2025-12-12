// -------------------------------------------------------------
// Why: This component restricts access to certain routes based on authentication.
//
// Why this design?
//   - Ensures only logged-in users can access protected pages.
//   - Centralizes route protection logic for maintainability.
//   - Makes it easy to update or extend access control in the future.
//   - Follows React best practices for route guarding in SPAs.
// -------------------------------------------------------------
import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute(){
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8">Loading...</div>
  return user ? <Outlet /> : <Navigate to="/login" />
}
