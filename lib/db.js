// lib/db.js - PWA Optimized Version
// import { hash, compare } from 'bcrypt';
import bcrypt from 'bcryptjs';


let PouchDB, PouchDBFind, usersDB, sessionsDB

// Initialize PouchDB only on client side
const initializePouchDB = async () => {
  if (typeof window !== 'undefined' && !PouchDB) {
    // Dynamic imports for client-side only
    const PouchDBModule = await import('pouchdb-browser')
    const PouchDBFindModule = await import('pouchdb-find')
    
    PouchDB = PouchDBModule.default
    PouchDBFind = PouchDBFindModule.default
    
    // Add the find plugin
    PouchDB.plugin(PouchDBFind)
    
    // Initialize databases
    usersDB = new PouchDB('school_users', {
      auto_compaction: true, // Helps with storage efficiency
      revs_limit: 5 // Limit revision history for storage efficiency
    })
    
    sessionsDB = new PouchDB('school_sessions', {
      auto_compaction: true,
      revs_limit: 3
    })
    
    console.log('PouchDB initialized for PWA')
    return true
  }
  return false
}

// Ensure databases are initialized before use
const ensureDBReady = async () => {
  if (!PouchDB) {
    await initializePouchDB()
  }
  return { usersDB, sessionsDB }
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
}

// Predefined admin and teachers data
const PREDEFINED_USERS = [
    {
        _id: 'admin_001',
        fullName: 'School Headmaster',
        email: 'headmaster@magmax.com',
        password: 'headmaster123',
        role: USER_ROLES.ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'admin_002',
        fullName: 'Madam Esther',
        email: 'esther@magmax.com',
        password: 'esther_admin_123',
        role: USER_ROLES.ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'admin_003',
        fullName: 'Sir Robinson',
        email: 'robinson@magmax.com',
        password: 'robinson_admin_911',
        role: USER_ROLES.ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'teacher_001',
        fullName: 'James Owoo',
        email: 'james_owoo@magmax.com',
        password: 'teacher_james_007',
        role: USER_ROLES.TEACHER,
        classLevel: 'Grade 5',
        teacherPassCode: 'T5001',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'teacher_002',
        fullName: 'Doreen Asabeah',
        email: 'doreen_asabeah@magmax.com',
        password: 'teacher_doreen_008',
        role: USER_ROLES.TEACHER,
        classLevel: 'Grade 3',
        teacherPassCode: 'T3002',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

// Function to initialize database with predefined users
export async function initializeDatabase() {
    try {
        const { usersDB } = await ensureDBReady()
        
        // Create indexes for better query performance
        await usersDB.createIndex({
            index: { fields: ['email'] }
        })
        await usersDB.createIndex({
            index: { fields: ['role', 'isActive'] }
        })
        await usersDB.createIndex({
            index: { fields: ['email', 'password', 'isActive'] }
        })

        // Check if database is already initialized
        const existingUsers = await usersDB.allDocs({ include_docs: true })
        if (existingUsers.rows.length === 0) {
            for (const user of PREDEFINED_USERS) {
                await usersDB.put(user)
            }
            console.log('PWA: Predefined users initialized')
        } else {
            console.log('PWA: Database already initialized')
        }
    } catch (error) {
        console.error('Error initializing PWA database:', error)
        throw error
    }
}

// Authentication functions
export const authenticateUser = async (email, password) => {
  try {
    const { usersDB, sessionsDB } = await ensureDBReady();

    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    const result = await usersDB.find({
      selector: {
        email: email,
        isActive: true,
      },
    });

    if (result.docs.length > 0) {
      const user = result.docs[0];

      // Compare the provided password with the hashed password
      //const isValidPassword = await compare(password, user.password);
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        // Create session with expiration
        const sessionId = getSessionId();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const session = {
          _id: sessionId,
          userId: user._id,
          email: user.email,
          role: user.role,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        await sessionsDB.put(session);

        // Store session in localStorage for PWA persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('school_session_id', sessionId);
        }

        return {
          success: true,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            classLevel: user.classLevel || null,
            teacherPassCode: user.teacherPassCode || null,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          sessionId: session._id,
        };
      } else {
        return { success: false, message: 'Invalid credentials or user not found.' };
      }
    }

    return { success: false, message: 'Invalid credentials or user not found.' };
  } catch (error) {
    console.error('PWA Authentication error:', error);
    return { success: false, message: 'An error occurred during authentication.', error: error.message };
  }
};

// Get current session from localStorage (PWA feature)
export const getCurrentSession = async () => {
    try {
        if (typeof window === 'undefined') return null
        
        const sessionId = localStorage.getItem('school_session_id')
        if (!sessionId) return null
        
        const validation = await validateSession(sessionId)
        return validation.success ? validation : null
    } catch (error) {
        console.error('Error getting current session:', error)
        return null
    }
}

export const validateSession = async (sessionId) => {
    try {
        const { usersDB, sessionsDB } = await ensureDBReady()
        
        if (!sessionId) {
            return { success: false, message: 'Session ID is required.' }
        }

        const session = await sessionsDB.get(sessionId)
        
        // Check if session has expired
        const now = new Date()
        const expiresAt = new Date(session.expiresAt)
        
        if (now > expiresAt) {
            // Clean up expired session
            await sessionsDB.remove(session)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('school_session_id')
            }
            return { success: false, message: 'Session has expired.' }
        }
        
        // Fetch user details
        const user = await usersDB.get(session.userId)
        
        if (!user.isActive) {
            return { success: false, message: 'User account is inactive.' }
        }
        
        return {
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                classLevel: user.classLevel || null,
                teacherPassCode: user.teacherPassCode || null,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        }
    } catch (error) {
        console.error('PWA Session validation error:', error)
        return { success: false, message: 'Session not found or invalid.', error: error.message }
    }
}

