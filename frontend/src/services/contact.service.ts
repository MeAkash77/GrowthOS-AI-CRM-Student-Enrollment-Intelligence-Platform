import { api } from '@/lib/api';

export interface ContactData {
    name: string;
    email: string;
    message: string;
}

export const contactService = {
    submit: async (data: ContactData) => {
        // If mock mode is enabled, simulate a delay and success response
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Message sent successfully (Mock)' };
        }

        const response = await api.post('/contact', data);
        return response.data;
    }
};
