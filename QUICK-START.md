# 🚀 Quick Start - Push Ninja

## New Supabase Project Setup

### 1️⃣ Get Your API Keys (2 minutes)

Go to: https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/settings/api

Copy these 3 values:
- ✅ **Project URL:** `https://veesjjuhwxntvecggoks.supabase.co`
- ✅ **anon public key:** (JWT token starting with `eyJ...`)
- ✅ **service_role key:** (JWT token starting with `eyJ...`)

---

### 2️⃣ Update Environment Files (1 minute)

**File: `.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

**File: `backend/.env`**
```bash
SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_KEY=paste-your-service-role-key-here
```

---

### 3️⃣ Create Database Tables (2 minutes)

**Go to SQL Editor:**
https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/sql/new

**Copy this file:** `supabase/schema.sql`

**Or use the complete script in:** `NEW-SUPABASE-SETUP.md`

**Steps:**
1. Click "New Query"
2. Copy the ENTIRE SQL script
3. Paste it
4. Click "Run" (or Ctrl+Enter)
5. Wait for "Success" message

---

### 4️⃣ Start the Application (1 minute)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

Open: http://localhost:3000

---

## ✅ That's It!

Total time: **~6 minutes**

Your Push Ninja game is now running with:
- ✅ Real blockchain transactions (Push Chain Devnet)
- ✅ Multiplayer with staking
- ✅ NFT minting
- ✅ Leaderboards
- ✅ Private rooms

---

## Need Help?

- **Full Setup Guide:** See `NEW-SUPABASE-SETUP.md`
- **Troubleshooting:** See `SETUP.md`
- **Code Review:** See `CODE-REVIEW.md`

---

## Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/sql/new
- **API Keys:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/settings/api
- **Tables:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/editor
- **GitHub:** https://github.com/Kushcse09/PUSH-NINJA-V2
