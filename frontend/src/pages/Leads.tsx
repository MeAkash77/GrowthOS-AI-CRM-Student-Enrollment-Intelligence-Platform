import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Search,
    Plus,
    Shield,
    Linkedin,
    Mail,
    Phone,
    Calendar,
    Clock,
    CheckCircle2,
    TrendingUp,
    Users,
    LayoutDashboard,
    Sparkles,
    Home,
    Mail as MailIcon,
    Layers,
    Settings,
    LogOut,
    Send,
    FileText,
    Briefcase,
    PlusCircle,
    Edit3,
    X,
    Filter as FilterIcon,
    Upload,
    BarChart3,
    Database,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { useDataset } from '@/context/DatasetContext';

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

const safeRender = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
        }
        return value.name || value.title || value.description || value.content || JSON.stringify(value);
    }
    return String(value);
};

const Leads: React.FC = () => {
    const navigate = useNavigate();
    const { dataset, leads, updateLead } = useDataset();
    const [activeNav] = useState('Contacts');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [editingDealValueId, setEditingDealValueId] = useState<string | null>(null);

    useEffect(() => {
        // Select first lead by default if none selected
        if (leads.length > 0 && !selectedLead) {
            setSelectedLead(leads[0]);
        }
    }, [leads, selectedLead]);

    const sidebarLinks = [
        { name: 'Home', icon: <Home size={20} />, path: '/' },
        { name: 'AI Command Centre', icon: <Sparkles size={20} />, path: '/ai-command', isGlow: true },
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Contacts', icon: <Users size={20} />, path: '/leads' },
        { name: 'Master Table', icon: <Layers size={20} /> },
        { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
        { name: 'Mails', icon: <MailIcon size={20} />, path: '/mails' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'User Management', icon: <Shield size={20} />, path: '/user-management', isBlue: true },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', isBlue: true }
    ];

    const handleStatusChange = (leadId: string, newStatus: string) => {
        updateLead(leadId, { status: newStatus });
        if (selectedLead?.id === leadId) {
            setSelectedLead({ ...selectedLead, status: newStatus });
        }
    };

    const handleDealValueChange = (leadId: string, newValue: string) => {
        const numericValue = parseInt(newValue.replace(/[^0-9]/g, '')) || 0;
        updateLead(leadId, { dealValue: numericValue });
        setEditingDealValueId(null);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const getPriorityColor = (priority: any) => {
        const p = safeRender(priority);
        switch (p) {
            case 'Urgent':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'High':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Medium':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Low':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredLeads = leads.filter(
        lead =>
            (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lead.industry && lead.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!dataset) {
        return (
            <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
                <aside className='w-60 h-full bg-[#f9fafb] border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40'>
                    <div className='absolute top-0 right-0 bottom-0 w-[2px] bg-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' />
                    <div className='p-6 flex items-center gap-2 mb-4'>
                        <img
                            src='/logos/full-crm-mattr.png'
                            alt='GreenCRM Logo'
                            className='h-8 w-auto'
                        />
                        <span className='text-xl font-bold tracking-tight text-gray-900'>GreenCRM</span>
                    </div>
                    <nav className='flex-1 px-4 space-y-1'>
                        <Link
                            to='/'
                            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all'
                        >
                            <Home
                                size={20}
                                className='text-gray-400'
                            />
                            <span>Home</span>
                        </Link>
                        <Link
                            to='/ai-command'
                            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#22c55e] text-white shadow-lg shadow-green-100 animate-glow-pulse'
                        >
                            <Sparkles
                                size={20}
                                className='text-white'
                            />
                            <span>AI Command Centre</span>
                        </Link>
                        <Link
                            to='/analytics'
                            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all'
                        >
                            <BarChart3
                                size={20}
                                className='text-gray-400'
                            />
                            <span>Analytics</span>
                        </Link>
                    </nav>
                </aside>

                <main className='flex-1 ml-60 flex flex-col items-center justify-center p-8 bg-gray-50/30'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-center max-w-md'
                    >
                        <div className='w-20 h-20 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center mx-auto mb-8'>
                            <Database className='w-10 h-10 text-[#22c55e]' />
                        </div>
                        <h2 className='text-3xl font-extrabold text-gray-900 mb-4'>No contacts available</h2>
                        <p className='text-gray-500 mb-10 leading-relaxed'>
                            Populate your dashboard with real intelligence to start managing your contacts.
                        </p>
                        <Link
                            to='/ai-command'
                            className='inline-flex items-center gap-3 px-8 py-4 bg-[#22c55e] text-white font-bold rounded-2xl hover:bg-[#16a34a] transition-all shadow-xl shadow-green-100 hover:-translate-y-1'
                        >
                            Go to AI Command Centre
                            <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
            <Sidebar activeNav={activeNav} />
            {/* --- MAIN WORKSPACE --- */}
            <main className='flex-1 ml-60 flex flex-col overflow-hidden bg-white'>
                {/* TOP TOOLBAR */}
                <header className='px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-6'>
                    <div className='flex-1 flex items-center gap-4 max-w-2xl'>
                        <div className='relative flex-1 group'>
                            <Search
                                className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors'
                                size={18}
                            />
                            <input
                                type='text'
                                placeholder='Search leads by name, company, email, phone or industry...'
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className='w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all'
                            />
                        </div>
                        {/* <button className='flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm'>
                            <FilterIcon size={16} />
                            Filters
                        </button> */}
                    </div>

                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className='flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] text-white rounded-2xl text-sm font-bold hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'
                        >
                            <Plus size={18} />
                            Add Lead
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div className='flex-1 flex overflow-hidden'>
                    {/* LEFT PANEL - LEADS TABLE (65%) */}
                    <section className='w-[65%] border-r border-gray-100 flex flex-col overflow-hidden'>
                        <div className='flex-1 overflow-auto custom-scrollbar'>
                            <table className='w-full border-collapse'>
                                <thead className='sticky top-0 bg-white z-10'>
                                    <tr className='border-b border-gray-100'>
                                        <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Contact Name
                                        </th>
                                        <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Company
                                        </th>
                                        <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Role
                                        </th>
                                        <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Status
                                        </th>
                                        <th className='px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Priority
                                        </th>
                                        <th className='px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white'>
                                            Deal Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-50'>
                                    {filteredLeads.map(lead => (
                                        <motion.tr
                                            key={lead.id}
                                            layoutId={`lead-${lead.id}`}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`group cursor-pointer transition-all ${selectedLead?.id === lead.id ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}
                                        >
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-8 h-8 rounded-lg bg-green-50 text-[#22c55e] flex items-center justify-center font-bold text-xs'>
                                                        {String(safeRender(lead.name))[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className='text-sm font-bold text-gray-900 group-hover:text-[#22c55e] transition-colors'>
                                                            {safeRender(lead.name)}
                                                        </p>
                                                        <p className='text-[10px] text-gray-400 font-medium truncate max-w-[120px]'>
                                                            {safeRender(lead.email)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <p className='text-xs font-semibold text-gray-700'>{safeRender(lead.company)}</p>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <p className='text-[11px] text-gray-500 font-medium'>{safeRender(lead.role)}</p>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <select
                                                    value={safeRender(lead.status) as string}
                                                    onChange={e => handleStatusChange(lead.id, e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    className='bg-transparent border-none text-[10px] font-bold text-blue-600 focus:ring-0 cursor-pointer p-0'
                                                >
                                                    <option>New Lead</option>
                                                    <option>Contacted</option>
                                                    <option>Meeting Scheduled</option>
                                                    <option>Demo Completed</option>
                                                    <option>Proposal Sent</option>
                                                    <option>Negotiation</option>
                                                    <option>Closed Won</option>
                                                    <option>Closed Lost</option>
                                                </select>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPriorityColor(lead.priority)}`}
                                                >
                                                    {safeRender(lead.priority)}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                {editingDealValueId === lead.id ? (
                                                    <input
                                                        autoFocus
                                                        defaultValue={lead.dealValue}
                                                        onBlur={e => handleDealValueChange(lead.id, e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter')
                                                                handleDealValueChange(
                                                                    lead.id,
                                                                    (e.target as HTMLInputElement).value
                                                                );
                                                            if (e.key === 'Escape') setEditingDealValueId(null);
                                                        }}
                                                        className='w-24 px-2 py-1 text-xs font-bold text-right bg-white border border-[#22c55e] rounded-lg focus:outline-none'
                                                    />
                                                ) : (
                                                    <p
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setEditingDealValueId(lead.id);
                                                        }}
                                                        className='text-xs font-bold text-gray-900 cursor-pointer hover:text-[#22c55e] transition-colors'
                                                    >
                                                        ${(Number(lead.dealValue) || 0).toLocaleString()}
                                                    </p>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* RIGHT PANEL - CONTACT DETAILS (35%) */}
                    <aside className='w-[35%] bg-[#fcfdfd] overflow-y-auto custom-scrollbar'>
                        <AnimatePresence mode='wait'>
                            {selectedLead ? (
                                <motion.div
                                    key={selectedLead.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className='p-8 space-y-8'
                                >
                                    {/* CONTACT PROFILE */}
                                    <div className='flex flex-col items-center text-center'>
                                        <div className='w-24 h-24 rounded-3xl bg-green-50 text-[#22c55e] flex items-center justify-center font-bold text-3xl mb-4 shadow-xl shadow-green-50 relative group'>
                                            {String(safeRender(selectedLead.name))[0] || 'U'}
                                            <button className='absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white text-[#22c55e] border border-gray-100 shadow-lg flex items-center justify-center hover:scale-110 transition-transform'>
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                        <h2 className='text-xl font-extrabold text-gray-900 mb-1'>
                                            {safeRender(selectedLead.name)}
                                        </h2>
                                        <p className='text-sm font-bold text-gray-400 mb-6 flex items-center gap-1'>
                                            {safeRender(selectedLead.role)} <span className='text-gray-300'>•</span>{' '}
                                            {safeRender(selectedLead.company)}
                                        </p>

                                        <div className='flex items-center gap-2 w-full max-w-[280px]'>
                                            <a
                                                href={`mailto:${safeRender(selectedLead.email)}`}
                                                className='flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all'
                                            >
                                                <Mail size={16} />
                                            </a>
                                            <a
                                                href={`tel:${safeRender(selectedLead.phone)}`}
                                                className='flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all'
                                            >
                                                <Phone size={16} />
                                            </a>
                                            <a
                                                href={safeRender(selectedLead.linkedIn)?.toString().startsWith('http') ? safeRender(selectedLead.linkedIn) as string : `https://${safeRender(selectedLead.linkedIn)}`}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 transition-all'
                                            >
                                                <Linkedin size={16} />
                                            </a>
                                        </div>
                                    </div>

                                    {/* QUICK ACTIONS */}
                                    <div className='grid grid-cols-2 gap-3'>
                                        <button className='flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#22c55e] text-white font-bold text-xs hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'>
                                            <Calendar size={14} />
                                            Schedule
                                        </button>
                                        <button className='flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all'>
                                            <PlusCircle size={14} />
                                            Add Task
                                        </button>
                                    </div>

                                    {/* LEAD INFORMATION */}
                                    <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4'>
                                        <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                            <Briefcase
                                                size={14}
                                                className='text-[#22c55e]'
                                            />
                                            Lead Information
                                        </h3>
                                        <div className='grid grid-cols-2 gap-y-4 gap-x-6'>
                                            <InfoField
                                                label='Industry'
                                                value={selectedLead.industry}
                                            />
                                            <InfoField
                                                label='Company Size'
                                                value={selectedLead.companySize}
                                            />
                                            <InfoField
                                                label='Deal Value'
                                                value={`$${(Number(selectedLead.dealValue) || 0).toLocaleString()}`}
                                            />
                                            <InfoField
                                                label='Lead Source'
                                                value={selectedLead.source}
                                            />
                                            <InfoField
                                                label='Assigned Owner'
                                                value={selectedLead.owner}
                                            />
                                        </div>
                                    </div>

                                    {/* NOTES SECTION */}
                                    <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4'>
                                        <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                            <Edit3
                                                size={14}
                                                className='text-blue-500'
                                            />
                                            Lead Notes
                                        </h3>
                                        <div className='relative group'>
                                            <textarea
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder='Write notes about the lead... e.g. Interested in enterprise pricing'
                                                className='w-full min-h-[100px] p-3 rounded-2xl bg-gray-50 border-none text-xs font-medium focus:ring-2 focus:ring-[#22c55e]/20 transition-all resize-none placeholder:text-gray-300'
                                            />
                                            <div className='absolute bottom-2 right-2 opacity-0 group-focus-within:opacity-100 transition-opacity'>
                                                <button className='px-3 py-1 rounded-lg bg-[#22c55e] text-white text-[10px] font-bold'>
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TASKS RELATED TO LEAD */}
                                    <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                                <CheckCircle2
                                                    size={14}
                                                    className='text-purple-500'
                                                />
                                                Upcoming Tasks
                                            </h3>
                                            <button className='text-[10px] font-bold text-[#22c55e] hover:underline'>
                                                View All
                                            </button>
                                        </div>
                                        <div className='space-y-3'>
                                            <TaskCard
                                                name='Follow-up call'
                                                deadline='Tomorrow, 10:00 AM'
                                                priority='High'
                                            />
                                            <TaskCard
                                                name='Send pricing sheet'
                                                deadline='Oct 24, 2023'
                                                priority='Medium'
                                            />
                                        </div>
                                    </div>

                                    {/* ACTIVITY TIMELINE */}
                                    <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4'>
                                        <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                            <Clock
                                                size={14}
                                                className='text-amber-500'
                                            />
                                            Activity Timeline
                                        </h3>
                                        <div className='relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100'>
                                            <TimelineItem
                                                date='Jan 12'
                                                event='Demo completed'
                                                icon={<TrendingUp size={10} />}
                                                color='bg-green-100 text-green-600'
                                            />
                                            <TimelineItem
                                                date='Jan 9'
                                                event='Meeting scheduled'
                                                icon={<Calendar size={10} />}
                                                color='bg-blue-100 text-blue-600'
                                            />
                                            <TimelineItem
                                                date='Jan 7'
                                                event='Email sent'
                                                icon={<Send size={10} />}
                                                color='bg-purple-100 text-purple-600'
                                            />
                                            <TimelineItem
                                                date='Jan 5'
                                                event='Lead created'
                                                icon={<Plus size={10} />}
                                                color='bg-gray-100 text-gray-600'
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className='h-full flex flex-col items-center justify-center p-8 text-center'>
                                    <div className='w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4'>
                                        <Users size={32} />
                                    </div>
                                    <h3 className='text-sm font-bold text-gray-900 mb-2'>No Lead Selected</h3>
                                    <p className='text-xs text-gray-400 leading-relaxed max-w-[200px]'>
                                        Select a lead from the list to view detailed contact information and activity.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </aside>
                </div>
            </main>

            {/* MODALS */}
            <AnimatePresence>
                {showAddModal && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm'
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className='relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8'
                        >
                            <div className='flex items-center justify-between mb-8'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2.5 rounded-2xl bg-green-50 text-[#22c55e]'>
                                        <Plus size={20} />
                                    </div>
                                    <h2 className='text-xl font-extrabold text-gray-900'>Add New Lead</h2>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className='p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors'
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                            Full Name
                                        </label>
                                        <input
                                            type='text'
                                            placeholder='e.g. John Doe'
                                            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                        />
                                    </div>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                            Company
                                        </label>
                                        <input
                                            type='text'
                                            placeholder='e.g. Acme Inc'
                                            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                            Email
                                        </label>
                                        <input
                                            type='email'
                                            placeholder='john@company.com'
                                            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                        />
                                    </div>
                                    <div className='space-y-1.5'>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                            Phone
                                        </label>
                                        <input
                                            type='text'
                                            placeholder='+1...'
                                            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                        />
                                    </div>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Smart Assist: Paste LinkedIn / Signature
                                    </label>
                                    <textarea
                                        placeholder='Paste details here to auto-fill...'
                                        className='w-full h-24 px-4 py-3 bg-green-50/30 border border-green-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none resize-none'
                                    />
                                    <p className='text-[10px] text-[#22c55e] font-bold flex items-center gap-1 mt-1'>
                                        <Sparkles size={10} /> Smart AI will extract details automatically
                                    </p>
                                </div>

                                <div className='flex gap-3 pt-4'>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className='flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button className='flex-1 py-3.5 rounded-2xl bg-[#22c55e] text-white font-bold text-sm hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'>
                                        Create Lead
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showImportModal && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowImportModal(false)}
                            className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm'
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className='relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8'
                        >
                            <div className='flex items-center justify-between mb-8'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2.5 rounded-2xl bg-blue-50 text-blue-500'>
                                        <Upload size={20} />
                                    </div>
                                    <h2 className='text-xl font-extrabold text-gray-900'>Import Leads</h2>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className='p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors'
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className='space-y-6'>
                                <div className='border-2 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer group'>
                                    <div className='w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-4'>
                                        <FileText size={32} />
                                    </div>
                                    <p className='text-sm font-bold text-gray-900 mb-1'>Click or drag CSV file</p>
                                    <p className='text-[10px] text-gray-400 font-medium'>Max file size: 10MB</p>
                                </div>

                                <div className='space-y-4'>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                        Supported Fields
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        {['Name', 'Company', 'Email', 'Phone', 'Role', 'Industry'].map(field => (
                                            <span
                                                key={field}
                                                className='px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-[10px] font-bold text-gray-600 shadow-sm'
                                            >
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className='flex gap-3 pt-4'>
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className='flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button className='flex-1 py-3.5 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-100'>
                                        Upload File
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5'>{label}</p>
        <p className='text-xs font-bold text-gray-700'>{value}</p>
    </div>
);

const TaskCard = ({ name, deadline, priority }: { name: string; deadline: string; priority: string }) => (
    <div className='p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group cursor-pointer flex items-center justify-between'>
        <div className='flex items-center gap-3'>
            <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                }`}
            >
                <Clock size={14} />
            </div>
            <div>
                <p className='text-[11px] font-bold text-gray-900 group-hover:text-[#22c55e] transition-colors'>
                    {name}
                </p>
                <p className='text-[9px] text-gray-400 font-medium'>{deadline}</p>
            </div>
        </div>
        <div className='flex items-center gap-2'>
            <span className={`w-2 h-2 rounded-full ${priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`} />
        </div>
    </div>
);

const TimelineItem = ({
    date,
    event,
    icon,
    color
}: {
    date: string;
    event: string;
    icon: React.ReactNode;
    color: string;
}) => (
    <div className='relative'>
        <div
            className={`absolute -left-[31px] top-0 w-6 h-6 rounded-lg ${color} flex items-center justify-center shadow-sm z-10`}
        >
            {icon}
        </div>
        <div className='flex flex-col'>
            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5'>{date}</p>
            <p className='text-xs font-bold text-gray-900'>{event}</p>
        </div>
    </div>
);

export default Leads;
