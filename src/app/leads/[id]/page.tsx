'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function LeadDetailsPage() {
    const { id } = useParams();
    const [lead, setLead] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [activityType, setActivityType] = useState('Call');
    const [followupAt, setFollowupAt] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const handleAddFollowup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!followupAt) return;

        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        const res = await fetch('/api/followups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lead_id: id,
                user_id: user.id,
                followup_at: followupAt
            })
        });

        if (res.ok) {
            setFollowupAt('');
            alert('Follow-up scheduled');
        }
    };

    const fetchData = async () => {
        const [leadRes, activitiesRes, templatesRes] = await Promise.all([
            fetch(`/api/leads/${id}`),
            fetch(`/api/activities?leadId=${id}`),
            fetch('/api/templates')
        ]);

        const leadData = await leadRes.json();
        const activitiesData = await activitiesRes.json();
        const templatesData = await templatesRes.json();

        setLead(leadData);
        setActivities(activitiesData);
        setTemplates(Array.isArray(templatesData) ? templatesData : []);
        setLoading(false);
    };

    const handleSendEmail = async () => {
        if (!selectedTemplate) {
            alert('Please select a template');
            return;
        }

        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadId: id,
                templateId: selectedTemplate,
                userId: user.id
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Email sent successfully!');
            setIsEmailModalOpen(false);
            setSelectedTemplate('');
        } else {
            alert('Failed to send email: ' + data.error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note) return;

        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        const res = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lead_id: id,
                user_id: user.id,
                type: activityType,
                note: note
            })
        });

        if (res.ok) {
            setNote('');
            fetchData();
        }
    };

    if (loading) return <div>Loading lead details...</div>;
    if (!lead) return <div>Lead not found.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Lead Info */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold mb-4">{lead.name}</h1>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${lead.status === 'Won' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Lost' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {lead.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Stage</p>
                            <p className="text-sm">{lead.pipeline_stages?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Company</p>
                            <p className="text-sm">{lead.company || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                            <p className="text-sm">{lead.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                            <p className="text-sm">{lead.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Expected Value</p>
                            <p className="text-sm font-bold text-blue-600">₹{Number(lead.expected_value || 0).toLocaleString()}</p>
                        </div>
                        {lead.ai_score && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold text-purple-600">AI Lead Score</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-black text-purple-700">{lead.ai_score}</span>
                                    <span className="text-xs text-gray-500">/ 100</span>
                                </div>
                                <p className="text-[10px] text-purple-500 italic mt-1">{lead.ai_score_reason}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold mb-4">Internal Notes</h2>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes || 'No notes added yet.'}</p>
                </div>

                <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-md flex items-center justify-center space-x-2"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <span>Send Email</span>
                </button>
            </div>

            {/* Right Column: Activities & Actions */}
            <div className="lg:col-span-2 space-y-6">
                {/* Log Activity & Schedule Follow-up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="font-bold mb-4 text-gray-800">Log Activity</h2>
                        <form onSubmit={handleAddActivity} className="space-y-4">
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                            >
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Meeting">Meeting</option>
                            </select>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="What happened? Add a note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                Post Activity
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="font-bold mb-4 text-gray-800">Schedule Follow-up</h2>
                        <form onSubmit={handleAddFollowup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={followupAt}
                                    onChange={(e) => setFollowupAt(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition">
                                Set Follow-up
                            </button>
                        </form>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="font-bold mb-6">Activity Timeline</h2>
                    <div className="space-y-6">
                        {activities.length === 0 ? (
                            <p className="text-gray-500 text-sm">No activities logged yet.</p>
                        ) : (
                            activities.map((activity, idx) => (
                                <div key={activity.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-6">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold">{activity.type}</p>
                                        <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-600">{activity.note}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">Send Email</h2>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Template</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    <option value="">Choose a template...</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                                >
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
