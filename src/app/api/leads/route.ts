import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { calculateLeadScore } from '@/lib/aiScoring';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const repId = searchParams.get('repId');
    const search = searchParams.get('search');

    let query = supabase
        .from('leads')
        .select('*, pipeline_stages(name)');

    if (status) query = query.eq('status', status);
    if (stage) query = query.eq('pipeline_stage_id', stage);
    if (repId) query = query.eq('assigned_rep', repId);
    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Calculate AI score
        const { score, reason } = calculateLeadScore(body);
        const leadData = {
            ...body,
            ai_score: score,
            ai_score_reason: reason
        };

        const { data, error } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
