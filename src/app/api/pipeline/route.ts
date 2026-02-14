import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_num', { ascending: true });

    if (stagesError) return NextResponse.json({ error: stagesError.message }, { status: 400 });

    // Get lead counts per stage
    const { data: leadCounts, error: countsError } = await supabase
        .from('leads')
        .select('pipeline_stage_id, expected_value');

    if (countsError) return NextResponse.json({ error: countsError.message }, { status: 400 });

    const stats = stages.map(stage => {
        const stageLeads = leadCounts.filter(l => l.pipeline_stage_id === stage.id);
        return {
            ...stage,
            count: stageLeads.length,
            totalValue: stageLeads.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0)
        };
    });

    return NextResponse.json(stats);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('pipeline_stages')
            .insert(body)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { leadId, stageId } = await request.json();
        const { data, error } = await supabase
            .from('leads')
            .update({ pipeline_stage_id: stageId, updated_at: new Date().toISOString() })
            .eq('id', leadId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
