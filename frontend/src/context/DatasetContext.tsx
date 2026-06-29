import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../services/auth.service';

interface Lead {
    id: string;
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
    status: string;
    priority: string;
    lastActivity: string;
    dealValue: number;
    industry: string;
    companySize: string;
    source: string;
    owner: string;
    linkedIn: string;
    department?: string;
}

interface DealTask {
    id: string;
    title: string;
    deadline: string;
    priority: string;
    completed: boolean;
}

interface DealActivity {
    id: string;
    type: string;
    description: string;
    date: string;
}

interface Deal {
    id: string;
    contactName: string;
    company: string;
    value: number;
    priority: 'Low' | 'Medium' | 'High';
    lastActivity: string;
    expectedCloseDate: string;
    stage: string;
    owner: string;
    email: string;
    phone: string;
    notes: string[];
    tasks: DealTask[];
    activities: DealActivity[];
    deal_name?: string;
}

interface DatasetContextType {
    dataset: any | null;
    setDataset: (data: any) => void;
    clearDataset: () => void;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deals: Deal[];
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
    updateDeal: (id: string, updates: Partial<Deal>) => void;
    selectedCompanyIndex: number;
    setSelectedCompanyIndex: (index: number) => void;
    companies: any[];
    emails: any[];
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('user');
            return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
            return null;
        }
    });

    const getStorageKey = useCallback((baseKey: string) => {
        return user ? `${baseKey}_${user.id}` : baseKey;
    }, [user]);

    const [dataset, setDatasetState] = useState<any | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const userData = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
            const key = userData ? `crm_dataset_${userData.id}` : 'crm_dataset';
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error parsing crm_dataset from localStorage', e);
            return null;
        }
    });

    const [selectedCompanyIndex, setSelectedCompanyIndex] = useState<number>(() => {
        const savedUser = localStorage.getItem('user');
        const userData = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
        const key = userData ? `crm_selected_company_index_${userData.id}` : 'crm_selected_company_index';
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved) : 0;
    });

    const [leads, setLeads] = useState<Lead[]>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const userData = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
            const key = userData ? `crm_leads_${userData.id}` : 'crm_leads';
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error parsing crm_leads from localStorage', e);
            return [];
        }
    });

    const [deals, setDeals] = useState<Deal[]>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const userData = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
            const key = userData ? `crm_deals_${userData.id}` : 'crm_deals';
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error parsing crm_deals from localStorage', e);
            return [];
        }
    });

    const [emails, setEmails] = useState<any[]>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const userData = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
            const key = userData ? `crm_emails_${userData.id}` : 'crm_emails';
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error parsing crm_emails from localStorage', e);
            return [];
        }
    });

    const fetchUserSpecificData = useCallback(async (newUser: User | null) => {
        if (!newUser) {
            setDatasetState(null);
            setLeads([]);
            setDeals([]);
            setEmails([]);
            setSelectedCompanyIndex(0);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            // Load from localStorage first for instant UI
            const dsKey = `crm_dataset_${newUser.id}`;
            const leadsKey = `crm_leads_${newUser.id}`;
            const dealsKey = `crm_deals_${newUser.id}`;
            const emailsKey = `crm_emails_${newUser.id}`;
            const selIdxKey = `crm_selected_company_index_${newUser.id}`;

            const savedDs = localStorage.getItem(dsKey);
            const savedLeads = localStorage.getItem(leadsKey);
            const savedDeals = localStorage.getItem(dealsKey);
            const savedEmails = localStorage.getItem(emailsKey);
            const savedSelIdx = localStorage.getItem(selIdxKey);

            if (savedDs) setDatasetState(JSON.parse(savedDs));
            if (savedLeads) setLeads(JSON.parse(savedLeads));
            if (savedDeals) setDeals(JSON.parse(savedDeals));
            if (savedEmails) setEmails(JSON.parse(savedEmails));
            if (savedSelIdx) setSelectedCompanyIndex(parseInt(savedSelIdx));

            // Sync with Backend (Optional: Implement fetch-all endpoint if needed)
            // For now, we rely on the fact that research results are pushed to state
        } catch (e) {
            console.error('Error fetching user specific data', e);
        }
    }, []);

    // Update user state when localStorage changes (e.g. on login)
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('user');
            const newUser = (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
            
            if (newUser?.id !== user?.id) {
                setUser(newUser);
                fetchUserSpecificData(newUser);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(handleStorageChange, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [user, fetchUserSpecificData]);

    const companies = dataset?.companies || (dataset?.account ? [dataset] : []);

    const setDataset = useCallback((data: any) => {
        if (!user) return;
        
        setDatasetState(data);
        localStorage.setItem(getStorageKey('crm_dataset'), JSON.stringify(data));
        setSelectedCompanyIndex(0);
        localStorage.setItem(getStorageKey('crm_selected_company_index'), '0');

        let allLeads: Lead[] = [];
        let allDeals: Deal[] = [];
        let allEmails: any[] = [];

        const companiesToProcess = data.companies || (data.account ? [data] : []);

        companiesToProcess.forEach((companyData: any) => {
            const currentAccount = companyData.account || companyData.company || {};
            const companyName = String(currentAccount.name || 'Company');

            // Initialize leads
            if (companyData.leads || companyData.contacts) {
                const contactsToUse = companyData.contacts || [];
                const companyLeads: Lead[] = contactsToUse.map((contact: any, index: number) => ({
                    id: String(contact.contact_id || `contact-${companyName}-${index}`),
                    name: String(contact.name || 'Unknown'),
                    company: companyName,
                    role: String(contact.role || 'Staff'),
                    department: String(contact.department || 'N/A'),
                    email: String(contact.email || 'N/A'),
                    phone: String(contact.phone || 'N/A'),
                    status: String(contact.lead_status || 'New Lead'),
                    priority: contact.influence_level === 'High' ? 'High' : 'Medium',
                    lastActivity: String(contact.last_activity || 'N/A'),
                    dealValue: contact.deal_value
                        ? typeof contact.deal_value === 'string'
                            ? parseInt(contact.deal_value.replace(/[^0-9]/g, ''))
                            : Number(contact.deal_value)
                        : 2000 + Math.floor(Math.random() * 201),
                    industry: String(currentAccount.industry || 'N/A'),
                    companySize: String(currentAccount.employee_count?.toString() || 'N/A'),
                    source: 'CRM Import',
                    owner: 'Alex Johnson',
                    linkedIn: String(contact.linkedin || 'linkedin.com')
                }));
                allLeads = [...allLeads, ...companyLeads];
            }

            // Initialize deals
            if (companyData.deals) {
                const companyDeals: Deal[] = companyData.deals.map((deal: any, index: number) => {
                    const contactName = String(deal.associated_contacts?.[0] || 'Unknown');
                    const lead = (companyData.contacts || []).find(
                        (c: any) => String(c.name) === contactName || String(c.contact_id) === contactName
                    );

                    return {
                        id: String(deal.deal_id || `deal-${companyName}-${index}`),
                        contactName: String(lead?.name || contactName),
                        company: companyName,
                        value: Number(deal.value_estimate) || 0,
                        priority: (deal.priority || 'Medium') as any,
                        lastActivity: 'Imported',
                        expectedCloseDate:
                            String(deal.expected_close_date ||
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                        stage: String(deal.stage || 'New Leads'),
                        owner: String(deal.owner || 'Alex Johnson'),
                        email: String(lead?.email || 'N/A'),
                        phone: String(lead?.phone || 'N/A'),
                        notes: [],
                        tasks: [],
                        activities: [],
                        deal_name: String(deal.deal_name || `${lead?.name || contactName} Deal`)
                    };
                });
                allDeals = [...allDeals, ...companyDeals];
            }

            // Initialize emails
            if (companyData.emails) {
                const companyEmails = companyData.emails.map((email: any) => ({
                    ...email,
                    companyName: companyName
                }));
                allEmails = [...allEmails, ...companyEmails];
            }
        });

        setLeads(allLeads);
        localStorage.setItem(getStorageKey('crm_leads'), JSON.stringify(allLeads));
        setDeals(allDeals);
        localStorage.setItem(getStorageKey('crm_deals'), JSON.stringify(allDeals));
        setEmails(allEmails);
        localStorage.setItem(getStorageKey('crm_emails'), JSON.stringify(allEmails));
    }, [user, getStorageKey]);

    const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
        setLeads(prev => {
            const newLeads = prev.map(lead => (lead.id === id ? { ...lead, ...updates } : lead));
            const key = user ? `crm_leads_${user.id}` : 'crm_leads';
            localStorage.setItem(key, JSON.stringify(newLeads));
            return newLeads;
        });
    }, [user]);

    const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
        setDeals(prev => {
            const newDeals = prev.map(deal => (deal.id === id ? { ...deal, ...updates } : deal));
            const key = user ? `crm_deals_${user.id}` : 'crm_deals';
            localStorage.setItem(key, JSON.stringify(newDeals));
            return newDeals;
        });
    }, [user]);

    const handleSetSelectedCompanyIndex = (index: number) => {
        setSelectedCompanyIndex(index);
        const key = user ? `crm_selected_company_index_${user.id}` : 'crm_selected_company_index';
        localStorage.setItem(key, index.toString());
    };

    const clearDataset = useCallback(() => {
        setDatasetState(null);
        setLeads([]);
        setDeals([]);
        setEmails([]);
        setSelectedCompanyIndex(0);
        
        const dsKey = user ? `crm_dataset_${user.id}` : 'crm_dataset';
        const leadsKey = user ? `crm_leads_${user.id}` : 'crm_leads';
        const dealsKey = user ? `crm_deals_${user.id}` : 'crm_deals';
        const emailsKey = user ? `crm_emails_${user.id}` : 'crm_emails';
        const selIdxKey = user ? `crm_selected_company_index_${user.id}` : 'crm_selected_company_index';

        localStorage.removeItem(dsKey);
        localStorage.removeItem(leadsKey);
        localStorage.removeItem(dealsKey);
        localStorage.removeItem(emailsKey);
        localStorage.removeItem(selIdxKey);
    }, [user]);

    return (
        <DatasetContext.Provider
            value={{
                dataset,
                setDataset,
                clearDataset,
                leads,
                setLeads,
                updateLead,
                deals,
                setDeals,
                updateDeal,
                selectedCompanyIndex,
                setSelectedCompanyIndex: handleSetSelectedCompanyIndex,
                companies,
                emails
            }}
        >
            {children}
        </DatasetContext.Provider>
    );
};

export const useDataset = () => {
    const context = useContext(DatasetContext);
    if (context === undefined) {
        throw new Error('useDataset must be used within a DatasetProvider');
    }
    return context;
};