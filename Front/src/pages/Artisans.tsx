
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const artisans = [
  {
    id: 1,
    name: 'Hery Rakoto',
    specialty: 'Sculpture sur bois',
    location: 'Antananarivo',
    image: '/placeholder.svg',
    rating: 4.8,
    productsCount: 24,
    description: 'Artisan spécialisé dans la sculpture traditionnelle malgache depuis 15 ans'
  },
  {
    id: 2,
    name: 'Voahangy Razafy',
    specialty: 'Tissage traditionnel',
    location: 'Fianarantsoa',
    image: '/placeholder.svg',
    rating: 4.9,
    productsCount: 18,
    description: 'Maître tisserand perpétuant les techniques ancestrales'
  },
  {
    id: 3,
    name: 'Nivo Andriamana',
    specialty: 'Poterie',
    location: 'Mahajanga',
    image: '/placeholder.svg',
    rating: 4.7,
    productsCount: 31,
    description: 'Créateur de poteries uniques inspirées de la nature malgache'
  },
  {
    id: 4,
    name: 'Lalaina Ratsimbazafy',
    specialty: 'Bijouterie',
    location: 'Toliara',
    image: '/placeholder.svg',
    rating: 4.6,
    productsCount: 42,
    description: 'Bijoutier créant des pièces avec des pierres locales'
  },
  {
    id: 5,
    name: 'Fara Rasoamampianina',
    specialty: 'Vannerie',
    location: 'Morondava',
    image: '/placeholder.svg',
    rating: 4.8,
    productsCount: 16,
    description: 'Spécialiste de la vannerie avec des fibres naturelles'
  },
  {
    id: 6,
    name: 'Miora Randrianarisoa',
    specialty: 'Broderie',
    location: 'Antsirabe',
    image: '/placeholder.svg',
    rating: 4.9,
    productsCount: 28,
    description: 'Brodeuse experte en motifs traditionnels malgaches'
  }
];

const specialties = [
  'Tous',
  'Sculpture sur bois',
  'Tissage traditionnel',
  'Poterie',
  'Bijouterie',
  'Vannerie',
  'Broderie'
];

const Artisans = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous');

  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Tous' || artisan.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('artisans')}
            </h1>
            <p className="text-gray-600">
              Découvrez les talentueux artisans de Madagascar
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <Input
              type="text"
              placeholder="Rechercher un artisan, spécialité ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md mx-auto block"
            />
            
            <div className="flex flex-wrap justify-center gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 text-center">
              {filteredArtisans.length} artisan{filteredArtisans.length > 1 ? 's' : ''} trouvé{filteredArtisans.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Artisans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <Card key={artisan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-orange-100 relative">
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                    ⭐ {artisan.rating}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{artisan.name}</CardTitle>
                  <CardDescription>{artisan.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {artisan.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>📍 {artisan.location}</span>
                    <span>{artisan.productsCount} produits</span>
                  </div>
                  <Link to={`/artisan/${artisan.id}`}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      {t('view_profile')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredArtisans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun artisan trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('Tous');
                }}
                variant="outline"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artisans;
