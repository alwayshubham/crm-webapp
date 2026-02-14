'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard?role=admin')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.totalLeads}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Total Wins</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.wonLeads}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Conversion</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.stats.conversionRate}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Pipeline Value</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">₹{data.stats.pipelineValue.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Pipeline Summary</h2>
                    <div className="space-y-4">
                        {Object.entries(data.stats.leadsByStage).map(([id, count]: [any, any]) => (
                            <div key={id}>
                                <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-500">
                                    <span>Stage {id}</span>
                                    <span>{count} Leads</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${(count / data.stats.totalLeads) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Top Sales Representatives</h2>
                    <div className="space-y-4">
                        {data.topReps.map((rep: any, idx: number) => (
                            <div key={rep.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-gray-400 w-4">{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{rep.name}</p>
                                        <p className="text-[10px] text-green-500 font-bold uppercase">{rep.wins} Wins</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-gray-900">₹{rep.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
