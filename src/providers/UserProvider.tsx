import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  type: string;
  uid : string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  setLoggedIn: (isLoggedIn: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [isLoggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedIn = localStorage.getItem('isLoggedIn');
      return storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    }
  }, [user, isLoggedIn]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn, setLoggedIn }}>
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
