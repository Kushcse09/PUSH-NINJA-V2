# Supabase Setup - Step by Step Guide

## Your Situation

You already have some tables created, but they're missing columns needed for private rooms and forfeit tracking.

## Solution: Run Migration First

### Step 1: Add Missing Columns

1. Go to: https://supabase.com/dashboard/project/fzhufbohglwucmkfhfey/sql
2. Click "New Query"
3. Copy **all** of `supabase-migration-add-columns.sql`
4. Paste and click "Run"
5. You should see the games table columns listed at the bottom

### Step 2: Verify It Worked

After running the migration, you should see these new columns in the output:
- `room_type` (TEXT, default 'public')
- `room_code` (TEXT)
- `win_type` (TEXT)

---

## Alternative: Fresh Start (If You Want Clean Setup)

If you prefer to start fresh with all tables properly configured:

### Option A: Drop and Recreate

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS player_game_stats CASCADE;
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS event_log CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS indexer_state CASCADE;

-- Then run supabase-complete-setup.sql
```

### Option B: Keep Your Data, Just Add Columns

Use `supabase-migration-add-columns.sql` (recommended if you have existing data)

---

## What Each File Does

| File | Purpose | When to Use |
|------|---------|-------------|
| `supabase-migration-add-columns.sql` | Adds missing columns to existing tables | **Use this first** if tables exist |
| `supabase-complete-setup.sql` | Creates all tables from scratch | Use for fresh setup or after dropping tables |
| `supabase/schema.sql` | Original schema (outdated) | Don't use - missing columns |
| `supabase/migrations/add_multiplayer_columns.sql` | Old migration | Already included in new migration |

---

## Recommended Steps (For Your Situation)

1. ✅ Run `supabase-migration-add-columns.sql` first
2. ✅ Verify columns were added (check the output)
3. ✅ Test the app at http://localhost:3000
4. ✅ Try creating a private multiplayer room

---

## After Migration

Your database will have:
- ✅ All existing data preserved
- ✅ New columns for private rooms (`room_type`, `room_code`)
- ✅ New column for forfeit tracking (`win_type`)
- ✅ New indexes for better performance
- ✅ Full multiplayer functionality

---

## Troubleshooting

**If you get "column already exists" errors:**
- That's fine! The `IF NOT EXISTS` clause prevents errors
- The migration is safe to run multiple times

**If you get "table does not exist" errors:**
- Use `supabase-complete-setup.sql` instead
- This creates all tables from scratch

**If you want to see what tables you have:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
