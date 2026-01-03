# 🚀 New Supabase Setup Guide

## Your New Supabase Project
**Project ID:** veesjjuhwxntvecggoks
**Dashboard:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks

---

## Step 1: Get Your API Keys

1. Go to: https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/settings/api
2. Copy these values:
   - **Project URL** (looks like: `https://veesjjuhwxntvecggoks.supabase.co`)
   - **anon public** key (JWT token starting with `eyJ...`)
   - **service_role** key (JWT token starting with `eyJ...`)

---

## Step 2: Update Environment Files

### Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Push Chain Devnet (Donut) Configuration
NEXT_PUBLIC_PUSH_CHAIN_RPC=https://evm.donut.rpc.push.org/
NEXT_PUBLIC_PUSH_EXPLORER=https://donut.push.network

# NFT Contract Address (deployed to Push Chain Devnet)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x7Da1841d68509BCd92A9bd98cc71E2F228cDc573

# Treasury Wallet for Multiplayer Stakes
NEXT_PUBLIC_STAKE_TREASURY_ADDRESS=0x3b1793e470ce44de4595eaE95315eEC85746ae97

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Backend (backend/.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://veesjjuhwxntvecggoks.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Push Chain
PUSH_CHAIN_RPC=https://evm.donut.rpc.push.org/

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## Step 3: Create Database Tables

### Go to SQL Editor
1. Open: https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/sql/new
2. Click "New Query"
3. Copy the **ENTIRE** script below
4. Paste it in the SQL editor
5. Click "Run" (or press Ctrl+Enter)

### SQL Script to Run
Copy from the file: **`supabase/schema.sql`**

Or use this complete script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id BIGINT UNIQUE NOT NULL,
  bet_amount BIGINT NOT NULL,
  bet_tier INTEGER NOT NULL,
  player1_address TEXT NOT NULL,
  player2_address TEXT,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  player1_finished BOOLEAN DEFAULT FALSE,
  player2_finished BOOLEAN DEFAULT FALSE,
  winner_address TEXT,
  win_type TEXT,
  state INTEGER DEFAULT 0,
  room_type TEXT DEFAULT 'public',
  room_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  creation_tx_hash TEXT,
  join_tx_hash TEXT,
  finish_tx_hash TEXT
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_wagered BIGINT DEFAULT 0,
  total_winnings BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player game stats
CREATE TABLE IF NOT EXISTS player_game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_address TEXT NOT NULL,
  game_id BIGINT NOT NULL,
  final_score INTEGER NOT NULL,
  max_combo INTEGER DEFAULT 0,
  tokens_slashed INTEGER DEFAULT 0,
  tokens_missed INTEGER DEFAULT 0,
  game_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT mints table
CREATE TABLE IF NOT EXISTS nft_mints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_address TEXT NOT NULL,
  token_id TEXT,
  transaction_hash TEXT,
  score INTEGER NOT NULL,
  max_combo INTEGER DEFAULT 0,
  tokens_slashed INTEGER DEFAULT 0,
  tier_name TEXT,
  chain TEXT DEFAULT 'push',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event log
CREATE TABLE IF NOT EXISTS event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  game_id BIGINT,
  player_address TEXT,
  data JSONB,
  transaction_hash TEXT,
  transaction_version BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexer state
CREATE TABLE IF NOT EXISTS indexer_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_processed_version BIGINT DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_syncing BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_state ON games(state);
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_address);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_address);
CREATE INDEX IF NOT EXISTS idx_games_game_id ON games(game_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code) WHERE room_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_public_waiting ON games(state, room_type) WHERE state = 0 AND room_type = 'public';

CREATE INDEX IF NOT EXISTS idx_players_address ON players(address);
CREATE INDEX IF NOT EXISTS idx_players_winnings ON players(total_winnings DESC);

CREATE INDEX IF NOT EXISTS idx_player_game_stats_player ON player_game_stats(player_address);
CREATE INDEX IF NOT EXISTS idx_player_game_stats_game ON player_game_stats(game_id);

