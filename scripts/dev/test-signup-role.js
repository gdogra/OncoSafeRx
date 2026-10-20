// Test script to verify signup role assignment works correctly
// Run with: node test-signup-role.js

import fetch from 'node-fetch';

const API_BASE = 'https://oncosaferx.com/api/supabase-auth/proxy';

async function testSignupRole(email, password, role) {
  console.log(`\n🧪 Testing signup with role: ${role} for ${email}`);
  
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://oncosaferx.com'
      },
      body: JSON.stringify({
        email,
        password,
        metadata: {
          first_name: 'Test',
          last_name: 'User',
          role: role,
          specialty: role === 'oncologist' ? 'Medical Oncology' : '',
          institution: 'Test Hospital',
          license_number: (role === 'oncologist' || role === 'pharmacist') ? 'TEST123' : '',
          years_experience: 5
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Signup successful for ${role}`);
      console.log(`   - Profile created: ${result.profile_created}`);
      console.log(`   - Needs confirmation: ${result.needs_confirmation}`);
      console.log(`   - User ID: ${result.user?.id || 'N/A'}`);
      console.log(`   - User role in response: ${result.user?.user_metadata?.role || 'N/A'}`);
    } else {
      console.log(`❌ Signup failed for ${role}:`, result.error);
      console.log(`   - Code: ${result.code}`);
      console.log(`   - Details: ${result.details}`);
    }
  } catch (error) {
    console.log(`💥 Network error for ${role}:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting role assignment tests...');
  
  const testCases = [
    { role: 'patient', email: 'test.patient@example.com' },
    { role: 'oncologist', email: 'test.oncologist@example.com' },
    { role: 'pharmacist', email: 'test.pharmacist@example.com' },
    { role: 'nurse', email: 'test.nurse@example.com' },
    { role: 'researcher', email: 'test.researcher@example.com' },
    { role: 'student', email: 'test.student@example.com' }
  ];
  
  for (const testCase of testCases) {
    await testSignupRole(testCase.email, 'TestPassword123!', testCase.role);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log('\n✨ Role assignment tests completed!');
  console.log('\nNext steps:');
  console.log('1. Check server logs for role assignment details');
  console.log('2. Verify users appear in database with correct roles');
  console.log('3. Test email confirmation flow');
}

runTests().catch(console.error);