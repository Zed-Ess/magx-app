
// app/teachers/page.js
import { TeacherAndAdmin } from '@/components/ProtectedRoute'

export default function TeachersPage() {
  return (
    <TeacherAndAdmin>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Teachers Area
            </h1>
            <p className="text-gray-600 mb-6">
              This page is accessible to teachers and administrators.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Class Management</h3>
                <p className="text-blue-600 text-sm">Manage your classes</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Gradebook</h3>
                <p className="text-blue-600 text-sm">Record and manage grades</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherAndAdmin>
  )
}
