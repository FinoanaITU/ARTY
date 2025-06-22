
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isLoggedIn, switchRole } = useUser();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      {/* Top bar with language toggle and user info */}
      <div className="px-4 py-2 bg-orange-50 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('fr')}
            className={`text-xs px-2 py-1 rounded ${language === 'fr' ? 'bg-orange-200 text-orange-800' : 'text-orange-600'}`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('mg')}
            className={`text-xs px-2 py-1 rounded ${language === 'mg' ? 'bg-orange-200 text-orange-800' : 'text-orange-600'}`}
          >
            MG
          </button>
        </div>
        
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-700">{user?.name} ({user?.role})</span>
            {/* Demo role switcher */}
            <select 
              value={user?.role} 
              onChange={(e) => switchRole(e.target.value as any)}
              className="text-xs bg-transparent border-0 text-orange-700"
            >
              <option value="buyer">Acheteur</option>
              <option value="artisan">Artisan</option>
              <option value="admin">Admin</option>
            </select>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs">
                {t('dashboard')}
              </Button>
            </Link>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="text-xs text-orange-700">
            Se connecter
          </Button>
        )}
      </div>

      {/* Main navigation */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-orange-600">
            Artizaho
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors ${
                isActive('/products') ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Produits
            </Link>
            <Link
              to="/workshops"
              className={`text-sm font-medium transition-colors ${
                isActive('/workshops') ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              {t('workshops')}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 px-4 py-2 z-50">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-1 ${
              isActive('/') ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs">{t('home')}</span>
          </Link>
          <Link
            to="/products"
            className={`flex flex-col items-center py-1 ${
              isActive('/products') ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1">🛍️</div>
            <span className="text-xs">Produits</span>
          </Link>
          <Link
            to="/workshops"
            className={`flex flex-col items-center py-1 ${
              isActive('/workshops') ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1">🎨</div>
            <span className="text-xs">{t('workshops')}</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center py-1 ${
              isActive('/dashboard') ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            <div className="w-6 h-6 mb-1">📊</div>
            <span className="text-xs">{t('dashboard')}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
