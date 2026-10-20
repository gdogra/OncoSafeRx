/**
 * OncoSafeRx localStorage Debug Utility
 * 
 * Run this in browser console to debug localStorage issues
 * Copy and paste these functions one by one into the browser console
 */

// 1. View all OncoSafeRx localStorage keys
function debugLocalStorage() {
  console.log('🔍 OncoSafeRx localStorage Debug Report');
  console.log('================================================');
  
  const osrxKeys = [];
  const otherKeys = [];
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('osrx_') || 
        key.startsWith('oncosaferx_') || 
        key.includes('rxnorm') ||
        key.includes('analytics') ||
        key === 'current_session' ||
        key === 'visitor_history') {
      osrxKeys.push(key);
    } else {
      otherKeys.push(key);
    }
  });
  
  console.log('🔐 Authentication & Profile Keys:');
  osrxKeys.filter(k => k.includes('auth') || k.includes('user') || k.includes('profile')).forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'null');
  });
  
  console.log('\n🏥 Patient Keys:');
  osrxKeys.filter(k => k.includes('patient')).forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'null');
  });
  
  console.log('\n📊 App Settings:');
  osrxKeys.filter(k => !k.includes('auth') && !k.includes('user') && !k.includes('profile') && !k.includes('patient')).forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'null');
  });
  
  console.log('\n🌐 Other Keys:', otherKeys.length);
  console.log('================================================');
}

// 2. Clear all OncoSafeRx localStorage
function clearOncoSafeRxStorage() {
  console.log('🧹 Clearing OncoSafeRx localStorage...');
  
  const keysToRemove = [];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('osrx_') || 
        key.startsWith('oncosaferx_') || 
        key.includes('rxnorm') ||
        key.includes('analytics') ||
        key === 'current_session' ||
        key === 'visitor_history') {
      keysToRemove.push(key);
    }
  });
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Removed: ${key}`);
  });
  
  console.log(`🎯 Cleared ${keysToRemove.length} OncoSafeRx keys`);
  console.log('🔄 Reload the page to see changes');
}

// 3. Clear only auth-related storage
function clearAuthStorage() {
  console.log('🔐 Clearing authentication storage...');
  
  const authKeys = [
    'osrx_auth_tokens',
    'osrx_user_profile', 
    'osrx_auth_path',
    'osrx_session_user_id',
    'osrx_dev_user',
    'osrx_dev_auth',
    'osrx_force_production'
  ];
  
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`  ✅ Removed: ${key}`);
    } else {
      console.log(`  ⚪ Not found: ${key}`);
    }
  });
  
  console.log('🔄 Reload the page to re-authenticate');
}

// 4. Clear only patient storage
function clearPatientStorage() {
  console.log('🏥 Clearing patient storage...');
  
  const patientKeys = [
    'oncosaferx_current_patient',
    'oncosaferx_recent_patients',
    'oncosaferx_patients'
  ];
  
  patientKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`  ✅ Removed: ${key}`);
    } else {
      console.log(`  ⚪ Not found: ${key}`);
    }
  });
  
  console.log('🔄 Patient list will refresh from server');
}

// 5. Check authentication status
function checkAuthStatus() {
  console.log('🔍 Authentication Status Check');
  console.log('===============================');
  
  const authTokens = localStorage.getItem('osrx_auth_tokens');
  const userProfile = localStorage.getItem('osrx_user_profile');
  const authPath = localStorage.getItem('osrx_auth_path');
  
  console.log('Auth Tokens:', authTokens ? '✅ Present' : '❌ Missing');
  console.log('User Profile:', userProfile ? '✅ Present' : '❌ Missing');
  console.log('Auth Path:', authPath ? JSON.parse(authPath) : '❌ Missing');
  
  if (authTokens) {
    try {
      const tokens = JSON.parse(authTokens);
      console.log('Token expires:', tokens.expires_at ? new Date(tokens.expires_at) : 'Unknown');
    } catch (e) {
      console.log('❌ Invalid token format');
    }
  }
  
  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      console.log('User ID:', profile.id || 'Missing');
      console.log('User Email:', profile.email || 'Missing');
      console.log('User Role:', profile.role || 'Missing');
    } catch (e) {
      console.log('❌ Invalid profile format');
    }
  }
}

// Display instructions
console.log(`
🔧 OncoSafeRx localStorage Debug Utility Loaded!

Available functions:
1. debugLocalStorage()     - View all localStorage data
2. clearOncoSafeRxStorage() - Clear ALL app data (nuclear option)
3. clearAuthStorage()      - Clear only authentication data
4. clearPatientStorage()   - Clear only patient data  
5. checkAuthStatus()       - Check current auth status

Example usage:
  debugLocalStorage()      // See what's stored
  clearAuthStorage()       // Fix profile issues
  clearPatientStorage()    // Fix patient issues
  window.location.reload() // Reload after clearing

⚠️  Always run debugLocalStorage() first to see what's there!
`);