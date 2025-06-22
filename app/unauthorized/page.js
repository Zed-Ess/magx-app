

'use client'


// app/unauthorized/page.js
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page. Please contact your administrator if you believe this is an error.
          </p>
          <a href="/" className="text-indigo-600 hover:text-indigo-800">
            Go back to home
          </a>
        </div>
      </div>
    </div>
  )
}