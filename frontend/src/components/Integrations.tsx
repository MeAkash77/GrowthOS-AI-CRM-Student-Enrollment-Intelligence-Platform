import React from 'react';

const integrations = [
    { name: 'Gmail', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
    { name: 'Slack', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg' },
    { name: 'Stripe', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
    { name: 'Notion', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
    {
        name: 'Google Calendar',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg'
    },
    { name: 'HubSpot', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg' }
];

const Integrations: React.FC = () => {
    // Duplicate the array to create a seamless infinite scroll
    const doubledIntegrations = [...integrations, ...integrations, ...integrations, ...integrations];

    return (
        <section
            id='integrations'
            className='py-24 bg-white overflow-hidden'
        >
            <div className='max-w-7xl mx-auto px-6 mb-16 text-center'>
                <h2 className='text-3xl font-bold text-[#111827] mb-4'>
                    Integrates with the tools your team already uses
                </h2>
            </div>

            <div className='relative w-full'>
                {/* Soft blur gradient masks */}
                <div className='absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-20' />
                <div className='absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-20' />

                {/* Marquee Container */}
                <div className='flex w-full overflow-hidden'>
                    <div className='flex animate-marquee py-12'>
                        {doubledIntegrations.map((integration, index) => (
                            <div
                                key={index}
                                className='flex items-center justify-center mx-[60px] group transition-all duration-500'
                                style={{ minWidth: '140px' }}
                            >
                                <div className='flex flex-col items-center gap-6 cursor-pointer transition-all duration-500'>
                                    <div className='relative'>
                                        <img
                                            src={integration.icon}
                                            alt={integration.name}
                                            className='w-20 h-20 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 filter group-hover:drop-shadow-[0_0_20px_rgba(20,148,3,0.5)]'
                                        />
                                    </div>
                                    <span className='text-sm font-medium text-[#6B7280] group-hover:text-[#111827] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0'>
                                        {integration.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Integrations;
