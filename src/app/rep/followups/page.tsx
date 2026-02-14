'use client';

import { useEffect, useState } from 'react';

export default function FollowupsPage() {
    const [followups, setFollowups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
        fetch(`/api/followups?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setFollowups(data);
                setLoading(false);
            });
    }, []);

    const categorizeFollowups = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return {
            overdue: followups.filter(f => !f.completed && new Date(f.followup_at) < now && new Date(f.followup_at) < today),
            today: followups.filter(f => !f.completed && new Date(f.followup_at) >= today && new Date(f.followup_at) <= new Date(today.getTime() + 86400000)),
            upcoming: followups.filter(f => !f.completed && new Date(f.followup_at) > new Date(today.getTime() + 86400000))
        };
    };

    if (loading) return <div>Loading follow-ups...</div>;

    const sections = categorizeFollowups();

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Follow-ups</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <FollowupSection title="Overdue" items={sections.overdue} color="red" />
                <FollowupSection title="Today" items={sections.today} color="blue" />
                <FollowupSection title="Upcoming" items={sections.upcoming} color="green" />
            </div>
        </div>
    );
}

function FollowupSection({ title, items, color }: { title: string, items: any[], color: 'red' | 'blue' | 'green' }) {
    const colorClasses = {
        red: 'border-red-200 bg-red-50 text-red-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
        green: 'border-green-200 bg-green-50 text-green-700'
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className={`p-4 rounded-xl border-l-4 font-bold ${colorClasses[color]}`}>
                {title} ({items.length})
            </div>
            <div className="space-y-4">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No follow-ups here.</p>
                ) : (
                    items.map(f => (
                        <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="font-bold">{f.leads.name}</p>
                            <p className="text-xs text-gray-400 mb-3">{new Date(f.followup_at).toLocaleString()}</p>
                            <button className="text-xs font-bold text-blue-600 hover:underline">View Lead</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
