import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Plus,
    Search,
    Briefcase,
    Users,
    Building2,
    Shield,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle2,
    LayoutDashboard,
    Home,
    Sparkles,
    Mail,
    Settings,
    LogOut,
    Layers,
    TrendingUp,
    ArrowRight,
    ArrowUpRight,
    MessageSquare,
    Send,
    Trash2,
    X,
    BarChart3,
    Database,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { useDataset } from '@/context/DatasetContext';

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
    tasks: { id: string; title: string; deadline: string; priority: string; completed: boolean }[];
    activities: { id: string; type: string; description: string; date: string }[];
    deal_name?: string;
}

const STAGES = [
    'New Leads',
    'Contacted',
    'Meeting Scheduled',
    'Demo Completed',
    'Proposal Sent',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
];

const Deals: React.FC = () => {
    const navigate = useNavigate();
    const { dataset, leads, updateLead, deals, updateDeal } = useDataset();
    const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
    const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOwner, setFilterOwner] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [activeNav] = useState('Deals');

    // Sync leads to local deals state if needed, or just use leads as cards
    const dealCards = useMemo(() => {
        return leads.map(lead => {
            // Find extra deal info if it exists
            const dealInfo = deals.find(d => d.contactName.includes(lead.name));
            return {
                id: lead.id,
                contactName: lead.name,
                company: lead.company,
                value: lead.dealValue,
                priority: lead.priority as any,
                lastActivity: lead.lastActivity,
                expectedCloseDate:
                    dealInfo?.expectedCloseDate ||
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                stage: lead.status === 'New Lead' ? 'New Leads' : lead.status,
                owner: lead.owner,
                email: lead.email,
                phone: lead.phone,
                notes: dealInfo?.notes || [],
                tasks: dealInfo?.tasks || [],
                activities: dealInfo?.activities || [],
                deal_name: dealInfo?.deal_name || `${lead.name} Deal`
            };
        });
    }, [leads, deals]);

    const [draggingDealId, setDraggingDealId] = useState<string | null>(null);

    const sidebarLinks = [
        { name: 'Home', icon: <Home size={20} />, path: '/' },
        { name: 'AI Command Centre', icon: <Sparkles size={20} />, path: '/ai-command', isGlow: true },
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Contacts', icon: <Users size={20} />, path: '/leads' },
        { name: 'Master Table', icon: <Layers size={20} /> },
        { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
        { name: 'Mails', icon: <Mail size={20} />, path: '/mails' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'User Management', icon: <Shield size={20} />, path: '/user-management', isBlue: true },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', isBlue: true }
    ];

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const onDragStart = (e: React.DragEvent, dealId: string) => {
        setDraggingDealId(dealId);
        e.dataTransfer.setData('dealId', dealId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        if (dealId) {
            const newStatus = stage === 'New Leads' ? 'New Lead' : stage;
            updateLead(dealId, { status: newStatus, lastActivity: `Moved to ${stage}` });
            setDraggingDealId(null);
        }
    };

    const filteredDeals = dealCards.filter(deal => {
        const matchesSearch =
            deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.deal_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOwner = filterOwner === 'All' || deal.owner === filterOwner;
        const matchesPriority = filterPriority === 'All' || deal.priority === filterPriority;
        return matchesSearch && matchesOwner && matchesPriority;
    });

    const getStageDeals = (stage: string) => filteredDeals.filter(deal => deal.stage === stage);

    const totalPipeline = dealCards.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const metrics = {
        totalPipeline,
        closingThisMonth: dealCards.filter(deal => {
            const closeDate = new Date(deal.expectedCloseDate);
            const now = new Date();
            return closeDate.getMonth() === now.getMonth() && closeDate.getFullYear() === now.getFullYear();
        }).length,
        // Calculated as a multiple of 2.4 of the pipeline value as per user request
        averageDealSize: totalPipeline * 2.4,
        conversionRate: 21
    };

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
                        <h2 className='text-3xl font-extrabold text-gray-900 mb-4'>No deals available</h2>
                        <p className='text-gray-500 mb-10 leading-relaxed'>
                            Populate your dashboard with real intelligence to start managing your pipeline.
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
            {/* MAIN CONTENT */}
            <main className='flex-1 ml-64 flex flex-col h-full bg-white relative overflow-hidden'>
                <header className='px-8 py-6 border-b border-gray-100 bg-white'>
                    <div className='flex items-center justify-between mb-8'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>Deals Pipeline</h1>
                            <p className='text-sm text-gray-500'>Visualize and manage your sales opportunities.</p>
                        </div>

                        <div className='flex items-center gap-4'>
                            <div className='relative group w-80'>
                                <Search
                                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors'
                                    size={18}
                                />
                                <input
                                    type='text'
                                    placeholder='Search deals...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className='w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all'
                                />
                            </div>

                            <div className='flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-200'>
                                <select
                                    value={filterOwner}
                                    onChange={e => setFilterOwner(e.target.value)}
                                    className='bg-transparent text-sm font-medium px-3 py-1.5 focus:outline-none border-r border-gray-200'
                                >
                                    <option value='All'>All Owners</option>
                                    <option value='Alex Johnson'>Alex Johnson</option>
                                    <option value='Sam Rivera'>Sam Rivera</option>
                                </select>
                                <select
                                    value={filterPriority}
                                    onChange={e => setFilterPriority(e.target.value)}
                                    className='bg-transparent text-sm font-medium px-3 py-1.5 focus:outline-none'
                                >
                                    <option value='All'>All Priority</option>
                                    <option value='High'>High</option>
                                    <option value='Medium'>Medium</option>
                                    <option value='Low'>Low</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setIsNewDealModalOpen(true)}
                                className='flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] text-white rounded-2xl font-bold text-sm hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'
                            >
                                <Plus size={18} />
                                New Deal
                            </button>
                        </div>
                    </div>

                    <div className='grid grid-cols-4 gap-6'>
                        <MetricCard
                            label='Pipeline Value (Expected Price Estimate)'
                            value={`$${metrics.totalPipeline.toLocaleString()}`}
                            icon={<DollarSign size={20} />}
                        />
                        <MetricCard
                            label='Closing This Month'
                            value={metrics.closingThisMonth.toString()}
                            icon={<Calendar size={20} />}
                        />
                        <MetricCard
                            label='Average Deal Size (2.4x Multiple of Pipeline)'
                            value={`$${Math.round(metrics.averageDealSize).toLocaleString()}`}
                            icon={<TrendingUp size={20} />}
                        />
                        <MetricCard
                            label='Conversion Rate'
                            value={`${metrics.conversionRate}%`}
                            icon={<ArrowUpRight size={20} />}
                        />
                    </div>
                </header>

                <div className='flex-1 overflow-x-auto overflow-y-hidden bg-[#f9fafb] p-8'>
                    <div className='flex h-full gap-6 min-w-max'>
                        {STAGES.map(stage => (
                            <div
                                key={stage}
                                onDragOver={onDragOver}
                                onDrop={e => onDrop(e, stage)}
                                className='w-80 flex flex-col h-full rounded-3xl bg-gray-100/50 border border-gray-200/50 p-4'
                            >
                                <div className='flex items-center justify-between mb-4 px-2'>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='font-bold text-gray-900 text-sm'>{stage}</h3>
                                        <span className='px-2 py-0.5 rounded-full bg-white text-gray-500 text-[10px] font-bold border border-gray-200'>
                                            {getStageDeals(stage).length}
                                        </span>
                                    </div>
                                    <button className='p-1 hover:bg-white rounded-lg transition-colors text-gray-400'>
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className='flex-1 overflow-y-auto custom-scrollbar space-y-3'>
                                    {getStageDeals(stage).map(deal => (
                                        <motion.div
                                            key={deal.id}
                                            layoutId={deal.id}
                                            draggable
                                            onDragStart={(e: any) => onDragStart(e, deal.id)}
                                            onClick={() => setSelectedDeal(deal)}
                                            className={`group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#22c55e]/30 transition-all cursor-grab active:cursor-grabbing ${draggingDealId === deal.id ? 'opacity-40' : ''}`}
                                        >
                                            <div className='flex items-start justify-between mb-3'>
                                                <div>
                                                    <h4 className='font-bold text-gray-900 text-sm group-hover:text-[#22c55e] transition-colors'>
                                                        {deal.deal_name || deal.contactName}
                                                    </h4>
                                                    <p className='text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5'>
                                                        <Building2 size={10} /> {deal.company}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase ${
                                                        deal.priority === 'High'
                                                            ? 'bg-red-50 text-red-600'
                                                            : deal.priority === 'Medium'
                                                              ? 'bg-amber-50 text-amber-600'
                                                              : 'bg-blue-50 text-blue-600'
                                                    }`}
                                                >
                                                    {deal.priority}
                                                </div>
                                            </div>

                                            <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-50'>
                                                <span className='text-xs font-bold text-gray-900'>
                                                    ${(deal.value || 0).toLocaleString()}
                                                </span>
                                                <div className='flex items-center gap-1 text-[10px] text-gray-400'>
                                                    <Clock size={10} />
                                                    {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>

                                            <div className='mt-2 flex items-center gap-1.5'>
                                                <div className='w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 border border-white'>
                                                    {deal.owner
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')}
                                                </div>
                                                <span className='text-[10px] text-gray-400 truncate'>
                                                    {deal.lastActivity}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {getStageDeals(stage).length === 0 && (
                                        <div className='h-20 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center'>
                                            <p className='text-[10px] text-gray-400 font-medium italic'>
                                                Drop deal here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAILS SIDE PANEL */}
                <AnimatePresence>
                    {selectedDeal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedDeal(null)}
                                className='fixed inset-0 bg-black/10 backdrop-blur-sm z-50'
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className='fixed right-0 top-0 bottom-0 w-[450px] bg-white shadow-2xl z-[60] flex flex-col'
                            >
                                <div className='p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0'>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-12 h-12 rounded-2xl bg-[#dcfce7] flex items-center justify-center text-[#22c55e]'>
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h2 className='text-lg font-bold text-gray-900'>
                                                {selectedDeal.deal_name || selectedDeal.contactName}
                                            </h2>
                                            <p className='text-sm text-gray-500'>{selectedDeal.company}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDeal(null)}
                                        className='p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400'
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className='flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='p-4 rounded-2xl bg-gray-50 border border-gray-100'>
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Deal Value
                                            </p>
                                            <p className='text-lg font-bold text-gray-900'>
                                                ${(selectedDeal.value || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className='p-4 rounded-2xl bg-gray-50 border border-gray-100'>
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Expected Close
                                            </p>
                                            <p className='text-lg font-bold text-gray-900'>
                                                {new Date(selectedDeal.expectedCloseDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className='p-4 rounded-2xl bg-gray-50 border border-gray-100'>
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Current Stage
                                            </p>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 rounded-full bg-[#22c55e]' />
                                                <span className='text-sm font-bold text-gray-900'>
                                                    {selectedDeal.stage}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='p-4 rounded-2xl bg-gray-50 border border-gray-100'>
                                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Priority
                                            </p>
                                            <span
                                                className={`text-sm font-bold ${
                                                    selectedDeal.priority === 'High'
                                                        ? 'text-red-600'
                                                        : selectedDeal.priority === 'Medium'
                                                          ? 'text-amber-600'
                                                          : 'text-blue-600'
                                                }`}
                                            >
                                                {selectedDeal.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <h3 className='text-sm font-bold text-gray-900 flex items-center gap-2'>
                                            <Users
                                                size={16}
                                                className='text-[#22c55e]'
                                            />
                                            Contact Information
                                        </h3>
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors'>
                                                <div className='flex items-center gap-3'>
                                                    <Mail
                                                        size={16}
                                                        className='text-gray-400'
                                                    />
                                                    <span className='text-sm text-gray-600'>{selectedDeal.email}</span>
                                                </div>
                                                <button className='text-[#22c55e] hover:underline text-[10px] font-bold uppercase'>
                                                    Send
                                                </button>
                                            </div>
                                            <div className='flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors'>
                                                <div className='flex items-center gap-3'>
                                                    <Clock
                                                        size={16}
                                                        className='text-gray-400'
                                                    />
                                                    <span className='text-sm text-gray-600'>{selectedDeal.phone}</span>
                                                </div>
                                                <button className='text-[#22c55e] hover:underline text-[10px] font-bold uppercase'>
                                                    Call
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <h3 className='text-sm font-bold text-gray-900 flex items-center gap-2'>
                                            <Activity
                                                size={16}
                                                className='text-[#22c55e]'
                                            />
                                            Related Activities
                                        </h3>
                                        <div className='relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100'>
                                            {selectedDeal.activities.map((activity: any) => (
                                                <div
                                                    key={activity.id}
                                                    className='relative'
                                                >
                                                    <div className='absolute -left-[1.65rem] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#22c55e]' />
                                                    <div className='flex flex-col'>
                                                        <div className='flex items-center justify-between mb-1'>
                                                            <span className='text-xs font-bold text-gray-900'>
                                                                {activity.type}
                                                            </span>
                                                            <span className='text-[10px] text-gray-400'>
                                                                {new Date(activity.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className='text-xs text-gray-500'>{activity.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-sm font-bold text-gray-900 flex items-center gap-2'>
                                                <CheckCircle2
                                                    size={16}
                                                    className='text-[#22c55e]'
                                                />
                                                Tasks and Next Steps
                                            </h3>
                                            <button className='text-[10px] font-bold text-[#22c55e] uppercase'>
                                                + Add Task
                                            </button>
                                        </div>
                                        <div className='space-y-2'>
                                            {selectedDeal.tasks.map((task: any) => (
                                                <div
                                                    key={task.id}
                                                    className='flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-[#22c55e]/30 transition-all group'
                                                >
                                                    <button className='w-5 h-5 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-[#22c55e] transition-colors'>
                                                        {task.completed && (
                                                            <CheckCircle2
                                                                size={12}
                                                                className='text-[#22c55e]'
                                                            />
                                                        )}
                                                    </button>
                                                    <div className='flex-1'>
                                                        <p className='text-xs font-bold text-gray-900'>{task.title}</p>
                                                        <p className='text-[10px] text-gray-400'>
                                                            Due: {new Date(task.deadline).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                            task.priority === 'High'
                                                                ? 'bg-red-50 text-red-600'
                                                                : 'bg-gray-50 text-gray-500'
                                                        }`}
                                                    >
                                                        {task.priority}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <h3 className='text-sm font-bold text-gray-900 flex items-center gap-2'>
                                            <MessageSquare
                                                size={16}
                                                className='text-[#22c55e]'
                                            />
                                            Notes Section
                                        </h3>
                                        <div className='space-y-3'>
                                            {selectedDeal.notes.map((note: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className='p-4 rounded-2xl bg-green-50/50 border border-green-100 text-xs text-gray-700 leading-relaxed italic'
                                                >
                                                    "{note}"
                                                </div>
                                            ))}
                                            <div className='relative'>
                                                <textarea
                                                    placeholder='Add a note...'
                                                    className='w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all resize-none min-h-[100px]'
                                                />
                                                <button className='absolute right-3 bottom-3 p-2 bg-[#22c55e] text-white rounded-xl hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'>
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3'>
                                    <button className='flex-1 py-3 bg-[#22c55e] text-white rounded-2xl font-bold text-sm hover:bg-[#16a34a] transition-all shadow-xl shadow-green-100'>
                                        Mark as Won
                                    </button>
                                    <button className='flex-1 py-3 bg-white border border-gray-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all'>
                                        Mark as Lost
                                    </button>
                                    <button className='p-3 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-gray-600 transition-all'>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* NEW DEAL MODAL */}
                <AnimatePresence>
                    {isNewDealModalOpen && (
                        <div className='fixed inset-0 z-[100] flex items-center justify-center p-6'>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsNewDealModalOpen(false)}
                                className='absolute inset-0 bg-black/30 backdrop-blur-sm'
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className='relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden'
                            >
                                <div className='p-8 border-b border-gray-100 flex items-center justify-between'>
                                    <div>
                                        <h2 className='text-2xl font-bold text-gray-900'>Create New Deal</h2>
                                        <p className='text-sm text-gray-500'>
                                            Enter details to start a new opportunity.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsNewDealModalOpen(false)}
                                        className='p-2 hover:bg-gray-100 rounded-full text-gray-400'
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className='p-8 space-y-6'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-2'>
                                            <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                                                Contact Name
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='e.g. John Doe'
                                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                                                Company
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='e.g. Acme Corp'
                                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                                            />
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-2'>
                                            <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                                                Deal Value ($)
                                            </label>
                                            <input
                                                type='number'
                                                placeholder='50000'
                                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                                                Expected Close
                                            </label>
                                            <input
                                                type='date'
                                                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                                            />
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                                            Initial Stage
                                        </label>
                                        <select className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 appearance-none'>
                                            {STAGES.map(s => (
                                                <option
                                                    key={s}
                                                    value={s}
                                                >
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className='p-8 bg-gray-50 flex items-center gap-4'>
                                    <button className='flex-1 py-4 bg-[#22c55e] text-white rounded-2xl font-bold text-base hover:bg-[#16a34a] transition-all shadow-xl shadow-green-100'>
                                        Create Deal
                                    </button>
                                    <button
                                        onClick={() => setIsNewDealModalOpen(false)}
                                        className='px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold text-base hover:bg-gray-100 transition-all'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className='p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group'>
        <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 rounded-xl bg-green-50 text-[#22c55e] transition-transform group-hover:scale-110'>
                {icon}
            </div>
            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{label}</p>
        </div>
        <p className='text-xl font-bold text-gray-900'>{value}</p>
    </div>
);

export default Deals;
