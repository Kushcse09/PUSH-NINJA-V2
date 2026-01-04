-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- Run this if tables already exist
-- =====================================================

-- Add missing columns to games table (if they don't exist)
DO $$ 
BEGIN
    -- Add room_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='games' AND column_name='room_type') THEN
        ALTER TABLE games ADD COLUMN room_type TEXT DEFAULT 'public';
    END IF;

    -- Add room_code column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='games' AND column_name='room_code') THEN
        ALTER TABLE games ADD COLUMN room_code TEXT;
    END IF;

    -- Add win_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='games' AND column_name='win_type') THEN
        ALTER TABLE games ADD COLUMN win_type TEXT;
    END IF;
END $$;

-- Add missing indexes (if they don't exist)
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
