import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen w-full bg-white font-['Inter']">
            {/* Left Column - Authentication Panel */}
            <div className='flex flex-col justify-center items-center p-8 bg-white overflow-y-auto'>
                <div className='w-full max-w-[420px] flex flex-col gap-[18px]'>{children}</div>
            </div>

            {/* Right Column - Brand Section */}
            <div className='hidden lg:flex relative overflow-hidden bg-[linear-gradient(135deg,#F3FBF6,#E8F8F0)]'>
                <img
                    src='/auth-mattr.png'
                    alt='GreenCRM Authentication'
                    className='w-full h-full object-cover'
                />
            </div>
        </div>
    );
};

export default AuthLayout;
