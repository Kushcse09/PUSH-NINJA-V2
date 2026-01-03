-- =====================================================
-- PUSH NINJA - COMPLETE SUPABASE DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

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
  win_type TEXT,  -- 'normal' or 'forfeit'
  state INTEGER DEFAULT 0,  -- 0=WAITING, 1=IN_PROGRESS, 2=FINISHED, 3=CANCELLED, 4=FORFEITED
  room_type TEXT DEFAULT 'public',  -- 'public' or 'private'
  room_code TEXT,  -- 6-character code for private rooms
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

-- Player game stats (detailed per-game stats)
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

-- Event log for blockchain events
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

-- Indexer state (track last processed transaction)
CREATE TABLE IF NOT EXISTS indexer_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_processed_version BIGINT DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_syncing BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES
-- =====================================================

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

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read games" ON games;
DROP POLICY IF EXISTS "Public insert games" ON games;
DROP POLICY IF EXISTS "Public update games" ON games;
DROP POLICY IF EXISTS "Public read players" ON players;
DROP POLICY IF EXISTS "Public insert players" ON players;
DROP POLICY IF EXISTS "Public update players" ON players;
DROP POLICY IF EXISTS "Public read stats" ON player_game_stats;
DROP POLICY IF EXISTS "Public insert stats" ON player_game_stats;
DROP POLICY IF EXISTS "Public read mints" ON nft_mints;
DROP POLICY IF EXISTS "Public insert mints" ON nft_mints;
DROP POLICY IF EXISTS "Public read events" ON event_log;

-- Create policies for public access
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

-- =====================================================
-- VIEWS
-- =====================================================

-- Available games view
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

-- Leaderboard view
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

-- Recent matches view
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

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment player stats
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

-- Function to get player statistics
CREATE OR REPLACE FUNCTION get_player_stats(player_addr TEXT)
RETURNS TABLE (
  address TEXT,
  games_played INTEGER,
  games_won INTEGER,
  total_wagered BIGINT,
  total_winnings BIGINT,
  win_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.address,
    p.games_played,
    p.games_won,
    p.total_wagered,
    p.total_winnings,
    CASE 
      WHEN p.games_played > 0 THEN ROUND((p.games_won::NUMERIC / p.games_played::NUMERIC) * 100, 1)
      ELSE 0 
    END as win_rate
  FROM players p
  WHERE LOWER(p.address) = LOWER(player_addr);
  
  -- Return default values if player doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      player_addr,
      0::INTEGER,
      0::INTEGER,
      0::BIGINT,
      0::BIGINT,
      0::NUMERIC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update player stats (trigger)
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert player stats
  INSERT INTO players (address, games_played, games_won, total_wagered, total_winnings, last_active)
  VALUES (
    COALESCE(NEW.player1_address, NEW.player2_address),
    0,
    0,
    0,
    0,
    NOW()
  )
  ON CONFLICT (address) DO UPDATE
  SET last_active = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_player_stats_trigger ON games;

-- Create trigger to auto-update player stats
CREATE TRIGGER update_player_stats_trigger
AFTER INSERT OR UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_player_stats();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert initial indexer state if not exists
INSERT INTO indexer_state (last_processed_version) 
SELECT 0 
WHERE NOT EXISTS (SELECT 1 FROM indexer_state);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show all created tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show all views
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show all functions
SELECT routine_name as function_name
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
