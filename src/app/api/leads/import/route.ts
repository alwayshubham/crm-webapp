import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { leads } = await request.json();

        // Basic validation and formatting
        const formattedLeads = leads.map((lead: any) => ({
            name: lead.name,
            email: lead.email || null,
            phone: lead.phone || null,
            company: lead.company || null,
            location: lead.location || null,
            source: lead.source || 'Import',
            status: lead.status || 'New',
            expected_value: Number(lead.expected_value) || 0,
            notes: lead.notes || null,
            pipeline_stage_id: 1, // Default stage
            assigned_rep: lead.assigned_rep || null,
        }));

        const { data, error } = await supabase
            .from('leads')
            .insert(formattedLeads)
            .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ message: `Successfully imported ${data.length} leads`, data });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
