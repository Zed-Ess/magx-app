// lib/db.js - Fixed Version with Proper Document Creation
import bcrypt from 'bcryptjs';

let PouchDB, PouchDBFind, usersDB, sessionsDB, isInitialized = false

// Initialize PouchDB only on client side
const initializePouchDB = async () => {
  if (typeof window !== 'undefined' && !PouchDB) {
    const PouchDBModule = await import('pouchdb-browser')
    const PouchDBFindModule = await import('pouchdb-find')
    
    PouchDB = PouchDBModule.default
    PouchDBFind = PouchDBFindModule.default
    
    PouchDB.plugin(PouchDBFind)
    
    usersDB = new PouchDB('school_users', {
      auto_compaction: true,
      revs_limit: 5
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

// Fixed session ID generation
const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Wait for database to be ready with timeout
const waitForDB = async (maxAttempts = 10, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { usersDB } = await ensureDBReady();
      if (usersDB) {
        // Test database connectivity
        await usersDB.info();
        return true;
      }
    } catch (error) {
      console.log(`Database connection attempt ${attempt}/${maxAttempts} failed:`, error.message);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Database connection timeout after maximum attempts');
}

// Clear and recreate database
const clearDatabase = async () => {
  try {
    const { usersDB } = await ensureDBReady();
    console.log('🗑️ Clearing existing database...');
    
    const allDocs = await usersDB.allDocs({ include_docs: true });
    console.log(`📊 Found ${allDocs.rows.length} existing documents to remove`);
    
    if (allDocs.rows.length > 0) {
      const docsToRemove = allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));
      
      await usersDB.bulkDocs(docsToRemove);
      console.log('✅ Successfully cleared existing documents');
    }
    
    // Wait a moment for the deletions to process
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔧 Starting database initialization...');
    
    // Wait for database to be ready
    await waitForDB();
    const { usersDB } = await ensureDBReady();

    // Check if we need to reinitialize (force clear for debugging)
    const forceReinitialize = true; // Set to true to force recreation
    
    if (forceReinitialize) {
      await clearDatabase();
    }

    // Create indexes with retry logic
    console.log('📝 Creating database indexes...');
    const createIndexWithRetry = async (indexDef, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await usersDB.createIndex(indexDef);
          return true;
        } catch (error) {
          if (error.name === 'conflict' || error.message.includes('exists')) {
            console.log('ℹ️ Index already exists, continuing...');
            return true;
          }
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        }
      }
    };

    try {
      await createIndexWithRetry({ index: { fields: ['email'] } });
      await createIndexWithRetry({ index: { fields: ['role', 'isActive'] } });
      await createIndexWithRetry({ index: { fields: ['email', 'isActive'] } });
      console.log('✅ Database indexes created successfully');
    } catch (indexError) {
      console.log('⚠️ Index creation error:', indexError.message);
    }

    // Check for existing users
    const existingUsers = await usersDB.allDocs({ include_docs: true });
    console.log(`📊 Current user count: ${existingUsers.rows.length}`);

    if (existingUsers.rows.length === 0 || forceReinitialize) {
      console.log('👥 Creating predefined users...');
      
      // Create users using bulkDocs for better reliability
      const usersToCreate = [];
      
      for (const user of PREDEFINED_USERS) {
        try {
          console.log(`🔐 Preparing user: ${user.email}`);
          
          const hashedPassword = await bcrypt.hash(user.password, 10);
          console.log(`🔐 Password hashed for: ${user.email}`);
          
          const userDoc = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            classLevel: user.classLevel || null,
            teacherPassCode: user.teacherPassCode || null,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          usersToCreate.push(userDoc);
          console.log(`✅ Prepared user document: ${user.email}`);
          
        } catch (userError) {
          console.error(`❌ Error preparing user ${user.email}:`, userError);
        }
      }
      
      // Create all users at once using bulkDocs
      if (usersToCreate.length > 0) {
        try {
          console.log(`📝 Creating ${usersToCreate.length} users with bulkDocs...`);
          const result = await usersDB.bulkDocs(usersToCreate);
          
          console.log('📋 Bulk creation results:');
          result.forEach((res, index) => {
            if (res.ok) {
              console.log(`✅ ${usersToCreate[index].email} - Success`);
            } else {
              console.log(`❌ ${usersToCreate[index].email} - Error: ${res.error || res.message}`);
            }
          });
          
        } catch (bulkError) {
          console.error('❌ Bulk user creation failed:', bulkError);
          
          // Fallback to individual creation
          console.log('🔄 Falling back to individual user creation...');
          for (const userDoc of usersToCreate) {
            try {
              await usersDB.put(userDoc);
              console.log(`✅ Individual creation success: ${userDoc.email}`);
            } catch (individualError) {
              console.error(`❌ Individual creation failed for ${userDoc.email}:`, individualError);
            }
          }
        }
      }
      
      console.log('✅ Predefined users creation process completed');
    } else {
      console.log('ℹ️ Users already exist in database');
    }

    // Wait a moment for documents to be fully indexed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Final verification with detailed logging
    const finalCount = await usersDB.allDocs({ include_docs: true });
    console.log(`✅ Database initialization complete. Total users: ${finalCount.rows.length}`);
    
    console.log('📋 Current users in database (detailed):');
    finalCount.rows.forEach((row, index) => {
      const doc = row.doc || {};
      console.log(`${index + 1}. ID: ${doc._id || 'undefined'}`);
      console.log(`   Email: ${doc.email || 'undefined'}`);
      console.log(`   Name: ${doc.fullName || 'undefined'}`);
      console.log(`   Role: ${doc.role || 'undefined'}`);
      console.log(`   Active: ${doc.isActive}`);
      console.log(`   Password exists: ${!!doc.password}`);
      console.log('---');
    });

    // Set initialization flag
    isInitialized = true;
    console.log('🎉 Database fully initialized and ready for use!');
    
  } catch (error) {
    console.error('❌ Error initializing PWA database:', error);
    isInitialized = false;
    throw error;
  }
}

