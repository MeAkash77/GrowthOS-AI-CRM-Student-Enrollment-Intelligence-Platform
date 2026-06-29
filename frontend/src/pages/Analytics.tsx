import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    BarChart3,
    Calendar,
    Users,
    Target,
    TrendingUp,
    Shield,
    Mail,
    Download,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    LayoutDashboard,
    Home,
    Sparkles,
    Briefcase,
    Settings,
    LogOut,
    Layers,
    Search,
    MoreVertical,
    DollarSign
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LineChart,
    Line,
    FunnelChart,
    Funnel,
    LabelList
} from 'recharts';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';

// --- MOCK DATA ---
const KPI_DATA = [
    { label: 'Total Leads', value: '1,248', change: '+12.5%', trend: 'up' },
    { label: 'New Leads This Month', value: '+184', change: '+5.2%', trend: 'up' },
    { label: 'Total Deals in Pipeline', value: '96', change: '-2.1%', trend: 'down' },
    { label: 'Total Revenue in Pipeline', value: '$420,000', change: '+8.4%', trend: 'up' },
    { label: 'Closed Deals This Month', value: '18', change: '+15.0%', trend: 'up' },
    { label: 'Conversion Rate', value: '23%', change: '+3.1%', trend: 'up' }
];

const PIPELINE_DATA = [
    { value: 1248, name: 'New Leads', fill: '#f0fdf4' },
    { value: 840, name: 'Contacted', fill: '#dcfce7' },
    { value: 420, name: 'Meeting Scheduled', fill: '#bbf7d0' },
    { value: 210, name: 'Demo Completed', fill: '#86efac' },
    { value: 105, name: 'Proposal Sent', fill: '#4ade80' },
    { value: 52, name: 'Negotiation', fill: '#22c55e' },
    { value: 18, name: 'Closed Won', fill: '#16a34a' }
];

const CONVERSION_TREND_DATA = [
    { date: 'Mar 01', newLeads: 45, qualified: 20, converted: 5 },
    { date: 'Mar 05', newLeads: 52, qualified: 25, converted: 8 },
    { date: 'Mar 10', newLeads: 48, qualified: 22, converted: 6 },
    { date: 'Mar 15', newLeads: 61, qualified: 30, converted: 12 },
    { date: 'Mar 20', newLeads: 55, qualified: 28, converted: 9 },
    { date: 'Mar 25', newLeads: 70, qualified: 35, converted: 15 },
    { date: 'Mar 30', newLeads: 65, qualified: 32, converted: 14 }
];

const EMAIL_METRICS = [
    { label: 'Emails Sent', value: '840' },
    { label: 'Open Rate', value: '47%' },
    { label: 'Reply Rate', value: '19%' },
    { label: 'Follow-up Rate', value: '32%' }
];

const ACTIVITY_METRICS = [
    { name: 'Meetings', value: 42 },
    { name: 'Calls', value: 128 },
    { name: 'Tasks', value: 256 }
];

const REVENUE_FORECAST_DATA = [
    { month: 'Current Month', expected: 85000, actual: 78000 },
    { month: 'Next Month', expected: 120000 },
    { month: 'Next Quarter', expected: 380000 }
];

const PERFORMANCE_TABLE_DATA = [
    { rep: 'Sarah Johnson', leads: 42, won: 9, revenue: 180000, conversion: 21, avgDeal: 20000, avatar: 'SJ' },
    { rep: 'Michael Chen', leads: 38, won: 7, revenue: 145000, conversion: 18, avgDeal: 20700, avatar: 'MC' },
    { rep: 'Emily Davis', leads: 51, won: 12, revenue: 240000, conversion: 24, avgDeal: 20000, avatar: 'ED' },
    { rep: 'Alex Rivera', leads: 45, won: 8, revenue: 160000, conversion: 18, avgDeal: 20000, avatar: 'AR' },
    { rep: 'Jessica Wu', leads: 29, won: 5, revenue: 95000, conversion: 17, avgDeal: 19000, avatar: 'JW' }
];

