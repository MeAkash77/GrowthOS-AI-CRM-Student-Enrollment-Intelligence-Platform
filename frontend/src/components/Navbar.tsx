import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className='fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl'>
            <div className='bg-white/80 backdrop-blur-md border border-[#E5E7EB] rounded-full px-6 py-3 flex items-center justify-between shadow-sm'>
                <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2'>
                        <img
                            src='/logos/full-crm-mattr.png'
                            alt='GreenCRM Logo'
                            className='h-8 w-auto'
                        />
                        <span className='text-xl font-bold text-[#111827] tracking-tight'>GreenCRM</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => scrollToSection('features')}
                        className="text-[#6B7280] hover:text-primary transition-colors font-medium text-sm cursor-pointer"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => scrollToSection('how-it-works')}
                        className="text-[#6B7280] hover:text-primary transition-colors font-medium text-sm cursor-pointer"
                    >
                        How it Works
                    </button>
                    <button
                        onClick={() => scrollToSection('integrations')}
                        className="text-[#6B7280] hover:text-primary transition-colors font-medium text-sm cursor-pointer"
                    >
                        Integrations
                    </button>
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="text-[#6B7280] hover:text-primary transition-colors font-medium text-sm cursor-pointer"
                    >
                        Contact
                    </button>
                </div>

                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className='bg-[#111827] text-white px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm cursor-pointer'
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
