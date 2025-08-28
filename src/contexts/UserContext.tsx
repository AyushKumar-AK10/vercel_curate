import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('curate_username')
  );

  const handleSetUsername = (newUsername: string | null) => {
    setUsername(newUsername);
    if (newUsername) {
      localStorage.setItem('curate_username', newUsername);
    } else {
      localStorage.removeItem('curate_username');
    }
  };

  return (
    <UserContext.Provider value={{
      username,
      setUsername: handleSetUsername,
      isAuthenticated: !!username,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};