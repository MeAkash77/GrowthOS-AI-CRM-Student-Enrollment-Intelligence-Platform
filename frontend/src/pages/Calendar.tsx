import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Shield,
    Clock,
    MapPin,
    User,
    Users,
    Tag,
    Plus,
    Trash2,
    Save,
    X,
    Sparkles,
    Bell,
    Home,
    LayoutDashboard,
    Layers,
    Mail,
    Settings,
    LogOut,
    Search,
    Briefcase,
    BarChart3,
    Database,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { useDataset } from '@/context/DatasetContext';

interface Task {
    id: string;
    date: string; // ISO string YYYY-MM-DD
    title: string;
    type: string;
    meetingTime?: string;
    meetingDuration?: string;
    location?: string;
    customerName: string;
    status: string;
    priority: string;
    deadline?: string;
    progress: string;
    notes: string;
}

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const { dataset } = useDataset();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [activeNav, setActiveNav] = useState('Calendar');
    const [showNotification, setShowNotification] = useState(true);

    // Form State
    const [formState, setFormState] = useState<Partial<Task>>({
        title: '',
        type: 'Internal Task',
        customerName: '',
        status: 'New Lead',
        priority: 'Medium',
        progress: 'Not Started',
        notes: '',
        deadline: ''
    });

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem('crm_calendar_tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Save tasks to localStorage
    useEffect(() => {
        localStorage.setItem('crm_calendar_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const formatDateKey = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const tasksForSelectedDate = useMemo(() => {
        const key = formatDateKey(selectedDate);
        return tasks.filter(t => t.date === key);
    }, [tasks, selectedDate]);

    const handleSaveTask = () => {
        if (!formState.title) return;

        const newTask: Task = {
            id: isEditing ? (formState.id as string) : Math.random().toString(36).substr(2, 9),
            date: formatDateKey(selectedDate),
            title: formState.title || '',
            type: formState.type || 'Internal Task',
            customerName: formState.customerName || '',
            status: formState.status || 'New Lead',
            priority: formState.priority || 'Medium',
            progress: formState.progress || 'Not Started',
            notes: formState.notes || '',
            deadline: formState.deadline || '',
            ...formState
        };

        if (isEditing) {
            setTasks(prev => prev.map(t => (t.id === newTask.id ? newTask : t)));
        } else {
            setTasks(prev => [...prev, newTask]);
        }

        handleClearForm();
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (formState.id === id) handleClearForm();
    };

    const handleClearForm = () => {
        setFormState({
            title: '',
            type: 'Internal Task',
            customerName: '',
            status: 'New Lead',
            priority: 'Medium',
            progress: 'Not Started',
            notes: '',
            deadline: ''
        });
        setIsEditing(false);
    };

    const handleEditTask = (task: Task) => {
        setFormState(task);
        setIsEditing(true);
    };

    const sidebarLinks = [
        { name: 'Home', icon: <Home size={20} />, path: '/' },
        { name: 'AI Command Centre', icon: <Sparkles size={20} />, path: '/ai-command', isGlow: true },
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Contacts', icon: <Users size={20} />, path: '/leads' },
        { name: 'Master Table', icon: <Layers size={20} /> },
        { name: 'Calendar', icon: <CalendarIcon size={20} />, active: true },
        { name: 'Mails', icon: <Mail size={20} />, path: '/mails' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'User Management', icon: <Shield size={20} />, path: '/user-management', isBlue: true },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', isBlue: true }
    ];

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    // Smart suggestions logic
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormState({ ...formState, notes: value });
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
                        <h2 className='text-3xl font-extrabold text-gray-900 mb-4'>No tasks/events yet</h2>
                        <p className='text-gray-500 mb-10 leading-relaxed'>
                            Populate your dashboard with real intelligence to start managing your calendar.
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
            <main className='flex-1 ml-64 overflow-y-auto bg-white p-8'>
                {/* HEADER */}
                <header className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Calendar Workspace</h1>
                        <p className='text-gray-500 mt-1'>Manage your meetings and customer interactions</p>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='relative'>
                            <Search
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                                size={18}
                            />
                            <input
                                type='text'
                                placeholder='Search tasks...'
                                className='pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20'
                            />
                        </div>
                        <button className='p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-all relative'>
                            <Bell size={20} />
                            <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white'></span>
                        </button>
                    </div>
                </header>

                {/* NOTIFICATION PANEL */}
                <AnimatePresence>
                    {showNotification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className='bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-4 mb-8 flex items-center justify-between'
                        >
                            <div className='flex items-center gap-4'>
                                <div className='w-10 h-10 rounded-full bg-[#22c55e] flex items-center justify-center text-white'>
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <h4 className='font-bold text-gray-900 text-sm'>Today's Briefing</h4>
                                    <p className='text-xs text-gray-600'>
                                        You have {tasks.filter(t => t.date === formatDateKey(new Date())).length} tasks
                                        due today and{' '}
                                        {
                                            tasks.filter(
                                                t => t.date === formatDateKey(new Date()) && t.type === 'Meeting'
                                            ).length
                                        }{' '}
                                        upcoming meetings.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotification(false)}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                    {/* LEFT COLUMN - CALENDAR */}
                    <div className='lg:col-span-4 space-y-6'>
                        <div className='bg-white rounded-3xl border border-gray-100 shadow-sm p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <h3 className='font-bold text-gray-900'>
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h3>
                                <div className='flex items-center gap-1'>
                                    <button
                                        onClick={prevMonth}
                                        className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-400'
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={goToToday}
                                        className='px-3 py-1 text-xs font-bold text-[#22c55e] hover:bg-green-50 rounded-lg'
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-400'
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className='grid grid-cols-7 gap-1 text-center mb-2'>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <span
                                        key={day}
                                        className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>

                            <div className='grid grid-cols-7 gap-1'>
                                {Array.from({ length: firstDayOfMonth(currentDate) }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className='h-10'
                                    />
                                ))}
                                {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                                    const day = i + 1;
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const isToday = formatDateKey(date) === formatDateKey(new Date());
                                    const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                                    const dayTasks = tasks.filter(t => t.date === formatDateKey(date));
                                    const hasTasks = dayTasks.length > 0;
                                    const hasMeetings = dayTasks.some(t => t.type === 'Meeting');

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(date)}
                                            className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                                                isSelected
                                                    ? 'bg-[#22c55e] text-white shadow-lg shadow-green-100'
                                                    : isToday
                                                      ? 'bg-green-50 text-[#22c55e] font-bold'
                                                      : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <span className='text-sm font-medium'>{day}</span>
                                            <div className='flex gap-0.5 mt-0.5'>
                                                {hasTasks && (
                                                    <div
                                                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#22c55e]'}`}
                                                    />
                                                )}
                                                {hasMeetings && (
                                                    <div
                                                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`}
                                                    />
                                                )}
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className='absolute bottom-full mb-2 hidden group-hover:block z-50'>
                                                <div className='bg-gray-900 text-white text-[10px] py-2 px-3 rounded-xl whitespace-nowrap shadow-2xl'>
                                                    {hasTasks ? (
                                                        <div className='space-y-1'>
                                                            {dayTasks.slice(0, 3).map(t => (
                                                                <div
                                                                    key={t.id}
                                                                    className='flex items-center gap-2'
                                                                >
                                                                    <div
                                                                        className={`w-1.5 h-1.5 rounded-full ${t.priority === 'High' ? 'bg-red-500' : 'bg-[#22c55e]'}`}
                                                                    />
                                                                    <span>{t.title}</span>
                                                                </div>
                                                            ))}
                                                            {dayTasks.length > 3 && (
                                                                <div className='text-gray-400'>
                                                                    + {dayTasks.length - 3} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        'No activities scheduled'
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* UPCOMING EVENTS MINI LIST */}
                        <div className='bg-[#f9fafb] rounded-3xl p-6 border border-gray-100'>
                            <h4 className='font-bold text-gray-900 text-sm mb-4'>Upcoming Next 7 Days</h4>
                            <div className='space-y-3'>
                                {tasks
                                    .filter(t => {
                                        const tDate = new Date(t.date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const weekLater = new Date();
                                        weekLater.setDate(today.getDate() + 7);
                                        return tDate >= today && tDate <= weekLater;
                                    })
                                    .sort((a, b) => a.date.localeCompare(b.date))
                                    .slice(0, 3)
                                    .map(task => (
                                        <div
                                            key={task.id}
                                            className='bg-white p-4 rounded-2xl border border-gray-50 flex items-center gap-3 hover:shadow-sm transition-shadow'
                                        >
                                            <div
                                                className={`w-1.5 h-10 rounded-full ${
                                                    task.priority === 'High'
                                                        ? 'bg-red-400'
                                                        : task.priority === 'Urgent'
                                                          ? 'bg-red-600'
                                                          : 'bg-[#22c55e]'
                                                }`}
                                            />
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex items-center justify-between mb-1'>
                                                    <p className='text-xs font-bold text-gray-900 truncate'>
                                                        {task.title}
                                                    </p>
                                                    <span className='text-[8px] font-bold text-gray-400'>
                                                        {new Date(task.date).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className='text-[10px] text-gray-500'>
                                                    {task.type} • {task.customerName || 'No customer'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                {tasks.length === 0 && (
                                    <div className='text-center py-4'>
                                        <p className='text-[10px] text-gray-400 italic'>No upcoming tasks scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - FORM & TASKS */}
                    <div className='lg:col-span-8 space-y-8'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl font-bold text-gray-900'>
                                Tasks for{' '}
                                {selectedDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </h2>
                            {isEditing && (
                                <button
                                    onClick={handleClearForm}
                                    className='text-sm font-bold text-[#22c55e] hover:bg-green-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2'
                                >
                                    <Plus size={16} /> Create New
                                </button>
                            )}
                        </div>

                        {/* TASK FORM */}
                        <div className='bg-white rounded-3xl border border-gray-100 shadow-xl p-8 overflow-hidden relative'>
                            <div className='absolute top-0 right-0 w-64 h-64 bg-[#dcfce7]/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none' />

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10'>
                                <div className='space-y-5'>
                                    <div>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                            Task Title
                                        </label>
                                        <input
                                            type='text'
                                            value={formState.title}
                                            onChange={e => setFormState({ ...formState, title: e.target.value })}
                                            placeholder='e.g. Follow up with John regarding Q3 Proposal'
                                            className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 transition-all placeholder:text-gray-300'
                                        />
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                Task Type
                                            </label>
                                            <select
                                                value={formState.type}
                                                onChange={e => setFormState({ ...formState, type: e.target.value })}
                                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none appearance-none'
                                            >
                                                <option>Meeting</option>
                                                <option>Follow-up</option>
                                                <option>Demo</option>
                                                <option>Customer Update</option>
                                                <option>Internal Task</option>
                                                <option>Reminder</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                Priority Level
                                            </label>
                                            <select
                                                value={formState.priority}
                                                onChange={e => setFormState({ ...formState, priority: e.target.value })}
                                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none appearance-none'
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                                <option>Urgent</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formState.type === 'Meeting' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='space-y-5 p-5 bg-green-50/50 rounded-3xl border border-green-100/50'
                                        >
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                        Meeting Time
                                                    </label>
                                                    <input
                                                        type='time'
                                                        value={formState.meetingTime || ''}
                                                        onChange={e =>
                                                            setFormState({ ...formState, meetingTime: e.target.value })
                                                        }
                                                        className='w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 transition-all cursor-pointer'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                        Duration
                                                    </label>
                                                    <input
                                                        type='text'
                                                        placeholder='30 min'
                                                        value={formState.meetingDuration}
                                                        onChange={e =>
                                                            setFormState({
                                                                ...formState,
                                                                meetingDuration: e.target.value
                                                            })
                                                        }
                                                        className='w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none'
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                    Location / Video Link
                                                </label>
                                                <div className='relative'>
                                                    <MapPin
                                                        className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                                        size={16}
                                                    />
                                                    <input
                                                        type='text'
                                                        placeholder='Zoom, Google Meet or Address'
                                                        value={formState.location}
                                                        onChange={e =>
                                                            setFormState({ ...formState, location: e.target.value })
                                                        }
                                                        className='w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none'
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                            Customer Name
                                        </label>
                                        <div className='relative'>
                                            <User
                                                className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                                size={16}
                                            />
                                            <input
                                                type='text'
                                                placeholder='Type customer name...'
                                                value={formState.customerName}
                                                onChange={e =>
                                                    setFormState({ ...formState, customerName: e.target.value })
                                                }
                                                className='w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-5'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                Customer Status
                                            </label>
                                            <select
                                                value={formState.status}
                                                onChange={e => setFormState({ ...formState, status: e.target.value })}
                                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none appearance-none'
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
                                        </div>
                                        <div>
                                            <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                Progress Tracker
                                            </label>
                                            <select
                                                value={formState.progress}
                                                onChange={e => setFormState({ ...formState, progress: e.target.value })}
                                                className='w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none appearance-none'
                                            >
                                                <option>Not Started</option>
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                                <option>Waiting for Response</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                            Deadline
                                        </label>
                                        <div className='relative group'>
                                            <CalendarIcon
                                                className='absolute left-4 top-1/2 -translate-y-1/2 text-[#22c55e] transition-colors group-focus-within:text-[#16a34a] pointer-events-none'
                                                size={16}
                                            />
                                            <input
                                                type='datetime-local'
                                                value={formState.deadline || ''}
                                                onChange={e => setFormState({ ...formState, deadline: e.target.value })}
                                                className='w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:bg-white transition-all cursor-pointer'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block flex items-center justify-between'>
                                            Notes Section
                                            <div className='flex items-center gap-1 text-[#22c55e] font-bold bg-green-50 px-2 py-0.5 rounded-lg text-[8px] uppercase'>
                                                <Sparkles size={10} /> Smart Assist
                                            </div>
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={formState.notes}
                                            onChange={handleNotesChange}
                                            placeholder='Enter detailed notes, discussion points, or paste a meeting summary...'
                                            className='w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 transition-all resize-none'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='mt-10 pt-8 border-t border-gray-50 flex flex-wrap items-center justify-between gap-6'>
                                <div className='flex items-center gap-4'>
                                    <button
                                        onClick={handleSaveTask}
                                        className='px-10 py-4 bg-[#22c55e] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-green-100 hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all flex items-center gap-2'
                                    >
                                        <Save size={18} />
                                        {isEditing ? 'Update Task' : 'Save Task'}
                                    </button>
                                    <button
                                        onClick={handleClearForm}
                                        className='px-8 py-4 bg-gray-50 text-gray-500 rounded-[2rem] font-bold text-sm hover:bg-gray-100 transition-all'
                                    >
                                        Reset Form
                                    </button>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => handleDeleteTask(formState.id as string)}
                                        className='px-8 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-[2rem] transition-all flex items-center gap-2'
                                    >
                                        <Trash2 size={18} />
                                        Delete entry
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* SAVED TASKS LIST */}
                        <div className='space-y-6'>
                            <div className='flex items-center gap-2 mb-2'>
                                <div className='w-1.5 h-6 bg-[#22c55e] rounded-full' />
                                <h3 className='font-bold text-gray-900 text-lg'>Daily Schedule</h3>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {tasksForSelectedDate.map(task => (
                                    <motion.div
                                        layout
                                        key={task.id}
                                        onClick={() => handleEditTask(task)}
                                        className={`group p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#22c55e]/30 transition-all cursor-pointer relative overflow-hidden ${
                                            task.priority === 'High' || task.priority === 'Urgent'
                                                ? 'border-l-4 border-l-[#22c55e]'
                                                : ''
                                        }`}
                                    >
                                        <div className='flex items-start justify-between mb-4'>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className={`p-2 rounded-xl ${task.type === 'Meeting' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-[#22c55e]'}`}
                                                >
                                                    {task.type === 'Meeting' ? <Clock size={16} /> : <Tag size={16} />}
                                                </div>
                                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                                    {task.type}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        task.priority === 'High'
                                                            ? 'bg-red-400 animate-pulse'
                                                            : task.priority === 'Urgent'
                                                              ? 'bg-red-600 animate-bounce'
                                                              : 'bg-[#22c55e]'
                                                    }`}
                                                />
                                                <span className='text-[9px] font-bold text-gray-500'>
                                                    {task.priority} Priority
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className='font-bold text-gray-900 text-base mb-2 group-hover:text-[#22c55e] transition-colors line-clamp-1'>
                                            {task.title}
                                        </h4>

                                        <div className='flex items-center gap-3 mb-6'>
                                            <div className='w-8 h-8 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] font-bold text-gray-500'>
                                                {task.customerName ? task.customerName[0] : '?'}
                                            </div>
                                            <p className='text-xs font-medium text-gray-600 truncate'>
                                                {task.customerName || 'No customer specified'}
                                            </p>
                                        </div>

                                        <div className='flex items-center justify-between pt-5 border-t border-gray-50'>
                                            <div className='flex items-center gap-3'>
                                                <span className='px-2.5 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-500'>
                                                    {task.status}
                                                </span>
                                                {task.meetingTime && (
                                                    <span className='text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg'>
                                                        {task.meetingTime}
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-[9px] font-bold text-gray-400'>
                                                    {task.progress}
                                                </span>
                                                <div className='w-12 h-2 bg-gray-100 rounded-full overflow-hidden'>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width:
                                                                task.progress === 'Completed'
                                                                    ? '100%'
                                                                    : task.progress === 'In Progress'
                                                                      ? '50%'
                                                                      : '10%'
                                                        }}
                                                        className={`h-full ${task.progress === 'Completed' ? 'bg-[#22c55e]' : 'bg-amber-400'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {tasksForSelectedDate.length === 0 && (
                                <div className='p-16 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200/60 text-center group hover:border-[#22c55e]/20 transition-all'>
                                    <div className='w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-200 group-hover:scale-110 transition-transform'>
                                        <CalendarIcon size={40} />
                                    </div>
                                    <h4 className='font-bold text-gray-900 text-lg mb-2'>Your schedule is empty</h4>
                                    <p className='text-sm text-gray-500 max-w-xs mx-auto leading-relaxed'>
                                        It looks like you don't have any tasks planned for this day. Use the form above
                                        to add a new activity.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CalendarPage;
