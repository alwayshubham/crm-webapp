'use client';

import { useEffect, useState } from 'react';
import LeadForm from './LeadForm';

export default function KanbanBoard({ admin = false }: { admin?: boolean }) {
    const [stages, setStages] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('crm_user');
        const user = userStr ? JSON.parse(userStr) : {};

        const [stagesRes, leadsRes] = await Promise.all([
            fetch('/api/pipeline'),
            fetch(`/api/leads${!admin && user.id ? `?repId=${user.id}` : ''}`)
        ]);

        const stagesData = await stagesRes.json();
        const leadsData = await leadsRes.json();

        setStages(stagesData);
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const moveLead = async (leadId: string, currentStageId: number, direction: number) => {
        const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
        const nextStage = stages[currentStageIndex + direction];
        if (!nextStage) return;

        const res = await fetch('/api/pipeline', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadId, stageId: nextStage.id })
        });

        if (res.ok) {
            fetchData();
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pipeline Board</h1>
                <div className="text-sm text-gray-500 font-medium">
                    Total Pipeline: <span className="text-gray-900 font-bold">₹{leads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex-1 flex space-x-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300">
                {stages.map((stage) => {
                    const stageLeads = leads.filter(l => l.pipeline_stage_id === stage.id);
                    const stageTotal = stageLeads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0);

                    return (
                        <div key={stage.id} className="min-w-[320px] w-[320px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
                                <div>
                                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{stage.name}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">₹{stageTotal.toLocaleString()}</p>
                                </div>
                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-blue-100">
                                    {stageLeads.length}
                                </span>
                            </div>
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[500px]">
                                {stageLeads.length === 0 && (
                                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-xs text-gray-400 font-medium">No leads here</p>
                                    </div>
                                )}
                                {stageLeads.map(lead => (
                                    <div
                                        key={lead.id}
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setIsModalOpen(true);
                                        }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer group relative"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm text-gray-900 line-clamp-1">{lead.name}</p>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                                {lead.source || 'Direct'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3 truncate font-medium">{lead.company || lead.email}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-sm font-black text-gray-900 tracking-tight">₹{Number(lead.expected_value || 0).toLocaleString()}</span>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveLead(lead.id, stage.id, -1); }}
                                                    disabled={stage.order_num === 1}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:invisible transition"
                                                    title="Move Left"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveLead(lead.id, stage.id, 1); }}
                                                    disabled={stage.order_num === stages.length}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:invisible transition"
                                                    title="Move Right"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">Edit Lead</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <LeadForm
                                lead={selectedLead}
                                onSuccess={() => {
                                    setIsModalOpen(false);
                                    fetchData();
                                }}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
