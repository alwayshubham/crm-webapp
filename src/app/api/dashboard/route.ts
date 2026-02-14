import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    let query = supabase.from('leads').select('*');

    if (role === 'sales_rep' && userId) {
        query = query.eq('assigned_rep', userId);
    }

    const { data: leads, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'Won').length;
    const lostLeads = leads.filter(l => l.status === 'Lost').length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const pipelineValue = leads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0);

    // Group leads by stage for Chart data
    const leadsByStage = leads.reduce((acc: any, lead) => {
        const stageId = lead.pipeline_stage_id || 1;
        acc[stageId] = (acc[stageId] || 0) + 1;
        return acc;
    }, {});

    // Get followups due today
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    let followupQuery = supabase
        .from('lead_followups')
        .select('*, leads(name)')
        .eq('completed', false)
        .gte('followup_at', todayStart)
        .lte('followup_at', todayEnd);

    if (role === 'sales_rep' && userId) {
        followupQuery = followupQuery.eq('user_id', userId);
    }

    const { data: followups } = await followupQuery;

    // Get Top Reps for Admin
    let topReps: any[] = [];
    if (role === 'admin') {
        const repsData: any = {};
        leads.forEach(l => {
            if (!l.assigned_rep) return;
            if (!repsData[l.assigned_rep]) repsData[l.assigned_rep] = { wins: 0, value: 0 };
            if (l.status === 'Won') {
                repsData[l.assigned_rep].wins += 1;
                repsData[l.assigned_rep].value += (Number(l.expected_value) || 0);
            }
        });

        // Convert to array and join with user names
        const { data: users } = await supabase.from('users').select('id, name');
        topReps = Object.entries(repsData).map(([id, stats]: [string, any]) => {
            const user = users?.find(u => u.id === id);
            return {
                id,
                name: user?.name || 'Unknown',
                wins: stats.wins,
                value: stats.value
            };
        }).sort((a, b) => b.value - a.value).slice(0, 5);
    }

    return NextResponse.json({
        stats: {
            totalLeads,
            wonLeads,
            lostLeads,
            conversionRate: Number(conversionRate).toFixed(1),
            pipelineValue,
            leadsByStage,
        },
        followupsDue: followups || [],
        topReps,
    });
}
