// components/DebugPanel.js
'use client'
import { useState } from 'react'
import { debugListAllUsers, testPasswordHashing, getDatabaseInfo } from '@/lib/db'

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const runDebugTests = async () => {
    setLoading(true)
    setDebugInfo('Running debug tests...\n\n')
    
    try {
      // Test password hashing
      console.log('🧪 Testing password hashing...')
      setDebugInfo(prev => prev + '🧪 Testing password hashing...\n')
      
      const hashTest = await testPasswordHashing()
      setDebugInfo(prev => prev + `✅ Hash test passed: ${hashTest.isMatch}\n\n`)
      
      // List all users
      console.log('📋 Listing all users...')
      setDebugInfo(prev => prev + '📋 Listing all users in database:\n')
      
      const users = await debugListAllUsers()
      users.forEach((user, index) => {
        setDebugInfo(prev => prev + `${index + 1}. ${user.email} (${user.role}) - Active: ${user.isActive}\n`)
      })
      
      // Database info
      setDebugInfo(prev => prev + '\n📊 Database Information:\n')
      const dbInfo = await getDatabaseInfo()
      if (dbInfo) {
        setDebugInfo(prev => prev + `Users DB: ${dbInfo.users.doc_count} documents\n`)
        setDebugInfo(prev => prev + `Sessions DB: ${dbInfo.sessions.doc_count} documents\n`)
        setDebugInfo(prev => prev + `Online: ${!dbInfo.isOffline}\n`)
      }
      
      setDebugInfo(prev => prev + '\n✅ Debug tests completed! Check console for detailed logs.\n')
      
    } catch (error) {
      console.error('Debug test error:', error)
      setDebugInfo(prev => prev + `❌ Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const clearDebugInfo = () => {
    setDebugInfo('')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runDebugTests}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Debug Tests'}
        </button>
        
        <button
          onClick={clearDebugInfo}
          className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Debug Info
        </button>
      </div>
      
      {debugInfo && (
        <div className="bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
          {debugInfo}
        </div>
      )}
    </div>
  )
}

export default DebugPanel