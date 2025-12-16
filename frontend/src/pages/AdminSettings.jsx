
import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings, uploadFile } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Save, Upload } from 'lucide-react';
import * as Icons from 'lucide-react';

const AdminSettings = () => {
    const { showToast } = useToast();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({});

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
            handleChange(key, result.url); // Assuming backend returns { url: "..." }
            showToast('File uploaded successfully', 'success');
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
            showToast('Settings updated successfully', 'success');
            setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes
        } catch (error) {
            showToast('Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    const renderField = (key, label, type = "text") => {
        const setting = settings.find(s => s.key === key);
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {type === "file" ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            {formData[key] && (
                                <div className="h-12 w-auto border p-1 rounded bg-gray-50 flex items-center justify-center min-w-[3rem]">
                                    {formData[key].startsWith('icon:') ? (
                                        <DynamicIcon name={formData[key].split(':')[1]} className="w-8 h-8 text-indigo-600" />
                                    ) : (
                                        <img src={`${formData[key]}`} alt="Preview" className="h-full w-auto object-contain" />
                                    )}
                                </div>
                            )}
                            <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <Upload size={16} />
                                <span>Upload Image</span>
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
                                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-xs"
                            />
                        </div>
                        
                        {/* Pre-prepared Logos List for LogoUrl */}
                        {key === 'LogoUrl' && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-2">Or choose a pre-defined logo:</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {['Stethoscope', 'Activity', 'Heart', 'Shield', 'Cross', 'BriefcaseMedical', 'PlusCircle'].map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => handleChange(key, `icon:${iconName}`)}
                                            className={`p-2 border rounded-lg hover:bg-indigo-50 transition-colors ${formData[key] === `icon:${iconName}` ? 'bg-indigo-100 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white'}`}
                                            title={iconName}
                                        >
                                            <DynamicIcon name={iconName} className="w-6 h-6 text-gray-700" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <input
                        type={type}
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                )}
            </div>
        );
    };

    const DynamicIcon = ({ name, className = "w-5 h-5" }) => {
        const IconComponent = Icons[name] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b bg-gray-50 flex">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'general' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        General
                    </button>
                    <button 
                        onClick={() => setActiveTab('branding')}
                        className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'branding' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Branding
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'general' && (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Contact Information</h3>
                                {renderField('ClinicName', 'Clinic Name')}
                                {renderField('Address', 'Address')}
                                {renderField('Phone', 'Phone Number')}
                                {renderField('Email', 'Email Address')}

                                <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4 pb-2 border-b">Social Media Links</h3>
                                {renderField('FacebookUrl', 'Facebook URL')}
                                {renderField('TwitterUrl', 'Twitter URL')}
                                {renderField('InstagramUrl', 'Instagram URL')}
                            </>
                        )}

                        {activeTab === 'branding' && (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Brand Identity</h3>
                                {renderField('LogoUrl', 'Logo', 'file')}
                                {renderField('HeroTitle', 'Hero Title')}
                                {renderField('HeroSubtitle', 'Hero Subtitle')}
                                {renderField('HeroImageUrl', 'Hero Background Image', 'file')}
                            </>
                        )}

                        <div className="mt-8 pt-4 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
