import React, { useState } from 'react';
import { contactService } from '../services/contact.service';
import { Mail, Phone, MapPin, Github, GraduationCap, ArrowUpRight } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await contactService.submit(formData);
            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            console.error('Contact form error:', err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactDetails = [
        {
            icon: Phone,
            label: 'Phone',
            value: '+91 0000000000',
            href: 'tel:+910000000000'
        },
        {
            icon: Mail,
            label: 'Email',
            value: 'iakshu845@gmail.com',
            href: 'mailto:iakshu845@gmail.com'
        },
        {
            icon: MapPin,
            label: 'Location',
            value: 'Jamshedpur, India',
            href: null
        },
        {
            icon: Github,
            label: 'GitHub',
            value: 'Akash',
            href: 'https://github.com/MeAkash77/'
        }
    ];

    return (
        <section
            id='contact'
            className='py-24 px-6 bg-white'
        >
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-16'>
                    <h2 className='text-4xl font-bold text-[#111827] mb-4'>Contact Us</h2>
                    <p className='text-[#6B7280] text-lg max-w-lg mx-auto'>
                        Ready to transform your sales process? Get in touch today.
                    </p>
                </div>

                {/* Two-column layout */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch'>

                    {/* LEFT — Personal Info */}
                    <div className='bg-gradient-to-br from-[#111827] to-[#1f2f1f] rounded-3xl p-10 flex flex-col justify-between text-white relative overflow-hidden'>
                        {/* Decorative blobs */}
                        <div className='absolute top-0 right-0 w-64 h-64 bg-[#149403]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none' />
                        <div className='absolute bottom-0 left-0 w-48 h-48 bg-[#149403]/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none' />

                        <div className='relative z-10'>
                            {/* Badge */}
                            <span className='inline-flex items-center gap-2 px-3 py-1 bg-[#149403]/20 text-[#4ade80] text-xs font-semibold rounded-full border border-[#149403]/30 mb-8'>
                                <span className='w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse' />
                                Open to collaborate
                            </span>

                            {/* Name & title */}
                            <h3 className='text-3xl font-bold text-white mb-2'>Akash</h3>
                            <div className='flex items-center gap-2 text-[#4ade80] font-semibold mb-1'>
                                <GraduationCap className='w-4 h-4' />
                                <span>KIIT (BHUBNESHWAR) Odissa</span>
                            </div>
                            <p className='text-[#9CA3AF] text-sm mb-10'>Builder · Developer · Innovator</p>

                            {/* Divider */}
                            <div className='w-12 h-px bg-[#149403]/50 mb-10' />

                            {/* Contact details */}
                            <div className='flex flex-col gap-5'>
                                {contactDetails.map((item, index) => (
                                    <div key={index} className='flex items-center gap-4 group'>
                                        <div className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#149403]/20 group-hover:border-[#149403]/40 transition-all'>
                                            <item.icon className='w-4 h-4 text-[#9CA3AF] group-hover:text-[#4ade80] transition-colors' />
                                        </div>
                                        <div className='flex flex-col min-w-0'>
                                            <span className='text-[#6B7280] text-xs font-medium uppercase tracking-wide mb-0.5'>
                                                {item.label}
                                            </span>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                                    rel='noreferrer'
                                                    className='text-white text-sm font-medium hover:text-[#4ade80] transition-colors truncate flex items-center gap-1'
                                                >
                                                    {item.value}
                                                    {item.href.startsWith('http') && (
                                                        <ArrowUpRight className='w-3 h-3 flex-shrink-0' />
                                                    )}
                                                </a>
                                            ) : (
                                                <span className='text-white text-sm font-medium'>{item.value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom tagline */}
                        <div className='relative z-10 mt-12 pt-8 border-t border-white/10'>
                            <p className='text-[#6B7280] text-sm leading-relaxed'>
                                Built with passion from the banks of the Ganges. Let's create something remarkable together.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT — Form */}
                    <div className='bg-[#F9FAFB] border border-[#E5E7EB] rounded-3xl p-10 shadow-sm flex flex-col'>
                        {success && (
                            <div className='mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center text-sm font-medium'>
                                Thank you for your message! We'll get back to you soon.
                            </div>
                        )}
                        {error && (
                            <div className='mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center text-sm font-medium'>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='flex flex-col flex-1 gap-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor='name' className='text-sm font-semibold text-[#111827]'>
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        id='name'
                                        required
                                        className='bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        placeholder='John Doe'
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor='email' className='text-sm font-semibold text-[#111827]'>
                                        Email Address
                                    </label>
                                    <input
                                        type='email'
                                        id='email'
                                        required
                                        className='bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        placeholder='john@example.com'
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col gap-2 flex-1'>
                                <label htmlFor='message' className='text-sm font-semibold text-[#111827]'>
                                    Message
                                </label>
                                <textarea
                                    id='message'
                                    required
                                    rows={6}
                                    className='bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none flex-1'
                                    placeholder='How can we help you?'
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 mt-2'
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;