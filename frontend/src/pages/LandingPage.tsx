import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Integrations from '../components/Integrations';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className='min-h-screen bg-white text-[#111827] font-sans selection:bg-primary/30 selection:text-[#111827]'>
            <Navbar />
            <main>
                <Hero />
                <HowItWorks />
                <Features />
                <Integrations />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
