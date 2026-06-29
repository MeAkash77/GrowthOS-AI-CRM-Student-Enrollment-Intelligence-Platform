import axios from 'axios';

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Create an axios instance with the backend base URL
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://greencrm-hnb1.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authService = {
    login: async (credentials: any): Promise<AuthResponse> => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                user: { id: '1', email: 'user@example.com', name: 'Mock User' },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };
        }

        const response = await api.post('/auth/login', credentials);
        const data = response.data;

        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    register: async (data: any): Promise<AuthResponse> => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                user: { id: '1', email: 'user@example.com', name: 'Mock User' },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };
        }

        const response = await api.post('/auth/register', data);
        const authData = response.data;

        if (authData.accessToken) {
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem('user', JSON.stringify(authData.user));
        }

        return authData;
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            try {
                const saved = localStorage.getItem('user');
                const user = (saved && saved !== 'undefined') ? JSON.parse(saved) : { id: '1', email: 'user@example.com', name: 'Mock User' };
                return { user };
            } catch {
                return { user: { id: '1', email: 'user@example.com', name: 'Mock User' } };
            }
        }

        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};