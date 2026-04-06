import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/api';

type UserRole = 'buyer' | 'artisan' | 'admin';
type BuyerType = 'entreprise' | 'particulier';
type LocationType = 'local' | 'etranger';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  buyer_type?: BuyerType;
  nationality?: 'local' | 'foreign';
  company_name?: string;
  siret?: string;
  specialty?: string;
  description?: string;
  experience?: string;
  
  buyerType?: BuyerType;
  locationType?: LocationType;
  companyName?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          
          const userData = await apiService.getCurrentUser();
          const formattedUser = formatUserFromApi(userData);
          setUser(formattedUser);
          localStorage.setItem('user', JSON.stringify(formattedUser));
        } catch (error) {
          
          console.error('Error loading user:', error);
          apiService.clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const formatUserFromApi = (apiUser: any): User => {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      avatar: apiUser.avatar,
      buyer_type: apiUser.buyer_type,
      nationality: apiUser.nationality,
      company_name: apiUser.company_name,
      siret: apiUser.siret,
      specialty: apiUser.specialty,
      description: apiUser.description,
      experience: apiUser.experience,
      
      buyerType: apiUser.buyer_type,
      locationType: apiUser.nationality === 'local' ? 'local' : 'etranger',
      companyName: apiUser.company_name,
    };
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const { access_token, refresh_token, user: userData } = response;

      
      apiService.setTokens(access_token, refresh_token);

      
      const formattedUser = formatUserFromApi(userData);
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.detail || 'Erreur lors de la connexion'
      );
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      const formattedUser = formatUserFromApi(userData);
      setUser(formattedUser);
      localStorage.setItem('user', JSON.stringify(formattedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      
      await logout();
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      if (role === 'buyer') {
        updatedUser.name = 'Marie Dubois';
        updatedUser.email = 'marie.dubois@email.com';
        updatedUser.buyerType = 'particulier';
        updatedUser.locationType = 'local';
        
        delete updatedUser.specialty;
        delete updatedUser.description;
        delete updatedUser.experience;
      } else if (role === 'artisan') {
        updatedUser.name = 'Hery Rakoto';
        updatedUser.email = 'hery.rakoto@artizaho.mg';
        updatedUser.specialty = 'vannerie';
        updatedUser.description = 'Artisan spécialisé dans la vannerie traditionnelle malgache';
        updatedUser.experience = '10 ans';
        
        delete updatedUser.buyerType;
        delete updatedUser.locationType;
        delete updatedUser.companyName;
        delete updatedUser.siret;
      } else if (role === 'admin') {
        updatedUser.name = 'Admin Artizaho';
        updatedUser.email = 'admin@artizaho.mg';
        
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
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      isLoggedIn: !!user, 
      login,
      logout,
      refreshUser,
      switchRole,
      loading
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
