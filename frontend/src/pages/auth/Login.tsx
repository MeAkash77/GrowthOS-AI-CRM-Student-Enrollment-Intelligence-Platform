import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { authService } from '../../services/auth.service';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.login({ email, password });
            // Simulate successful login
            navigate('/ai-command');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className='mb-[28px]'>
                <h1 className="text-[36px] font-bold text-[#111827] mb-2 font-['Inter'] leading-tight">Welcome back</h1>
                <p className="text-[#6B7280] text-[16px] font-['Inter']">Log in to continue using GreenCRM.</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className='flex flex-col gap-6'
            >
                {error && (
                    <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-2 border border-red-100'>
                        {error}
                    </div>
                )}

                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium text-[#374151] font-['Inter']">Email</label>
                    <div className='relative'>
                        <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]' />
                        <input
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder='name@company.com'
                            className="w-full p-4 pl-12 rounded-[10px] bg-[#FAFAFA] border border-[#E5E7EB] text-[15px] focus:outline-none focus:border-[#149403] focus:ring-[rgba(20,148,3,0.15)] focus:ring-3 transition-all font-['Inter']"
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className="text-sm font-medium text-[#374151] font-['Inter']">Password</label>
                    <div className='relative'>
                        <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]' />
                        <input
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder='••••••••'
                            className="w-full p-4 pl-12 rounded-[10px] bg-[#FAFAFA] border border-[#E5E7EB] text-[15px] focus:outline-none focus:border-[#149403] focus:ring-[rgba(20,148,3,0.15)] focus:ring-3 transition-all font-['Inter']"
                        />
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={isLoading}
                    className="mt-2 bg-[linear-gradient(135deg,#149403,#0d6202)] text-white p-4 rounded-[10px] font-semibold text-base w-full hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(20,148,3,0.25)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed font-['Inter']"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className='mt-8 flex flex-col gap-6'>
                <div className='flex items-center gap-3'>
                    <div className='h-[1px] flex-1 bg-[#E5E7EB]'></div>
                    <span className='text-xs text-[#9CA3AF] uppercase tracking-wider font-medium'>Or</span>
                    <div className='h-[1px] flex-1 bg-[#E5E7EB]'></div>
                </div>

                <div className='text-center'>
                    <p className="text-sm text-[#6B7280] font-['Inter']">
                        Don't have an account?{' '}
                        <Link
                            to='/auth/signup'
                            className='text-[#149403] font-semibold hover:underline'
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
