
import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'mg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    artisans: 'Artisans',
    workshops: 'Ateliers',
    dashboard: 'Tableau de bord',
    
    // Homepage
    welcome: 'Bienvenue sur Artizaho',
    subtitle: 'Découvrez l\'artisanat authentique de Madagascar',
    featured_artisans: 'Artisans Vedettes',
    featured_workshops: 'Ateliers à Venir',
    browse_all: 'Voir Tout',
    
    // Artisans
    view_profile: 'Voir le Profil',
    products: 'Produits',
    about: 'À Propos',
    contact: 'Contact',
    
    // Workshops
    book_now: 'Réserver',
    duration: 'Durée',
    price: 'Prix',
    location: 'Lieu',
    date: 'Date',
    
    // Dashboard
    my_orders: 'Mes Commandes',
    my_workshops: 'Mes Ateliers',
    wishlist: 'Liste de Souhaits',
    profile: 'Profil',
    
    // Admin
    manage_artisans: 'Gérer les Artisans',
    manage_workshops: 'Gérer les Ateliers',
    payments: 'Paiements',
    analytics: 'Analytiques',
  },
  mg: {
    // Navigation
    home: 'Fandraisana',
    artisans: 'Mpanao asa tanana',
    workshops: 'Fianarana',
    dashboard: 'Kaonty',
    
    // Homepage
    welcome: 'Tongasoa eto amin\'ny Artizaho',
    subtitle: 'Mahita ny asa tanana marina avy any Madagasikara',
    featured_artisans: 'Mpanao asa tanana malaza',
    featured_workshops: 'Fianarana ho avy',
    browse_all: 'Hijery daholo',
    
    // Artisans
    view_profile: 'Hijery ny mombamomba',
    products: 'Vokatra',
    about: 'Mombamomba',
    contact: 'Fifandraisana',
    
    // Workshops
    book_now: 'Hanao famandrihana',
    duration: 'Faharetana',
    price: 'Vidiny',
    location: 'Toerana',
    date: 'Daty',
    
    // Dashboard
    my_orders: 'Ny kaomandy',
    my_workshops: 'Ny fianarana',
    wishlist: 'Zavatra tiako',
    profile: 'Mombamomba',
    
    // Admin
    manage_artisans: 'Mitantana mpanao asa tanana',
    manage_workshops: 'Mitantana fianarana',
    payments: 'Fandoavam-bola',
    analytics: 'Fandinihana',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
