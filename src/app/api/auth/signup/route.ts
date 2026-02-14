import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const { email, password, name, role } = await request.json();

        // 1. Sign up user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                },
            },
        });

        if (authError) {
            console.error('Auth Error:', authError);
            if (authError.status === 429) {
                return NextResponse.json({
                    error: "Email rate limit exceeded. Please wait a while or disable 'Confirm Email' in your Supabase Dashboard (Authentication > Providers > Email).",
                    details: authError
                }, { status: 429 });
            }
            return NextResponse.json({ error: authError.message, details: authError }, { status: 400 });
        }

        console.log('Auth Success:', authData.user?.id);

        if (!authData.user) {
            return NextResponse.json({ error: 'User creation failed' }, { status: 400 });
        }

        // 2. Insert into our custom 'users' table
        const { error: dbError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                role,
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            return NextResponse.json({ error: dbError.message, details: dbError }, { status: 400 });
        }

        console.log('DB Success:', authData.user.id);

        return NextResponse.json({ user: authData.user, message: 'Signup successful' });
    } catch (error: any) {
        console.error('Unexpected Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
