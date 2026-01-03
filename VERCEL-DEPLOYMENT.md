# Vercel Deployment Guide

## Problem: "Supabase not configured" on Vercel

This happens because Vercel doesn't have your environment variables.

---

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Project Settings

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your Push Ninja project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar

### Step 2: Add These Variables

Add each variable one by one:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://veesjjuhwxntvecggoks.supabase.co`
- **Environment:** Check all (Production, Preview, Development)
- Click "Save"

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `sb_publishable_VrIdDSUN9ncrfmpvUAWzpg_1ILVLtSs`
- **Environment:** Check all (Production, Preview, Development)
- Click "Save"

#### Variable 3: NEXT_PUBLIC_PUSH_CHAIN_RPC
- **Key:** `NEXT_PUBLIC_PUSH_CHAIN_RPC`
- **Value:** `https://evm.donut.rpc.push.org/`
- **Environment:** Check all
- Click "Save"

#### Variable 4: NEXT_PUBLIC_PUSH_EXPLORER
- **Key:** `NEXT_PUBLIC_PUSH_EXPLORER`
- **Value:** `https://donut.push.network`
- **Environment:** Check all
- Click "Save"

#### Variable 5: NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
- **Key:** `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
- **Value:** `0x7Da1841d68509BCd92A9bd98cc71E2F228cDc573`
- **Environment:** Check all
- Click "Save"

#### Variable 6: NEXT_PUBLIC_STAKE_TREASURY_ADDRESS
- **Key:** `NEXT_PUBLIC_STAKE_TREASURY_ADDRESS`
- **Value:** `0x3b1793e470ce44de4595eaE95315eEC85746ae97`
- **Environment:** Check all
- Click "Save"

#### Variable 7: NEXT_PUBLIC_API_BASE_URL (Backend URL)
- **Key:** `NEXT_PUBLIC_API_BASE_URL`
- **Value:** `YOUR_BACKEND_URL` (e.g., `https://your-backend.herokuapp.com`)
- **Environment:** Production only
- Click "Save"

#### Variable 8: NEXT_PUBLIC_SOCKET_URL (Backend WebSocket)
- **Key:** `NEXT_PUBLIC_SOCKET_URL`
- **Value:** `YOUR_BACKEND_URL` (same as above)
- **Environment:** Production only
- Click "Save"

---

## Step 3: Redeploy

After adding all variables:

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## Quick Copy-Paste Format

For faster setup, here's the format Vercel accepts:

```
NEXT_PUBLIC_SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_VrIdDSUN9ncrfmpvUAWzpg_1ILVLtSs
NEXT_PUBLIC_PUSH_CHAIN_RPC=https://evm.donut.rpc.push.org/
NEXT_PUBLIC_PUSH_EXPLORER=https://donut.push.network
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x7Da1841d68509BCd92A9bd98cc71E2F228cDc573
NEXT_PUBLIC_STAKE_TREASURY_ADDRESS=0x3b1793e470ce44de4595eaE95315eEC85746ae97
NEXT_PUBLIC_API_BASE_URL=YOUR_BACKEND_URL
NEXT_PUBLIC_SOCKET_URL=YOUR_BACKEND_URL
```

---

## Backend Deployment (Optional)

If you want multiplayer to work, deploy the backend separately:

### Option 1: Railway
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Add environment variables from `backend/.env`
5. Copy the deployed URL
6. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel

### Option 2: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

### Option 3: Heroku
1. Go to https://heroku.com
2. Create new app
3. Connect GitHub
4. Add environment variables
5. Deploy

---

## Verification

After redeploying:

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for Supabase connection
4. Try connecting wallet
5. Test creating a game

---

## Troubleshooting

**Still showing "not configured"?**
- Make sure all variable names are EXACTLY as shown (case-sensitive)
- Check that you selected all environments (Production, Preview, Development)
- Try redeploying again
- Clear browser cache

**Backend not working?**
- Deploy backend separately (Railway, Render, or Heroku)
- Update `NEXT_PUBLIC_API_BASE_URL` with backend URL
- Make sure backend has CORS configured for your Vercel domain

---

## Important Notes

- ✅ All `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- ⚠️ Never put `SUPABASE_SERVICE_KEY` in frontend (only in backend)
- 🔒 Backend should be deployed separately with its own environment variables
- 🌐 Update CORS in backend to allow your Vercel domain

---

**After adding variables and redeploying, your app should work!** 🚀
