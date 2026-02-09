import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import {
  DebugDiary,
  DebugNotes,
  DebugTasks,
  DebugWeeklyGoals,
} from '../pages/Debug'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="/debug" element={<AppLayout />}>
        <Route path="diary" element={<DebugDiary />} />
        <Route path="notes" element={<DebugNotes />} />
        <Route path="tasks" element={<DebugTasks />} />
        <Route path="weekly-goals" element={<DebugWeeklyGoals />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
