import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';
import { APP_CONFIG } from './config';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

            if (token && userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login(email, password);

            if (response.success && response.token) {
                await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
                await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
                setUser(response.user);
                return { success: true };
            }

            return { success: false, error: response.error || 'فشل تسجيل الدخول' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.error || 'حدث خطأ في الاتصال' };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
