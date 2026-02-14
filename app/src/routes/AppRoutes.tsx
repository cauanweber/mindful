import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const NotFound = lazy(() => import('../pages/NotFound'))
const DebugDiary = lazy(() =>
  import('../pages/Debug').then((module) => ({ default: module.DebugDiary })),
)
const DebugNotes = lazy(() =>
  import('../pages/Debug').then((module) => ({ default: module.DebugNotes })),
)
const DebugTasks = lazy(() =>
  import('../pages/Debug').then((module) => ({ default: module.DebugTasks })),
)
const DebugWeeklyGoals = lazy(() =>
  import('../pages/Debug').then((module) => ({
    default: module.DebugWeeklyGoals,
  })),
)

function RouteFallback() {
  return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  )
}
