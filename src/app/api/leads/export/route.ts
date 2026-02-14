import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'CreatedAt'];
    const csvRows = [
        headers.join(','),
        ...leads.map(l => [
            l.name,
            l.email || '',
            l.phone || '',
            l.company || '',
            l.status,
            new Date(l.created_at).toLocaleDateString()
        ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=leads_export.csv'
        }
    });
}
