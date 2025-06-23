// components/UserManagement.js
'use client'
import { useState, useEffect } from 'react'
import { createUser, getAllUsers, USER_ROLES } from '../lib/db'
import { useAuth } from '../contexts/AuthContext'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: USER_ROLES.STUDENT,
    classLevel: '',
    teacherPassCode: ''
  })
  const [message, setMessage] = useState('')
  const { hasRole } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const allUsers = await getAllUsers()
    setUsers(allUsers)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const userData = { ...newUser }
      
      // Only include classLevel and teacherPassCode for teachers
      if (newUser.role !== USER_ROLES.TEACHER) {
        delete userData.classLevel
        delete userData.teacherPassCode
      }

      const result = await createUser(userData)
      
      if (result.success) {
        setMessage('User created successfully!')
        setNewUser({
          email: '',
          password: '',
          fullName: '',
          role: USER_ROLES.STUDENT,
          classLevel: '',
          teacherPassCode: ''
        })
        setShowCreateForm(false)
        loadUsers()
      } else {
        setMessage(result.message || 'Failed to create user')
      }
    } catch (error) {
      setMessage('An error occurred while creating the user')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800'
      case USER_ROLES.TEACHER:
        return 'bg-blue-100 text-blue-800'
      case USER_ROLES.STUDENT:
        return 'bg-green-100 text-green-800'
      case USER_ROLES.PARENT:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Only admins can access user management
  if (!hasRole(USER_ROLES.ADMIN)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {showCreateForm ? 'Cancel' : 'Add New User'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`px-6 py-3 ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {showCreateForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={USER_ROLES.STUDENT}>Student</option>
                    <option value={USER_ROLES.PARENT}>Parent</option>
                    <option value={USER_ROLES.TEACHER}>Teacher</option>
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                  </select>
                </div>

                {newUser.role === USER_ROLES.TEACHER && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Level
                      </label>
                      <input
                        type="text"
                        required={newUser.role === USER_ROLES.TEACHER}
                        value={newUser.classLevel}
                        onChange={(e) => setNewUser({ ...newUser, classLevel: e.target.value })}
                        placeholder="e.g., Grade 5, Form 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher Pass Code
                      </label>
                      <input
                        type="text"
                        required={newUser.role === USER_ROLES.TEACHER}
                        value={newUser.teacherPassCode}
                        onChange={(e) => setNewUser({ ...newUser, teacherPassCode: e.target.value })}
                        placeholder="e.g., T5001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === USER_ROLES.TEACHER && (
                        <div>
                          <div>Class: {user.classLevel}</div>
                          <div>Code: {user.teacherPassCode}</div>
                        </div>
                      )}
                      {user.role !== USER_ROLES.TEACHER && '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement