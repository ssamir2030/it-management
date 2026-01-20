// API Configuration
export const API_CONFIG = {
    // Change this to your production URL
    BASE_URL: __DEV__ ? 'http://192.168.1.100:3000' : 'https://your-domain.com',

    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',

        // Assets
        ASSETS: '/api/assets',
        ASSET_DETAIL: (id: string) => `/api/assets/${id}`,
        ASSET_SCAN: '/api/assets/scan',

        // Tickets
        TICKETS: '/api/tickets',
        TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,

        // Dashboard
        DASHBOARD: '/api/dashboard',
        STATS: '/api/dashboard/stats',

        // Employees
        EMPLOYEES: '/api/employees',

        // Departments
        DEPARTMENTS: '/api/departments',

        // Locations
        LOCATIONS: '/api/locations',
    }
}

// App Configuration
export const APP_CONFIG = {
    APP_NAME: 'IT Asset',
    VERSION: '1.0.0',
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
        SETTINGS: 'app_settings',
    }
}

// Theme Colors (matching web app)
export const COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',

    // Backgrounds
    background: '#ffffff',
    backgroundDark: '#0a0a0a',
    card: '#f8fafc',
    cardDark: '#171717',

    // Text
    text: '#0a0a0a',
    textDark: '#fafafa',
    textMuted: '#6b7280',

    // Borders
    border: '#e5e7eb',
    borderDark: '#262626',
}
