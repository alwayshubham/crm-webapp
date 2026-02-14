'use client';

import { useState, useEffect } from 'react';
import { Lead, User, PipelineStage } from '@/types/database';

interface LeadFormProps {
    lead?: Partial<Lead>;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
    const [formData, setFormData] = useState<Partial<Lead>>(lead || {
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        source: '',
        status: 'New',
        expected_value: 0,
        notes: '',
        pipeline_stage_id: 1, // Default stage
    });
    const [reps, setReps] = useState<User[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch reps and stages
        const fetchData = async () => {
            const [repsRes, stagesRes] = await Promise.all([
                fetch('/api/users?role=sales_rep'),
                fetch('/api/pipeline')
            ]);
            const [repsData, stagesData] = await Promise.all([
                repsRes.json(),
                stagesRes.json()
            ]);
            setReps(repsData);
            setStages(stagesData);
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'expected_value' || name === 'pipeline_stage_id' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const method = formData.id ? 'PATCH' : 'POST';
        const url = formData.id ? `/api/leads/${formData.id}` : '/api/leads';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save lead');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-inner border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Name</label>
                    <input name="name" value={formData.name ?? ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
                    <input name="email" type="email" value={formData.email ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Phone</label>
                    <input name="phone" value={formData.phone ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Company</label>
                    <input name="company" value={formData.company ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Location</label>
                    <input name="location" value={formData.location ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Source</label>
                    <select name="source" value={formData.source ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="">Select Source</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select name="status" value={formData.status ?? 'New'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Expected Value (₹)</label>
                    <input name="expected_value" type="number" value={formData.expected_value ?? 0} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Assigned Rep</label>
                    <select name="assigned_rep" value={formData.assigned_rep ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="">Select Rep</option>
                        {reps.map(rep => (
                            <option key={rep.id} value={rep.id}>{rep.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Pipeline Stage</label>
                    <select name="pipeline_stage_id" value={formData.pipeline_stage_id ?? 1} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        {stages.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Notes</label>
                <textarea name="notes" value={formData.notes ?? ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Lead'}
                </button>
            </div>
        </form>
    );
}
