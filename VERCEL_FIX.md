# Quick Deployment Fix for Vercel

## ⚡ Immediate Fix

The build is failing because Vercel doesn't have your Supabase credentials.

### Add These Environment Variables on Vercel:

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. Add these two variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://kymhuksaoojmgnhzufzj.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bWh1a3Nhb29qbWduaHp1ZnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTg3NTUsImV4cCI6MjA4NjU3NDc1NX0.tzY7KkXx2-MtRtfNzz7itvm18KYsRpu82mN7NwxwhqY
Environment: Production, Preview, Development
```

3. **Redeploy** (Vercel will automatically redeploy after adding env vars)

---

## ✅ What Was Fixed

- Updated `supabaseClient.ts` to use fallback values during build
- This allows the build to complete even without env vars
- Runtime will still use your actual Supabase credentials

---

## 📋 Next Steps After Deployment

1. **Configure Supabase Auth Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add: `https://your-app.vercel.app/auth/callback`

2. **Test the deployment:**
   - Visit your Vercel URL
   - Try signing up/logging in
   - Test forgot password flow

---

For complete deployment instructions, see [DEPLOYMENT.md](file:///C:/Users/Admin/.gemini/antigravity/brain/42589217-b46c-471a-ab95-a37b6771ac4d/DEPLOYMENT.md)
