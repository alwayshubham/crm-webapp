'use client';

import { useEffect, useState } from 'react';

export default function RepDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        fetch(`/api/dashboard?role=sales_rep&userId=${user.id}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Sales Rep Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">My Leads</p>
                    <p className="text-3xl font-black text-gray-900">{data.stats.totalLeads}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Wins</p>
                    <p className="text-3xl font-black text-gray-900">{data.stats.wonLeads}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Conversion</p>
                    <p className="text-3xl font-black text-gray-900">{data.stats.conversionRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">My Pipeline</p>
                    <p className="text-3xl font-black text-gray-900">₹{data.stats.pipelineValue.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Follow-ups Due Today</h2>
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-amber-100">
                        {data.followupsDue.length} Urgent
                    </span>
                </div>

                {data.followupsDue.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                        <p className="text-gray-400 font-medium">No follow-ups scheduled for today. ✨</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.followupsDue.map((f: any) => (
                            <div key={f.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border hover:border-blue-200 rounded-2xl transition cursor-pointer group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{f.leads.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(f.followup_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <a href={`/leads/${f.lead_id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
