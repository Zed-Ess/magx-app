// components/LoginForm.js
'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('Form submitted with:', { email, password })
      const result = await login(email, password)
      console.log('Login result:', result)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick fill function for testing
  const fillTestCredentials = (type) => {
    switch(type) {
      case 'admin':
        setEmail('headmaster@magmax.com')
        setPassword('headmaster123')
        break
      case 'teacher':
        setEmail('james_owoo@magmax.com')
        setPassword('teacher_james_007')
        break
      case 'admin2':
        setEmail('esther@magmax.com')
        setPassword('esther_admin_123')
        break
    }
  }

  return (
    <div className="min-h-screen mx-4 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MagMax School Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6 px-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Test Accounts (Click to fill):</h3>
          <div className="text-xs text-blue-600 space-y-2">
            <div className="cursor-pointer hover:bg-blue-100 p-1 rounded" onClick={() => fillTestCredentials('admin')}>
              <strong>Admin:</strong> headmaster@magmax.com / headmaster123
            </div>
            <div className="cursor-pointer hover:bg-blue-100 p-1 rounded" onClick={() => fillTestCredentials('teacher')}>
              <strong>Teacher:</strong> james_owoo@magmax.com / teacher_james_007
            </div>
            <div className="cursor-pointer hover:bg-blue-100 p-1 rounded" onClick={() => fillTestCredentials('admin2')}>
              <strong>Admin 2:</strong> esther@magmax.com / esther_admin_123
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default LoginForm
// 0682907489