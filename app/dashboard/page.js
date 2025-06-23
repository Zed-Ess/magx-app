// app/dashboard/page.js
import Dashboard from '../components/Dashboard'
import { AuthenticatedOnly } from '../components/ProtectedRoute'

export default function DashboardPage() {
  return (
    <AuthenticatedOnly>
      <Dashboard />
    </AuthenticatedOnly>
  )
}
