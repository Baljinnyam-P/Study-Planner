// -------------------------------------------------------------
// This is the main React component that sets up routing and global layout.
//   - Centralizes all page routes for clarity and maintainability.
//   - Provides a single place to manage navigation and shared UI like Navbar.
//   - Enables easy addition of new pages and features as the app grows.
// -------------------------------------------------------------
//Main App Component

import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import PlannerPage from './pages/PlannerPage'
import PlansPage from './pages/PlansPage'
import HomePage from './pages/HomePage'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PublicPlanPage from './pages/PublicPlanPage'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import GroupsPage from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        </Route>
        <Route path="/share/:publicId" element={<PublicPlanPage />} />
        <Route path="*" element={<div className="p-8">404</div>} />
      </Routes>
    </div>
  );
}
