import React, { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle, Send, Sparkles, Layout, Code, Terminal, ArrowRight, MousePointer2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';
import { useAuth } from '../contexts/AuthContext';

const AdminEmailTemplates = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_URL}/emailtemplates`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch templates');
            const data = await response.json();
            setTemplates(data);
            if (data.length > 0 && !selectedTemplate) {
                setSelectedTemplate(data[0]);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error loading templates' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!selectedTemplate) return;

        try {
            const response = await fetch(`${API_URL}/emailtemplates/${selectedTemplate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(selectedTemplate)
            });

            if (!response.ok) throw new Error('Failed to update template');

            setMessage({ type: 'success', text: 'Template sync completed successfully!' });
            fetchTemplates(); // Refresh
            
            // Auto hide success message
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const placeholders = [
        { label: 'Full Name', tag: '{{FullName}}' },
        { label: 'User Name', tag: '{{UserName}}' },
        { label: 'Date', tag: '{{Date}}' },
        { label: 'Time', tag: '{{Time}}' },
        { label: 'Clinic Name', tag: '{{ClinicName}}' }
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl -mr-40 -mt-40 z-0" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                                <Mail size={24} />
                             </div>
                             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Email System</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-amber-500" />
                             Communication Architecture & Templates
                        </p>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm border ${
                                    message.type === 'error' 
                                    ? 'bg-red-50 text-red-700 border-red-100' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}
                            >
                                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                                <p className="text-sm font-black uppercase tracking-wider">{message.text}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="xl:col-span-3 space-y-4">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <Terminal size={14} className="text-gray-400" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment Channels</h3>
                    </div>
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 space-y-2">
                        {templates.map((t, idx) => (
                            <motion.button
                                key={t.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => { setSelectedTemplate(t); setMessage(null); }}
                                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group ${
                                    selectedTemplate?.id === t.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    selectedTemplate?.id === t.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    <Send size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-black tracking-tight leading-tight">{t.name}</div>
                                    <div className={`text-[10px] font-bold uppercase truncate transition-colors ${
                                        selectedTemplate?.id === t.id ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                        {t.subject}
                                    </div>
                                </div>
                                {selectedTemplate?.id === t.id && (
                                    <MousePointer2 size={16} className="text-white/50" />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Quick Help */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] text-white overflow-hidden relative group">
                        <Layout className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info size={14} />
                            Template Engine
                        </h4>
                        <p className="text-xs text-blue-100 font-bold leading-relaxed mb-4">
                            You are editing HTML templates. Always verify tag closure and responsive behavior.
                        </p>
                        <div className="space-y-2">
                            {placeholders.slice(0, 3).map(p => (
                                <div key={p.tag} className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/5 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase">{p.label}</span>
                                    <code className="text-[10px] font-mono text-blue-200">{p.tag}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Surface */}
                <div className="xl:col-span-9 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">
                    <AnimatePresence mode='wait'>
                        {selectedTemplate ? (
                            <motion.form 
                                key={selectedTemplate.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                onSubmit={handleSave} 
                                className="flex-1 flex flex-col"
                            >
                                {/* Editor Header */}
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                    <div className="flex-1 max-w-2xl space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Distribution Subject</label>
                                        <input
                                            type="text"
                                            value={selectedTemplate.subject}
                                            onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                            className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 shadow-sm font-bold text-gray-900 placeholder:text-gray-300"
                                            placeholder="Enter email subject line..."
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="hidden sm:flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                                    >
                                        <Save size={18} />
                                        Commit Changes
                                    </button>
                                </div>

                                {/* Editor Body */}
                                <div className="flex-1 p-8 flex flex-col gap-6">
                                    <div className="flex-1 flex flex-col space-y-3">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <Code size={14} className="text-gray-400" />
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">HTML Source Architecture</label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-gray-300 uppercase">Available Variables:</span>
                                                <div className="flex gap-2">
                                                    {placeholders.map(p => (
                                                        <button
                                                            key={p.tag}
                                                            type="button"
                                                            onClick={() => {
                                                                const textarea = document.getElementById('template-body');
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const text = selectedTemplate.body;
                                                                const before = text.substring(0, start);
                                                                const after = text.substring(end);
                                                                setSelectedTemplate({
                                                                    ...selectedTemplate,
                                                                    body: before + p.tag + after
                                                                });
                                                            }}
                                                            className="text-[9px] font-black px-2 py-1 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors uppercase border border-gray-100"
                                                        >
                                                            {p.tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <textarea
                                            id="template-body"
                                            value={selectedTemplate.body}
                                            onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                                            className="flex-1 w-full px-8 py-8 bg-gray-900 text-blue-100 rounded-[32px] focus:ring-4 focus:ring-blue-500/10 outline-none font-mono text-sm leading-relaxed shadow-inner border-[12px] border-gray-900"
                                            spellCheck="false"
                                        />
                                    </div>
                                </div>

                                {/* Footer Save (Mobile Only) */}
                                <div className="sm:hidden p-8 pt-0">
                                    <button 
                                        type="submit" 
                                        className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em]"
                                    >
                                        <Save size={18} />
                                        Commit Changes
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8">
                                    <Mail className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">System Idle</h3>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest max-w-xs">
                                    Select a communication channel from the sidebar to begin architectural modifications.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplates;
