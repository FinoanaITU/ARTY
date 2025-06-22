
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const featuredProducts = [
  {
    id: 1,
    name: 'Masque traditionnel Vezo',
    artisan: 'Hery Rakoto',
    price: 45000,
    location: 'Antananarivo',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
    category: 'Sculpture sur bois',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Tissu Lamba traditionnel',
    artisan: 'Voahangy Razafy',
    price: 35000,
    location: 'Fianarantsoa',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop',
    category: 'Textile',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Poterie artisanale',
    artisan: 'Nivo Andriamana',
    price: 25000,
    location: 'Mahajanga',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
    category: 'Céramique',
    rating: 4.7
  }
];

const featuredWorkshops = [
  {
    id: 1,
    title: 'Initiation à la sculpture sur bois',
    instructor: 'Hery Rakoto',
    date: '2024-06-15',
    duration: '3 heures',
    price: 25000,
    participants: 8,
    maxParticipants: 12,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    category: 'Sculpture'
  },
  {
    id: 2,
    title: 'Tissage traditionnel Malagasy',
    instructor: 'Voahangy Razafy',
    date: '2024-06-20',
    duration: '4 heures',
    price: 30000,
    participants: 5,
    maxParticipants: 10,
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
    category: 'Textile'
  }
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="px-4 py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('welcome')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {t('subtitle')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link to="/products">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3">
                Découvrir les produits
              </Button>
            </Link>
            <Link to="/workshops">
              <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 py-3">
                {t('workshops')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produits en vedette</h2>
            <Link to="/products">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                {t('browse_all')} →
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-orange-100 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                    ⭐ {product.rating}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>par {product.artisan}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>📍 {product.location}</span>
                    <span className="font-semibold text-lg text-orange-600">
                      {product.price.toLocaleString()} Ar
                    </span>
                  </div>
                  <Link to={`/product/${product.id}`}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Voir le produit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workshops */}
      <section className="px-4 py-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('featured_workshops')}</h2>
            <Link to="/workshops">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                {t('browse_all')} →
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {featuredWorkshops.map((workshop) => (
              <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-green-100 relative">
                  <img
                    src={workshop.image}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                    {workshop.participants}/{workshop.maxParticipants} places
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{workshop.title}</CardTitle>
                  <CardDescription>par {workshop.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>📅 {new Date(workshop.date).toLocaleDateString('fr-FR')}</span>
                      <span>⏱️ {workshop.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-green-600">
                        {workshop.price.toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                  <Link to={`/workshop/${workshop.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      {t('book_now')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Artizaho ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2">Artisanat Authentique</h3>
              <p className="text-sm text-gray-600">
                Découvrez des créations uniques faites main par des artisans passionnés
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Commerce Équitable</h3>
              <p className="text-sm text-gray-600">
                Soutenez directement les artisans locaux de Madagascar
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Simple et Accessible</h3>
              <p className="text-sm text-gray-600">
                Une plateforme conçue pour être utilisée facilement sur mobile
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
