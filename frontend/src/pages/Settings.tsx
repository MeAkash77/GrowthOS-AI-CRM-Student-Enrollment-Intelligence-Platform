import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Globe,
    LogOut,
    LayoutDashboard,
    Users,
    Layers,
    Calendar,
    Mail as MailIcon,
    Briefcase,
    BarChart3,
    Sparkles,
    Home,
    Camera,
    Mail,
    Phone,
    Building2,
    MapPin,
    AlertCircle,
    Save,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('Settings');

    // Profile State
    const [profile, setProfile] = useState({
        fullName: 'Sarah Jenkins',
        jobTitle: 'Senior Sales Director',
        email: 'sarah.jenkins@greencrm.io',
        phone: '+1 (555) 890-1234'
    });

    // Account State
    const [account, setAccount] = useState({
        orgName: 'Acme Global Solutions',
        website: 'www.acmeglobal.com',
        industry: 'Enterprise Software',
        companySize: '501-1000 employees',
        address: '123 Innovation Drive, Suite 400, San Francisco, CA 94105'
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        meetingReminders: true,
        dealUpdates: true,
        leadUpdates: true,
        emailActivity: false,
        taskDeadlines: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);

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
        { name: 'Settings', icon: <SettingsIcon size={20} />, path: '/settings', isBlue: true }
    ];

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        }, 800);
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className='flex h-screen bg-white text-gray-900 font-inter overflow-hidden'>
            <Sidebar activeNav={activeNav} />
            {/* --- MAIN WORKSPACE --- */}
            <main className='flex-1 ml-60 overflow-y-auto bg-white relative pb-20'>
                {/* HEADER */}
                <header className='sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-12 py-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
                        <p className='text-sm text-gray-500 font-medium'>
                            Manage your personal preferences and account settings
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className='flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] text-white rounded-2xl text-sm font-bold hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100 disabled:opacity-70'
                    >
                        {isSaving ? (
                            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        ) : (
                            <>
                                <Save size={18} />
                                Save All Changes
                            </>
                        )}
                    </button>
                </header>

                <div className='max-w-4xl mx-auto px-12 py-10 space-y-12'>
                    {/* PROFILE SETTINGS */}
                    <section className='space-y-6'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='p-2 rounded-xl bg-green-50 text-[#22c55e]'>
                                <User size={20} />
                            </div>
                            <h2 className='text-xl font-bold text-gray-900'>Profile Settings</h2>
                        </div>

                        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-10'>
                            {/* Avatar Section */}
                            <div className='flex flex-col items-center gap-4 shrink-0'>
                                <div className='relative group'>
                                    <div className='w-32 h-32 rounded-3xl bg-green-50 text-[#22c55e] flex items-center justify-center font-bold text-4xl shadow-xl shadow-green-50 overflow-hidden'>
                                        <img
                                            src='https://ui-avatars.com/api/?name=Sarah+Jenkins&background=dcfce7&color=22c55e&size=128'
                                            alt='Profile'
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                    <button className='absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white text-[#22c55e] border border-gray-100 shadow-lg flex items-center justify-center hover:scale-110 transition-transform'>
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <button className='text-[10px] font-bold text-gray-400 hover:text-[#22c55e] transition-colors uppercase tracking-widest'>
                                    Remove Photo
                                </button>
                            </div>

                            {/* Form Section */}
                            <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        value={profile.fullName}
                                        onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                        className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Job Title
                                    </label>
                                    <input
                                        type='text'
                                        value={profile.jobTitle}
                                        onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                                        className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Email Address
                                    </label>
                                    <div className='relative'>
                                        <Mail
                                            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                            size={16}
                                        />
                                        <input
                                            type='email'
                                            value={profile.email}
                                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                                            className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                        />
                                    </div>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Phone Number
                                    </label>
                                    <div className='relative'>
                                        <Phone
                                            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                            size={16}
                                        />
                                        <input
                                            type='text'
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                        />
                                    </div>
                                </div>
                                <div className='sm:col-span-2 flex justify-end gap-3 pt-2'>
                                    <button className='px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all'>
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className='px-5 py-2.5 rounded-xl text-xs font-bold bg-green-50 text-[#22c55e] hover:bg-green-100 transition-all'
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ACCOUNT SETTINGS */}
                    <section className='space-y-6'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='p-2 rounded-xl bg-blue-50 text-blue-600'>
                                <Building2 size={20} />
                            </div>
                            <h2 className='text-xl font-bold text-gray-900'>Account Settings</h2>
                        </div>

                        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Organization Name
                                    </label>
                                    <input
                                        type='text'
                                        value={account.orgName}
                                        onChange={e => setAccount({ ...account, orgName: e.target.value })}
                                        className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Company Website
                                    </label>
                                    <div className='relative'>
                                        <Globe
                                            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                            size={16}
                                        />
                                        <input
                                            type='text'
                                            value={account.website}
                                            onChange={e => setAccount({ ...account, website: e.target.value })}
                                            className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                        />
                                    </div>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Industry
                                    </label>
                                    <input
                                        type='text'
                                        value={account.industry}
                                        onChange={e => setAccount({ ...account, industry: e.target.value })}
                                        className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all'
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Company Size
                                    </label>
                                    <select
                                        value={account.companySize}
                                        onChange={e => setAccount({ ...account, companySize: e.target.value })}
                                        className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all appearance-none cursor-pointer'
                                    >
                                        <option>1-50 employees</option>
                                        <option>51-200 employees</option>
                                        <option>201-500 employees</option>
                                        <option>501-1000 employees</option>
                                        <option>1000+ employees</option>
                                    </select>
                                </div>
                                <div className='sm:col-span-2 space-y-1.5'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1'>
                                        Business Address
                                    </label>
                                    <div className='relative'>
                                        <MapPin
                                            className='absolute left-4 top-4 text-gray-400'
                                            size={16}
                                        />
                                        <textarea
                                            value={account.address}
                                            onChange={e => setAccount({ ...account, address: e.target.value })}
                                            className='w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22c55e]/20 outline-none transition-all resize-none h-24'
                                        />
                                    </div>
                                </div>
                                <div className='sm:col-span-2 flex justify-end pt-2'>
                                    <button
                                        onClick={handleSave}
                                        className='px-8 py-2.5 rounded-xl text-xs font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all shadow-lg shadow-green-100'
                                    >
                                        Save Account Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* NOTIFICATION PREFERENCES */}
                    <section className='space-y-6'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='p-2 rounded-xl bg-purple-50 text-purple-600'>
                                <Bell size={20} />
                            </div>
                            <h2 className='text-xl font-bold text-gray-900'>Notification Preferences</h2>
                        </div>

                        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4'>
                            <p className='text-xs text-gray-500 font-medium mb-6'>
                                Choose which alerts you receive via email and push notifications.
                            </p>

                            <div className='divide-y divide-gray-50'>
                                <NotificationToggle
                                    label='Meeting reminders'
                                    description='Receive alerts for upcoming meetings and calendar events.'
                                    isOn={notifications.meetingReminders}
                                    onToggle={() => toggleNotification('meetingReminders')}
                                />
                                <NotificationToggle
                                    label='Deal updates'
                                    description='Get notified when deal status or probability changes.'
                                    isOn={notifications.dealUpdates}
                                    onToggle={() => toggleNotification('dealUpdates')}
                                />
                                <NotificationToggle
                                    label='Lead updates'
                                    description='Receive alerts for new leads assigned to you.'
                                    isOn={notifications.leadUpdates}
                                    onToggle={() => toggleNotification('leadUpdates')}
                                />
                                <NotificationToggle
                                    label='Email activity alerts'
                                    description='Get notified when contacts open or reply to your emails.'
                                    isOn={notifications.emailActivity}
                                    onToggle={() => toggleNotification('emailActivity')}
                                />
                                <NotificationToggle
                                    label='Task deadlines'
                                    description='Alerts for upcoming and overdue task deadlines.'
                                    isOn={notifications.taskDeadlines}
                                    onToggle={() => toggleNotification('taskDeadlines')}
                                />
                            </div>
                        </div>
                    </section>

                    {/* DANGER ZONE */}
                    <section className='pt-10 border-t border-gray-100'>
                        <div className='bg-red-50/50 p-8 rounded-[2rem] border border-red-100 flex items-center justify-between gap-6'>
                            <div className='flex items-center gap-4'>
                                <div className='p-3 rounded-2xl bg-white border border-red-100 text-red-500 shadow-sm'>
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className='text-sm font-bold text-gray-900'>Deactivate Account</h3>
                                    <p className='text-xs text-gray-500 font-medium mt-1'>
                                        Permanently delete your profile and all associated data.
                                    </p>
                                </div>
                            </div>
                            <button className='px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-red-500 border border-red-100 hover:bg-red-50 transition-all shadow-sm'>
                                Deactivate
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* SAVED TOAST */}
            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className='fixed bottom-10 right-10 z-50 bg-[#111827] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10'
                    >
                        <div className='w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center'>
                            <Check size={14} />
                        </div>
                        <div>
                            <p className='text-xs font-bold'>Settings saved successfully</p>
                            <p className='text-[10px] text-gray-400'>All your preferences have been updated.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const NotificationToggle = ({
    label,
    description,
    isOn,
    onToggle
}: {
    label: string;
    description: string;
    isOn: boolean;
    onToggle: () => void;
}) => (
    <div className='flex items-center justify-between py-5 group'>
        <div className='space-y-0.5'>
            <h4 className='text-sm font-bold text-gray-900 group-hover:text-[#22c55e] transition-colors'>{label}</h4>
            <p className='text-[11px] text-gray-500 font-medium'>{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${isOn ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
        >
            <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isOn ? 'left-7' : 'left-1'}`}
            />
        </button>
    </div>
);

export default Settings;
