import React from 'react';
import { Search, FileText, Users, Target, ArrowRight, Database } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Research Companies',
        description: 'Enter any company name and let AI gather comprehensive intelligence including contacts, deals, and market insights.',
        icon: Search,
        color: 'from-blue-500 to-blue-600'
    },
    {
        number: '02',
        title: 'Analyze Data',
        description: 'AI analyzes your research and identifies high-value opportunities, decision makers, and optimal outreach strategies.',
        icon: FileText,
        color: 'from-green-500 to-green-600'
    },
    {
        number: '03',
        title: 'Build Pipeline',
        description: 'Import CSV data or use AI-generated insights to populate your CRM with qualified leads and opportunities.',
        icon: Users,
        color: 'from-purple-500 to-purple-600'
    },
    {
        number: '04',
        title: 'Close Deals',
        description: 'Access AI-powered insights, deal recommendations, and automated workflows to accelerate your sales cycle.',
        icon: Target,
        color: 'from-orange-500 to-orange-600'
    }
];

const HowItWorks: React.FC = () => {
    return (
        <section
            id="how-it-works"
            className="py-24 px-6 bg-gradient-to-b from-white to-[#F8FFFE]"
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-[#111827] mb-4">How It Works</h2>
                    <p className="text-[#6B7280] text-lg max-w-3xl mx-auto mb-12">
                        Transform your sales process with AI-powered intelligence that works the way you do.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Step Number */}
                            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-[#E8F8F0] to-[#d1f5e3] flex items-center justify-center text-sm font-bold text-[#111827] border-2 border-white shadow-sm z-10">
                                {step.number}
                            </div>

                            {/* Step Content */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all group-hover:border-[#149403]/30 group-hover:shadow-lg relative overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#dcfce7]/30 rounded-full blur-3xl -mr-48 -mt-48" />
                                
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-[#149403] transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-[#6B7280] leading-relaxed mb-6">
                                        {step.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="flex items-center text-[#149403] font-semibold text-sm group-hover:text-[#111827] transition-colors">
                                        <span>Next step</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>{/* ← closed grid div */}

                
            </div>
        </section>
    );
};

export default HowItWorks;