const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const [activeNav] = useState('Analytics');
    const [dateRange, setDateRange] = useState('Last 30 days');

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const sidebarLinks = [
        { name: 'Home', icon: <Home size={20} />, path: '/' },
        { name: 'AI Command Centre', icon: <Sparkles size={20} />, path: '/ai-command', isGlow: true },
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Contacts', icon: <Users size={20} />, path: '/leads' },
        { name: 'Master Table', icon: <Layers size={20} /> },
        { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
        { name: 'Mails', icon: <Mail size={20} />, path: '/mails' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, active: true },
        { name: 'User Management', icon: <Shield size={20} />, path: '/user-management', isBlue: true },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', isBlue: true }
    ];

    return (
        <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
            <Sidebar activeNav={activeNav} />
            {/* --- MAIN WORKSPACE --- */}
            <main className='flex-1 ml-60 overflow-y-auto bg-white p-8 custom-scrollbar relative'>
                {/* TOP HEADER & FILTER BAR */}
                <header className='mb-10'>
                    <div className='flex items-center justify-between mb-8'>
                        <div>
                            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                                Reporting & Analytics
                            </h1>
                            <p className='text-gray-500 mt-1'>
                                Monitor sales performance, lead conversion, and business growth.
                            </p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <button className='flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm group'>
                                <Download
                                    size={18}
                                    className='group-hover:text-[#22c55e]'
                                />
                                Export Report
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                        <div className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-[#22c55e]/30 transition-all'>
                            <Calendar
                                size={16}
                                className='text-[#22c55e]'
                            />
                            <span className='text-sm font-semibold text-gray-700'>{dateRange}</span>
                            <ChevronDown
                                size={14}
                                className='text-gray-400'
                            />
                        </div>

                        <div className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-[#22c55e]/30 transition-all'>
                            <Users
                                size={16}
                                className='text-blue-500'
                            />
                            <span className='text-sm font-semibold text-gray-700'>All Team Members</span>
                            <ChevronDown
                                size={14}
                                className='text-gray-400'
                            />
                        </div>

                        <div className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-[#22c55e]/30 transition-all'>
                            <Target
                                size={16}
                                className='text-red-500'
                            />
                            <span className='text-sm font-semibold text-gray-700'>All Lead Sources</span>
                            <ChevronDown
                                size={14}
                                className='text-gray-400'
                            />
                        </div>

                        <div className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-[#22c55e]/30 transition-all'>
                            <Briefcase
                                size={16}
                                className='text-amber-500'
                            />
                            <span className='text-sm font-semibold text-gray-700'>All Deal Stages</span>
                            <ChevronDown
                                size={14}
                                className='text-gray-400'
                            />
                        </div>

                        <div className='flex-1' />

                        <div className='flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-3 py-2 rounded-xl border border-gray-100'>
                            <Activity
                                size={12}
                                className='text-[#22c55e]'
                            />
                            Real-time data
                        </div>
                    </div>
                </header>

                {/* KEY METRICS OVERVIEW */}
                <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10'>
                    {KPI_DATA.map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'
                        >
                            <div className='absolute top-0 right-0 w-16 h-16 bg-[#dcfce7]/20 rounded-bl-[2rem] -mr-8 -mt-8 group-hover:bg-[#dcfce7]/40 transition-colors' />
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate pr-4'>
                                {kpi.label}
                            </p>
                            <h3 className='text-2xl font-black text-gray-900 tracking-tight mb-2'>{kpi.value}</h3>
                            <div
                                className={`flex items-center gap-1 text-[10px] font-bold ${kpi.trend === 'up' ? 'text-[#22c55e]' : 'text-red-500'}`}
                            >
                                {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {kpi.change}
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* ANALYTICS CHARTS GRID */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10'>
                    {/* SALES PIPELINE ANALYTICS */}
                    <section className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col'>
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-green-50 text-[#22c55e] rounded-xl'>
                                    <Layers size={20} />
                                </div>
                                <h3 className='font-bold text-gray-900'>Sales Pipeline Analytics</h3>
                            </div>
                            <button className='text-[10px] font-bold text-[#22c55e] uppercase tracking-widest hover:underline'>
                                View Pipeline
                            </button>
                        </div>

                        <div className='flex-1 min-h-[400px] flex items-center justify-center'>
                            <ResponsiveContainer
                                width='100%'
                                height='100%'
                            >
                                <FunnelChart>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Funnel
                                        data={PIPELINE_DATA}
                                        dataKey='value'
                                        nameKey='name'
                                    >
                                        <LabelList
                                            position='right'
                                            fill='#6B7280'
                                            stroke='none'
                                            dataKey='name'
                                            fontSize={11}
                                            fontWeight={600}
                                        />
                                        <LabelList
                                            position='center'
                                            fill='#111827'
                                            stroke='none'
                                            dataKey='value'
                                            fontSize={12}
                                            fontWeight={800}
                                        />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                            <span>Stage Drop-off Analysis</span>
                            <span className='text-[#22c55e]'>Avg. Velocity: 14 days</span>
                        </div>
                    </section>

                    {/* LEAD CONVERSION ANALYTICS */}
                    <section className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col'>
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-blue-50 text-blue-500 rounded-xl'>
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className='font-bold text-gray-900'>Lead Conversion Trend</h3>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-1.5'>
                                    <div className='w-2 h-2 rounded-full bg-[#22c55e]' />
                                    <span className='text-[10px] font-bold text-gray-500 uppercase'>New</span>
                                </div>
                                <div className='flex items-center gap-1.5'>
                                    <div className='w-2 h-2 rounded-full bg-blue-400' />
                                    <span className='text-[10px] font-bold text-gray-500 uppercase'>Qualified</span>
                                </div>
                            </div>
                        </div>

                        <div className='flex-1 min-h-[400px]'>
                            <ResponsiveContainer
                                width='100%'
                                height='100%'
                            >
                                <AreaChart
                                    data={CONVERSION_TREND_DATA}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient
                                            id='colorNew'
                                            x1='0'
                                            y1='0'
                                            x2='0'
                                            y2='1'
                                        >
                                            <stop
                                                offset='5%'
                                                stopColor='#22c55e'
                                                stopOpacity={0.1}
                                            />
                                            <stop
                                                offset='95%'
                                                stopColor='#22c55e'
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id='colorQualified'
                                            x1='0'
                                            y1='0'
                                            x2='0'
                                            y2='1'
                                        >
                                            <stop
                                                offset='5%'
                                                stopColor='#3b82f6'
                                                stopOpacity={0.1}
                                            />
                                            <stop
                                                offset='95%'
                                                stopColor='#3b82f6'
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray='3 3'
                                        vertical={false}
                                        stroke='#F3F4F6'
                                    />
                                    <XAxis
                                        dataKey='date'
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='newLeads'
                                        stroke='#22c55e'
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill='url(#colorNew)'
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='qualified'
                                        stroke='#3b82f6'
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill='url(#colorQualified)'
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='mt-6 pt-6 border-t border-gray-50 text-center'>
                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                                Conversion trend is up <span className='text-[#22c55e]'>14.2%</span> compared to last
                                month
                            </p>
                        </div>
                    </section>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10'>
                    {/* EMAIL AND ACTIVITY ANALYTICS */}
                    <section className='lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm'>
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-purple-50 text-purple-500 rounded-xl'>
                                    <Mail size={20} />
                                </div>
                                <h3 className='font-bold text-gray-900'>Email and Activity Analytics</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                    Active Channels
                                </span>
                                <div className='flex -space-x-2'>
                                    <div className='w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-blue-600'>
                                        E
                                    </div>
                                    <div className='w-6 h-6 rounded-full bg-green-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-[#22c55e]'>
                                        C
                                    </div>
                                    <div className='w-6 h-6 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-purple-600'>
                                        M
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                            <div className='space-y-6'>
                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4'>
                                    Email Performance Metrics
                                </p>
                                <div className='grid grid-cols-2 gap-4'>
                                    {EMAIL_METRICS.map((metric, i) => (
                                        <div
                                            key={i}
                                            className='p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm group hover:border-[#22c55e]/30 transition-all'
                                        >
                                            <p className='text-[9px] font-bold text-gray-400 uppercase mb-1'>
                                                {metric.label}
                                            </p>
                                            <p className='text-xl font-black text-gray-900 group-hover:text-[#22c55e] transition-colors'>
                                                {metric.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-col h-full'>
                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4'>
                                    Activity Breakdown
                                </p>
                                <div className='flex-1 min-h-[200px]'>
                                    <ResponsiveContainer
                                        width='100%'
                                        height='100%'
                                    >
                                        <BarChart
                                            data={ACTIVITY_METRICS}
                                            layout='vertical'
                                            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                        >
                                            <XAxis
                                                type='number'
                                                hide
                                            />
                                            <YAxis
                                                type='category'
                                                dataKey='name'
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fontWeight: 700, fill: '#111827' }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar
                                                dataKey='value'
                                                radius={[0, 10, 10, 0]}
                                                barSize={20}
                                            >
                                                {ACTIVITY_METRICS.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={['#22c55e', '#3b82f6', '#a855f7'][index % 3]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* REVENUE FORECAST SECTION */}
                    <section className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col'>
                        <div className='flex items-center gap-3 mb-8'>
                            <div className='p-2 bg-amber-50 text-amber-500 rounded-xl'>
                                <DollarSign size={20} />
                            </div>
                            <h3 className='font-bold text-gray-900'>Projected Revenue</h3>
                        </div>

                        <div className='flex-1 min-h-[300px]'>
                            <ResponsiveContainer
                                width='100%'
                                height='100%'
                            >
                                <LineChart
                                    data={REVENUE_FORECAST_DATA}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray='3 3'
                                        vertical={false}
                                        stroke='#F3F4F6'
                                    />
                                    <XAxis
                                        dataKey='month'
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                                        tickFormatter={value => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        formatter={value => [`$${value?.toLocaleString()}`, 'Expected Revenue']}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='expected'
                                        stroke='#22c55e'
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className='mt-6 space-y-4'>
                            <div className='p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#22c55e] border border-gray-100'>
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase'>
                                            Quarterly Target
                                        </p>
                                        <p className='text-sm font-black text-gray-900'>$500,000</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase'>Progress</p>
                                    <p className='text-sm font-black text-[#22c55e]'>76%</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* PERFORMANCE TABLE */}
                <section className='bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-10'>
                    <div className='p-8 border-b border-gray-50 flex items-center justify-between bg-white'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-50 text-blue-500 rounded-xl'>
                                <Users size={20} />
                            </div>
                            <h3 className='font-bold text-gray-900'>Sales Performance Leaderboard</h3>
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='relative'>
                                <Search
                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                                    size={14}
                                />
                                <input
                                    type='text'
                                    placeholder='Search representative...'
                                    className='pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                                />
                            </div>
                            <button className='p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400'>
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-50/50'>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                        Representative
                                    </th>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                        Leads Assigned
                                    </th>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center'>
                                        Deals Won
                                    </th>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right'>
                                        Revenue Generated
                                    </th>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center'>
                                        Conversion
                                    </th>
                                    <th className='px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right'>
                                        Avg. Deal Size
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-50'>
                                {PERFORMANCE_TABLE_DATA.map((row, i) => (
                                    <tr
                                        key={i}
                                        className='hover:bg-gray-50/30 transition-all cursor-pointer group'
                                    >
                                        <td className='px-8 py-5'>
                                            <div className='flex items-center gap-4'>
                                                <div className='w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center font-bold text-[#22c55e] text-xs group-hover:scale-110 transition-transform'>
                                                    {row.avatar}
                                                </div>
                                                <span className='text-sm font-bold text-gray-900 group-hover:text-[#22c55e] transition-colors'>
                                                    {row.rep}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5'>
                                            <span className='text-sm font-semibold text-gray-600'>
                                                {row.leads} leads
                                            </span>
                                        </td>
                                        <td className='px-8 py-5 text-center'>
                                            <span className='px-3 py-1 bg-green-50 text-[#22c55e] text-[11px] font-bold rounded-full border border-green-100'>
                                                {row.won} won
                                            </span>
                                        </td>
                                        <td className='px-8 py-5 text-right font-black text-gray-900'>
                                            ${row.revenue.toLocaleString()}
                                        </td>
                                        <td className='px-8 py-5 text-center'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <span className='text-sm font-bold text-gray-900'>
                                                    {row.conversion}%
                                                </span>
                                                <div className='w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                                                    <div
                                                        className='h-full bg-[#22c55e]'
                                                        style={{ width: `${row.conversion * 3}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5 text-right font-bold text-gray-500'>
                                            ${row.avgDeal.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='p-6 bg-gray-50/30 text-center border-t border-gray-50'>
                        <button className='text-sm font-bold text-[#22c55e] hover:underline'>
                            View All Sales Representatives
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Analytics;
