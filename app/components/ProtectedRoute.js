// components/ProtectedRoute.js
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user, hasRole, hasAnyRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      // Check role-based access
      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/unauthorized')
        return
      }

      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requiredRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null
  }

  return children
}

// Higher-order component for role-based protection
export const withRoleProtection = (WrappedComponent, requiredRole = null, requiredRoles = []) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }
}

// Admin-only component wrapper
export const AdminOnly = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
)

// Teacher and Admin component wrapper
export const TeacherAndAdmin = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'teacher']}>
    {children}
  </ProtectedRoute>
)

// All authenticated users
export const AuthenticatedOnly = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute