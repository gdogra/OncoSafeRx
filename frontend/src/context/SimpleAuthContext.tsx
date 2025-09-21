import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface SimpleAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored auth on mount
    const stored = localStorage.getItem('simpleAuth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUser(data.user);
        console.log('🔄 SIMPLE AUTH: Restored user from localStorage:', data.user.email);
      } catch (error) {
        console.error('❌ SIMPLE AUTH: Failed to parse stored auth');
        localStorage.removeItem('simpleAuth');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('🔑 SIMPLE AUTH: Login attempt:', email);
    
    // Demo credentials
    if (email === 'demo@oncosaferx.com' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user',
        email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'oncologist'
      };
      
      setUser(demoUser);
      localStorage.setItem('simpleAuth', JSON.stringify({ user: demoUser }));
      console.log('✅ SIMPLE AUTH: Demo login successful');
      return;
    }
    
    // Accept any credentials for testing
    if (email && password) {
      const testUser = {
        id: 'user-' + Date.now(),
        email,
        firstName: 'Test',
        lastName: 'User',
        role: 'oncologist'
      };
      
      setUser(testUser);
      localStorage.setItem('simpleAuth', JSON.stringify({ user: testUser }));
      console.log('✅ SIMPLE AUTH: Test login successful');
      return;
    }
    
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    console.log('🚪 SIMPLE AUTH: Logging out');
    setUser(null);
    localStorage.removeItem('simpleAuth');
  };

  return (
    <SimpleAuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};