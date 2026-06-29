import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-white'>
                <div className='w-8 h-8 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin'></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to='/auth/login'
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
