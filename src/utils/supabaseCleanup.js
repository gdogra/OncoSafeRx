/**
 * Supabase Cleanup Utilities
 * 
 * Helper functions to clean up orphaned data and fix hard delete issues
 */

import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Clean up orphaned auth users that exist in auth.users but not in public.users
 */
export async function cleanupOrphanedAuthUsers() {
  if (!supabase) {
    console.log('⚠️ Supabase not configured');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    console.log('🧹 Starting cleanup of orphaned auth users...');
    
    // Get all users from public.users table
    const { data: tableUsers, error: tableError } = await supabase
      .from('users')
      .select('id');
    
    if (tableError) throw tableError;
    
    const tableUserIds = new Set(tableUsers.map(u => u.id));
    console.log(`📊 Found ${tableUserIds.size} users in public.users table`);
    
    // Get all users from auth.users
    const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    const authUsers = authResponse.users;
    console.log(`📊 Found ${authUsers.length} users in auth.users`);
    
    // Find orphaned auth users
    const orphanedAuthUsers = authUsers.filter(authUser => !tableUserIds.has(authUser.id));
    
    if (orphanedAuthUsers.length === 0) {
      console.log('✅ No orphaned auth users found');
      return { success: true, orphanedCount: 0 };
    }
    
    console.log(`🗑️ Found ${orphanedAuthUsers.length} orphaned auth users to clean up:`);
    orphanedAuthUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.id})`);
    });
    
    // Delete orphaned auth users
    const deleteResults = [];
    for (const orphanedUser of orphanedAuthUsers) {
      try {
        console.log(`🗑️ Deleting orphaned auth user: ${orphanedUser.email}`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(orphanedUser.id);
        
        if (deleteError) {
          console.error(`❌ Failed to delete ${orphanedUser.email}:`, deleteError.message);
          deleteResults.push({ 
            id: orphanedUser.id, 
            email: orphanedUser.email, 
            success: false, 
            error: deleteError.message 
          });
        } else {
          console.log(`✅ Successfully deleted ${orphanedUser.email}`);
          deleteResults.push({ 
            id: orphanedUser.id, 
            email: orphanedUser.email, 
            success: true 
          });
        }
      } catch (error) {
        console.error(`💥 Exception deleting ${orphanedUser.email}:`, error);
        deleteResults.push({ 
          id: orphanedUser.id, 
          email: orphanedUser.email, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    const successCount = deleteResults.filter(r => r.success).length;
    const failureCount = deleteResults.filter(r => !r.success).length;
    
    console.log(`🎯 Cleanup completed: ${successCount} deleted, ${failureCount} failed`);
    
    return {
      success: true,
      orphanedCount: orphanedAuthUsers.length,
      deletedCount: successCount,
      failedCount: failureCount,
      results: deleteResults
    };
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Force delete a specific user from both auth and users table
 */
export async function forceDeleteUser(userId) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🗑️ Force deleting user: ${userId}`);
    
    // Get user info first
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    const userEmail = userData?.email || 'unknown';
    
    // Delete from users table first
    const { error: tableError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (tableError) {
      console.log(`⚠️ Table deletion error (may not exist): ${tableError.message}`);
    } else {
      console.log(`✅ Deleted from users table: ${userEmail}`);
    }
    
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.log(`⚠️ Auth deletion error (may not exist): ${authError.message}`);
    } else {
      console.log(`✅ Deleted from auth: ${userEmail}`);
    }
    
    return { success: true, email: userEmail };
    
  } catch (error) {
    console.error('💥 Force delete failed:', error);
    throw error;
  }
}

/**
 * Get status of users across both tables
 */
export async function getUserStatus() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Get users from table
    const { data: tableUsers, error: tableError } = await supabase
      .from('users')
      .select('id, email, created_at');
    
    if (tableError) throw tableError;
    
    // Get users from auth
    const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    const authUsers = authResponse.users;
    
    // Find discrepancies
    const tableUserIds = new Set(tableUsers.map(u => u.id));
    const authUserIds = new Set(authUsers.map(u => u.id));
    
    const onlyInTable = tableUsers.filter(u => !authUserIds.has(u.id));
    const onlyInAuth = authUsers.filter(u => !tableUserIds.has(u.id));
    
    return {
      tableUsers: tableUsers.length,
      authUsers: authUsers.length,
      onlyInTable: onlyInTable.length,
      onlyInAuth: onlyInAuth.length,
      orphanedAuthUsers: onlyInAuth,
      orphanedTableUsers: onlyInTable
    };
    
  } catch (error) {
    console.error('Error getting user status:', error);
    throw error;
  }
}