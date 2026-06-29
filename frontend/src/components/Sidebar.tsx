import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    Sparkles,
    LayoutDashboard,
    Users,
    Calendar,
    Mail,
    Briefcase,
    BarChart3,
    Shield,
    Settings,
    LogOut
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface SidebarProps {
    activeNav: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNav }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

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

        // Logout (Red)
        { name: 'LogOut', icon: <LogOut size={20} />, path: '/logout', textColor: 'text-red-500', hoverBg: 'hover:bg-red-500', isLogout: true }
    ];

    return (
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

            <nav className='flex-1 px-4 pb-4 space-y-1 flex flex-col overflow-y-auto custom-scrollbar'>
                {sidebarLinks.map((link, idx) =>
                    'separator' in link ? (
                        <div
                            key={idx}
                            className={`${(link as any).margin} border-t ${(link as any).color}`}
                        />
                    ) : 'spacer' in link ? (
                        <div key={idx} className="flex-1" />
                    ) : (
                        <button
                            key={(link as any).name}
                            onClick={() => {
                                if ((link as any).isLogout) {
                                    handleLogout();
                                } else if ((link as any).path) {
                                    navigate((link as any).path);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                                activeNav === (link as any).name
                                    ? 'bg-gray-100 shadow-sm'
                                    : ''
                            } ${(link as any).textColor} ${(link as any).hoverBg} hover:text-white ${
                                (link as any).isGlow ? 'hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''
                            }`}
                        >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                                {(link as any).icon}
                            </span>
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                                {(link as any).name}
                            </span>
                            {(link as any).isGlow && (
                                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer' />
                            )}
                        </button>
                    )
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
