import express from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import supabaseService from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Simple admin token check for migrations
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token';

function requireAdminToken(req, res, next) {
  const provided = req.headers['x-admin-token'] || req.query.token;
  if (!provided || String(provided) !== String(ADMIN_TOKEN)) {
    return res.status(403).json({ error: 'Admin token required' });
  }
  next();
}

// Apply database migration
router.post('/apply/:migrationName', requireAdminToken, async (req, res) => {
  try {
    const { migrationName } = req.params;
    
    // Security: only allow specific migration files
    if (!migrationName.match(/^[a-zA-Z0-9_-]+$/)) {
      return res.status(400).json({ error: 'Invalid migration name' });
    }
    
    const migrationPath = join(__dirname, '../../database/migrations', `${migrationName}.sql`);
    
    let migrationSQL;
    try {
      migrationSQL = await readFile(migrationPath, 'utf-8');
    } catch (error) {
      return res.status(404).json({ error: 'Migration file not found' });
    }
    
    if (!supabaseService.enabled) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    const results = [];
    
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        console.log('Executing migration statement:', statement.substring(0, 100) + '...');
        const { data, error } = await supabaseService.client.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          console.error('Migration error:', error);
          results.push({ statement: statement.substring(0, 100), error: error.message });
        } else {
          results.push({ statement: statement.substring(0, 100), success: true });
        }
      } catch (e) {
        console.error('Migration execution error:', e);
        results.push({ statement: statement.substring(0, 100), error: e.message });
      }
    }
    
    res.json({
      migration: migrationName,
      statements: statements.length,
      results,
      success: results.every(r => r.success)
    });
    
  } catch (error) {
    console.error('Migration route error:', error);
    res.status(500).json({ error: 'Migration failed', details: error.message });
  }
});

// List available migrations
router.get('/list', requireAdminToken, async (req, res) => {
  try {
    const { readdir } = await import('fs/promises');
    const migrationsDir = join(__dirname, '../../database/migrations');
    const files = await readdir(migrationsDir);
    const migrations = files.filter(f => f.endsWith('.sql')).map(f => f.replace('.sql', ''));
    res.json({ migrations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list migrations', details: error.message });
  }
});

// Quick schema fix - add missing columns directly
router.post('/fix-user-schema', requireAdminToken, async (req, res) => {
  try {
    if (!supabaseService.enabled) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }
    
    const statements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INTEGER",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS persona VARCHAR(100)"
    ];
    
    const results = [];
    
    for (const statement of statements) {
      try {
        const { data, error } = await supabaseService.client.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          results.push({ statement, error: error.message });
        } else {
          results.push({ statement, success: true });
        }
      } catch (e) {
        results.push({ statement, error: e.message });
      }
    }
    
    res.json({
      action: 'fix-user-schema',
      results,
      success: results.every(r => r.success)
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Schema fix failed', details: error.message });
  }
});

export default router;