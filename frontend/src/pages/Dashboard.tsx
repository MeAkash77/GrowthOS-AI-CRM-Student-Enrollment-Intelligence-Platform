import React, { useState, useEffect } from 'react';
import { AiOutlineRobot } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Target,
    TrendingUp,
    Activity,
    BarChart3,
    Globe,
    Settings,
    Search,
    Sparkles,
    Send,
    Mail,
    ChevronRight,
    Plus,
    Calendar,
    Briefcase,
    Layers,
    PieChart as PieChartIcon,
    ArrowUpRight,
    CheckCircle2,
    MessageSquare,
    Bell,
    LogOut,
    Shield,
    Trophy,
    DollarSign,
    MapPin,
    Home,
    ArrowRight,
    Database
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    RadialBarChart,
    RadialBar,
    Legend,
    BarChart,
    Bar,
    XAxis
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { aiService } from '../services/ai.service';
import { useDataset } from '@/context/DatasetContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { dataset, companies, selectedCompanyIndex, setSelectedCompanyIndex } = useDataset();
    const [activeTab, setActiveTab] = useState('Emails');
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [aiInput, setAiInput] = useState('');
    const [isAiResponding, setIsAiResponding] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCompanySelector, setShowCompanySelector] = useState(false);

    const currentCompanyDataset = companies[selectedCompanyIndex] || dataset;

    const notifications = [
        { id: 1, text: 'New lead identified', detail: 'VP Data Infrastructure', type: 'lead', time: '2m ago' },
        { id: 2, text: 'Deal probability increased', detail: 'Updated to 35%', type: 'deal', time: '15m ago' },
        { id: 3, text: 'New activity logged', detail: 'Contact responded to email', type: 'activity', time: '1h ago' }
    ];

    useEffect(() => {
        if (!searchTerm.trim() || !currentCompanyDataset) {
            setSearchResults([]);
            return;
        }

        const query = searchTerm.toLowerCase();
        const results: any[] = [];

        // Account
        if (currentCompanyDataset.account?.name?.toLowerCase().includes(query)) {
            results.push({ type: 'Account', name: currentCompanyDataset.account.name, sectionId: 'account-section' });
        }

        // Contacts
        (currentCompanyDataset.contacts || []).forEach((contact: any) => {
            if (contact.name?.toLowerCase().includes(query)) {
                results.push({ type: 'Contact', name: contact.name, sectionId: 'contacts-section' });
            }
        });

        // Leads
        (currentCompanyDataset.leads || []).forEach((lead: any) => {
            if (lead.target_role?.toLowerCase().includes(query)) {
                results.push({ type: 'Lead', name: lead.target_role, sectionId: 'leads-section' });
            }
        });

        // Deals
        (currentCompanyDataset.deals || []).forEach((deal: any) => {
            if (deal.deal_name?.toLowerCase().includes(query)) {
                results.push({ type: 'Deal', name: deal.deal_name, sectionId: 'deals-section' });
            }
        });

        setSearchResults(results);
    }, [searchTerm, currentCompanyDataset]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // Adjusted scroll with offset for sticky header
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const userMessage = { role: 'user', content: aiInput };
        setChatMessages([...chatMessages, userMessage]);
        setAiInput('');
        setIsAiResponding(true);

        try {
            const response = await aiService.chat([...chatMessages, userMessage]);
            setChatMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('AI chat failed:', error);
        } finally {
            setIsAiResponding(false);
        }
    };

    // --- FALLBACK FOR NO DATASET ---
    if (!dataset) {
        return (
            <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
                <Sidebar activeNav="Dashboard" />

                <main className='flex-1 ml-60 flex flex-col items-center justify-center p-8 bg-gray-50/30'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-center max-w-md'
                    >
                        <div className='w-20 h-20 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center mx-auto mb-8'>
                            <Database className='w-10 h-10 text-[#22c55e]' />
                        </div>
                        <h2 className='text-3xl font-extrabold text-gray-900 mb-4'>No dataset loaded yet</h2>
                        <p className='text-gray-500 mb-10 leading-relaxed'>
                            Use the research tool to analyze a company and press <strong>"Move to Dashboard"</strong> to
                            populate your dashboard with real intelligence.
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

    // --- CHART DATA PREPARATION ---

    // Radial Chart: Deal Probability
    const dealProbData = (currentCompanyDataset.deals || []).map((deal: any, idx: number) => ({
        name: deal.deal_name,
        uv: deal.probability,
        fill: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'][idx % 5]
    }));

    // Pie Chart: Contact Influence
    const influenceData = [
        {
            name: 'High',
            value: (currentCompanyDataset.contacts || []).filter((c: any) => c.influence_level === 'High').length,
            color: '#22c55e'
        },
        {
            name: 'Medium',
            value: (currentCompanyDataset.contacts || []).filter((c: any) => c.influence_level === 'Medium').length,
            color: '#f59e0b'
        },
        {
            name: 'Low',
            value: (currentCompanyDataset.contacts || []).filter((c: any) => c.influence_level === 'Low').length,
            color: '#ef4444'
        }
    ].filter(d => d.value > 0);

    // Donut Chart: Lead Priority
    const leadPriorityData = [
        {
            name: 'High',
            value: (currentCompanyDataset.leads || []).filter((l: any) => l.priority === 'High').length,
            color: '#ef4444'
        },
        {
            name: 'Medium',
            value: (currentCompanyDataset.leads || []).filter((l: any) => l.priority === 'Medium').length,
            color: '#f59e0b'
        },
        {
            name: 'Low',
            value: (currentCompanyDataset.leads || []).filter((l: any) => l.priority === 'Low').length,
            color: '#22c55e'
        }
    ].filter(d => d.value > 0);

    // Pie Chart: Engagement Channel Breakdown
    const channelCounts: Record<string, number> = {};
    (currentCompanyDataset.interaction_history || []).forEach((int: any) => {
        channelCounts[int.channel] = (channelCounts[int.channel] || 0) + 1;
    });
    if (currentCompanyDataset.emails?.length)
        channelCounts['Email'] = (channelCounts['Email'] || 0) + currentCompanyDataset.emails.length;
    if (currentCompanyDataset.call_logs?.length)
        channelCounts['Phone'] = (channelCounts['Phone'] || 0) + currentCompanyDataset.call_logs.length;

    const channelData = Object.entries(channelCounts).map(([name, value], i) => ({
        name,
        value,
        color: ['#3b82f6', '#0077b5', '#22c55e', '#f59e0b', '#a855f7'][i % 5]
    }));

    const sidebarLinks = [
        // Top Section (Green)
        { name: 'Home', icon: <Home size={20} />, path: '/', textColor: 'text-green-500', hoverBg: 'hover:bg-green-500' },
        { name: 'AI Command Centre', icon: <Sparkles size={20} />, path: '/ai-command', textColor: 'text-green-500', hoverBg: 'hover:bg-green-500', isGlow: true },

        // Separator (Silver)
        { separator: true, color: 'border-gray-300', margin: 'my-2' },

        // Middle Section (Default)
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', textColor: 'text-gray-500', hoverBg: 'hover:bg-gray-500' },
        { name: 'Contacts', icon: <Users size={20} />, path: '/leads', textColor: 'text-gray-500', hoverBg: 'hover:bg-gray-500' },
        { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar', textColor: 'text-gray-500', hoverBg: 'hover:bg-gray-500' },
        { name: 'Mails', icon: <Mail size={20} />, path: '/mails', textColor: 'text-gray-500', hoverBg: 'hover:bg-gray-500' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals', textColor: 'text-gray-500', hoverBg: 'hover:bg-gray-500' },

        // Spacer to push remaining items to bottom
        { spacer: true },

        // Lower Section (Blue) - Now at bottom
        { separator: true, color: 'border-gray-500', margin: 'mt-auto mb-2' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics', textColor: 'text-blue-400', hoverBg: 'hover:bg-blue-400' },
        { name: 'User Management', icon: <Shield size={20} />, path: '/user-management', textColor: 'text-blue-400', hoverBg: 'hover:bg-blue-400' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', textColor: 'text-blue-400', hoverBg: 'hover:bg-blue-400' },
        // Separator (Silver)
        { separator: true, color: 'border-gray-300', margin: 'my-2' },
        // Logout (Red)
        { name: 'LogOut', icon: <LogOut size={20} />, path: '/logout', textColor: 'text-red-500', hoverBg: 'hover:bg-red-500', isLogout: true }
    ];

    const kpiCards = [
        {
            label: 'Account Value',
            value: currentCompanyDataset.ai_summary?.account_value || 'N/A',
            icon: <DollarSignIcon />,
            color: 'bg-green-500'
        },
        {
            label: 'Deal Potential',
            value: currentCompanyDataset.ai_summary?.deal_potential || 'N/A',
            icon: <TrendingUpIcon />,
            color: 'bg-blue-500'
        },
        {
            label: 'Buying Team Size',
            value: currentCompanyDataset.lead_discovery?.estimated_buying_team_size?.toString() || '0',
            icon: <UsersIcon />,
            color: 'bg-purple-500'
        },
        {
            label: 'Active Deals',
            value: (currentCompanyDataset.deals?.length || 0).toString(),
            icon: <BriefcaseIcon />,
            color: 'bg-amber-500'
        }
    ];

    return (
        <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
            <Sidebar activeNav={activeNav} />
            {/* --- MAIN WORKSPACE --- */}
            <main className='flex-1 ml-60 overflow-y-auto bg-white relative'>
                {/* TOP BAR / AI CONTEXT BAR */}
                <header className='sticky top-0 z-30 bg-white border-b border-gray-100 px-8 py-4'>
                    <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-4'>
                            <span className='px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider'>
                                {safeRender(dataset.metadata?.intent || 'Account Intelligence')}
                            </span>
                            <span className='text-[10px] text-gray-400 font-medium'>
                                {dataset.metadata?.timestamp
                                    ? new Date(dataset.metadata.timestamp).toLocaleString()
                                    : new Date().toLocaleString()}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-[10px] text-gray-400'>Generated by</span>
                            <span className='text-[10px] font-bold text-[#22c55e]'>
                                {safeRender(dataset.metadata?.generated_by || 'AI')}
                            </span>
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-8'>
                        <div className='flex flex-col max-w-[40%]'>
                            <h1 className='text-2xl font-bold text-gray-900 truncate'>
                                {safeRender(currentCompanyDataset.account?.name || 'Market Analysis')}
                            </h1>
                            {companies.length > 1 && (
                                <div className='relative mt-1'>
                                    <button
                                        onClick={() => setShowCompanySelector(!showCompanySelector)}
                                        className='flex items-center gap-1 text-base font-extrabold text-blue-600 hover:text-blue-700 transition-colors'
                                    >
                                        Switch Company ({selectedCompanyIndex + 1}/{companies.length})
                                        <ChevronRight
                                            size={18}
                                            className={`${showCompanySelector ? 'rotate-90' : ''} transition-transform`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {showCompanySelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className='absolute top-full left-0 mt-2 w-64 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 overflow-hidden py-2'
                                            >
                                                {companies.map((company, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedCompanyIndex(idx);
                                                            setShowCompanySelector(false);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                                            selectedCompanyIndex === idx
                                                                ? 'bg-blue-600 text-white font-bold'
                                                                : 'text-blue-700 hover:bg-blue-50 font-semibold'
                                                        }`}
                                                    >
                                                        {safeRender(company.account?.name || `Company ${idx + 1}`)}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className='flex-1 max-w-md relative'>
                            <div className='relative group'>
                                <Search
                                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors'
                                    size={18}
                                />
                                <input
                                    type='text'
                                    placeholder='Search accounts, contacts, leads or deals...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className='w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all'
                                />
                            </div>

                            {/* SEARCH RESULTS DROPDOWN */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden'
                                    >
                                        <div className='max-h-[300px] overflow-y-auto custom-scrollbar p-2'>
                                            {searchResults.map((result, idx) => (
                                                <button
                                                    key={`${result.type}-${idx}`}
                                                    onClick={() => scrollToSection(result.sectionId)}
                                                    className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all group text-left'
                                                >
                                                    <div className='flex flex-col'>
                                                        <span className='text-[10px] font-bold text-[#22c55e] uppercase tracking-widest mb-0.5'>
                                                            {result.type}
                                                        </span>
                                                        <span className='text-sm font-bold text-gray-900 group-hover:text-[#22c55e] transition-colors'>
                                                            {safeRender(result.name)}
                                                        </span>
                                                    </div>
                                                    <ArrowUpRight
                                                        size={14}
                                                        className='text-gray-300 group-hover:text-[#22c55e]'
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className='flex items-center gap-4'>
                            {/* NOTIFICATIONS */}
                            <div className='relative'>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-green-50 text-[#22c55e]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                >
                                    <Bell size={20} />
                                    <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white'></span>
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className='absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden'
                                        >
                                            <div className='p-4 border-b border-gray-50 flex items-center justify-between'>
                                                <h3 className='font-bold text-gray-900 text-sm'>Notifications</h3>
                                                <span className='text-[10px] font-bold text-[#22c55e] bg-green-50 px-2 py-0.5 rounded-full'>
                                                    3 New
                                                </span>
                                            </div>
                                            <div className='max-h-[350px] overflow-y-auto custom-scrollbar'>
                                                {notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className='p-4 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0 group cursor-pointer'
                                                    >
                                                        <div className='flex gap-3'>
                                                            <div
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                                    notif.type === 'lead'
                                                                        ? 'bg-blue-50 text-blue-500'
                                                                        : notif.type === 'deal'
                                                                          ? 'bg-amber-50 text-amber-500'
                                                                          : 'bg-green-50 text-[#22c55e]'
                                                                }`}
                                                            >
                                                                {notif.type === 'lead' ? (
                                                                    <UserCheck size={16} />
                                                                ) : notif.type === 'deal' ? (
                                                                    <Target size={16} />
                                                                ) : (
                                                                    <Activity size={16} />
                                                                )}
                                                            </div>
                                                            <div className='flex-1'>
                                                                <div className='flex items-center justify-between mb-0.5'>
                                                                    <p className='text-xs font-bold text-gray-900'>
                                                                        {notif.text}
                                                                    </p>
                                                                    <span className='text-[10px] text-gray-400'>
                                                                        {notif.time}
                                                                    </span>
                                                                </div>
                                                                <p className='text-[11px] text-gray-500 leading-tight'>
                                                                    • {notif.detail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='p-3 bg-gray-50 text-center'>
                                                <button className='text-[10px] font-bold text-gray-500 hover:text-[#22c55e] transition-colors'>
                                                    View all notifications
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className='flex -space-x-2'>
                                {(dataset.metadata?.data_sources || ['AI']).map((source: string, i: number) => {
                                    const renderedSource = String(safeRender(source));
                                    return (
                                        <div
                                            key={i}
                                            className='w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500'
                                            title={renderedSource}
                                        >
                                            {renderedSource[0] || '?'}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                <div className='p-8 space-y-8 max-w-[1600px] mx-auto'>
                    {/* ACCOUNT OVERVIEW (TOP) */}
                    <div
                        className='w-full'
                        id='account-section'
                    >
                        <div className='bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden'>
                            <div className='absolute top-0 right-0 w-96 h-96 bg-[#dcfce7]/30 rounded-full blur-3xl -mr-48 -mt-48' />
                            <div className='relative z-10 flex flex-col'>
                                <div className='flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8'>
                                    <div className='min-w-0 flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <h2 className='text-4xl font-extrabold text-gray-900 tracking-tight truncate'>
                                                {safeRender(currentCompanyDataset.account?.name || 'Company Name')}
                                            </h2>
                                            {currentCompanyDataset.account?.public_company && (
                                                <span className='px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 shrink-0'>
                                                    Public
                                                </span>
                                            )}
                                        </div>
                                        <div className='flex flex-wrap gap-2'>
                                            <span className='px-4 py-1.5 rounded-full bg-green-50 text-[#22c55e] text-sm font-bold border border-green-100'>
                                                {safeRender(currentCompanyDataset.account?.industry || 'Industry')}
                                            </span>
                                            <span className='px-4 py-1.5 rounded-full bg-gray-50 text-gray-600 text-sm font-bold border border-gray-100'>
                                                {safeRender(currentCompanyDataset.account?.market_segment || 'Market Segment')}
                                            </span>
                                            <span className='px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100'>
                                                {safeRender(currentCompanyDataset.account?.business_model || 'Business Model')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3 shrink-0'>
                                        {currentCompanyDataset.account?.website && (
                                            <a
                                                href={safeRender(currentCompanyDataset.account.website) as string}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='px-6 py-3 rounded-2xl bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100 flex items-center gap-2 font-bold text-sm'
                                            >
                                                <Globe size={18} />
                                                Visit Website
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <p className='text-lg text-gray-600 leading-relaxed mb-8 max-w-4xl whitespace-pre-wrap'>
                                    {safeRender(currentCompanyDataset.account?.description)}
                                </p>

                                <div className='grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-gray-50 mt-auto'>
                                    <AccountInfo
                                        label='Headquarters'
                                        value={currentCompanyDataset.account?.hq || 'N/A'}
                                        icon={<MapPinIcon />}
                                    />
                                    <AccountInfo
                                        label='Employees'
                                        value={currentCompanyDataset.account?.employee_count?.toLocaleString() || 'N/A'}
                                        icon={<UsersIcon />}
                                    />
                                    <AccountInfo
                                        label='Founded'
                                        value={currentCompanyDataset.account?.founded_year || 'N/A'}
                                        icon={<CalendarIcon />}
                                    />
                                    <AccountInfo
                                        label='Market Position'
                                        value={currentCompanyDataset.account?.market_positioning || 'N/A'}
                                        icon={<ShieldIcon />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ANALYTICS KPI CARDS */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch'>
                        {kpiCards.map((card, i) => (
                            <div
                                key={i}
                                className='bg-[#f9fafb] p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group'
                            >
                                <div className='flex items-start justify-between mb-4'>
                                    <div
                                        className={`p-2.5 rounded-xl ${card.color} text-white shadow-lg shadow-gray-200 transition-transform group-hover:scale-110`}
                                    >
                                        {card.icon}
                                    </div>
                                    <div className='flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded'>
                                        <ArrowUpRight size={10} /> 12%
                                    </div>
                                </div>
                                <div>
                                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1'>
                                        {card.label}
                                    </p>
                                    <p className='text-2xl font-bold text-gray-900 tracking-tight'>{safeRender(card.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ANALYTICS CHARTS ROW */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch'>
                        <div className='bg-[#f9fafb] p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col'>
                            <h3 className='text-sm font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <PieChartIcon
                                    size={16}
                                    className='text-[#22c55e]'
                                />
                                Deal Probability
                            </h3>
                            <div className='h-[260px] w-full relative'>
                                {dealProbData.length > 0 ? (
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <RadialBarChart
                                            cx='50%'
                                            cy='50%'
                                            innerRadius='20%'
                                            outerRadius='90%'
                                            barSize={10}
                                            data={dealProbData}
                                        >
                                            <RadialBar
                                                background
                                                dataKey='uv'
                                                cornerRadius={5}
                                            />
                                            <Legend
                                                iconSize={8}
                                                layout='vertical'
                                                verticalAlign='middle'
                                                align='right'
                                                wrapperStyle={{ fontSize: '10px' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-[10px] text-gray-400 italic'>
                                        No deals to display
                                    </div>
                                )}
                            </div>
                            <div className='mt-2 text-center'>
                                <span className='text-[10px] font-bold text-gray-400 uppercase'>
                                    Avg. Prob:{' '}
                                    {Math.round(
                                        dealProbData.reduce((acc: number, cur: any) => acc + (Number(cur.uv) || 0), 0) /
                                            (dealProbData.length || 1)
                                    )}
                                    %
                                </span>
                            </div>
                        </div>

                        <div className='bg-[#f9fafb] p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col'>
                            <h3 className='text-sm font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <Users
                                    size={16}
                                    className='text-blue-500'
                                />
                                Contact Influence
                            </h3>
                            <div className='h-[260px] w-full relative'>
                                {influenceData.length > 0 ? (
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <BarChart
                                            data={influenceData}
                                            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                                        >
                                            <XAxis
                                                dataKey='name'
                                                fontSize={10}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Bar
                                                dataKey='value'
                                                radius={[4, 4, 0, 0]}
                                            >
                                                {influenceData.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-[10px] text-gray-400 italic'>
                                        No contacts to display
                                    </div>
                                )}
                            </div>
                            <div className='flex justify-center gap-4 mt-2'>
                                {influenceData.map((item: any, i: number) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-1'
                                    >
                                        <div
                                            className='w-2 h-2 rounded-full'
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className='text-[10px] text-gray-500 font-medium'>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='bg-[#f9fafb] p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col'>
                            <h3 className='text-sm font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <Target
                                    size={16}
                                    className='text-red-500'
                                />
                                Lead Priority
                            </h3>
                            <div className='h-[260px] w-full relative'>
                                {leadPriorityData.length > 0 ? (
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <BarChart
                                            data={leadPriorityData}
                                            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                                        >
                                            <XAxis
                                                dataKey='name'
                                                fontSize={10}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Bar
                                                dataKey='value'
                                                radius={[4, 4, 0, 0]}
                                            >
                                                {leadPriorityData.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-[10px] text-gray-400 italic'>
                                        No leads to display
                                    </div>
                                )}
                            </div>
                            <div className='flex justify-center gap-4 mt-2'>
                                {leadPriorityData.map((item: any, i: number) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-1'
                                    >
                                        <div
                                            className='w-2 h-2 rounded-full'
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className='text-[10px] text-gray-500 font-medium'>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='bg-[#f9fafb] p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col'>
                            <h3 className='text-sm font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <TrendingUp
                                    size={16}
                                    className='text-purple-500'
                                />
                                Channels
                            </h3>
                            <div className='h-[260px] w-full relative'>
                                {channelData.length > 0 ? (
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <PieChart>
                                            <Pie
                                                data={channelData}
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey='value'
                                                stroke='none'
                                            >
                                                {channelData.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Legend
                                                iconSize={8}
                                                layout='horizontal'
                                                verticalAlign='bottom'
                                                align='center'
                                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='h-full flex items-center justify-center text-[10px] text-gray-400 italic'>
                                        No data to display
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-wrap justify-center gap-x-4 gap-y-1'>
                                {channelData.map((item: any, i: number) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-1'
                                    >
                                        <div
                                            className='w-2 h-2 rounded-full'
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className='text-[10px] text-gray-500 font-medium'>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ROW 1: DEALS & BUYING COMMITTEE */}
                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch'>
                        {/* DEALS PANEL */}
                        <div
                            className='bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col'
                            id='deals-section'
                        >
                            <div className='px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30'>
                                <div className='flex items-center gap-2'>
                                    <Trophy
                                        size={18}
                                        className='text-amber-500'
                                    />
                                    <h3 className='font-bold text-gray-900 text-sm'>Active Deals</h3>
                                </div>
                                <button className='text-[10px] font-bold text-[#22c55e] hover:underline flex items-center gap-1'>
                                    All <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className='overflow-x-auto flex-1'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-white text-left'>
                                            <th className='px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                Deal
                                            </th>
                                            <th className='px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                Stage
                                            </th>
                                            <th className='px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right'>
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-50'>
                                        {(currentCompanyDataset.deals || []).slice(0, 5).map((deal: any) => (
                                            <tr
                                                key={deal.deal_id}
                                                className='hover:bg-gray-50/50 transition-colors'
                                            >
                                                <td className='px-6 py-3'>
                                                    <p className='text-xs font-bold text-gray-900 truncate max-w-[150px]'>
                                                        {safeRender(deal.deal_name)}
                                                    </p>
                                                </td>
                                                <td className='px-6 py-3'>
                                                    <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-wider'>
                                                        {safeRender(deal.stage)}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-3 text-xs font-semibold text-gray-700 text-right'>
                                                    {deal.value_estimate
                                                        ? `$${(Number(deal.value_estimate) / 1000000).toFixed(1)}M`
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* BUYING COMMITTEE SECTION */}
                        <div
                            className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col'
                            id='contacts-section'
                        >
                            <div className='flex items-center justify-between mb-6'>
                                <div className='flex items-center gap-2'>
                                    <Users
                                        size={18}
                                        className='text-[#22c55e]'
                                    />
                                    <h3 className='font-bold text-gray-900 text-sm'>Buying Committee</h3>
                                </div>
                                <span className='text-[10px] font-bold text-gray-400'>
                                    {(currentCompanyDataset.contacts || []).length} Contacts
                                </span>
                            </div>
                            <div className='flex flex-col gap-4 flex-1'>
                                {(currentCompanyDataset.contacts || []).slice(0, 4).map((contact: any) => (
                                    <div
                                        key={contact.contact_id}
                                        className='flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#22c55e]/30 transition-all cursor-pointer group'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#22c55e] border border-gray-100 font-bold text-sm shrink-0 group-hover:scale-110 transition-transform'>
                                                {String(safeRender(contact.name))[0] || 'U'}
                                            </div>
                                            <div className='min-w-0'>
                                                <h4 className='text-sm font-bold text-gray-900 truncate'>
                                                    {safeRender(contact.name)}
                                                </h4>
                                                <p className='text-[11px] text-gray-400 truncate'>{safeRender(contact.role)}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-end gap-2'>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                    contact.influence_level === 'High'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                }`}
                                            >
                                                {safeRender(contact.influence_level)} Influence
                                            </span>
                                            <div className='w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                                                <div
                                                    className='h-full bg-[#22c55e]'
                                                    style={{ width: `${Number(contact.lead_score) || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: PRODUCT ECOSYSTEM, MARKET & ECOSYSTEM, ENGAGEMENT */}
                    <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                        {/* PRODUCT ECOSYSTEM */}
                        <div className='flex flex-col gap-6'>
                            <div className='bg-[#f9fafb] p-6 rounded-3xl border border-gray-100 shadow-sm flex-1'>
                                <h3 className='font-bold text-gray-900 mb-6 flex items-center gap-2'>
                                    <Sparkles
                                        size={18}
                                        className='text-[#22c55e]'
                                    />
                                    Product Intelligence
                                </h3>
                                <div className='space-y-6'>
                                    <div>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                            Key Products
                                        </p>
                                        <div className='flex flex-wrap gap-2'>
                                            {(currentCompanyDataset.products || []).map((p: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className='px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-semibold text-gray-700 shadow-sm'
                                                >
                                                    {safeRender(p)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                            Tech Stack
                                        </p>
                                        <div className='flex flex-wrap gap-2'>
                                            {(currentCompanyDataset.tech_stack || []).map((t: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className='px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-semibold text-gray-700 shadow-sm'
                                                >
                                                    {safeRender(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TARGET LEADS - integrated here */}
                            <div
                                className='bg-[#f9fafb] p-6 rounded-3xl border border-gray-100 shadow-sm'
                                id='leads-section'
                            >
                                <div className='flex items-center gap-2 mb-4'>
                                    <Target
                                        size={18}
                                        className='text-red-500'
                                    />
                                    <h3 className='font-bold text-gray-900'>Priority Leads</h3>
                                </div>
                                <div className='space-y-3'>
                                    {(currentCompanyDataset.leads || []).slice(0, 2).map((lead: any) => (
                                        <div
                                            key={lead.lead_id}
                                            className='p-4 rounded-2xl bg-white border border-gray-100 relative overflow-hidden'
                                        >
                                            <div
                                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                    lead.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'
                                                }`}
                                            />
                                            <h4 className='text-sm font-bold text-gray-900 mb-1'>{safeRender(lead.target_role)}</h4>
                                            <p className='text-[10px] text-gray-500 line-clamp-2'>{safeRender(lead.reason)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* MARKET & ECOSYSTEM */}
                        <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col'>
                            <h3 className='text-sm font-bold text-gray-900 mb-6 flex items-center gap-2'>
                                <Globe
                                    size={18}
                                    className='text-blue-500'
                                />
                                Market Intelligence
                            </h3>
                            <div className='space-y-6 flex-1'>
                                <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                        Trends & Dynamics
                                    </p>
                                    <ul className='space-y-3'>
                                        {(currentCompanyDataset.market_analysis?.market_trends || [])
                                            .slice(0, 3)
                                            .map((t: any, i: number) => (
                                                <li
                                                    key={i}
                                                    className='text-xs font-medium text-gray-700 flex items-start gap-2'
                                                >
                                                    <CheckCircle2
                                                        size={14}
                                                        className='text-[#22c55e] shrink-0 mt-0.5'
                                                    />{' '}
                                                    {safeRender(t)}
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                        Funding Profile
                                    </p>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='p-3 bg-blue-50 rounded-xl border border-blue-100'>
                                            <p className='text-[9px] font-bold text-blue-400 uppercase mb-0.5'>
                                                Total Raised
                                            </p>
                                            <p className='text-sm font-extrabold text-blue-700'>
                                                {safeRender(currentCompanyDataset.funding?.total_raised || 'N/A')}
                                            </p>
                                        </div>
                                        <div className='p-3 bg-purple-50 rounded-xl border border-purple-100'>
                                            <p className='text-[9px] font-bold text-purple-400 uppercase mb-0.5'>
                                                Last Round
                                            </p>
                                            <p className='text-sm font-extrabold text-purple-700'>
                                                {safeRender(currentCompanyDataset.funding?.last_round || 'N/A')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='pt-4 border-t border-gray-50 mt-auto'>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                                        Key Competitors
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        {(
                                            currentCompanyDataset.market_analysis?.competitor_landscape ||
                                            currentCompanyDataset.competitors ||
                                            []
                                        )
                                            .slice(0, 4)
                                            .map((c: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className='px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold'
                                                >
                                                    {safeRender(c)}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ENGAGEMENT & TIMELINE */}
                        <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col'>
                            <div className='flex items-center gap-2 mb-6'>
                                <MessageSquare
                                    size={18}
                                    className='text-purple-500'
                                />
                                <h3 className='font-bold text-gray-900 text-sm'>Engagement Activity</h3>
                            </div>
                            <div className='flex gap-1 mb-6 p-1 bg-gray-50 rounded-2xl'>
                                {['Emails', 'Calls'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                            activeTab === tab
                                                ? 'bg-white text-[#22c55e] shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className='space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-1'>
                                {activeTab === 'Emails' &&
                                    (currentCompanyDataset.emails || []).slice(0, 4).map((email: any) => (
                                        <div
                                            key={email.email_id}
                                            className='p-4 rounded-2xl border border-gray-50 bg-[#f9fafb]'
                                        >
                                            <div className='flex items-center justify-between mb-2'>
                                                <span className='text-[8px] font-bold text-blue-500 uppercase'>
                                                    {safeRender(email.direction)}
                                                </span>
                                                <span className='text-[8px] text-gray-400 font-medium'>
                                                    {email.timestamp
                                                        ? new Date(email.timestamp).toLocaleDateString()
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <p className='text-xs font-bold text-gray-900 truncate mb-1'>
                                                {safeRender(email.subject)}
                                            </p>
                                            <p className='text-[10px] text-gray-600 line-clamp-2'>{safeRender(email.summary)}</p>
                                        </div>
                                    ))}
                                {activeTab === 'Calls' &&
                                    (currentCompanyDataset.call_logs || []).slice(0, 4).map((call: any) => (
                                        <div
                                            key={call.call_id}
                                            className='p-4 rounded-2xl border border-gray-50 bg-[#f9fafb]'
                                        >
                                            <div className='flex items-center justify-between mb-2'>
                                                <span className='text-[8px] font-bold text-[#22c55e] uppercase'>
                                                    {safeRender(call.outcome)}
                                                </span>
                                                <span className='text-[8px] text-gray-400 font-medium'>
                                                    {Math.floor(Number(call.duration_seconds || 0) / 60)}m{' '}
                                                    {Number(call.duration_seconds || 0) % 60}s
                                                </span>
                                            </div>
                                            <p className='text-xs font-bold text-gray-900 mb-1'>
                                                Call with {safeRender(call.contact)}
                                            </p>
                                            <p className='text-[10px] text-gray-600 italic line-clamp-2'>
                                                "{safeRender(call.notes)}"
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* INSIGHTS FOOTER SECTION */}
                    <div className='bg-[#f9fafb] p-8 rounded-3xl border border-gray-100 shadow-sm'>
                        <div className='flex flex-col md:flex-row gap-12'>
                            <div className='flex-1'>
                                <h3 className='text-sm font-bold text-gray-900 mb-6 flex items-center gap-2'>
                                    <Target
                                        size={18}
                                        className='text-[#22c55e]'
                                    />
                                    Sales Strategy Insights
                                </h3>
                                <div className='p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group'>
                                    <div className='absolute top-0 left-0 w-1 h-full bg-[#22c55e]' />
                                    <p className='text-[10px] font-bold text-[#22c55e] uppercase tracking-widest mb-3'>
                                        AI Recommendation
                                    </p>
                                    <p className='text-base text-gray-700 leading-relaxed font-semibold italic'>
                                        "{safeRender(currentCompanyDataset.sales_insights?.suggested_pitch)}"
                                    </p>
                                    <div className='mt-6 flex flex-wrap gap-2'>
                                        {(currentCompanyDataset.sales_insights?.opportunities || [])
                                            .slice(0, 3)
                                            .map((o: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className='px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100'
                                                >
                                                    {safeRender(o)}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                            <div className='w-full md:w-80'>
                                <div className='bg-[#22c55e] p-6 rounded-2xl text-white shadow-xl shadow-green-100 h-full flex flex-col justify-between'>
                                    <div>
                                        <h4 className='text-sm font-bold mb-2'>Next Recommended Step</h4>
                                        <p className='text-xs text-green-50 leading-relaxed opacity-90'>
                                            {safeRender(currentCompanyDataset.ai_summary?.recommended_next_step ||
                                                'Analyze stakeholders and initiate personalized outreach.')}
                                        </p>
                                    </div>
                                    <button className='mt-6 w-full py-3 bg-white text-[#22c55e] rounded-xl text-xs font-bold hover:bg-green-50 transition-all flex items-center justify-center gap-2'>
                                        Execute Outreach <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FLOATING AI BUTTON & PANEL --- */}
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-3xl px-4'>
                    <AnimatePresence>
                        {isAiPanelOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className='w-full bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/50 flex flex-col overflow-hidden max-h-[450px]'
                            >
                                <div className='p-5 border-b border-gray-200/20 bg-white/10 flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='p-1.5 rounded-lg bg-white/20 text-gray-700'>
                                            <Sparkles size={16} />
                                        </div>
                                        <h2 className='text-base font-bold text-gray-800 tracking-tight'>
                                            AI Insights Explorer
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsAiPanelOpen(false)}
                                        className='p-1 rounded-full hover:bg-black/5 text-gray-400 transition-colors'
                                    >
                                        <Plus
                                            size={20}
                                            className='rotate-45'
                                        />
                                    </button>
                                </div>

                                <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[200px]'>
                                    {chatMessages.length === 0 && (
                                        <div className='h-full flex flex-col items-center justify-center text-center p-6 py-8'>
                                            <div className='w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center text-gray-300 mb-4'>
                                                <MessageSquare size={32} />
                                            </div>
                                            <p className='text-sm font-bold text-gray-700 mb-2'>
                                                Deep Intelligence Workspace
                                            </p>
                                            <p className='text-xs text-gray-500 leading-relaxed max-w-sm'>
                                                Ask anything about this account, leads, deals, or market strategy for
                                                instant AI-powered insights.
                                            </p>
                                        </div>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                                                    msg.role === 'user'
                                                        ? 'bg-gray-900 text-white font-medium shadow-lg'
                                                        : 'bg-white/60 text-gray-800 border border-white/40 shadow-sm'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiResponding && (
                                        <div className='flex justify-start'>
                                            <div className='bg-white/40 p-3 rounded-2xl border border-white/40 flex items-center gap-2'>
                                                <div className='flex gap-1'>
                                                    <div
                                                        className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                                                        style={{ animationDelay: '0ms' }}
                                                    />
                                                    <div
                                                        className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                                                        style={{ animationDelay: '150ms' }}
                                                    />
                                                    <div
                                                        className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                                                        style={{ animationDelay: '300ms' }}
                                                    />
                                                </div>
                                                <span className='text-[10px] font-bold text-gray-400 uppercase'>
                                                    Analyzing...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='p-5 bg-white/10 border-t border-gray-200/20'>
                                    <form
                                        onSubmit={handleAiSubmit}
                                        className='relative'
                                    >
                                        <div className='relative bg-white/60 rounded-3xl border border-white/80 shadow-inner focus-within:ring-2 focus-within:ring-[#22c55e]/20 transition-all overflow-hidden flex items-center p-1.5'>
                                            <textarea
                                                value={aiInput}
                                                onChange={e => setAiInput(e.target.value)}
                                                placeholder='Ask anything about this account...'
                                                className='flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-800 px-4 py-3 resize-none max-h-24 min-h-[50px] placeholder:text-gray-400'
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAiSubmit(e);
                                                    }
                                                }}
                                            />
                                            <button
                                                type='submit'
                                                disabled={isAiResponding || !aiInput.trim()}
                                                className='ml-2 w-12 h-12 rounded-2xl bg-gray-900 text-white hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center shrink-0 shadow-lg'
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                    onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                    className="
                        relative flex items-center justify-center
                        w-16 h-16
                        bg-[#1a0b2e]
                        backdrop-blur-lg
                        border border-[#00f2ff]/50
                        rounded-full
                        shadow-[0_0_20px_rgba(0,242,255,0.3)]
                        hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]
                        hover:border-[#00f2ff]/70
                        active:scale-95
                        transition-all
                    "
                    >
                    <Sparkles
                        size={28}
                        className="text-[#00f2ff] drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]"
                    />
                    </button>
                </div>
            </main>
        </div>
    );
};

// --- HELPER COMPONENTS ---

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

const AccountInfo = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
    <div className='space-y-1'>
        <div className='flex items-center gap-1.5 text-gray-400 mb-1'>
            <span className='text-[#22c55e]'>{icon}</span>
            <span className='text-[10px] font-bold uppercase tracking-widest'>{label}</span>
        </div>
        <p className='text-sm font-bold text-gray-900 truncate'>{safeRender(value)}</p>
    </div>
);

const EcosystemInfo = ({ label, value }: { label: string; value: any }) => (
    <div>
        <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5'>{label}</p>
        <p className='text-xs font-bold text-gray-800'>{safeRender(value)}</p>
    </div>
);

// --- SIMPLE ICON WRAPPERS TO AVOID IMPORT ISSUES ---
const DollarSignIcon = () => <DollarSign size={20} />;
const TrendingUpIcon = () => <TrendingUp size={20} />;
const UsersIcon = () => <Users size={20} />;
const BriefcaseIcon = () => <Briefcase size={20} />;
const MapPinIcon = () => <MapPin size={16} />;
const CalendarIcon = () => <Calendar size={16} />;
const ShieldIcon = () => <Shield size={16} />;

export default Dashboard;
