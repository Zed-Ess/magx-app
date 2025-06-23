// contexts/AuthContext.js - Fixed Version
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authenticateUser, validateSession, logout, initializeDatabase, debugListAllUsers } from '@/lib/db';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Utility functions to safely access localStorage
const getSessionId = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('school_session_id');
    }
    return null;
};

const setSessionId = (id) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('school_session_id', id);
    }
};

const removeSessionId = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('school_session_id');
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [initializationStatus, setInitializationStatus] = useState('initializing');

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            console.log('🔧 Starting application initialization...');
            setInitializationStatus('initializing_database');
            
            // Initialize database with proper error handling
            await initializeDatabase();
            console.log('✅ Database initialized successfully');
            
            setInitializationStatus('checking_session');
            
            // Wait a moment for database to be fully ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const sessionId = getSessionId();
            if (sessionId) {
                console.log('🔍 Found existing session, validating...');
                const validation = await validateSession(sessionId);
                
                if (validation.success) {
                    setUser(validation.user);
                    setIsAuthenticated(true);
                    console.log('✅ Session validated successfully');
                    setInitializationStatus('authenticated');
                } else {
                    console.log('❌ Session validation failed:', validation.message);
                    removeSessionId();
                    setInitializationStatus('ready');
                }
            } else {
                console.log('ℹ️ No existing session found');
                setInitializationStatus('ready');
            }
            
            // Debug: List all users after initialization
            console.log('🧪 Running post-initialization debug...');
            await debugListAllUsers();
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            setInitializationStatus('error');
            removeSessionId();
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        try {
            console.log('🔐 Attempting login with email:', email);
            
            // Ensure we're not still initializing
            if (initializationStatus === 'initializing' || initializationStatus === 'initializing_database') {
                console.log('⏳ Database still initializing, waiting...');
                return { success: false, message: 'System is still initializing. Please wait a moment and try again.' };
            }
            
            const result = await authenticateUser(email, password);
            console.log('🔐 Authentication result:', result);
            
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                setSessionId(result.sessionId);
                setInitializationStatus('authenticated');
                console.log('✅ Login successful');
                return { success: true, user: result.user };
            } else {
                console.log('❌ Login failed:', result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: error.message || 'Login error occurred. Please try again.' };
        }
    }, [initializationStatus]);

    const logoutUser = useCallback(async () => {
        try {
            const sessionId = getSessionId();
            if (sessionId) {
                await logout(sessionId);
            }
            removeSessionId();
        } catch (error) {
            console.error('❌ Logout failed:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setInitializationStatus('ready');
        }
    }, []);

    const hasRole = useCallback((role) => {
        if (!user || !user.role) return false;
        return user.role === role;
    }, [user]);

    const hasAnyRole = useCallback((roles) => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    }, [user]);

        const debugAuth = useCallback(async () => {
        console.log('🧪 Running auth debug...');
        console.log('Current state:', {
            user,
            isAuthenticated,
            loading,
            initializationStatus,
            sessionId: getSessionId()
        });
        
        const users = await debugListAllUsers();
        console.log('Available users:', users);
        
        return {
            currentState: { user, isAuthenticated, loading, initializationStatus },
            sessionId: getSessionId(),
            availableUsers: users
        };
    }, [user, isAuthenticated, loading, initializationStatus]);

    // Function to fill test credentials based on role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const fillTestCredentials = useCallback((role) => {
        switch (role) {
            case 'admin':
                setEmail('headmaster@magmax.com');
                setPassword('headmaster123');
                break;
            case 'teacher':
                setEmail('james_owoo@magmax.com');
                setPassword('teacher_james_007');
                break;
            case 'admin2':
                setEmail('esther@magmax.com');
                setPassword('esther_admin_123');
                break;
            default:
                setEmail('');
                setPassword('');
        }
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout: logoutUser,
        hasRole,
        hasAnyRole,
        fillTestCredentials,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Initializing application...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};