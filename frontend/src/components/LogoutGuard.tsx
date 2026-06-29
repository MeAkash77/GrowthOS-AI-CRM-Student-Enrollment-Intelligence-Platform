import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { authService } from '../services/auth.service';

interface LogoutGuardProps {
    children: React.ReactNode;
}

const LogoutGuard: React.FC<LogoutGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [fromProtectedRoute, setFromProtectedRoute] = useState(false);

    // Protected routes that require logout confirmation when navigating to home or auth pages
    const protectedRoutes = [
        '/dashboard',
        '/ai-command',
        '/calendar',
        '/mails',
        '/leads',
        '/deals',
        '/analytics',
        '/user-management',
        '/settings'
    ];

    const authRoutes = ['/auth/login', '/auth/signup'];

    useEffect(() => {
        // Check if current route is protected and we're navigating to home or auth pages
        const isCurrentRouteProtected = protectedRoutes.includes(location.pathname);
        const isNavigatingToHome = location.pathname === '/';
        const isNavigatingToAuth = authRoutes.includes(location.pathname);

        if (isCurrentRouteProtected && (isNavigatingToHome || isNavigatingToAuth)) {
            // User is trying to navigate from protected route to home or auth pages
            setFromProtectedRoute(true);
            setShowLogoutConfirm(true);
        }
    }, [location]);

    const confirmLogout = () => {
        setShowLogoutConfirm(false); // Close dialog first
        setTimeout(() => { // Small delay for smooth transition
            authService.logout();
            navigate('/');
        }, 200);
    };

    const handleNavigation = (to: string) => {
        const isCurrentRouteProtected = protectedRoutes.includes(location.pathname);
        const isNavigatingToHome = to === '/' || to === '/';
        const isNavigatingToAuth = authRoutes.includes(to);

        if (isCurrentRouteProtected && (isNavigatingToHome || isNavigatingToAuth)) {
            setShowLogoutConfirm(true);
            return;
        }
        navigate(to);
    };

    // Expose navigation handler to children
    React.useEffect(() => {
        let lastProtectedRoute = location.pathname;
        let isPopupShown = false;

        // Override pushState for programmatic navigation
        const originalPush = window.history.pushState;
        window.history.pushState = function(state, title, url) {
            if (url) {
                const pathname = new URL(url, window.location.origin).pathname;
                const isCurrentRouteProtected = protectedRoutes.includes(lastProtectedRoute);
                const isNavigatingToHome = pathname === '/';
                const isNavigatingToAuth = authRoutes.includes(pathname);

                if (isCurrentRouteProtected && (isNavigatingToHome || isNavigatingToAuth) && !isPopupShown) {
                    setShowLogoutConfirm(true);
                    isPopupShown = true;
                    return;
                }
            }
            lastProtectedRoute = location.pathname;
            return originalPush.call(window.history, state, title, url);
        };

        // Handle browser back/forward buttons
        const handlePopState = (event: PopStateEvent) => {
            const isCurrentRouteProtected = protectedRoutes.includes(lastProtectedRoute);
            const isNavigatingToHome = window.location.pathname === '/';
            const isNavigatingToAuth = authRoutes.includes(window.location.pathname);

            if (isCurrentRouteProtected && (isNavigatingToHome || isNavigatingToAuth) && !isPopupShown) {
                event.preventDefault();
                setShowLogoutConfirm(true);
                isPopupShown = true;
                // Push back the protected route to prevent actual navigation
                window.history.pushState(null, '', lastProtectedRoute);
                return;
            }
            lastProtectedRoute = window.location.pathname;
        };

        window.addEventListener('popstate', handlePopState);

        // Update last protected route when location changes
        if (protectedRoutes.includes(location.pathname)) {
            lastProtectedRoute = location.pathname;
            isPopupShown = false;
        }

        return () => {
            window.history.pushState = originalPush;
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location]);

    return (
        <>
            {children}
            
            {/* Logout Confirmation Popup */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm'
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 1 }}
                            className='relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl'
                        >
                            {/* Glassmorphism background effect */}
                            <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-3xl' />
                            <div className='absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#2ECC71]/10 blur-3xl' />

                            <div className='relative z-10 flex flex-col items-center text-center'>
                                <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 border border-red-100'>
                                    <LogOut className='h-8 w-8' />
                                </div>

                                <h3 className='mb-2 text-2xl font-bold text-gray-900'>Ready to leave?</h3>
                                <p className='mb-8 text-gray-500'>
                                    You are about to leave the application. Please logout to securely end your session.
                                </p>

                                <div className='flex w-full flex-col gap-3'>
                                    <button
                                        onClick={confirmLogout}
                                        className='flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 active:scale-95'
                                    >
                                        <LogOut className='h-5 w-5' />
                                        Logout & Exit
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className='w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 font-bold text-gray-500 transition-all hover:bg-gray-50'
                                    >
                                        Stay here
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LogoutGuard;
