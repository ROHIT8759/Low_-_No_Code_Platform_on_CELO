# ⚡ Quick Start - Get Up and Running in 5 Minutes

## Step 1: Get Gemini API Key (2 minutes)

1. Open: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

## Step 2: Setup Supabase (2 minutes)

1. Open: https://supabase.com
2. Sign up / Sign in
3. Click "New Project"
   - Name: `celo-builder`
   - Password: (create one)
   - Region: (pick closest)
4. Wait ~2 minutes for setup

## Step 3: Run Database Schema (30 seconds)

1. In Supabase, click "SQL Editor"
2. Click "New Query"
3. Copy everything from `supabase/schema.sql`
4. Paste and click "Run"
5. Should see "Success"

## Step 4: Get Supabase Credentials (30 seconds)

1. Click Settings (gear icon)
2. Click "API"
3. Copy two values:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhb...`

## Step 5: Update .env.local (1 minute)

Open `.env.local` and update these 3 lines:

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy... (paste your Gemini key)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co (paste your URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (paste your anon key)
```

Save the file.

## Step 6: Restart Server (10 seconds)

```bash
# Press Ctrl+C to stop
pnpm dev
```

## Step 7: Test It Works (1 minute)

1. Open http://localhost:3000
2. Press F12 to open console
3. Click "Connect Wallet"
4. Approve connection
5. Look for: `✅ User initialized in Supabase`
6. Go to Supabase → Table Editor → users
7. See your wallet address? ✅ YOU'RE DONE!

---

## 🎉 What You Can Do Now

### 1. Build & Deploy Contracts
- Use the Canvas to build visually
- Deploy to Celo with one click
- AI generates beautiful frontend automatically

### 2. Cloud Storage
- All your projects saved to cloud
- Access from any device
- Full deployment history

### 3. AI Features
- AI-powered frontends (auto-enabled)
- Smart contract enhancements
- Gas optimization suggestions
- Auto-generated documentation

---

## 🆘 Troubleshooting

**"User initialized" not showing?**
- Check your API keys are correct
- Make sure no extra spaces in `.env.local`
- Restart the dev server

**Schema won't run?**
- Make sure you're in SQL Editor (not Table Editor)
- Copy ALL lines from schema.sql
- Check for "Success" message

**Still not working?**
- Check browser console for red errors
- Verify Supabase project is "Active" (not paused)
- See full troubleshooting in `SETUP_GUIDE.md`

---

## 📚 Full Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup with screenshots
- **Technical Summary**: `INTEGRATION_SUMMARY.md` - How it all works
- **Status**: `INTEGRATION_STATUS.md` - What's complete, what's next

---

**Need help?** Check the console for detailed error messages.

**Ready to build?** Go to http://localhost:3000 and start creating! 🚀
