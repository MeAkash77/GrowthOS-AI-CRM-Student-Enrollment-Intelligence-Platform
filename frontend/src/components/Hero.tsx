import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VideoModal from './VideoModal';

const phrases = [
    'Research leads with AI',
    'Generate outreach instantly',
    'Analyze deals automatically',
    'Close deals faster'
];

const Hero: React.FC = () => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const navigate = useNavigate();

    // YouTube video URL with your actual video ID
    const videoUrl = "https://www.youtube.com/embed/Tt0PqFSncuA?autoplay=1&rel=0&modestbranding=1";

    const openVideoModal = () => setShowVideoModal(true);
    const closeVideoModal = () => setShowVideoModal(false);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];
        const typingSpeed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting && displayedText === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && displayedText === '') {
                setIsDeleting(false);
                setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
            } else {
                const nextText = isDeleting
                    ? currentPhrase.substring(0, displayedText.length - 1)
                    : currentPhrase.substring(0, displayedText.length + 1);
                setDisplayedText(nextText);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentPhraseIndex]);

    return (
        <>
            <section className='relative pt-40 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden bg-white'>
            {/* 1. Background Design: Edge Glow Vignette */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(20,148,3,0.08)_100%)]'></div>
            </div>

            {/* 2. Grid System - Static and Visible */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute inset-0 bg-grid-pattern opacity-[0.3]'></div>

                {/* Intersection Glows */}
                <div
                    className='absolute inset-0 opacity-[0.25]'
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #149403 2px, transparent 0)',
                        backgroundSize: '80px 80px'
                    }}
                ></div>
            </div>

            {/* 3. Radial Vignette behind text */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_center,white_0%,rgba(20,148,3,0.05)_100%)] blur-[80px] pointer-events-none'></div>

            <div className='max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10'>
                {/* Left Column */}
                <div className='flex flex-col items-start gap-8'>
                    <h1 className='text-5xl lg:text-7xl font-extrabold text-[#111827] leading-[1.1]'>
                        AI-First CRM for <br />
                        <span className='text-primary'>Modern Sales Teams</span>
                    </h1>
                    <p className='text-xl text-[#6B7280] max-w-lg leading-relaxed'>
                        Manage leads, close deals, and let AI handle research, outreach, and insights.
                    </p>

                    <div className='h-8 flex items-center text-2xl font-semibold text-[#111827]'>
                        <span>{displayedText}</span>
                        <span className='ml-1 w-0.5 h-6 bg-primary animate-pulse'></span>
                    </div>

                    <div className='flex flex-wrap gap-4 mt-4'>
                        <button
                            onClick={() => navigate('/auth/login')}
                            className='bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 cursor-pointer'
                        >
                            Start Using GreenCRM
                        </button>
                        <button onClick={openVideoModal} className='bg-white text-[#111827] border border-[#E5E7EB] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#F3FBF6] transition-colors shadow-sm cursor-pointer'>
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className='relative group'>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className='w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden relative z-10'
                    >
                        {/* Window Bar */}
                        <div className='bg-[#F9FAFB] border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-2'>
                            <div className='w-3 h-3 rounded-full bg-[#FF5F56]'></div>
                            <div className='w-3 h-3 rounded-full bg-[#FFBD2E]'></div>
                            <div className='w-3 h-3 rounded-full bg-[#27C93F]'></div>
                            <div className='ml-4 flex-1 h-2 bg-[#E5E7EB] rounded-full max-w-[200px]'></div>
                        </div>

                        {/* Dashboard Content */}
                        <div className='bg-white aspect-[16/10] overflow-hidden'>
                            <img
                                src='/hero-crm.png'
                                alt='GreenCRM Dashboard Preview'
                                className='w-full h-full object-cover'
                            />
                        </div>
                    </motion.div>
                    {/* Background decorative elements */}
                    <div className='absolute -top-10 -right-10 w-64 h-64 bg-[#E8F8F0] rounded-full blur-3xl opacity-50 -z-10 group-hover:bg-primary/20 transition-colors duration-500'></div>
                    <div className='absolute -bottom-10 -left-10 w-64 h-64 bg-[#F3FBF6] rounded-full blur-3xl opacity-50 -z-10 group-hover:bg-primary/10 transition-colors duration-500'></div>
                </div>
            </div>
        </section>
        
        {/* Video Modal */}
        <VideoModal 
            isOpen={showVideoModal}
            onClose={closeVideoModal}
            videoUrl={videoUrl}
        />
        </>
    );
};

export default Hero;
