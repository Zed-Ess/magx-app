// contexts/AuthContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react'
import { authenticateUser, validateSession, logout, initializeDatabase } from '@/lib/db';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeApp()
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize the database and check for an existing session
            await initializeDatabase();
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                const validation = await validateSession(sessionId);
                if (validation.valid) {
                    setUser(validation.user);
                    setIsAuthenticated(true);
                }
            }
        } catch (error) {
            localStorage.removeItem('sessionId');
        } finally {
            setLoading(false);
        }
    };

const login = async (username, password) => {
    try {
        const session = await authenticateUser(username, password);
        if (session.success) {
            setUser(session.user);
            setIsAuthenticated(true);
            localStorage.setItem('sessionId', session.id);
            return { success: true, user: session.user };
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}


const logoutUser = async () => {
    try {
        const sessionId = localStorage.getItem('sessionId')
        if (sessionId){
            await logout(sessionId);
            localStorage.removeItem('sessionId');
        }
        setUser(null);
        setIsAuthenticated(false);
    } catch (error) {
        console.error('Logout failed:', error);
    }
}


const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user?.roles === role;
}


const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
}

const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout: logoutUser,
    hasRole,
    hasAnyRole
}
 return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
}


// AuthProvider.propTypes = {
//     children: PropTypes.node.isRequired,
// };