CREATE INDEX IF NOT EXISTS idx_nft_mints_player ON nft_mints(player_address);
CREATE INDEX IF NOT EXISTS idx_nft_mints_tx ON nft_mints(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_event_log_game ON event_log(game_id);
CREATE INDEX IF NOT EXISTS idx_event_log_tx ON event_log(transaction_hash);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Public insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update games" ON games FOR UPDATE USING (true);

CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update players" ON players FOR UPDATE USING (true);

CREATE POLICY "Public read stats" ON player_game_stats FOR SELECT USING (true);
CREATE POLICY "Public insert stats" ON player_game_stats FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read mints" ON nft_mints FOR SELECT USING (true);
CREATE POLICY "Public insert mints" ON nft_mints FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read events" ON event_log FOR SELECT USING (true);

-- Views
CREATE OR REPLACE VIEW available_games AS
SELECT 
  game_id,
  bet_amount,
  bet_tier,
  player1_address,
  room_type,
  created_at,
  creation_tx_hash
FROM games
WHERE state = 0 AND room_type = 'public'
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  address,
  games_played,
  games_won,
  total_wagered,
  total_winnings,
  CASE 
    WHEN games_played > 0 THEN ROUND((games_won::NUMERIC / games_played::NUMERIC) * 100, 1)
    ELSE 0 
  END as win_rate,
  last_active
FROM players
WHERE games_played > 0
ORDER BY total_winnings DESC, games_won DESC
LIMIT 100;

CREATE OR REPLACE VIEW recent_matches AS
SELECT 
  g.game_id,
  g.bet_amount,
  g.bet_tier,
  g.player1_address,
  g.player2_address,
  g.player1_score,
  g.player2_score,
  g.winner_address,
  g.win_type,
  g.created_at,
  g.finished_at
FROM games g
WHERE g.state = 2
ORDER BY g.finished_at DESC
LIMIT 50;

-- Functions
CREATE OR REPLACE FUNCTION increment_player_stats(
  player_addr TEXT,
  games_delta INTEGER DEFAULT 0,
  wins_delta INTEGER DEFAULT 0,
  wagered_delta BIGINT DEFAULT 0,
  winnings_delta BIGINT DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO players (address, games_played, games_won, total_wagered, total_winnings, last_active)
  VALUES (
    LOWER(player_addr),
    games_delta,
    wins_delta,
    wagered_delta,
    winnings_delta,
    NOW()
  )
  ON CONFLICT (address) DO UPDATE
  SET 
    games_played = players.games_played + games_delta,
    games_won = players.games_won + wins_delta,
    total_wagered = players.total_wagered + wagered_delta,
    total_winnings = players.total_winnings + winnings_delta,
    last_active = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert initial indexer state
INSERT INTO indexer_state (last_processed_version) 
SELECT 0 
WHERE NOT EXISTS (SELECT 1 FROM indexer_state);

-- Verification
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## Step 4: Verify Setup

After running the SQL, you should see these tables:
- ✅ games
- ✅ players
- ✅ player_game_stats
- ✅ nft_mints
- ✅ event_log
- ✅ indexer_state

Plus these views:
- ✅ available_games
- ✅ leaderboard
- ✅ recent_matches

---

## Step 5: Test the Application

1. Restart your servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. Open http://localhost:3000

3. Connect your Push Wallet

4. Try creating a game!

---

## Troubleshooting

**If you get errors:**
- Make sure you copied the ENTIRE SQL script
- Check that your API keys are correct in .env files
- Verify the project URL matches: `https://veesjjuhwxntvecggoks.supabase.co`

**Need to reset?**
```sql
-- Drop all tables (WARNING: deletes all data!)
DROP TABLE IF EXISTS player_game_stats CASCADE;
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS event_log CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS indexer_state CASCADE;

-- Then run the setup script again
```

---

## Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/sql/new
- **API Settings:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/settings/api
- **Table Editor:** https://supabase.com/dashboard/project/veesjjuhwxntvecggoks/editor

---

**That's it!** Your new Supabase project is ready to use! 🚀
