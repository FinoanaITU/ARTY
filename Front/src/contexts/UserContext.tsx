
import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'buyer' | 'artisan' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Demo user for testing - in real app this would come from authentication
  useEffect(() => {
    setUser({
      id: '1',
      name: 'Hery Rakoto',
      email: 'hery.rakoto@artizaho.mg',
      role: 'artisan',
      avatar: '/placeholder.svg'
    });
  }, []);

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      if (role === 'buyer') {
        updatedUser.name = 'Marie Dubois';
        updatedUser.email = 'marie.dubois@email.com';
      } else if (role === 'artisan') {
        updatedUser.name = 'Hery Rakoto';
        updatedUser.email = 'hery.rakoto@artizaho.mg';
      } else if (role === 'admin') {
        updatedUser.name = 'Admin Artizaho';
        updatedUser.email = 'admin@artizaho.mg';
      }
      setUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn: !!user, switchRole }}>
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
