import React from 'react';
import { Search, Mail, BarChart3, FileText, Target, Settings } from 'lucide-react';

const features = [
    {
        title: 'AI Lead Research',
        description: 'Automatically analyze companies and discover sales opportunities.',
        icon: Search
    },
    {
        title: 'AI Email Generation',
        description: 'Generate personalized outreach emails instantly.',
        icon: Mail
    },
    {
        title: 'Pipeline Insights',
        description: 'AI identifies stuck deals and suggests next actions.',
        icon: BarChart3
    },
    {
        title: 'Meeting Summaries',
        description: 'Automatically extract action items from meeting transcripts.',
        icon: FileText
    },
    {
        title: 'Lead Scoring',
        description: 'AI predicts which leads are most likely to convert.',
        icon: Target
    },
    {
        title: 'Automation Workflows',
        description: 'Automate follow ups and sales tasks.',
        icon: Settings
    }
];

const Features: React.FC = () => {
    return (
        <section
            id='features'
            className='py-24 px-6 bg-white'
        >
            <div className='max-w-7xl mx-auto'>
                <div className='text-center mb-16'>
                    <h2 className='text-4xl font-bold text-[#111827] mb-4'>Built for AI-Powered Sales Teams</h2>
                    <p className='text-[#6B7280] text-lg max-w-2xl mx-auto'>
                        Experience a CRM that doesn't just store data, but actively helps you close deals.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group'
                        >
                            <div className='w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors'>
                                <feature.icon className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='text-xl font-bold text-[#111827] mb-3 group-hover:text-primary transition-colors'>
                                {feature.title}
                            </h3>
                            <p className='text-[#6B7280] leading-relaxed'>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
