import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Upload, FileText, Send, User, LayoutDashboard, Sparkles, Loader2,
    X, Code, Copy, Check, Globe, MapPin, Calendar, Users, TrendingUp,
    Mail, Briefcase, Layers, Zap, Target, Database, Linkedin,
    Table as TableIcon, LogOut, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth.service';
import { aiService } from '@/services/ai.service';
import { useDataset } from '@/context/DatasetContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const safeRender = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') {
        if (Array.isArray(value)) return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
        return value.name || value.title || value.description || value.content || JSON.stringify(value);
    }
    return String(value);
};

const MetadataRow = ({ label, value }: { label: string; value: any }) => (
    <div className='flex items-center justify-between py-1.5 border-b border-white/5 last:border-0'>
        <span className='text-xs font-medium text-gray-400 font-sans'>{label}</span>
        <span className='text-sm text-gray-700 font-semibold truncate max-w-[250px] font-sans'>{safeRender(value)}</span>
    </div>
);

const InfoBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => (
    <div className='space-y-1.5 p-3 rounded-xl bg-[#f0fdf6] border border-[#149403]/10 hover:border-[#149403]/30 transition-colors'>
        <div className='flex items-center gap-1.5 text-[#149403]'>
            {icon}
            <span className='text-[9px] font-bold uppercase tracking-widest font-sans'>{label}</span>
        </div>
        <p className='text-sm font-semibold text-gray-900 truncate font-sans'>{safeRender(value)}</p>
    </div>
);

const ContactInfoRow = ({ icon, text }: { icon: React.ReactNode; text: any }) => (
    <div className='flex items-center gap-2 text-gray-500'>
        <span className='text-[#149403]/60'>{icon}</span>
        <span className='text-[11px] truncate font-sans'>{safeRender(text)}</span>
    </div>
);