// Enhanced authentication function with better error handling
export const authenticateUser = async (email, password) => {
  try {
    console.log('🔐 Starting authentication process...');
    console.log(`📧 Email: ${email}`);

    // Ensure database is fully initialized
    if (!isInitialized) {
      console.log('⚠️ Database not initialized, initializing now...');
      await initializeDatabase();
    }

    await waitForDB(); // Ensure DB is ready
    const { usersDB, sessionsDB } = await ensureDBReady();

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return { success: false, message: 'Email and password are required.' };
    }

    console.log('🔍 Searching for user in database...');
    
    // Try multiple search strategies
    let user = null;
    let searchAttempts = 0;
    const maxSearchAttempts = 3;

    while (!user && searchAttempts < maxSearchAttempts) {
      searchAttempts++;
      console.log(`🔍 Search attempt ${searchAttempts}/${maxSearchAttempts}`);

      try {
        // First try: search by email and active status
        const result = await usersDB.find({
          selector: {
            email: { $eq: email },
            isActive: { $eq: true }
          },
        });

        console.log(`🔍 Search result: Found ${result.docs.length} matching users`);

        if (result.docs.length > 0) {
          user = result.docs[0];
          console.log(`✅ User found: ${user.email} (${user.role})`);
          break;
        }

        // Second try: search by email only
        if (searchAttempts === 2) {
          console.log('🔍 Trying search by email only...');
          const emailOnlyResult = await usersDB.find({
            selector: { 
              email: { $eq: email }
            }
          });
          
          console.log(`🔍 Email-only search found: ${emailOnlyResult.docs.length} users`);
          
          if (emailOnlyResult.docs.length > 0) {
            const foundUser = emailOnlyResult.docs[0];
            console.log(`🔍 Found user details:`, {
              email: foundUser.email,
              isActive: foundUser.isActive,
              role: foundUser.role
            });
            
            if (foundUser.isActive) {
              user = foundUser;
              console.log(`✅ User found (email-only search): ${user.email} (${user.role})`);
              break;
            } else {
              console.log('❌ User found but is inactive');
              return { success: false, message: 'User account is inactive.' };
            }
          }
        }

        // Third try: get all users and find manually (fallback)
        if (searchAttempts === 3) {
          console.log('🔍 Trying manual search through all users...');
          const allUsers = await usersDB.allDocs({ include_docs: true });
          console.log(`🔍 Total users in database: ${allUsers.rows.length}`);
          
          const foundUser = allUsers.rows.find(row => {
            const doc = row.doc;
            console.log(`🔍 Checking user: ${doc?.email} vs ${email}, active: ${doc?.isActive}`);
            return doc && doc.email === email && doc.isActive === true;
          });
          
          if (foundUser) {
            user = foundUser.doc;
            console.log(`✅ User found (manual search): ${user.email} (${user.role})`);
            break;
          }
        }

      } catch (searchError) {
        console.error(`❌ Search attempt ${searchAttempts} failed:`, searchError);
        if (searchAttempts < maxSearchAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    if (!user) {
      console.log('❌ No user found with provided email and active status');
      console.log('🔍 Available users for debugging:');
      try {
        const allUsers = await usersDB.allDocs({ include_docs: true });
        allUsers.rows.forEach((row, index) => {
          const doc = row.doc || {};
          console.log(`${index + 1}. ${doc.email || 'NO_EMAIL'} (Active: ${doc.isActive}) (Role: ${doc.role || 'NO_ROLE'})`);
        });
      } catch (debugError) {
        console.error('Could not fetch users for debugging:', debugError);
      }
      return { success: false, message: 'Invalid credentials.' };
    }

    // Password verification
    console.log('🔍 Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔑 Password comparison result: ${isValidPassword}`);
    
    if (isValidPassword) {
      console.log('✅ Password matches! Creating session...');
      
      const sessionId = generateSessionId();
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
      console.log(`✅ Session created: ${sessionId}`);

      const returnUser = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel || null,
        teacherPassCode: user.teacherPassCode || null,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      console.log('✅ Authentication successful');
      return {
        success: true,
        user: returnUser,
        sessionId: sessionId,
      };
    } else {
      console.log('❌ Password does not match');
      return { success: false, message: 'Invalid credentials.' };
    }
  } catch (error) {
    console.error('❌ PWA Authentication error:', error);
    return { success: false, message: 'An error occurred during authentication.', error: error.message };
  }
};

// Enhanced debug function
export const debugListAllUsers = async () => {
  try {
    console.log('🧪 Running comprehensive debug tests...');
    
    // Test password hashing first
    console.log('🧪 Testing password hashing...');
    const hashTest = await testPasswordHashing();
    console.log(`✅ Hash test passed: ${hashTest.isMatch}`);
    
    await waitForDB();
    const { usersDB, sessionsDB } = await ensureDBReady();
    
    // Get database info
    const usersInfo = await usersDB.info();
    const sessionsInfo = await sessionsDB.info();
    
    console.log('📊 Database Information:');
    console.log('Users DB Info:', usersInfo);
    console.log('Sessions DB Info:', sessionsInfo);
    
    const allUsers = await usersDB.allDocs({ include_docs: true });
    const allSessions = await sessionsDB.allDocs({ include_docs: true });
    
    console.log('📋 Listing all users in database:');
    allUsers.rows.forEach((row, index) => {
      const user = row.doc || {};
      console.log(`${index + 1}. ${user.email || 'undefined'} (${user.fullName || 'undefined'}) - Role: ${user.role || 'undefined'} - Active: ${user.isActive || 'undefined'}`);
    });
    
    console.log('📋 Listing all sessions:');
    allSessions.rows.forEach((row, index) => {
      const session = row.doc || {};
      console.log(`${index + 1}. Session: ${session._id} - User: ${session.email} - Expires: ${session.expiresAt}`);
    });
    
    console.log(`📊 Users DB: ${allUsers.rows.length} documents`);
    console.log(`📊 Sessions DB: ${allSessions.rows.length} documents`);
    console.log(`🌐 Online: ${!isOffline()}`);
    console.log(`✅ Initialized: ${isInitialized}`);
    
    console.log('✅ Debug tests completed! Check console for detailed logs.');
    
    return allUsers.rows.map(row => ({
      email: row.doc?.email || 'undefined',
      fullName: row.doc?.fullName || 'undefined',
      role: row.doc?.role || 'undefined',
      isActive: row.doc?.isActive || 'undefined'
    }));
  } catch (error) {
    console.error('❌ Error in debug function:', error);
    return [];
  }
};

// Test password hashing
export const testPasswordHashing = async () => {
  try {
    const testPassword = 'headmaster123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    
    console.log(`🔐 Password test - Original: ${testPassword}`);
    console.log(`🔐 Password test - Hashed: ${hashedPassword.substring(0, 20)}...`);
    console.log(`🔐 Password test - Match: ${isMatch}`);
    
    return { testPassword, hashedPassword, isMatch };
  } catch (error) {
    console.error('❌ Password hashing test failed:', error);
    return { testPassword: '', hashedPassword: '', isMatch: false };
  }
};

// Session validation
export const validateSession = async (sessionId) => {
    try {
        const { usersDB, sessionsDB } = await ensureDBReady()
        
        if (!sessionId) {
            return { success: false, message: 'Session ID is required.' }
        }

        const session = await sessionsDB.get(sessionId)
        
        const now = new Date()
        const expiresAt = new Date(session.expiresAt)
        
        if (now > expiresAt) {
            await sessionsDB.remove(session)
            return { success: false, message: 'Session has expired.' }
        }
        
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
        console.error('❌ Session validation error:', error)
        return { success: false, message: 'Session not found or invalid.' }
    }
}

export const logout = async (sessionId) => {
    try {
        const { sessionsDB } = await ensureDBReady()
        
        if (sessionId) {
            try {
                const session = await sessionsDB.get(sessionId)
                await sessionsDB.remove(session)
            } catch (error) {
                console.log('⚠️ Session already removed or not found')
            }
        }
        
        return { success: true, message: 'Logged out successfully.' }
    } catch (error) {
        console.error('❌ Logout error:', error)
        return { success: false, message: 'An error occurred during logout.' }
    }
}

// Utility functions
export const isOffline = () => {
    return typeof window !== 'undefined' && !navigator.onLine
}

export const getDatabaseInfo = async () => {
    try {
        const { usersDB, sessionsDB } = await ensureDBReady()
        
        const usersInfo = await usersDB.info()
        const sessionsInfo = await sessionsDB.info()
        
        return {
            users: usersInfo,
            sessions: sessionsInfo,
            isOffline: isOffline(),
            isInitialized
        }
    } catch (error) {
        console.error('Error getting database info:', error)
        return null
    }
}

// Additional utility functions
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
    return { success: false, message: 'An error occurred while creating the user.' };
  }
};

export const getActiveUsers = async () => {
    try {
        const { usersDB } = await ensureDBReady()
        
        const result = await usersDB.find({
            selector: { isActive: true }
        })
        
        const users = result.docs.map(user => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
        })
        
        return { success: true, users }
    } catch (error) {
        console.error('Error fetching active users:', error)
        return { success: false, message: 'An error occurred while fetching active users.' }
    }
}

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

export const getDBInstances = async () => {
    await ensureDBReady()
    return { usersDB, sessionsDB }
}

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