import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Users,
    UserCheck,
    Shield,
    Briefcase,
    Search,
    Filter,
    MoreVertical,
    Key,
    Power,
    X,
    PlusCircle,
    Home,
    LayoutDashboard,
    Sparkles,
    Layers,
    Calendar,
    Mail as MailIcon,
    BarChart3,
    Settings,
    LogOut,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';

interface UserMember {
    id: string;
    name: string;
    email: string;
    role: 'Administrator' | 'Sales Manager' | 'Sales Representative' | 'Viewer';
    status: 'Active' | 'Pending Invitation' | 'Disabled';
    lastLogin: string;
    assignedLeads: number;
    dealsManaged: number;
    activities: { date: string; action: string; icon: React.ReactNode }[];
}

const MOCK_USERS: UserMember[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'Sales Manager',
        status: 'Active',
        lastLogin: '2 hours ago',
        assignedLeads: 42,
        dealsManaged: 18,
        activities: [
            { date: '2 hours ago', action: 'Updated deal stage: Acme Inc', icon: <Briefcase size={12} /> },
            { date: '4 hours ago', action: 'Sent email to John Smith', icon: <MailIcon size={12} /> },
            { date: 'Yesterday', action: 'Created lead: Globex Corp', icon: <PlusCircle size={12} /> }
        ]
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.c@company.com',
        role: 'Administrator',
        status: 'Active',
        lastLogin: '1 hour ago',
        assignedLeads: 12,
        dealsManaged: 5,
        activities: [
            { date: '1 hour ago', action: 'Changed system settings', icon: <Settings size={12} /> },
            { date: '3 hours ago', action: 'Invited new user: Alex Rivera', icon: <UserPlus size={12} /> }
        ]
    },
    {
        id: '3',
        name: 'Alex Rivera',
        email: 'alex.r@company.com',
        role: 'Sales Representative',
        status: 'Pending Invitation',
        lastLogin: 'Never',
        assignedLeads: 0,
        dealsManaged: 0,
        activities: []
    },
    {
        id: '4',
        name: 'Emily Davis',
        email: 'emily.d@company.com',
        role: 'Sales Representative',
        status: 'Active',
        lastLogin: '5 hours ago',
        assignedLeads: 38,
        dealsManaged: 12,
        activities: [
            { date: '5 hours ago', action: 'Scheduled meeting: TechFlow', icon: <Calendar size={12} /> },
            { date: '1 day ago', action: 'Sent email: Security Review', icon: <MailIcon size={12} /> }
        ]
    },
    {
        id: '5',
        name: 'Jessica Wu',
        email: 'jessica.w@company.com',
        role: 'Viewer',
        status: 'Disabled',
        lastLogin: '2 weeks ago',
        assignedLeads: 0,
        dealsManaged: 0,
        activities: []
    }
];

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserMember[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserMember | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeNav] = useState('User Management');

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
        { name: 'Mails', icon: <MailIcon size={20} />, path: '/mails' },
        { name: 'Deals', icon: <Briefcase size={20} />, path: '/deals' },
        { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
        { name: 'User Management', icon: <Shield size={20} />, active: true, isBlue: true },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', isBlue: true }
    ];

    const metrics = [
        {
            label: 'Total Users',
            value: users.length,
            icon: <Users size={20} />,
            color: 'text-gray-600',
            bg: 'bg-gray-50'
        },
        {
            label: 'Active Users',
            value: users.filter(u => u.status === 'Active').length,
            icon: <UserCheck size={20} />,
            color: 'text-[#22c55e]',
            bg: 'bg-green-50'
        },
        {
            label: 'Admins',
            value: users.filter(u => u.role === 'Administrator').length,
            icon: <Shield size={20} />,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Sales Reps',
            value: users.filter(u => u.role.includes('Sales')).length,
            icon: <Briefcase size={20} />,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ];

    const filteredUsers = users.filter(
        user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending Invitation':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Disabled':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
            <Sidebar activeNav={activeNav} />
            {/* MAIN CONTENT */}
            <main className='flex-1 ml-60 overflow-hidden flex flex-col bg-white relative'>
                {/* TOP HEADER */}
                <header className='px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0'>
                    <div>
                        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>User Management</h1>
                        <p className='text-sm text-gray-500 font-medium'>Manage team members and access control.</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className='flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-2xl text-sm font-bold hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'
                    >
                        <UserPlus size={18} />
                        Invite New User
                    </button>
                </header>

                {/* SCROLLABLE AREA */}
                <div className='flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar'>
                    {/* SUMMARY METRICS */}
                    <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                        {metrics.map((metric, i) => (
                            <div
                                key={i}
                                className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group'
                            >
                                <div className='flex items-center gap-4'>
                                    <div
                                        className={`p-3 rounded-2xl ${metric.bg} ${metric.color} transition-transform group-hover:scale-110`}
                                    >
                                        {metric.icon}
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                            {metric.label}
                                        </p>
                                        <p className='text-2xl font-black text-gray-900 tracking-tight'>
                                            {metric.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* MAIN TABLE SECTION */}
                    <section className='bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col'>
                        {/* TABLE TOOLBAR */}
                        <div className='p-6 border-b border-gray-100 flex items-center justify-between gap-6'>
                            <div className='flex-1 max-w-md relative group'>
                                <Search
                                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors'
                                    size={18}
                                />
                                <input
                                    type='text'
                                    placeholder='Search by name, email or role...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className='w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 focus:border-[#22c55e] transition-all'
                                />
                            </div>
                            <div className='flex items-center gap-3'>
                                <button className='flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm'>
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>
                        </div>

                        {/* USER TABLE */}
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead>
                                    <tr className='bg-gray-50/50'>
                                        <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            User Name
                                        </th>
                                        <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            Role
                                        </th>
                                        <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            Status
                                        </th>
                                        <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            Last Login
                                        </th>
                                        <th className='px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            Leads
                                        </th>
                                        <th className='px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                            Deals
                                        </th>
                                        <th className='px-6 py-4 text-right'></th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-50'>
                                    {filteredUsers.map(user => (
                                        <motion.tr
                                            key={user.id}
                                            layoutId={`user-${user.id}`}
                                            onClick={() => setSelectedUser(user)}
                                            className={`group cursor-pointer transition-all ${selectedUser?.id === user.id ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}
                                        >
                                            <td className='px-6 py-5'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-10 h-10 rounded-xl bg-green-50 text-[#22c55e] flex items-center justify-center font-bold text-sm shrink-0 border border-green-100 group-hover:scale-110 transition-transform'>
                                                        {user.name[0]}
                                                    </div>
                                                    <div className='min-w-0'>
                                                        <p className='text-sm font-bold text-gray-900 truncate group-hover:text-[#22c55e] transition-colors'>
                                                            {user.name}
                                                        </p>
                                                        <p className='text-[10px] text-gray-400 font-medium truncate'>
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-6 py-5'>
                                                <p className='text-xs font-semibold text-gray-700'>{user.role}</p>
                                            </td>
                                            <td className='px-6 py-5'>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(user.status)}`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className='px-6 py-5'>
                                                <p className='text-[11px] text-gray-500 font-medium'>
                                                    {user.lastLogin}
                                                </p>
                                            </td>
                                            <td className='px-6 py-5 text-center'>
                                                <p className='text-xs font-bold text-gray-900'>{user.assignedLeads}</p>
                                            </td>
                                            <td className='px-6 py-5 text-center'>
                                                <p className='text-xs font-bold text-gray-900'>{user.dealsManaged}</p>
                                            </td>
                                            <td className='px-6 py-5 text-right'>
                                                <button className='p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600'>
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className='p-20 text-center'>
                                <div className='w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4'>
                                    <Users size={32} />
                                </div>
                                <h3 className='text-sm font-bold text-gray-900 mb-1'>No users found</h3>
                                <p className='text-xs text-gray-400'>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* EDIT USER SIDE PANEL */}
                <AnimatePresence>
                    {selectedUser && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUser(null)}
                                className='absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] z-50'
                            />
                            <motion.aside
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className='absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col'
                            >
                                <div className='p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30'>
                                    <h3 className='font-bold text-gray-900'>User Details</h3>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className='p-2 rounded-xl hover:bg-white text-gray-400 transition-colors'
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className='flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar'>
                                    {/* PROFILE HEADER */}
                                    <div className='flex flex-col items-center text-center'>
                                        <div className='w-20 h-20 rounded-[1.75rem] bg-green-50 text-[#22c55e] flex items-center justify-center font-black text-2xl mb-4 shadow-xl shadow-green-50 border border-green-100'>
                                            {selectedUser.name[0]}
                                        </div>
                                        <h2 className='text-xl font-black text-gray-900 mb-1'>{selectedUser.name}</h2>
                                        <p className='text-xs font-bold text-gray-400 mb-6'>{selectedUser.email}</p>
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(selectedUser.status)}`}
                                        >
                                            {selectedUser.status}
                                        </span>
                                    </div>

                                    {/* USER STATS */}
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                            <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Assigned Leads
                                            </p>
                                            <p className='text-lg font-black text-gray-900'>
                                                {selectedUser.assignedLeads}
                                            </p>
                                        </div>
                                        <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                            <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                                                Deals Managed
                                            </p>
                                            <p className='text-lg font-black text-gray-900'>
                                                {selectedUser.dealsManaged}
                                            </p>
                                        </div>
                                    </div>

                                    {/* FORM FIELDS */}
                                    <div className='space-y-6'>
                                        <div>
                                            <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block'>
                                                System Role
                                            </label>
                                            <select
                                                defaultValue={selectedUser.role}
                                                className='w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#22c55e]/20 outline-none appearance-none'
                                            >
                                                <option>Administrator</option>
                                                <option>Sales Manager</option>
                                                <option>Sales Representative</option>
                                                <option>Viewer</option>
                                            </select>
                                            <p className='text-[10px] text-gray-400 mt-2 px-1'>
                                                {selectedUser.role === 'Administrator'
                                                    ? 'Full access to all pages, manage users, and system settings.'
                                                    : selectedUser.role === 'Sales Manager'
                                                      ? 'View all leads, manage deals, and access reports.'
                                                      : selectedUser.role === 'Sales Representative'
                                                        ? 'View assigned leads, update deals, and send emails.'
                                                        : 'Read-only access to the system.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RECENT ACTIVITY */}
                                    <div className='space-y-4'>
                                        <h4 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                            Recent Activity
                                        </h4>
                                        <div className='space-y-4 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100'>
                                            {selectedUser.activities.length > 0 ? (
                                                selectedUser.activities.map((activity, i) => (
                                                    <div
                                                        key={i}
                                                        className='relative'
                                                    >
                                                        <div className='absolute -left-[21px] top-0 w-4 h-4 rounded bg-white border border-gray-200 text-[#22c55e] flex items-center justify-center shadow-sm'>
                                                            {activity.icon}
                                                        </div>
                                                        <div>
                                                            <p className='text-[11px] font-bold text-gray-900 leading-tight'>
                                                                {activity.action}
                                                            </p>
                                                            <p className='text-[9px] text-gray-400 font-medium'>
                                                                {activity.date}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='text-[11px] text-gray-400 italic'>
                                                    No recent activity found.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* QUICK ACTIONS */}
                                    <div className='pt-8 border-t border-gray-50 grid grid-cols-2 gap-3'>
                                        <button className='flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 text-gray-600 font-bold text-[11px] hover:bg-gray-100 transition-all'>
                                            <Key size={14} />
                                            Reset Password
                                        </button>
                                        <button
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] transition-all ${
                                                selectedUser.status === 'Disabled'
                                                    ? 'bg-green-50 text-[#22c55e] hover:bg-green-100'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                        >
                                            <Power size={14} />
                                            {selectedUser.status === 'Disabled' ? 'Enable User' : 'Deactivate'}
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </main>

            {/* INVITE USER MODAL */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInviteModal(false)}
                            className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm'
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className='relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8'
                        >
                            <div className='flex items-center justify-between mb-8'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2.5 rounded-2xl bg-[#dcfce7] text-[#22c55e]'>
                                        <UserPlus size={20} />
                                    </div>
                                    <h2 className='text-xl font-black text-gray-900'>Invite New User</h2>
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className='p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors'
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className='space-y-6'>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        placeholder='e.g. Sarah Johnson'
                                        className='w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Email Address
                                    </label>
                                    <input
                                        type='email'
                                        placeholder='sarah@company.com'
                                        className='w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#22c55e]/20 outline-none'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Assign Role
                                    </label>
                                    <select className='w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#22c55e]/20 outline-none appearance-none'>
                                        <option>Administrator</option>
                                        <option>Sales Manager</option>
                                        <option>Sales Representative</option>
                                        <option>Viewer</option>
                                    </select>
                                </div>

                                <div className='pt-4 flex gap-3'>
                                    <button
                                        onClick={() => setShowInviteModal(false)}
                                        className='flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button className='flex-1 py-4 rounded-2xl bg-[#22c55e] text-white font-bold text-sm hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'>
                                        Send Invite
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

export default UserManagement;
