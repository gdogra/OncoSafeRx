#!/usr/bin/env node

/**
 * Migration script to add deleted_at column to users table
 * Run with: node database/migrate_deleted_at.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  console.log('💡 Please set these environment variables and try again');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting migration: Add deleted_at column to users table');
    
    // Read the SQL migration file
    const sqlPath = join(__dirname, 'migrations', 'add_deleted_at_column.sql');
    const migrationSQL = readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing SQL migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Fallback: try to add column directly
      console.log('🔄 Trying direct column addition...');
      const { error: altError } = await supabase
        .from('users')
        .select('deleted_at')
        .limit(1);
        
      if (altError && altError.message.includes('does not exist')) {
        // Column doesn't exist, we need to add it manually
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log('---');
        console.log(migrationSQL);
        console.log('---');
        console.log('💡 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
      } else {
        console.log('✅ Column already exists or other issue');
      }
      
      return;
    }
    
    console.log('✅ Migration completed successfully');
    
    // Verify the column was added
    const { error: verifyError } = await supabase
      .from('users')
      .select('deleted_at')
      .limit(1);
      
    if (verifyError) {
      console.log('⚠️  Verification failed, but migration may have succeeded');
    } else {
      console.log('✅ Verified: deleted_at column is accessible');
    }
    
  } catch (error) {
    console.error('💥 Migration error:', error);
    console.log('📋 Please run the SQL manually in Supabase SQL Editor');
  }
}

// Instructions for manual execution
console.log('📋 MANUAL MIGRATION INSTRUCTIONS:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Run the SQL from: database/migrations/add_deleted_at_column.sql');
console.log('4. Or run this script with: node database/migrate_deleted_at.js');
console.log('');

// Run if called directly
if (process.argv[1] === __filename) {
  runMigration().catch(console.error);
}