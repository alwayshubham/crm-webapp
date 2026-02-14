# Supabase Setup Instructions

1. Go to https://app.supabase.com/ and sign in or create an account.
2. Create a new project for your CRM app.
3. Note your Supabase project URL and anon/public API key.
4. In your Next.js project, create a `.env.local` file and add:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

5. Install the Supabase JS client:

npm install @supabase/supabase-js

6. Create a `lib/supabaseClient.ts` file:

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

7. Set up authentication and database tables in the Supabase dashboard as per your schema.

8. Use the Supabase client in your Next.js app for auth, CRUD, and storage.
