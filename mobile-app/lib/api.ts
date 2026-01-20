import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from './config';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post(API_CONFIG.ENDPOINTS.LOGOUT);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ME);
        return response.data;
    },
};

// Assets API
export const assetsAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ASSETS, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ASSET_DETAIL(id));
        return response.data;
    },

    getByBarcode: async (barcode: string) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ASSET_SCAN, { params: { barcode } });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.ASSETS, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(API_CONFIG.ENDPOINTS.ASSET_DETAIL(id), data);
        return response.data;
    },
};

// Tickets API
export const ticketsAPI = {
    getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.TICKETS, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.TICKET_DETAIL(id));
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.TICKETS, data);
        return response.data;
    },
};

// Dashboard API
export const dashboardAPI = {
    getStats: async () => {
        const response = await api.get(API_CONFIG.ENDPOINTS.STATS);
        return response.data;
    },
};

export default api;
