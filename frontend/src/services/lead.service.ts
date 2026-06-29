import { api } from '@/lib/api';

export interface Lead {
    id: string;
    name: string;
    company?: string;
    email?: string;
    industry?: string;
    status: string;
    score?: number;
    notes?: string;
    metadata?: any;
    createdAt: string;
}

export const leadService = {
    getLeads: async () => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            return {
                leads: [
                    {
                        id: '1',
                        name: 'Alex Thompson',
                        company: 'TechFlow',
                        email: 'alex@techflow.com',
                        status: 'NEW',
                        score: 95,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Sarah Chen',
                        company: 'DataSync',
                        email: 'sarah@datasync.com',
                        status: 'QUALIFIED',
                        score: 88,
                        createdAt: new Date().toISOString()
                    }
                ]
            };
        }
        const response = await api.get('/leads');
        return response.data;
    },

    createLead: async (leadData: Partial<Lead>) => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            return {
                lead: {
                    id: Math.random().toString(36).substr(2, 9),
                    ...leadData,
                    createdAt: new Date().toISOString()
                }
            };
        }
        const response = await api.post('/leads', leadData);
        return response.data;
    }
};
