#!/usr/bin/env node

/**
 * Test script for signup functionality
 * Tests both direct Supabase signup and proxy signup
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const getEnv = (key) => process.env[key];

const testEmail = `test-${Date.now()}@oncosaferx.com`;
const testPassword = 'TestPassword123!';

console.log('🧪 Testing OncoSafeRx Signup Functionality');
console.log('==========================================');

async function testEnvironment() {
  console.log('\n📋 Environment Check:');
  console.log('SUPABASE_URL:', getEnv('SUPABASE_URL') ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', getEnv('SUPABASE_ANON_KEY') ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', getEnv('SUPABASE_SERVICE_ROLE_KEY') ? '✅ Set' : '❌ Missing');
  console.log('AUTH_PROXY_ENABLED:', process.env.AUTH_PROXY_ENABLED);
  console.log('PROXY_ALLOWED_ORIGINS:', process.env.PROXY_ALLOWED_ORIGINS);
}

async function testDirectSupabaseSignup() {
  console.log('\n🧪 Testing Direct Supabase Signup...');
  
  try {
    const supabase = createClient(
      getEnv('SUPABASE_URL'),
      getEnv('SUPABASE_ANON_KEY')
    );

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'oncologist'
        }
      }
    });

    if (error) {
      console.log('❌ Direct signup failed:', error.message);
      return false;
    } else {
      console.log('✅ Direct signup successful');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      return true;
    }
  } catch (error) {
    console.log('❌ Direct signup exception:', error.message);
    return false;
  }
}

async function testProxySignup() {
  console.log('\n🧪 Testing Proxy Signup...');
  
  try {
    const response = await fetch('http://localhost:3001/api/supabase-auth/proxy/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5176'
      },
      body: JSON.stringify({
        email: `proxy-${testEmail}`,
        password: testPassword,
        metadata: {
          first_name: 'Proxy',
          last_name: 'Test',
          user_role: 'oncologist',
          specialty: 'Medical Oncology'
        }
      })
    });

    console.log('Proxy response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Proxy signup failed:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Proxy signup successful');
    console.log('Access token present:', !!result.access_token);
    console.log('User ID:', result.user?.id);
    return true;

  } catch (error) {
    console.log('❌ Proxy signup exception:', error.message);
    return false;
  }
}

async function testUsersTable() {
  console.log('\n🧪 Testing Users Table Access...');
  
  try {
    const supabase = createClient(
      getEnv('SUPABASE_URL'),
      getEnv('SUPABASE_SERVICE_ROLE_KEY')
    );

    // Try to insert a test user
    const testUserId = randomUUID();
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `table-test-${Date.now()}@oncosaferx.com`,
        user_role: 'oncologist',
        first_name: 'Table',
        last_name: 'Test',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('❌ Users table insert failed:', error.message);
      console.log('Error details:', error);
      return false;
    } else {
      console.log('✅ Users table insert successful');
      
      // Clean up - delete the test user
      await supabase.from('users').delete().eq('id', testUserId);
      console.log('✅ Test user cleaned up');
      return true;
    }
  } catch (error) {
    console.log('❌ Users table test exception:', error.message);
    return false;
  }
}

async function runAllTests() {
  await testEnvironment();
  
  const usersTableOk = await testUsersTable();
  const directSignupOk = await testDirectSupabaseSignup();
  const proxySignupOk = await testProxySignup();

  console.log('\n📊 Test Results Summary:');
  console.log('=======================');
  console.log('Users Table:', usersTableOk ? '✅ Working' : '❌ Failed');
  console.log('Direct Signup:', directSignupOk ? '✅ Working' : '❌ Failed');
  console.log('Proxy Signup:', proxySignupOk ? '✅ Working' : '❌ Failed');

  if (!usersTableOk) {
    console.log('\n💡 Recommendation: Run the database migration first:');
    console.log('   Open Supabase SQL Editor and run:');
    console.log('   database/migrations/2025-11-02_fix_signup_users_table.sql');
  }

  if (usersTableOk && !directSignupOk && !proxySignupOk) {
    console.log('\n💡 Recommendation: Check Supabase Auth settings');
  }

  if (usersTableOk && directSignupOk && !proxySignupOk) {
    console.log('\n💡 Recommendation: Check server proxy configuration');
  }
}

runAllTests().catch(console.error);