// app/admin/page.js
import { AdminOnly } from '../components/ProtectedRoute'

export default function AdminPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 mb-6">
              This page is only accessible to administrators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">User Management</h3>
                <p className="text-blue-600 text-sm">Manage all system users</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">System Settings</h3>
                <p className="text-green-600 text-sm">Configure system parameters</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Reports</h3>
                <p className="text-purple-600 text-sm">Generate system reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}

