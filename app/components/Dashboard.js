// components/Dashboard.js
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { USER_ROLES } from '@/lib/db'

const Dashboard = () => {
  const { user, logout, hasRole, hasAnyRole } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Admin Dashboard</h3>
              <p className="text-red-600 mb-4">Full system access and management capabilities</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Manage Users
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  System Settings
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Reports
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  School Management
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.TEACHER:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Teacher Dashboard</h3>
              <p className="text-blue-600 mb-2">Class: {user.classLevel}</p>
              <p className="text-blue-600 mb-4">Teacher Code: {user.teacherPassCode}</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  My Classes
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Gradebook
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Attendance
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Assignments
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.STUDENT:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Student Dashboard</h3>
              <p className="text-green-600 mb-4">Access your courses and assignments</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  My Courses
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Assignments
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Grades
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.PARENT:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Parent Dashboard</h3>
              <p className="text-purple-600 mb-4">Monitor your child's progress</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Child's Grades
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Attendance
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Messages
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Events
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                School Management System
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.fullName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {getRoleBasedContent()}

          {/* Conditional sections based on roles */}
          {hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]) && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Staff Section
              </h3>
              <p className="text-yellow-600">
                This section is visible to administrators and teachers only.
              </p>
            </div>
          )}

          {hasRole(USER_ROLES.ADMIN) && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Admin Only Section
              </h3>
              <p className="text-red-600">
                This section is visible to administrators only.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard