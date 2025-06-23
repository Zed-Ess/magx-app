// components/Dashboard.js
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { USER_ROLES } from '@/lib/db'
import Link from 'next/link'

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
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Admin Dashboard</h3>
              <p className="text-indigo-600 mb-4">Full system access and management capabilities</p>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/admin/users" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-center"
                >
                  Manage Users
                </Link>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  System Settings
                </button>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  Reports
                </button>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  School Management
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.TEACHER:
        return (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-teal-800 mb-2">Teacher Dashboard</h3>
              <p className="text-teal-600 mb-2">Class: {user.classLevel}</p>
              <p className="text-teal-600 mb-4">Teacher Code: {user.teacherPassCode}</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors">
                  My Classes
                </button>
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors">
                  Gradebook
                </button>
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors">
                  Attendance
                </button>
                <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors">
                  Assignments
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.STUDENT:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Student Dashboard</h3>
              <p className="text-emerald-600 mb-4">Access your courses and assignments</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                  My Courses
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                  Assignments
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                  Grades
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )

      case USER_ROLES.PARENT:
        return (
          <div className="space-y-6">
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-violet-800 mb-2">Parent Dashboard</h3>
              <p className="text-violet-600 mb-4">Monitor your child's progress</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
                  Child's Grades
                </button>
                <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
                  Attendance
                </button>
                <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
                  Messages
                </button>
                <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors">
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
      <header className="bg-white shadow-sm">
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
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
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
            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Staff Section
              </h3>
              <p className="text-amber-600">
                This section is visible to administrators and teachers only.
              </p>
            </div>
          )}

          {hasRole(USER_ROLES.ADMIN) && (
            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                Admin Only Section
              </h3>
              <p className="text-indigo-600">
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