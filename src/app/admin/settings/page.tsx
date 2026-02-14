'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
    const [stages, setStages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStage, setEditingStage] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', order_num: 0 });

    const fetchStages = async () => {
        setLoading(true);
        const res = await fetch('/api/pipeline');
        const data = await res.json();
        setStages(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchStages();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingStage ? `/api/pipeline/${editingStage.id}` : '/api/pipeline';
        const method = editingStage ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setIsModalOpen(false);
            setFormData({ name: '', order_num: 0 });
            setEditingStage(null);
            fetchStages();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this stage? Leads in this stage will need to be reassigned.')) return;

        const res = await fetch(`/api/pipeline/${id}`, { method: 'DELETE' });
        if (res.ok) fetchStages();
    };

    const openEditModal = (stage: any) => {
        setEditingStage(stage);
        setFormData({
            name: stage.name,
            order_num: stage.order_num
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
                <h1 className="text-2xl font-bold text-gray-800">Pipeline Settings</h1>
                <button
                    onClick={() => {
                        setEditingStage(null);
                        setFormData({ name: '', order_num: stages.length + 1 });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    + Add Stage
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stage Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stages.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No stages found.</td></tr>
                        ) : (
                            stages.map((stage) => (
                                <tr key={stage.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                            {stage.order_num}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{stage.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(stage)}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stage.id)}
                                                className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingStage ? 'Edit Stage' : 'New Stage'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Stage Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Qualified"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Order Number</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.order_num}
                                    onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) })}
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
                                    {editingStage ? 'Update' : 'Create'} Stage
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
