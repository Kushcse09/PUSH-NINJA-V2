# Supabase Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://fzhufbohglwucmkfhfey.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

## Step 2: Run the Schema

Copy and paste the entire contents of `supabase/schema.sql` into the SQL editor and click "Run"

## Step 3: Run the Migration

Copy and paste the entire contents of `supabase/migrations/add_multiplayer_columns.sql` into the SQL editor and click "Run"

## Step 4: Verify Tables

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- games
- players
- player_game_stats
- event_log
- indexer_state
- nft_mints

## Step 5: Test the Setup

The project should now work! The database is ready for:
- Multiplayer game creation and joining
- Player statistics tracking
- NFT mint recording
- Leaderboards