export const logout = async (sessionId) => {
    try {
        const { sessionsDB } = await ensureDBReady()
        
        if (!sessionId) {
            // Try to get from localStorage
            if (typeof window !== 'undefined') {
                sessionId = localStorage.getItem('school_session_id')
            }
        }
        
        if (!sessionId) {
            return { success: false, message: 'Session ID is required.' }
        }

        try {
            const session = await sessionsDB.get(sessionId)
            await sessionsDB.remove(session)
        } catch (error) {
            // Session might already be removed
        }
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('school_session_id')
        }
        
        return { success: true, message: 'Logged out successfully.' }
    } catch (error) {
        console.error('PWA Logout error:', error)
        return { success: false, message: 'An error occurred during logout.', error: error.message }
    }
}

// PWA-specific function to check if app is offline
export const isOffline = () => {
    return typeof window !== 'undefined' && !navigator.onLine
}

// PWA-specific function to get database info
export const getDatabaseInfo = async () => {
    try {
        const { usersDB, sessionsDB } = await ensureDBReady()
        
        const usersInfo = await usersDB.info()
        const sessionsInfo = await sessionsDB.info()
        
        return {
            users: usersInfo,
            sessions: sessionsInfo,
            isOffline: isOffline()
        }
    } catch (error) {
        console.error('Error getting database info:', error)
        return null
    }
}

// User management functions (same as before but with ensureDBReady)
export const createUser = async (userData) => {
  try {
    const { usersDB } = await ensureDBReady();

    if (!userData.email || !userData.password || !userData.role) {
      return { success: false, message: 'Email, password, and role are required.' };
    }

    const existingUser = await usersDB.find({
      selector: { email: userData.email },
    });

    if (existingUser.docs.length > 0) {
      return { success: false, message: 'User with this email already exists.' };
    }

    // const hashedPassword = await hash(userData.password, 10);
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user = {
      _id: userId,
      fullName: userData.fullName || userData.name || '',
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      classLevel: userData.classLevel || null,
      teacherPassCode: userData.teacherPassCode || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    await usersDB.put(user);

    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'An error occurred while creating the user.', error: error.message };
  }
};


export const getActiveUsers = async () => {
    try {
        const { usersDB } = await ensureDBReady()
        
        const result = await usersDB.find({
            selector: {
                isActive: true
            }
        })
        const users = result.docs.map(user => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
        })
        return { success: true, users }
    } catch (error) {
        console.error('Error fetching active users:', error)
        return { success: false, message: 'An error occurred while fetching active users.', error: error.message }
    }
}

// Utility functions
const getSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Authorization helper
export const hasPermission = (userRole, requiredRole) => {
    if (!userRole || !requiredRole) return false
    
    const roleHierarchy = {
        [USER_ROLES.ADMIN]: 4,
        [USER_ROLES.TEACHER]: 3,
        [USER_ROLES.PARENT]: 2,
        [USER_ROLES.STUDENT]: 1
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Export database instances for direct access if needed
export const getDBInstances = async () => {
    await ensureDBReady()
    return { usersDB, sessionsDB }
}