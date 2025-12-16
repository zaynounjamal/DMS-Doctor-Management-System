import React, { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
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

            setMessage({ type: 'success', text: 'Template updated successfully!' });
            fetchTemplates(); // Refresh
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Email Templates</h1>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar List */}
                <div className="md:col-span-1 bg-white rounded-xl shadow-sm border p-4 space-y-2">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setSelectedTemplate(t); setMessage(null); }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                                selectedTemplate?.id === t.id 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            <Mail size={16} />
                            <div>
                                <div className="text-sm">{t.name}</div>
                                <div className="text-xs text-gray-500 truncate">{t.subject}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-sm border p-6">
                    {selectedTemplate ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={selectedTemplate.subject}
                                    onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Body (HTML) 
                                    <span className="text-xs text-gray-500 ml-2 font-normal">
                                        Supports placeholders: {`{{FullName}}, {{UserName}}, {{Date}}, {{Time}}`}
                                    </span>
                                </label>
                                <textarea
                                    rows={15}
                                    value={selectedTemplate.body}
                                    onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center text-gray-500 py-12">Select a template to edit</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplates;
