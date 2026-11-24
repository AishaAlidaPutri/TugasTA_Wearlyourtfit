import React, { createContext, useState, useContext } from 'react';

const DEFAULT_USER = {
  id: 1,
  name: 'Wealy User',
  email: 'user@wealy.app',
  profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token] = useState('wealy_default_token');

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
        login: async () => {},
        register: async () => {},
        logout: async () => {},
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
