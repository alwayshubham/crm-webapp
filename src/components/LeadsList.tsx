'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadForm from './LeadForm';
import ImportModal from './ImportModal';

export default function LeadsList({ admin = false }: { admin?: boolean }) {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stage, setStage] = useState('');
    const [repId, setRepId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [reps, setReps] = useState<any[]>([]);
    const [stages, setStages] = useState<any[]>([]);

    const fetchFilters = async () => {
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

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('crm_user');
        const user = userStr ? JSON.parse(userStr) : {};
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (stage) params.append('stage', stage);
        if (!admin && user.id) params.append('repId', user.id);
        else if (repId) params.append('repId', repId);

        try {
            const res = await fetch(`/api/leads?${params.toString()}`);
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch leads', err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete lead');
            fetchLeads();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleExport = async () => {
        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        const params = new URLSearchParams();
        if (!admin) params.append('repId', user.id);
        const res = await fetch(`/api/leads/export?${params.toString()}`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_export.csv';
        a.click();
    };

    useEffect(() => {
        fetchLeads();
    }, [stage, repId]); // Reload on filter change

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leads</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleExport}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium border border-gray-200"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium border border-gray-200"
                    >
                        Import CSV
                    </button>
                    <button
                        onClick={() => {
                            setSelectedLead(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                    >
                        + Add Lead
                    </button>
                </div>
            </div>

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <ImportModal
                            onSuccess={() => {
                                setIsImportModalOpen(false);
                                fetchLeads();
                            }}
                            onCancel={() => setIsImportModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">{selectedLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <LeadForm
                                lead={selectedLead}
                                onSuccess={() => {
                                    setIsModalOpen(false);
                                    fetchLeads();
                                }}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search name, email, company..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                >
                    <option value="">All Stages</option>
                    {stages.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {admin && (
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={repId}
                        onChange={(e) => setRepId(e.target.value)}
                    >
                        <option value="">All Reps</option>
                        {reps.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                )}
                <button
                    onClick={fetchLeads}
                    className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                    Apply
                </button>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Value</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Rep</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">Loading leads...</td></tr>
                        ) : leads.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 italic">No leads found.</td></tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                                    <div className="text-xs text-gray-500">{lead.company || lead.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${lead.status === 'Won' ? 'bg-green-100 text-green-700' :
                                        lead.status === 'Lost' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    ₹{Number(lead.expected_value || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                    {lead.assigned_rep_name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                                    <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                                    <button
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-amber-600 hover:text-amber-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lead.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
