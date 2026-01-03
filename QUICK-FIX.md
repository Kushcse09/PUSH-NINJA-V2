# 🚀 QUICK FIX - Run This Now!

## The Error You Got

```
ERROR: column "room_code" does not exist
```

**Why?** Your tables exist but are missing the new columns for private rooms.

---

## ✅ Solution (2 Minutes)

### Run This SQL Script:

**File:** `supabase-migration-add-columns.sql`

**Where:** https://supabase.com/dashboard/project/fzhufbohglwucmkfhfey/sql

**Steps:**
1. Click "New Query"
2. Copy the entire `supabase-migration-add-columns.sql` file
3. Paste it
4. Click "Run"
5. Done! ✅

---

## What It Does

Adds these missing columns to your `games` table:
- `room_type` - For public/private rooms
- `room_code` - 6-character join code for private games
- `win_type` - Track normal wins vs forfeit wins

Plus adds performance indexes.

---

## After Running

✅ No more errors
✅ Private multiplayer rooms work
✅ Forfeit tracking works
✅ All existing data preserved

---

## Test It

1. Refresh http://localhost:3000
2. Try creating a private multiplayer game
3. Should work perfectly now!

---

**That's it!** The migration is safe and won't delete any data.
