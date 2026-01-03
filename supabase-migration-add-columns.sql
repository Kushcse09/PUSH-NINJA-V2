-- =====================================================
-- PUSH NINJA - ADD MISSING COLUMNS TO EXISTING TABLES
-- Run this FIRST if you already have tables created
-- =====================================================

-- Add missing columns to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'public';

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS room_code TEXT;

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS win_type TEXT;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_games_room_code 
ON games(room_code) 
WHERE room_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_games_public_waiting 
ON games(state, room_type) 
WHERE state = 0 AND room_type = 'public';

-- Add comments
COMMENT ON COLUMN games.state IS 'Game state: 0=WAITING, 1=IN_PROGRESS, 2=FINISHED, 3=CANCELLED, 4=FORFEITED';
COMMENT ON COLUMN games.room_type IS 'Room type: public or private';
COMMENT ON COLUMN games.room_code IS '6-character join code for private rooms';
COMMENT ON COLUMN games.win_type IS 'Win type: normal (98% of pool) or forfeit (1.5x)';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'games'
ORDER BY ordinal_position;
