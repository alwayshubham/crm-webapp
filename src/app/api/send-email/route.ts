import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { leadId, templateId, userId } = await request.json();

        // Fetch template and lead data
        const [templateRes, leadRes] = await Promise.all([
            supabase.from('email_templates').select('*').eq('id', templateId).single(),
            supabase.from('leads').select('*').eq('id', leadId).single()
        ]);

        if (templateRes.error || leadRes.error) {
            return NextResponse.json({ error: 'Template or lead not found' }, { status: 404 });
        }

        const template = templateRes.data;
        const lead = leadRes.data;

        // Replace template variables
        let emailBody = template.body;
        let emailSubject = template.subject;

        emailBody = emailBody.replace(/\{\{name\}\}/g, lead.name || '');
        emailBody = emailBody.replace(/\{\{company\}\}/g, lead.company || '');
        emailBody = emailBody.replace(/\{\{email\}\}/g, lead.email || '');

        emailSubject = emailSubject.replace(/\{\{name\}\}/g, lead.name || '');
        emailSubject = emailSubject.replace(/\{\{company\}\}/g, lead.company || '');

        // Log the email (in production, you would actually send it via Resend/SendGrid)
        const { data: logData, error: logError } = await supabase
            .from('email_logs')
            .insert({
                lead_id: leadId,
                user_id: userId,
                template_id: templateId,
                status: 'sent'
            })
            .select()
            .single();

        if (logError) {
            return NextResponse.json({ error: logError.message }, { status: 400 });
        }

        // In production, send actual email here using Resend or SendGrid
        // For now, we just log it
        return NextResponse.json({
            message: 'Email logged successfully',
            preview: {
                to: lead.email,
                subject: emailSubject,
                body: emailBody
            },
            log: logData
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