const ContactCard = ({ contact, companyName }: { contact: any; companyName: string }) => (
    <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#149403]/30 transition-all group relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#149403]/[0.06] to-transparent rounded-bl-full' />
        <div className='flex items-start gap-4 relative z-10'>
            <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8F8F0] to-[#d1f5e3] flex items-center justify-center text-[#149403] group-hover:scale-110 transition-transform shadow-sm'>
                <User className='w-5 h-5' />
            </div>
            <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                    <h4 className='font-bold text-gray-900 truncate pr-8 font-sans'>{safeRender(contact.name)}</h4>
                    {contact.lead_score && (
                        <span className='text-[10px] font-bold text-[#149403] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#149403]/20 font-sans'>
                            {safeRender(contact.lead_score)}
                        </span>
                    )}
                </div>
                <p className='text-xs font-semibold text-[#149403] mb-2 font-sans'>{safeRender(contact.role)}</p>
                <div className='space-y-1.5 pt-2 border-t border-gray-50'>
                    <ContactInfoRow icon={<Briefcase className='w-3 h-3' />} text={companyName || contact.company} />
                    <ContactInfoRow icon={<Layers className='w-3 h-3' />} text={contact.department} />
                    {contact.email && <ContactInfoRow icon={<Mail className='w-3 h-3' />} text={contact.email} />}
                    {contact.linkedin && (
                        <a href={typeof contact.linkedin === 'string' ? (contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`) : '#'}
                            target='_blank' rel='noopener noreferrer'
                            className='flex items-center gap-2 text-xs text-blue-500 hover:underline pt-1 font-sans'>
                            <Linkedin className='w-3 h-3' /> LinkedIn Profile
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const AICommand = () => {
    const navigate = useNavigate();
    const { setDataset } = useDataset();
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [researchResult, setResearchResult] = useState<any>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentLog, setCurrentLog] = useState('');
    const [csvData, setCsvData] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dataLoadingFinished = useRef(false);
    const pendingResearchResult = useRef<any>(null);

    const handleBackClick = (e: React.MouseEvent) => { e.preventDefault(); setShowLogoutConfirm(true); };
    const confirmLogout = () => { 
        setShowLogoutConfirm(false); // Close dialog first
        setTimeout(() => { // Small delay for smooth transition
            authService.logout(); 
            window.location.href = '/'; // Use direct navigation to bypass LogoutGuard
        }, 200);
    };

    const [placeholderText, setPlaceholderText] = useState('');
    const [promptIndex, setPromptIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const logs = ['doing web search', 'going through profiles', 'compiling the data'];

    useEffect(() => {
        let animationFrame: number;
        let startTime: number | null = null;
        const animate = (time: number) => {
            if (startTime === null) startTime = time;
            const elapsed = time - startTime;
            let newProgress = 0, logIdx = 0;
            if (elapsed < 2000) { newProgress = (elapsed / 2000) * 40; logIdx = 0; }
            else if (elapsed < 3000) { newProgress = 40; logIdx = 0; }
            else if (elapsed < 6000) { newProgress = 40 + ((elapsed - 3000) / 3000) * 40; logIdx = 1; }
            else if (elapsed < 7500) { newProgress = 80; logIdx = 1; }
            else if (elapsed < 9000) { newProgress = 80 + ((elapsed - 7500) / 1500) * 20; logIdx = 2; }
            else { newProgress = 100; logIdx = 2; }
            setProgress(newProgress); setCurrentLog(logs[logIdx]);
            if (newProgress >= 100) {
                if (dataLoadingFinished.current) {
                    if (pendingResearchResult.current) { setResearchResult(pendingResearchResult.current); setDataset(pendingResearchResult.current); navigate('/dashboard'); }
                    setIsProcessing(false); return;
                } else { setProgress(99); }
            }
            animationFrame = requestAnimationFrame(animate);
        };
        if (isProcessing) { startTime = null; animationFrame = requestAnimationFrame(animate); }
        return () => cancelAnimationFrame(animationFrame);
    }, [isProcessing, navigate, setDataset]);

    const placeholderPrompts = ['Ask GreenCRM AI about companies, leads, or sales...', 'Research about Nike', 'Find high-value prospects of Databricks', 'Research company: Notion'];

    useEffect(() => {
        if (!isAnimating || isFocused) return;
        const currentPrompt = placeholderPrompts[promptIndex];
        if (isFading) {
            const timeout = setTimeout(() => { setIsFading(false); setCharIndex(0); setPlaceholderText(''); setPromptIndex(prev => (prev + 1) % placeholderPrompts.length); }, 500);
            return () => clearTimeout(timeout);
        }
        if (charIndex < currentPrompt.length) {
            const timeout = setTimeout(() => { setPlaceholderText(currentPrompt.slice(0, charIndex + 1)); setCharIndex(prev => prev + 1); }, 40 + Math.random() * 20);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => setIsFading(true), 2000);
            return () => clearTimeout(timeout);
        }
    }, [charIndex, promptIndex, isAnimating, isFocused, isFading]);

    useEffect(() => {
        if (!isFocused && query === '') { restartTimeoutRef.current = setTimeout(() => setIsAnimating(true), 3000); }
        else { if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current); setIsAnimating(false); }
        return () => { if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current); };
    }, [isFocused, query]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files[0]);
    }, []);

    const handleFiles = (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'csv') {
            Papa.parse(file, { header: true, complete: (results: Papa.ParseResult<any>) => { setCsvData(results.data); setShowPreview(true); }, error: (error: Error) => { console.error(error); alert('Error parsing CSV file.'); } });
        } else if (extension === 'xlsx') {
            const reader = new FileReader();
            reader.onload = e => { const data = e.target?.result; const workbook = XLSX.read(data, { type: 'binary' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; setCsvData(XLSX.utils.sheet_to_json(sheet)); setShowPreview(true); };
            reader.readAsBinaryString(file);
        } else { alert('Please upload a CSV or XLSX file.'); }
    };

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!query.trim()) return;
        setIsProcessing(true); setResearchResult(null); setShowInsights(false);
        dataLoadingFinished.current = false; pendingResearchResult.current = null;
        try { const result = await aiService.researchCompany(query); pendingResearchResult.current = result; dataLoadingFinished.current = true; }
        catch (error) { console.error(error); alert('Failed to research company. Please try again.'); setIsProcessing(false); }
    };

    const copyToClipboard = () => {
        if (!researchResult) return;
        navigator.clipboard.writeText(JSON.stringify(researchResult, null, 2));
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    const handleMoveToDataset = async () => {
        if (csvData.length === 0) return;
        setIsProcessing(true); dataLoadingFinished.current = false; pendingResearchResult.current = null;
        try {
            const groupedData = csvData.reduce((acc, record) => {
                const companyName = record.account_name || record.company || record.name || 'Unknown Company';
                if (!acc[companyName]) acc[companyName] = [];
                acc[companyName].push(record); return acc;
            }, {} as Record<string, any[]>);
            const companyNames = Object.keys(groupedData);
            const processedCompanies = [];
            for (let i = 0; i < companyNames.length; i++) {
                const companyName = companyNames[i];
                const companyRecords = groupedData[companyName];
                const firstRecord = companyRecords[0];
                setCurrentLog(`Analyzing ${companyName} data (${i + 1}/${companyNames.length})`);
                let research = await aiService.researchCompany(companyName);
                if (typeof research === 'string') { try { research = JSON.parse(research); } catch { research = {}; } }
                setCurrentLog(`Enhancing ${companyName} profile`);
                let enhancedDescription = await aiService.enhanceCompanyInfo(companyName, firstRecord.website || research.account?.website || '', firstRecord.description || research.account?.description || '');
                if (typeof enhancedDescription === 'object' && enhancedDescription !== null) { enhancedDescription = (enhancedDescription as any).content || (enhancedDescription as any).description || JSON.stringify(enhancedDescription); }
                const contacts = companyRecords.map((record: any, index: number) => ({ contact_id: record.contact_id || `CON-${companyName}-${index}`, name: record.name || record.contact_name || 'Unknown Contact', role: record.role || record.position || 'Staff', department: record.department || 'General', linkedin: record.linkedin || record.linked_in || '', email: record.email || '', phone: record.phone || record.mobile || '', contact_type: record.contact_type || 'lead', influence_level: record.influence_level || 'Medium', lead_score: parseInt(record.lead_score) || 50, last_activity: '', notes: [], lead_status: 'New Lead' }));
                const accountInfo = research.account || research.company || {};
                const deals = companyRecords.filter((r: any) => r.deal_name || r.deal_id).map((record: any, index: number) => ({ deal_id: record.deal_id || `DEAL-${companyName}-${index}`, account_id: record.account_id || accountInfo.account_id || `ACC-${companyName}`, deal_name: record.deal_name || `Deal ${index + 1}`, stage: record.stage || record.deal_stage || 'New Leads', value_estimate: parseInt(record.value_estimate || record.deal_value || record.value) || 0, probability: parseInt(record.probability || record.deal_probability) || 50, owner: record.owner || record.deal_owner || 'Alex Johnson', associated_contacts: [record.name || record.contact_name], created_at: new Date().toISOString() }));
                processedCompanies.push({ account: { ...accountInfo, account_id: firstRecord.account_id || accountInfo.account_id || `ACC-${companyName}`, name: companyName, website: firstRecord.website || accountInfo.website, industry: firstRecord.industry || accountInfo.industry, sub_industry: firstRecord.sub_industry || accountInfo.sub_industry, market_segment: firstRecord.market_segment || accountInfo.market_segment, business_model: firstRecord.business_model || accountInfo.business_model, hq: firstRecord.hq || accountInfo.hq, founded_year: firstRecord.founded_year || accountInfo.founded_year, employee_count: parseInt(firstRecord.employee_count) || accountInfo.employee_count, public_company: firstRecord.public_company !== undefined ? firstRecord.public_company === 'true' || firstRecord.public_company === true : accountInfo.public_company, description: enhancedDescription || firstRecord.description || accountInfo.description }, products: research.products || [], use_cases: research.use_cases || [], tech_stack: research.tech_stack || [], customer_segments: research.customer_segments || [], partnerships: research.partnerships || [], competitors: research.competitors || [], funding: research.funding || {}, contacts, leads: research.leads || [], deals: deals.length > 0 ? deals : research.deals || [], activities: [], interaction_history: [], call_logs: [], emails: research.emails || [], sales_insights: research.sales_insights || {}, market_analysis: research.market_analysis || {}, outreach_strategy: research.outreach_strategy || {}, lead_discovery: research.lead_discovery || {}, ai_summary: research.ai_summary || {} });
            }
            const finalDataset = { metadata: { intent: 'multi_company_research', timestamp: new Date().toISOString(), generated_by: 'csv_upload', company_count: processedCompanies.length, data_sources: ['CSV File Upload'] }, companies: processedCompanies };
            pendingResearchResult.current = finalDataset; dataLoadingFinished.current = true;
        } catch (error) { console.error(error); alert('Failed to process dataset. Please try again.'); setIsProcessing(false); }
    };

    return (
        <div className='min-h-screen bg-[#f8fffe] font-sans overflow-hidden relative'>
            {/* Grid Background */}
            <div className='fixed inset-0 z-0 pointer-events-none overflow-hidden'>
                <svg className='absolute inset-0 w-full h-full opacity-[0.035]' xmlns='http://www.w3.org/2000/svg'>
                    <defs>
                        <pattern id='dots' x='0' y='0' width='28' height='28' patternUnits='userSpaceOnUse'>
                            <circle cx='1.5' cy='1.5' r='1.5' fill='#149403' />
                        </pattern>
                    </defs>
                    <rect width='100%' height='100%' fill='url(#dots)' />
                </svg>
                {/* Glowing orbs */}
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#149403]/[0.07] blur-[120px]' />
                <div className='absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#149403]/[0.05] blur-[100px]' />
                <div className='absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full bg-[#149403]/[0.04] blur-[80px]' />
            </div>

            {/* ─── Header ──────────────────────────────────────────────────────── */}
            <header className='h-16 border-b border-[#149403]/10 bg-white/60 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm shadow-[#149403]/5'>
                <div className='flex items-center gap-4'>
                    <button onClick={handleBackClick} className='p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-400 border border-transparent hover:border-red-100'>
                        <ArrowLeft className='w-4 h-4' />
                    </button>
                    <div className='h-6 w-px bg-gray-200' />
                    <div className='flex items-center gap-2.5'>
                        <img src='/logos/full-crm-mattr.png' alt='GreenCRM' className='h-7' />
                        <span className='text-lg font-bold text-gray-900 tracking-tight font-sans'>GreenCRM</span>
                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#E8F8F0] to-[#c8f0d8] border border-[#149403]/20 flex items-center justify-center text-[#149403] shadow-sm'>
                        <User className='w-4 h-4' />
                    </div>
                </div>
            </header>

            <main className='max-w-[860px] mx-auto px-6 pt-14 pb-24 relative z-10'>

                {/* ─── Hero Section ─────────────────────────────────────────────── */}
                <div className='text-center mb-10'>
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#E8F8F0] border border-[#149403]/20 rounded-full mb-5 shadow-sm'>
                        <Database className='w-3.5 h-3.5 text-[#149403]' />
                        <span className='text-xs font-bold text-[#149403] tracking-widest uppercase font-sans'>Powered by AI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className='text-5xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight font-sans'
                    >
                        AI Command{' '}
                        <span className='relative inline-block'>
                            <span className='relative z-10 text-[#149403] font-sans'>Center</span>
                            <span className='absolute bottom-1 left-0 right-0 h-2 bg-[#149403]/15 rounded-full -z-0' />
                        </span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className='text-gray-400 text-sm mb-7 font-light tracking-wide font-sans'>
                        Research companies, discover leads, and build your pipeline — instantly.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className='flex justify-center'>
                        <Link to='/dashboard' className='inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-[#149403] to-[#0f7a0f] hover:from-[#0f7a0f] hover:to-[#0d660d] text-white font-bold rounded-full transition-all shadow-lg shadow-[#149403]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#149403]/30 text-sm font-sans'>
                            <LayoutDashboard className='w-4 h-4' />
                            Go to Dashboard
                        </Link>
                    </motion.div>
                </div>

                {/* ─── Main Card ────────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className='bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/80 p-8 shadow-xl shadow-gray-100/50 relative overflow-hidden mb-8'>

                    {/* Card inner glow */}
                    <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#149403]/30 to-transparent' />

                    {/* Search Form */}
                    <form onSubmit={handleQuerySubmit} className='relative mb-6'>
                        <div className='relative group'>
                            <div className='absolute left-5 top-1/2 -translate-y-1/2 text-[#149403] z-10'>
                                <Target className='w-5 h-5' />
                            </div>
                            <input
                                type='text' value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                                placeholder={isFocused ? 'Research a company (e.g., Notion, Stripe, NVIDIA)...' : ''}
                                className='w-full h-[58px] pl-14 pr-16 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#149403] focus:ring-4 focus:ring-[#149403]/10 focus:bg-white transition-all shadow-inner relative z-0'
                            />
                            <AnimatePresence>
                                {!query && !isFocused && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: isFading ? 0 : 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                                        className='absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none select-none text-gray-400 text-sm'>
                                        {placeholderText}
                                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
                                            className='inline-block w-[2px] h-[16px] bg-[#149403] ml-[2px] align-middle rounded-full' />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button type='submit' disabled={isProcessing}
                                className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#149403] to-[#0f7a0f] hover:from-[#0f7a0f] hover:to-[#0d660d] text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-[#149403]/30 z-10 disabled:opacity-50 hover:scale-105 active:scale-95'>
                                {isProcessing ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
                            </button>
                        </div>
                    </form>

                    {/* Divider with label */}
                    <div className='flex items-center gap-4 mb-5'>
                        <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
                        <span className='text-[10px] font-bold text-gray-300 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>or upload</span>
                        <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
                    </div>

                    {/* Drop Zone */}
                    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-7 transition-all duration-300 ${dragActive ? 'border-[#149403] bg-[#F0FDF6] scale-[1.01]' : 'border-gray-200 hover:border-[#149403]/50 hover:bg-[#fafffe]'}`}>
                        <input type='file' id='file-upload' className='hidden' onChange={e => e.target.files?.[0] && handleFiles(e.target.files[0])} accept='.csv,.xlsx' />
                        <label htmlFor='file-upload' className='flex flex-col items-center justify-center cursor-pointer gap-3'>
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className='w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8F8F0] to-[#d0f5e0] flex items-center justify-center text-[#149403] shadow-sm'>
                                <Upload className='w-5 h-5' />
                            </motion.div>
                            <div className='text-center'>
                                <p className='text-gray-700 font-semibold text-sm mb-0.5' style={{ fontFamily: "'Syne', sans-serif" }}>Drop a CSV or XLSX file here</p>
                                <p className='text-gray-400 text-xs'>Analyze your leads with AI instantly</p>
                            </div>
                        </label>
                    </div>

                    {/* Sample CSV */}
                    <div className='mt-5 flex justify-center'>
                        <a href='/sample-crm-data.csv' download='sample-crm-data.csv'
                            className='inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 hover:border-[#149403]/40 hover:text-[#149403] hover:bg-[#fafffc] transition-all shadow-sm font-sans'>
                            <FileText className='w-3.5 h-3.5' />
                            Download Sample CSV file
                        </a>
                    </div>

                    {/* Processing Overlay */}
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className='absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-10 text-center rounded-3xl'>
                                <div className='w-full max-w-xs'>
                                    <div className='mb-8 flex flex-col items-center'>
                                        <div className='relative mb-6'>
                                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }} transition={{ duration: 2.5, repeat: Infinity }}
                                                className='absolute inset-0 rounded-full bg-[#149403]' />
                                            <motion.div animate={{ scale: [1, 1.7, 1], opacity: [0.1, 0, 0.1] }} transition={{ duration: 3.5, repeat: Infinity }}
                                                className='absolute -inset-5 rounded-full bg-[#149403]' />
                                            <div className='relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-[#f0fdf6] shadow-xl border border-[#149403]/20 flex items-center justify-center text-[#149403] z-10'>
                                                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                                    <Zap className='w-9 h-9' />
                                                </motion.div>
                                            </div>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                                className='absolute -inset-2 border-2 border-dashed border-[#149403]/30 rounded-full' />
                                        </div>
                                        <div className='h-6 overflow-hidden'>
                                            <AnimatePresence mode='wait'>
                                                <motion.p key={currentLog} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                                                    className='text-sm font-bold text-gray-800 capitalize tracking-wide' style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    {currentLog}...
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className='relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3 shadow-inner'>
                                        <motion.div className='absolute inset-y-0 left-0 bg-gradient-to-r from-[#149403] to-[#0f7a0f] rounded-full shadow-[0_0_12px_rgba(20,148,3,0.5)]'
                                            initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
                                    </div>
                                    <div className='flex justify-between items-center px-1'>
                                        <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>Researching</span>
                                        <span className='text-[10px] font-bold text-[#149403] font-sans'>{Math.round(progress)}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ─── CSV Preview ──────────────────────────────────────────────── */}
                {showPreview && csvData.length > 0 && !isProcessing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className='bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/50 overflow-hidden mb-8'>
                        <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60'>
                            <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#149403]'>
                                    <TableIcon className='w-4 h-4' />
                                </div>
                                <div>
                                    <h2 className='text-sm font-bold text-gray-900' style={{ fontFamily: "'Syne', sans-serif" }}>File Preview</h2>
                                    <p className='text-xs text-gray-400'>{csvData.length} records loaded</p>
                                </div>
                            </div>
                            <button onClick={handleMoveToDataset}
                                className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#149403] to-[#0f7a0f] hover:from-[#0f7a0f] hover:to-[#0d660d] text-white rounded-xl transition-all text-xs font-bold shadow-lg shadow-[#149403]/25 hover:-translate-y-0.5 font-sans'>
                                <Database className='w-3.5 h-3.5' /> Move to Dashboard
                            </button>
                        </div>
                        <div className='overflow-x-auto max-h-[400px]'>
                            <table className='w-full text-left border-collapse'>
                                <thead className='sticky top-0 bg-white shadow-sm'>
                                    <tr>
                                        {Object.keys(csvData[0]).map(header => (
                                            <th key={header} className='px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100' style={{ fontFamily: "'Syne', sans-serif" }}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-50'>
                                    {csvData.slice(0, 50).map((row, i) => (
                                        <tr key={i} className='hover:bg-[#fafffe] transition-colors'>
                                            {Object.values(row).map((value: any, j) => (
                                                <td key={j} className='px-5 py-3.5 text-xs text-gray-600 truncate max-w-[200px]'>{value?.toString() || '-'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {csvData.length > 50 && <div className='p-4 text-center text-xs text-gray-400 italic bg-gray-50'>Showing first 50 records...</div>}
                        </div>
                    </motion.div>
                )}

                {/* ─── Research Results ─────────────────────────────────────────── */}
                <AnimatePresence>
                    {researchResult && !showPreview && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className='space-y-6'>
                            <div className='bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col h-[600px]'>
                                <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60'>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2.5'>
                                            <div className='w-8 h-8 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#149403]'><Database className='w-4 h-4' /></div>
                                            <h2 className='text-sm font-bold text-gray-900' style={{ fontFamily: "'Syne', sans-serif" }}>Research Results</h2>
                                        </div>
                                        <button onClick={handleMoveToDataset}
                                            className='flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#149403] to-[#0f7a0f] hover:from-[#0f7a0f] hover:to-[#0d660d] text-white rounded-xl transition-all text-xs font-bold shadow-md shadow-[#149403]/25 hover:-translate-y-0.5 font-sans'>
                                            <Database className='w-3.5 h-3.5' /> Move to Dashboard
                                        </button>
                                    </div>
                                    <button onClick={() => setShowRawJson(!showRawJson)}
                                        className='flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-semibold' style={{ fontFamily: "'Syne', sans-serif" }}>
                                        <Code className='w-3.5 h-3.5' />{showRawJson ? 'View UI' : 'Raw JSON'}
                                    </button>
                                </div>
                                <div className='flex-1 overflow-y-auto p-6'>
                                    {showRawJson ? (
                                        <div className='bg-[#0f1117] rounded-2xl p-6 font-mono text-sm relative border border-white/5'>
                                            <button onClick={copyToClipboard} className='absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all' title='Copy'>
                                                {copied ? <Check className='w-4 h-4 text-[#149403]' /> : <Copy className='w-4 h-4' />}
                                            </button>
                                            <pre className='text-gray-400 whitespace-pre-wrap text-xs leading-relaxed'>{JSON.stringify(researchResult, null, 2)}</pre>
                                        </div>
                                    ) : (
                                        <div className='space-y-8'>
                                            {/* Metadata */}
                                            <section>
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-1 w-5 bg-gradient-to-r from-[#149403] to-[#0f7a0f] rounded-full' />
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>Metadata</h3>
                                                </div>
                                                <div className='bg-gray-50/80 rounded-2xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-x-8'>
                                                    <MetadataRow label='Intent' value={researchResult.metadata?.intent} />
                                                    <MetadataRow label='Query' value={researchResult.metadata?.query} />
                                                    <MetadataRow label='Timestamp' value={researchResult.metadata?.timestamp ? new Date(researchResult.metadata.timestamp).toLocaleString() : null} />
                                                    <MetadataRow label='Generated By' value={researchResult.metadata?.generated_by} />
                                                    <div className='col-span-full'><MetadataRow label='Data Sources' value={researchResult.metadata?.data_sources?.join(', ')} /></div>
                                                </div>
                                            </section>
                                            {/* Company */}
                                            <section>
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-1 w-5 bg-gradient-to-r from-[#149403] to-[#0f7a0f] rounded-full' />
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>Company Profile</h3>
                                                </div>
                                                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                                                    <div className='flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6'>
                                                        <div>
                                                            <h2 className='text-3xl font-extrabold text-gray-900 mb-2' style={{ fontFamily: "'Syne', sans-serif" }}>
                                                                {safeRender(researchResult.account?.name || researchResult.company?.name)}
                                                            </h2>
                                                            <div className='flex flex-wrap gap-2'>
                                                                {(researchResult.account?.industry || researchResult.company?.industry) && (
                                                                    <span className='px-3 py-1 bg-[#E8F8F0] text-[#149403] text-[10px] font-bold rounded-full border border-[#149403]/15' style={{ fontFamily: "'Syne', sans-serif" }}>{safeRender(researchResult.account?.industry || researchResult.company?.industry)}</span>
                                                                )}
                                                                {(researchResult.account?.sub_industry || researchResult.company?.sub_industry) && (
                                                                    <span className='px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full border border-gray-200' style={{ fontFamily: "'Syne', sans-serif" }}>{safeRender(researchResult.account?.sub_industry || researchResult.company?.sub_industry)}</span>
                                                                )}
                                                                {researchResult.account?.public_company && (
                                                                    <span className='px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-full border border-blue-100' style={{ fontFamily: "'Syne', sans-serif" }}>Public</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {(researchResult.account?.website || researchResult.company?.website) && (
                                                            <a href={safeRender(researchResult.account?.website || researchResult.company?.website) as string} target='_blank' rel='noopener noreferrer'
                                                                className='p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-[#149403] hover:bg-[#E8F8F0] transition-colors border border-gray-100'>
                                                                <Globe className='w-4 h-4' />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className='text-gray-500 leading-relaxed mb-8 whitespace-pre-wrap text-sm'>{safeRender(researchResult.account?.description || researchResult.company?.description)}</p>
                                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-gray-50'>
                                                        <InfoBox icon={<MapPin className='w-3.5 h-3.5' />} label='HQ' value={researchResult.account?.hq || researchResult.company?.hq} />
                                                        <InfoBox icon={<Users className='w-3.5 h-3.5' />} label='Employees' value={researchResult.account?.employee_count || researchResult.company?.employee_count} />
                                                        <InfoBox icon={<Calendar className='w-3.5 h-3.5' />} label='Founded' value={researchResult.account?.founded_year || researchResult.company?.founded_year} />
                                                        <InfoBox icon={<TrendingUp className='w-3.5 h-3.5' />} label='Segment' value={researchResult.account?.market_segment || researchResult.company?.market_segment} />
                                                    </div>
                                                </div>
                                            </section>
                                            {/* Contacts */}
                                            <section>
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-1 w-5 bg-gradient-to-r from-[#149403] to-[#0f7a0f] rounded-full' />
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>Key Decision Makers</h3>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    {(researchResult.contacts || researchResult.key_people || []).map((contact: any, idx: number) => (
                                                        <ContactCard key={idx} contact={contact} companyName={safeRender(researchResult.account?.name || researchResult.company?.name) as string} />
                                                    ))}
                                                </div>
                                            </section>
                                            {/* Strategic Insights */}
                                            <section>
                                                <div className='flex items-center gap-2 mb-4'>
                                                    <div className='h-1 w-5 bg-gradient-to-r from-[#149403] to-[#0f7a0f] rounded-full' />
                                                    <h3 className='text-[10px] font-bold text-gray-400 uppercase tracking-widest' style={{ fontFamily: "'Syne', sans-serif" }}>Strategic Insights</h3>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='bg-gradient-to-br from-[#fafffe] to-white p-6 rounded-2xl border border-[#149403]/10 shadow-sm hover:border-[#149403]/20 transition-colors'>
                                                        <h4 className='flex items-center gap-2 font-bold text-gray-900 mb-3 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>
                                                            <div className='w-6 h-6 rounded-lg bg-[#E8F8F0] flex items-center justify-center'><Target className='w-3.5 h-3.5 text-[#149403]' /></div>
                                                            Value Proposition
                                                        </h4>
                                                        <p className='text-sm text-gray-500 leading-relaxed'>{safeRender(researchResult.sales_insights?.value_proposition)}</p>
                                                    </div>
                                                    <div className='bg-gradient-to-br from-[#fafffe] to-white p-6 rounded-2xl border border-[#149403]/10 shadow-sm hover:border-[#149403]/20 transition-colors'>
                                                        <h4 className='flex items-center gap-2 font-bold text-gray-900 mb-3 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>
                                                            <div className='w-6 h-6 rounded-lg bg-[#E8F8F0] flex items-center justify-center'><Zap className='w-3.5 h-3.5 text-[#149403]' /></div>
                                                            Suggested Pitch
                                                        </h4>
                                                        <p className='text-sm text-gray-500 leading-relaxed italic'>"{safeRender(researchResult.sales_insights?.suggested_pitch)}"</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── AI Insights Modal ────────────────────────────────────────── */}
                <AnimatePresence>
                    {showInsights && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className='fixed inset-0 bg-white/95 backdrop-blur-xl z-[60] flex flex-col p-10 overflow-y-auto'>
                            <div className='flex items-center justify-between mb-8 max-w-[900px] mx-auto w-full'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8F8F0] to-[#d0f5e0] flex items-center justify-center text-[#149403] shadow-sm'><Sparkles className='w-5 h-5' /></div>
                                    <div>
                                        <h3 className='text-xl font-extrabold text-gray-900' style={{ fontFamily: "'Syne', sans-serif" }}>AI Insights Generated</h3>
                                        <p className='text-sm text-gray-400'>Based on your query and lead data</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowInsights(false)} className='p-2 hover:bg-gray-100 rounded-full transition-colors'><X className='w-5 h-5 text-gray-400' /></button>
                            </div>
                            <div className='max-w-[900px] mx-auto w-full'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                                    <div className='p-5 rounded-2xl border border-[#149403]/10 bg-[#fafffe]'>
                                        <h4 className='font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}><FileText className='w-4 h-4 text-[#149403]' />Lead Scoring</h4>
                                        <p className='text-sm text-gray-500'>85% of your leads are high-intent. 12 show immediate signs of readiness for outreach.</p>
                                    </div>
                                    <div className='p-5 rounded-2xl border border-[#149403]/10 bg-[#fafffe]'>
                                        <h4 className='font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}><LayoutDashboard className='w-4 h-4 text-[#149403]' />Industry Breakdown</h4>
                                        <p className='text-sm text-gray-500'>Primary sectors: SaaS (45%), Fintech (30%), E-commerce (25%).</p>
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    <h4 className='font-bold text-gray-900 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>Recommended Outreach Targets</h4>
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className='p-4 rounded-2xl border border-gray-200 flex items-center justify-between hover:border-[#149403]/30 hover:bg-[#fafffe] transition-all group cursor-pointer'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#E8F8F0] group-hover:text-[#149403] transition-colors'><User className='w-5 h-5' /></div>
                                                <div>
                                                    <p className='font-semibold text-gray-900 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>Alex Thompson</p>
                                                    <p className='text-xs text-gray-400'>CTO at TechFlow • High Intent</p>
                                                </div>
                                            </div>
                                            <button className='text-xs font-bold text-[#149403]' style={{ fontFamily: "'Syne', sans-serif" }}>View Details →</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Logout Confirmation ──────────────────────────────────────── */}
                <AnimatePresence>
                    {showLogoutConfirm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm'>
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className='relative w-full max-w-md overflow-hidden rounded-3xl border border-red-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl'>
                                <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/8 blur-3xl' />
                                <div className='absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#149403]/8 blur-3xl' />
                                <div className='relative z-10 flex flex-col items-center text-center'>
                                    <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400 border border-red-100 shadow-sm'>
                                        <LogOut className='h-7 w-7' />
                                    </div>
                                    <h3 className='mb-2 text-2xl font-extrabold text-gray-900' style={{ fontFamily: "'Syne', sans-serif" }}>Ready to leave?</h3>
                                    <p className='mb-8 text-gray-400 text-sm leading-relaxed'>You are about to leave the AI Command Centre. Please logout to securely end your session.</p>
                                    <div className='flex w-full flex-col gap-3'>
                                        <button onClick={confirmLogout}
                                            className='flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-200/60 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-200/80 active:scale-95 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>
                                            <LogOut className='h-4 w-4' /> Logout & Exit
                                        </button>
                                        <button onClick={() => setShowLogoutConfirm(false)}
                                            className='w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 font-bold text-gray-500 transition-all hover:bg-gray-50 hover:border-gray-300 text-sm' style={{ fontFamily: "'Syne', sans-serif" }}>
                                            Stay here
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AICommand;