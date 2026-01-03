# Push Ninja - Complete Setup Guide

## Quick Start (5 Minutes)

### 1. Get Supabase API Keys

Go to: https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/settings/api

Copy these values:
- **Project URL:** `https://veesjjuhwxntvecggoks.supabase.co`
- **anon public key:** `sb_publishable_VrIdDSUN9ncrfmpvUAWzpg_1ILVLtSs`
- **service_role key:** `sb_secret_eh8k2SpvO0qW5PJJ1C-5Aw_5UkDkYBd`

### 2. Update Environment Files

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_VrIdDSUN9ncrfmpvUAWzpg_1ILVLtSs
```

**Backend (backend/.env):**
```bash
SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
SUPABASE_ANON_KEY=sb_publishable_VrIdDSUN9ncrfmpvUAWzpg_1ILVLtSs
SUPABASE_SERVICE_KEY=sb_secret_eh8k2SpvO0qW5PJJ1C-5Aw_5UkDkYBd
```

### 3. Create Database Tables

**Go to SQL Editor:**
https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/sql/new

**Copy and run:** `supabase/schema.sql` (entire file)

This creates all tables, views, functions, and indexes.

### 4. Install & Run

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Open: http://localhost:3000

---

## Features

- **Single Player** - Slice tokens, avoid bombs, build combos
- **Multiplayer** - Real-time competition with PUSH token stakes
  - Public rooms - Join random opponents
  - Private rooms - Create rooms with 6-character codes
- **NFT Minting** - Mint high scores as NFTs on Push Chain
- **Leaderboards** - Track top players and recent matches
- **Real Blockchain** - Push Chain Devnet (testnet)

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Node.js, Express, Socket.IO
- **Blockchain:** Push Chain Devnet, Solidity, Hardhat
- **Database:** Supabase (PostgreSQL)

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see `VERCEL-DEPLOYMENT.md`)
4. Deploy

**Important:** Add all `NEXT_PUBLIC_*` variables from `.env.production.example` to Vercel

### Backend Deployment

Deploy backend separately to:
- Railway (recommended)
- Render
- Heroku

See `VERCEL-DEPLOYMENT.md` for detailed instructions.

## Smart Contracts

Deployed on Push Chain Devnet:
- **NFT Contract:** `0x7Da1841d68509BCd92A9bd98cc71E2F228cDc573`
- **Network:** Push Chain Devnet (Chain ID: 42101)
- **RPC:** https://evm.donut.rpc.push.org/
- **Explorer:** https://donut.push.network

## Multiplayer Staking

Bet tiers (testnet PUSH tokens):
- Casual: 0.001 PUSH
- Standard: 0.005 PUSH
- Competitive: 0.01 PUSH
- High Stakes: 0.05 PUSH

Winner gets 98% of the pool, 2% platform fee.

## Troubleshooting

**"Supabase not configured" error:**
- Verify your `.env.local` has the correct JWT token (starts with `eyJ...`)
- Run the migration script: `supabase-migration-add-columns.sql`

**Port already in use:**
- Backend uses port 3001
- Frontend uses port 3000
- Kill existing processes or change ports in `.env` files

**MetaMask connection issues:**
- Make sure you're on Push Chain Devnet
- Get testnet tokens from Push faucet

## Development

**Run tests:**
```bash
npm test
```

**Deploy contracts:**
```bash
cd contracts
npm run deploy:push
```

**Database migrations:**
See `supabase-migration-add-columns.sql` for schema updates.

## Production Deployment

1. Deploy frontend to Vercel
2. Deploy backend to your preferred hosting
3. Update environment variables with production URLs
4. Deploy contracts to Push Chain mainnet (when ready)

## License

MIT

## Support

For issues, check the GitHub repository or contact the team.
