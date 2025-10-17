#!/usr/bin/env node

/**
 * Migration script to create missing tables: visitor_analytics and data_sync_log
 * Run with: node database/migrate_missing_tables.js
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

async function runMigrations() {
  try {
    console.log('🚀 Starting migrations: Create missing analytics and sync tables');
    
    // Migration 1: visitor_analytics table
    console.log('\n📄 Creating visitor_analytics table...');
    const visitorAnalyticsSQL = readFileSync(
      join(__dirname, 'migrations', 'create_visitor_analytics_table.sql'), 
      'utf8'
    );
    
    const { error: analyticsError } = await supabase.rpc('exec_sql', { 
      sql: visitorAnalyticsSQL 
    });
    
    if (analyticsError) {
      console.error('❌ visitor_analytics table creation failed:', analyticsError);
    } else {
      console.log('✅ visitor_analytics table created successfully');
    }
    
    // Migration 2: data_sync_log table
    console.log('\n📄 Creating data_sync_log table...');
    const dataSyncLogSQL = readFileSync(
      join(__dirname, 'migrations', 'create_data_sync_log_table.sql'), 
      'utf8'
    );
    
    const { error: syncLogError } = await supabase.rpc('exec_sql', { 
      sql: dataSyncLogSQL 
    });
    
    if (syncLogError) {
      console.error('❌ data_sync_log table creation failed:', syncLogError);
    } else {
      console.log('✅ data_sync_log table created successfully');
    }
    
    // Verify both tables exist
    console.log('\n🔍 Verifying table creation...');
    
    const { error: analyticsVerifyError } = await supabase
      .from('visitor_analytics')
      .select('id')
      .limit(1);
      
    const { error: syncLogVerifyError } = await supabase
      .from('data_sync_log')
      .select('id')
      .limit(1);
    
    if (!analyticsVerifyError) {
      console.log('✅ visitor_analytics table is accessible');
    } else {
      console.log('⚠️  visitor_analytics table verification failed:', analyticsVerifyError);
    }
    
    if (!syncLogVerifyError) {
      console.log('✅ data_sync_log table is accessible');
    } else {
      console.log('⚠️  data_sync_log table verification failed:', syncLogVerifyError);
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration error:', error);
    console.log('📋 Please run the SQL files manually in Supabase SQL Editor:');
    console.log('1. database/migrations/create_visitor_analytics_table.sql');
    console.log('2. database/migrations/create_data_sync_log_table.sql');
  }
}

// Instructions for manual execution
console.log('📋 MISSING TABLES MIGRATION:');
console.log('This script will create the visitor_analytics and data_sync_log tables');
console.log('');

// Run if called directly
if (process.argv[1] === __filename) {
  runMigrations().catch(console.error);
}