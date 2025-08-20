
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

const Navigation = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isLoggedIn, switchRole, setUser } = useUser();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-beige shadow-sm">
      {/* Top bar with language toggle and user info */}
      <div className="px-4 py-2 bg-brand-beige/50 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('fr')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${language === 'fr' ? 'bg-brand-orange text-white' : 'text-brand-brown hover:bg-brand-orange/20'}`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('mg')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${language === 'mg' ? 'bg-brand-orange text-white' : 'text-brand-brown hover:bg-brand-orange/20'}`}
          >
            MG
          </button>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-brown font-medium">{user?.name} ({user?.role})</span>
            {/* Demo role switcher */}
            <select 
              value={user?.role} 
              onChange={(e) => switchRole(e.target.value as any)}
              className="text-xs bg-transparent border border-brand-brown/30 rounded px-2 py-1 text-brand-brown"
            >
              <option value="buyer">Acheteur</option>
              <option value="artisan">Artisan</option>
              <option value="admin">Admin</option>
            </select>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs text-brand-brown hover:bg-brand-orange/20">
                {t('dashboard')}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-brand-terracotta hover:bg-brand-terracotta/20"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        )}
      </div>

      {/* Main navigation */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-brown flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            Artizaho
          </Link>
          
          <div className="hidden md:flex gap-8 items-center">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                isActive('/') ? 'text-brand-orange' : 'text-brand-brown'
              }`}
            >
              ACCUEIL
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                isActive('/products') ? 'text-brand-orange' : 'text-brand-brown'
              }`}
            >
              NOS PRODUITS
            </Link>
            <Link
              to="/workshops"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                isActive('/workshops') ? 'text-brand-orange' : 'text-brand-brown'
              }`}
            >
              NOS ATELIERS
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                isActive('/contact') ? 'text-brand-orange' : 'text-brand-brown'
              }`}
            >
              NOUS CONTACTER
            </Link>
            
            {/* User dropdown menu */}
            {!isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-5 w-5 text-brand-brown" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-brand-beige shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                      Se connecter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                      Créer un compte
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/become-professional" className="flex items-center px-3 py-2 text-brand-orange hover:bg-brand-orange/10 cursor-pointer font-medium">
                      Devenir artisan
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-5 w-5 text-brand-brown" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-brand-beige shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                        ADMIN
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/become-professional" className="flex items-center px-3 py-2 text-brand-orange hover:bg-brand-orange/10 cursor-pointer font-medium">
                      Devenir artisan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center px-3 py-2 text-brand-terracotta hover:bg-brand-terracotta/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile signup button */}
          {!isLoggedIn && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <User className="h-5 w-5 text-brand-brown" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-brand-beige shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                      Se connecter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="flex items-center px-3 py-2 text-brand-brown hover:bg-brand-orange/10 cursor-pointer">
                      S'inscrire
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/become-professional" className="flex items-center px-3 py-2 text-brand-orange hover:bg-brand-orange/10 cursor-pointer font-medium">
                      Devenir artisan
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-brand-beige px-4 py-2 z-50">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 transition-colors ${
              isActive('/') ? 'text-brand-orange' : 'text-brand-brown/70'
            }`}
          >
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs font-medium">{t('home')}</span>
          </Link>
          <Link
            to="/products"
            className={`flex flex-col items-center py-2 transition-colors ${
              isActive('/products') ? 'text-brand-orange' : 'text-brand-brown/70'
            }`}
          >
            <div className="w-6 h-6 mb-1">🛍️</div>
            <span className="text-xs font-medium">Produits</span>
          </Link>
          <Link
            to="/workshops"
            className={`flex flex-col items-center py-2 transition-colors ${
              isActive('/workshops') ? 'text-brand-orange' : 'text-brand-brown/70'
            }`}
          >
            <div className="w-6 h-6 mb-1">🎨</div>
            <span className="text-xs font-medium">{t('workshops')}</span>
          </Link>
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className={`flex flex-col items-center py-2 transition-colors ${
                isActive('/dashboard') ? 'text-brand-orange' : 'text-brand-brown/70'
              }`}
            >
              <div className="w-6 h-6 mb-1">📊</div>
              <span className="text-xs font-medium">{t('dashboard')}</span>
            </Link>
          ) : (
            <Link
              to="/signup"
              className={`flex flex-col items-center py-2 transition-colors ${
                isActive('/signup') ? 'text-brand-orange' : 'text-brand-brown/70'
              }`}
            >
              <div className="w-6 h-6 mb-1">👤</div>
              <span className="text-xs font-medium">S'inscrire</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
