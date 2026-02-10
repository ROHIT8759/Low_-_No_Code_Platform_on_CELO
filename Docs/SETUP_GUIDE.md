# Block Builder Setup Guide

## 🎯 New Features Added

1. **Gemini AI Integration** - AI-powered frontend generation and contract enhancement
2. **Supabase Integration** - Cloud database for user and project data persistence

---

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm package manager
- A Celo-compatible wallet (MetaMask recommended)
- Google account for Gemini API
- Supabase account (free tier available)

---

## 🚀 Quick Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or email
4. Click "New Project"
5. Fill in:
   - **Project Name**: `celo-builder` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
6. Click "Create new project" (takes 1-2 minutes)

#### Run Database Schema

1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase/schema.sql` in this project
4. Copy all contents and paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

#### Get Your Supabase Credentials

1. In your Supabase project, click "Project Settings" (gear icon at bottom left)
2. Click "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public**: Copy this key (starts with `eyJ...`)

### 4. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```env
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### 5. Start the Development Server

```bash
pnpm dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## ✨ How to Use the New Features

### Gemini AI Features

The AI integration provides 5 powerful features:

1. **AI-Generated Frontends**

   - Deploy a contract through the Deploy Modal
   - The system automatically uses Gemini to generate a beautiful, fully-functional Next.js frontend
   - If Gemini API fails, it falls back to the default generator

2. **Contract Enhancement** (coming soon to UI)

   - Add new features to existing contracts using AI
   - Example: "Add pausable functionality" or "Add access control"

3. **Gas Optimization** (coming soon to UI)

   - Get AI-powered suggestions to reduce gas costs
   - Analyzes your Solidity code and provides specific improvements

4. **Contract Documentation** (coming soon to UI)

   - Auto-generate comprehensive markdown documentation
   - Includes function descriptions, parameters, and usage examples

5. **Contract Explanations** (coming soon to UI)
   - Get simple, human-readable explanations of complex contracts
   - Perfect for learning or auditing

### Supabase Cloud Storage

Once you've set up Supabase and configured the environment variables:

1. **User Management**

   - When you connect your wallet, a user account is automatically created
   - Your projects and deployed contracts are linked to your wallet address

2. **Project Sync**

   - All your projects are automatically saved to the cloud
   - Access your projects from any device by connecting the same wallet

3. **Deployed Contracts History**
   - Every deployed contract is saved with full details
   - View deployment history, transaction hashes, and contract ABIs
   - Sync across devices

---

## 🔍 Testing Your Setup

### Test Gemini AI

1. Build a simple contract in the Canvas
2. Click "Deploy"
3. Complete deployment
4. Check browser console - you should see Gemini API calls
5. The generated frontend will use AI enhancements

### Test Supabase

1. Connect your wallet in the navbar
2. Check browser console for "User initialized" message
3. Create a project
4. Go to your Supabase project → Table Editor
5. Check the `users` and `projects` tables for your data

---

## 🛠️ Troubleshooting

### Gemini AI Issues

**Error: "API key not found"**

- Make sure you've set `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`
- Restart the dev server after adding the key

**Error: "403 Forbidden"**

- Your API key may be invalid
- Generate a new key at Google AI Studio

**AI generation seems slow**

- Gemini API can take 5-30 seconds depending on contract complexity
- This is normal - the AI is analyzing and generating code

### Supabase Issues

**Error: "Invalid API key"**

- Double-check you copied the correct anon key from Supabase
- Make sure there are no extra spaces or line breaks

**Error: "relation does not exist"**

- You haven't run the schema.sql file yet
- Go to Supabase SQL Editor and run the schema

**Data not saving**

- Check browser console for errors
- Make sure your wallet is connected
- Verify your Supabase project is active (not paused)

### General Issues

**Changes not appearing**

- Restart the Next.js dev server: `pnpm dev`
- Clear browser cache and refresh

**TypeScript errors**

- Run `pnpm install` to ensure all dependencies are installed

---

## 📚 File Structure

```
lib/
├── gemini.ts                    # Gemini AI integration
├── gemini-frontend-generator.ts # AI-powered frontend generator
├── supabase.ts                  # Supabase client & helper functions
└── supabase-store.ts            # Zustand store for cloud sync

supabase/
└── schema.sql                   # Database schema

components/
├── deploy-modal.tsx             # Updated with AI & cloud sync
└── navbar.tsx                   # Will integrate user management
```

---

## 🔐 Security Notes

### API Keys

- **Never commit** `.env.local` to version control
- The `.gitignore` already excludes this file
- Keep your Supabase database password safe

### Row Level Security (RLS)

- The database schema includes RLS policies
- Users can only access their own data
- This is already configured in `schema.sql`

---

## 🎨 What's Next?

### Upcoming UI Enhancements

1. **Settings Page**

   - Configure AI models and preferences
   - View API usage and quotas

2. **Enhanced Deploy Modal**

   - AI optimization suggestions before deployment
   - Gas estimation with AI recommendations

3. **Project Dashboard**

   - Visual project history from Supabase
   - Contract analytics and insights

4. **AI Contract Assistant**
   - Chat interface for contract questions
   - Real-time code suggestions as you build

---

## 📞 Need Help?

- Check the browser console for detailed error messages
- Review the Supabase logs in your project dashboard
- Make sure all environment variables are set correctly
- Ensure you're using a Celo-compatible wallet with some test CELO

---

## 🚀 Ready to Build!

Once everything is set up:

1. ✅ Gemini API key configured
2. ✅ Supabase project created and schema loaded
3. ✅ Environment variables set
4. ✅ Dev server running

You're ready to build amazing smart contracts with AI assistance and cloud storage!

Visit [http://localhost:3000](http://localhost:3000) and start building! 🎉
