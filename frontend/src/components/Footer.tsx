import React from 'react';

const Footer: React.FC = () => {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className='bg-[#F3FBF6] py-16 px-6 border-t border-[#E5E7EB]'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12'>
                <div className='flex flex-col gap-6 max-w-sm'>
                    <div className='flex items-center gap-2'>
                        <img
                            src='/logos/full-crm-mattr.png'
                            alt='GreenCRM'
                            className='h-8 w-auto'
                        />
                    </div>
                    <p className='text-[#6B7280] leading-relaxed'>
                        The AI-First CRM built for modern sales teams to scale their outreach and close deals faster.
                    </p>
                    <div className='flex gap-8'>
                        <button
                            onClick={() => scrollToSection('features')}
                            className='text-[#6B7280] hover:text-primary transition-colors font-medium text-sm'
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('integrations')}
                            className='text-[#6B7280] hover:text-primary transition-colors font-medium text-sm'
                        >
                            Integrations
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className='text-[#6B7280] hover:text-primary transition-colors font-medium text-sm'
                        >
                            Contact
                        </button>
                    </div>
                </div>

                <div className='flex flex-col md:items-end justify-between h-full md:pt-2'>
                    <span className='text-[#6B7280] text-sm font-medium'>
                        © {new Date().getFullYear()} GreenCRM Inc. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
