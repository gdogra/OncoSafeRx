// Quick token refresh utility for admin access
export const refreshAdminTokens = async (): Promise<boolean> => {
  console.log('🔄 Refreshing admin tokens...');
  
  try {
    // Clear potentially corrupted tokens
    localStorage.removeItem('osrx_backend_jwt');
    localStorage.removeItem('osrx_exchange_unsupported_until');
    
    // Try to get fresh Supabase token
    const supabaseTokens = localStorage.getItem('osrx_auth_tokens');
    if (!supabaseTokens) {
      console.error('❌ No Supabase tokens found');
      return false;
    }
    
    const parsed = JSON.parse(supabaseTokens);
    const supabaseToken = parsed.access_token;
    
    if (!supabaseToken) {
      console.error('❌ No Supabase access token found');
      return false;
    }
    
    // Exchange for fresh backend JWT
    console.log('🔄 Exchanging Supabase token for backend JWT...');
    const response = await fetch('/api/supabase-auth/exchange/backend-jwt', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseToken}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Backend JWT exchange failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const result = await response.json();
    const backendToken = result?.token;
    
    if (!backendToken) {
      console.error('❌ No backend token in response');
      return false;
    }
    
    // Decode and validate the new token
    try {
      const payload = JSON.parse(atob(backendToken.split('.')[1]));
      const exp = payload.exp ? payload.exp * 1000 : null;
      
      console.log('✅ New backend JWT received:', {
        email: payload.email,
        role: payload.role,
        expires: exp ? new Date(exp).toLocaleString() : 'Unknown'
      });
      
      // Store the new token
      localStorage.setItem('osrx_backend_jwt', JSON.stringify({ 
        token: backendToken, 
        exp 
      }));
      
      return true;
    } catch (decodeError) {
      console.error('❌ Failed to decode new token:', decodeError);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
};

// Force token refresh and test admin access
export const forceRefreshAndTest = async (): Promise<void> => {
  console.log('🚀 Force refreshing tokens and testing admin access...');
  
  const success = await refreshAdminTokens();
  if (!success) {
    console.error('❌ Token refresh failed - user needs to logout/login');
    alert('Token refresh failed. Please logout and login again.');
    return;
  }
  
  // Test admin access
  try {
    const testResponse = await fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('osrx_backend_jwt')!).token}`,
        'X-Forwarded-Authorization': `Bearer ${JSON.parse(localStorage.getItem('osrx_backend_jwt')!).token}`,
        'X-Authorization': `Bearer ${JSON.parse(localStorage.getItem('osrx_backend_jwt')!).token}`,
        'X-Client-Authorization': `Bearer ${JSON.parse(localStorage.getItem('osrx_backend_jwt')!).token}`,
        'X-Supabase-Authorization': `Bearer ${JSON.parse(localStorage.getItem('osrx_backend_jwt')!).token}`,
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Admin access restored!');
      alert('✅ Admin access restored! Please refresh the page.');
      window.location.reload();
    } else {
      console.error('❌ Admin access still failing:', testResponse.status);
      alert('❌ Admin access still failing. Please logout and login again.');
    }
  } catch (testError) {
    console.error('❌ Test failed:', testError);
    alert('❌ Test failed. Please logout and login again.');
  }
};
