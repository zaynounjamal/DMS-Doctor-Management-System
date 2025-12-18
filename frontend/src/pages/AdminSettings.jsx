import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings, uploadFile } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Save, Upload, Settings, Globe, Shield, HeartPulse, Sparkles, Image as ImageIcon, MapPin, Phone, Mail, Facebook, Twitter, Instagram, ChevronRight, CheckCircle2, Loader2, Command, Eye, EyeOff, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveThemePreview from '../components/admin/LiveThemePreview';

const AdminSettings = () => {
    const { showToast } = useToast();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await getSystemSettings();
            setSettings(data);
            
            const initialData = {};
            data.forEach(s => {
                initialData[s.key] = s.value;
            });
            setFormData(initialData);

        } catch (error) {
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (key, file) => {
        if (!file) return;
        try {
            const result = await uploadFile(file);
            handleChange(key, result.url);
            showToast('Asset uploaded successfully', 'success');
        } catch (error) {
            showToast('Upload failed: ' + error.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
                key,
                value,
                description: settings.find(s => s.key === key)?.description || ''
            }));

            await updateSystemSettings(settingsToUpdate);
            showToast('System configuration synchronized', 'success');
            setTimeout(() => window.location.reload(), 1500); 
        } catch (error) {
            showToast('Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const DynamicIcon = ({ name, className = "w-5 h-5" }) => {
        const IconComponent = Icons[name] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    const renderField = (key, label, type = "text", icon) => {
        const IconComp = icon;
        return (
            <div className="space-y-2 group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    {IconComp && <IconComp size={12} className="text-indigo-400" />}
                    {label}
                </label>
                {type === "file" ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-[28px] border border-transparent group-focus-within:border-indigo-100 transition-all">
                            {formData[key] && (
                                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-gray-100 flex-shrink-0 overflow-hidden">
                                    {formData[key].startsWith('icon:') ? (
                                        <DynamicIcon name={formData[key].split(':')[1]} className="w-8 h-8 text-indigo-600" />
                                    ) : (
                                        <img src={formData[key]} alt="Preview" className="h-full w-full object-contain" />
                                    )}
                                </div>
                            )}
                            <div className="flex-1 space-y-2 w-full">
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200">
                                        <Upload size={14} />
                                        <span>Select File</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(key, e.target.files[0])}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[key] || ''}
                                        readOnly
                                        className="flex-1 px-4 py-2.5 bg-white rounded-xl border-none text-gray-400 text-[10px] font-mono shadow-inner outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {key === 'LogoUrl' && (
                            <div className="px-1">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Or choose a system icon:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Stethoscope', 'Activity', 'Heart', 'Shield', 'Cross', 'BriefcaseMedical', 'PlusCircle'].map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => handleChange(key, `icon:${iconName}`)}
                                            className={`p-3 rounded-2xl border-2 transition-all ${formData[key] === `icon:${iconName}` ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'}`}
                                        >
                                            <DynamicIcon name={iconName} className="w-6 h-6" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : type === "color" ? (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={(formData[key] || '').toString().startsWith('#') ? formData[key] : '#6d28d9'}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-12 w-14 rounded-2xl border border-gray-200 bg-white shadow-inner"
                        />
                        <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900 shadow-inner placeholder:text-gray-300"
                            placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                    </div>
                ) : (
                    <input
                        type={type}
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900 shadow-inner placeholder:text-gray-300"
                        placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <Settings className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className={`${showPreview ? 'max-w-7xl' : 'max-w-4xl'} mx-auto space-y-8 pb-10`}>
            {/* Header */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl -mr-40 -mt-40 z-0" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                                <Settings size={24} />
                             </div>
                             <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Core</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                             <Command className="w-4 h-4 text-emerald-500" />
                             Global Configuration & Preferences
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {activeTab === 'branding' && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-100 text-indigo-700 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-indigo-200 transition-all"
                            >
                                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                {showPreview ? 'Hide' : 'Show'} Preview
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-gray-200 group"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                            {saving ? 'Synchronizing...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}`}>
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Custom Tabs */}
                <div className="px-8 pt-8 flex gap-8 border-b border-gray-50">
                    {[
                        { id: 'general', label: 'Primary Config', icon: Globe },
                        { id: 'branding', label: 'Visual Identity', icon: ImageIcon }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 pb-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode='wait'>
                            {activeTab === 'general' ? (
                                <motion.div 
                                    key="general"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 px-2">
                                                <Sparkles size={14} className="text-amber-400" />
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinic Identity</h3>
                                            </div>
                                            {renderField('ClinicName', 'Entity Name', 'text', Globe)}
                                            {renderField('Address', 'Physical Address', 'text', MapPin)}
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 px-2">
                                                <HeartPulse size={14} className="text-rose-400" />
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Contact</h3>
                                            </div>
                                            {renderField('Phone', 'Communication Link', 'text', Phone)}
                                            {renderField('Email', 'Digital Inbox', 'text', Mail)}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2 px-2 mb-6">
                                            <Shield size={14} className="text-emerald-400" />
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Social Matrix</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {renderField('FacebookUrl', 'Facebook Network', 'text', Facebook)}
                                            {renderField('TwitterUrl', 'X Architecture', 'text', Twitter)}
                                            {renderField('InstagramUrl', 'Instagram Feed', 'text', Instagram)}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="branding"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 px-2">
                                            <ImageIcon size={14} className="text-blue-400" />
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Core</h3>
                                        </div>
                                        {renderField('LogoUrl', 'Primary System Logo', 'file')}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 px-2">
                                                <Command size={14} className="text-purple-400" />
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Content Engine</h3>
                                            </div>
                                            {renderField('HeroTitle', 'Main Interface H1')}
                                            {renderField('HeroSubtitle', 'Main Interface P1')}
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 px-2">
                                                <Sparkles size={14} className="text-amber-400" />
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hero Asset</h3>
                                            </div>
                                            {renderField('HeroImageUrl', 'Hero Background Vector', 'file')}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2 px-2 mb-6">
                                            <Sparkles size={14} className="text-indigo-400" />
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Theme Colors</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderField('ThemePrimaryLight', 'Primary (Light)', 'color')}
                                            {renderField('ThemePrimaryDark', 'Primary (Dark)', 'color')}
                                            {renderField('ThemeAccentLight', 'Accent (Light)', 'color')}
                                            {renderField('ThemeAccentDark', 'Accent (Dark)', 'color')}
                                            {renderField('ThemeSecondaryLight', 'Secondary (Light)', 'color')}
                                            {renderField('ThemeSecondaryDark', 'Secondary (Dark)', 'color')}
                                            {renderField('ThemeMutedLight', 'Muted (Light)', 'color')}
                                            {renderField('ThemeMutedDark', 'Muted (Dark)', 'color')}
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">
                                                    Light vs Dark Mode Colors
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Set separate colors for light mode (e.g., Primary Light) and dark mode (e.g., Primary Dark). 
                                                    Users will see Light colors in light mode and Dark colors in dark mode. 
                                                    Toggle the theme button in the header to preview both modes.
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Use HEX (e.g. #6d28d9) or any valid CSS color.
                                                </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const defaults = {
                                                        ThemePrimaryLight: 'hsl(262, 52%, 47%)',
                                                        ThemePrimaryDark: 'hsl(262, 65%, 60%)',
                                                        ThemeSecondaryLight: 'hsl(220, 25%, 95%)',
                                                        ThemeSecondaryDark: 'hsl(220, 15%, 20%)',
                                                        ThemeAccentLight: 'hsl(199, 89%, 48%)',
                                                        ThemeAccentDark: 'hsl(199, 89%, 58%)',
                                                        ThemeMutedLight: 'hsl(240, 10%, 85%)',
                                                        ThemeMutedDark: 'hsl(240, 5%, 40%)'
                                                    };
                                                    setFormData(prev => ({ ...prev, ...defaults }));
                                                }}
                                                className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-black/10 transition-all bg-gradient-to-r from-gray-900 via-gray-800 to-black hover:from-black hover:via-gray-900 hover:to-gray-800 hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                Revert to Defaults
                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-12 pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <CheckCircle2 size={24} className="text-emerald-500" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700 uppercase leading-none">Status: operational</p>
                                    <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Changes are deployed in real-time across all nodes.</p>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                                Commit System Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Live Theme Preview Panel */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Eye size={18} className="text-indigo-600" />
                                    Live Theme Preview
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                            <LiveThemePreview formData={formData} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminSettings;
