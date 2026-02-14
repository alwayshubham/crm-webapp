'use client';

import { useEffect, useState } from 'react';

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', subject: '', body: '' });

    const fetchTemplates = async () => {
        setLoading(true);
        const res = await fetch('/api/templates');
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');

        const payload = {
            ...formData,
            created_by: user.id
        };

        const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
        const method = editingTemplate ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsModalOpen(false);
            setFormData({ name: '', subject: '', body: '' });
            setEditingTemplate(null);
            fetchTemplates();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this template?')) return;

        const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
        if (res.ok) fetchTemplates();
    };

    const openEditModal = (template: any) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body
        });
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Email Templates</h1>
                <button
                    onClick={() => {
                        setEditingTemplate(null);
                        setFormData({ name: '', subject: '', body: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    + New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length === 0 ? (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 font-medium">No templates yet. Create your first one!</p>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div key={template.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-500 mb-1"><strong>Subject:</strong> {template.subject}</p>
                            <p className="text-xs text-gray-400 mb-4 line-clamp-3">{template.body}</p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openEditModal(template)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTemplate ? 'Edit Template' : 'New Template'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Welcome Email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Welcome to CRM Pro!"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Body</label>
                                <p className="text-xs text-gray-500 mb-2">Use variables: {`{{name}}, {{company}}, {{email}}`}</p>
                                <textarea
                                    required
                                    rows={10}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    placeholder="Hi {{name}},&#10;&#10;Thank you for your interest..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    {editingTemplate ? 'Update' : 'Create'} Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
