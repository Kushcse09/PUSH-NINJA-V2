# Push Ninja - Complete Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- Push Wallet
- Supabase account

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configure Environment

Copy the example files:
```bash
cp .env.local.example .env.local
cp backend/.env.example backend/.env
```

Edit `.env.local` and `backend/.env` with your Supabase credentials.

### 3. Setup Supabase Database

**Important:** Run the migration to add required columns:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Click "New Query"
3. Copy and paste the contents of `supabase-migration-add-columns.sql`
4. Click "Run"

This adds columns for private rooms and forfeit tracking.

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open http://localhost:3000

## Features

- **Single Player** - Slice tokens, avoid bombs, build combos
- **Multiplayer** - Compete in real-time with stakes
  - Public rooms - Join random opponents
  - Private rooms - Create rooms with 6-character codes
- **NFT Minting** - Mint your high scores as NFTs on Push Chain
- **Leaderboards** - Track top players and recent matches
- **Real Transactions** - Uses Push Chain Devnet (testnet)

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Node.js, Express, Socket.IO
- **Blockchain:** Push Chain Devnet, Solidity, Hardhat
- **Database:** Supabase (PostgreSQL)

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
