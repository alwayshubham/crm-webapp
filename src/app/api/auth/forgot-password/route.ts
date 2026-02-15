import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const trimmedEmail = email?.trim();
        console.log('Forgot password request for:', trimmedEmail);

        if (!trimmedEmail) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${new URL(request.url).origin}/reset-password`,
        });

        if (error) {
            console.error('Supabase error:', error.message);
            // Retrieve more specific error info if possible, or generalize
            if (error.message.includes('is invalid') || error.message.includes('not found')) {
                return NextResponse.json({ error: 'Invalid email or account not found' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Password reset link sent to your email' });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
