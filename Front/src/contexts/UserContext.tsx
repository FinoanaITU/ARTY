
import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'buyer' | 'artisan' | 'admin';
type BuyerType = 'entreprise' | 'particulier';
type LocationType = 'local' | 'etranger';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  buyerType?: BuyerType;
  locationType?: LocationType;
  nationality?: 'local' | 'foreign';
  companyName?: string;
  siret?: string;
  specialty?: string;
  description?: string;
  experience?: string;
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

  // Pas d'utilisateur par défaut - l'utilisateur doit se connecter
  // useEffect(() => {
  //   setUser({
  //     id: '1',
  //     name: 'Hery Rakoto',
  //     email: 'hery.rakoto@artizaho.mg',
  //     role: 'artisan',
  //     avatar: '/placeholder.svg',
  //     specialty: 'vannerie',
  //     description: 'Artisan spécialisé dans la vannerie traditionnelle malgache',
  //     experience: '10 ans'
  //   });
  // }, []);

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      if (role === 'buyer') {
        updatedUser.name = 'Marie Dubois';
        updatedUser.email = 'marie.dubois@email.com';
        updatedUser.buyerType = 'particulier';
        updatedUser.locationType = 'local';
        // Remove artisan-specific fields
        delete updatedUser.specialty;
        delete updatedUser.description;
        delete updatedUser.experience;
      } else if (role === 'artisan') {
        updatedUser.name = 'Hery Rakoto';
        updatedUser.email = 'hery.rakoto@artizaho.mg';
        updatedUser.specialty = 'vannerie';
        updatedUser.description = 'Artisan spécialisé dans la vannerie traditionnelle malgache';
        updatedUser.experience = '10 ans';
        // Remove buyer-specific fields
        delete updatedUser.buyerType;
        delete updatedUser.locationType;
        delete updatedUser.companyName;
        delete updatedUser.siret;
      } else if (role === 'admin') {
        updatedUser.name = 'Admin Artizaho';
        updatedUser.email = 'admin@artizaho.mg';
        // Remove role-specific fields
        delete updatedUser.buyerType;
        delete updatedUser.locationType;
        delete updatedUser.companyName;
        delete updatedUser.siret;
        delete updatedUser.specialty;
        delete updatedUser.description;
        delete updatedUser.experience;
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
