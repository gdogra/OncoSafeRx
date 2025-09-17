# Supabase Manual Setup Instructions

## Step 1: Access Supabase SQL Editor
1. Go to: https://emfrwckxctyarphjvfeu.supabase.co/project/emfrwckxctyarphjvfeu/sql
2. Login with your Supabase credentials

## Step 2: Create Database Schema
Copy and paste the entire contents of `supabase/schema.sql` into the SQL editor and run it.

## Step 3: Insert Sample Data
Copy and paste the entire contents of `supabase/seed.sql` into the SQL editor and run it.

## Step 4: Verify Setup
Run the following command from your project directory:
```bash
node scripts/setup-supabase.js
```

## Alternative: Use Supabase CLI (if installed)
If you have the Supabase CLI installed, you can run:
```bash
supabase db reset
```

## Troubleshooting
- If you see "table does not exist" errors, make sure you ran the schema.sql first
- If you see permission errors, ensure you're using the service role key
- The setup script will automatically verify the database once tables are created