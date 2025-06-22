
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const artisans = {
  'Hery Rakoto': {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    description: 'Maître sculpteur spécialisé dans l\'art traditionnel malgache depuis 20 ans.'
  },
  'Voahangy Razafy': {
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b332b302?w=50&h=50&fit=crop&crop=face',
    description: 'Tisseuse experte en lamba traditionnels et soie sauvage.'
  },
  'Nivo Andriamana': {
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    description: 'Potier traditionnel utilisant des techniques ancestrales.'
  },
  'Lalaina Ratsimbazafy': {
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
    description: 'Créatrice de bijoux artisanaux avec des matériaux locaux.'
  },
  'Fara Rasoamampianina': {
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    description: 'Spécialiste de la vannerie traditionnelle malgache.'
  },
  'Miora Randrianarisoa': {
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face',
    description: 'Experte en broderie et couture traditionnelle.'
  }
};

const workshops = [
  {
    id: 1,
    title: 'Initiation à la sculpture sur bois',
    instructor: 'Hery Rakoto',
    type: 'inscription', // Fixed date registration
    date: '2024-06-15',
    duration: '3 heures',
    price: 25000,
    participants: 8,
    maxParticipants: 12,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    location: 'Antananarivo',
    difficulty: 'Débutant',
    description: 'Apprenez les bases de la sculpture sur bois traditionnelle malgache',
    category: 'Sculpture'
  },
  {
    id: 2,
    title: 'Tissage traditionnel Malagasy',
    instructor: 'Voahangy Razafy',
    type: 'reservation', // Flexible booking
    duration: '4 heures',
    price: 30000,
    maxParticipants: 10,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
    location: 'Fianarantsoa',
    difficulty: 'Intermédiaire',
    description: 'Découvrez les techniques ancestrales du tissage malgache',
    category: 'Textile'
  },
  {
    id: 3,
    title: 'Poterie et céramique',
    instructor: 'Nivo Andriamana',
    type: 'inscription',
    date: '2024-06-22',
    duration: '5 heures',
    price: 35000,
    participants: 3,
    maxParticipants: 8,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop',
    location: 'Mahajanga',
    difficulty: 'Débutant',
    description: 'Créez vos propres pièces en céramique avec des techniques locales',
    category: 'Céramique'
  },
  {
    id: 4,
    title: 'Confection de bijoux artisanaux',
    instructor: 'Lalaina Ratsimbazafy',
    type: 'reservation',
    duration: '3 heures',
    price: 20000,
    maxParticipants: 15,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    location: 'Toliara',
    difficulty: 'Débutant',
    description: 'Apprenez à créer des bijoux avec des matériaux locaux',
    category: 'Bijouterie'
  },
  {
    id: 5,
    title: 'Vannerie traditionnelle',
    instructor: 'Fara Rasoamampianina',
    type: 'inscription',
    date: '2024-06-28',
    duration: '6 heures',
    price: 40000,
    participants: 4,
    maxParticipants: 10,
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
    location: 'Morondava',
    difficulty: 'Intermédiaire',
    description: 'Maîtrisez l\'art de la vannerie avec des fibres naturelles',
    category: 'Vannerie'
  },
  {
    id: 6,
    title: 'Broderie et couture traditionnelle',
    instructor: 'Miora Randrianarisoa',
    type: 'reservation',
    duration: '4 heures',
    price: 28000,
    maxParticipants: 12,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    location: 'Antsirabe',
    difficulty: 'Débutant',
    description: 'Découvrez les motifs traditionnels de la broderie malgache',
    category: 'Textile'
  }
];

const categories = ['Tous', 'Sculpture', 'Textile', 'Céramique', 'Bijouterie', 'Vannerie'];
const difficulties = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
const types = ['Tous', 'inscription', 'reservation'];

const Workshops = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || workshop.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'Tous' || workshop.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'Tous' || workshop.type === selectedType;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('workshops')}
            </h1>
            <p className="text-gray-600">
              Apprenez les techniques artisanales traditionnelles
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <Input
              type="text"
              placeholder="Rechercher un atelier, instructeur ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md mx-auto block"
            />
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-purple-100'
                    }`}
                  >
                    {type === 'Tous' ? 'Tous' : type === 'inscription' ? 'Inscription' : 'Réservation'}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Catégorie:</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Niveau:</span>
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-blue-100'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 text-center">
              {filteredWorkshops.length} atelier{filteredWorkshops.length > 1 ? 's' : ''} trouvé{filteredWorkshops.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Workshops Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredWorkshops.map((workshop) => (
              <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-green-100 relative">
                  <img
                    src={workshop.image}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Workshop Type Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    workshop.type === 'inscription' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-purple-600 text-white'
                  }`}>
                    {workshop.type === 'inscription' ? 'Inscription' : 'Réservation'}
                  </div>

                  {/* Participants Count for inscription type */}
                  {workshop.type === 'inscription' && (
                    <div className="absolute top-10 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                      {workshop.participants}/{workshop.maxParticipants} places
                    </div>
                  )}

                  {/* Max participants for reservation type */}
                  {workshop.type === 'reservation' && (
                    <div className="absolute top-10 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                      Max {workshop.maxParticipants} places
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {workshop.difficulty}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {workshop.category}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{workshop.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={artisans[workshop.instructor as keyof typeof artisans]?.photo}
                        alt={workshop.instructor}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-sm">{workshop.instructor}</div>
                        <div className="text-xs text-gray-500">
                          {artisans[workshop.instructor as keyof typeof artisans]?.description}
                        </div>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {workshop.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      {workshop.type === 'inscription' ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(workshop.date!).toLocaleDateString('fr-FR')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Dates flexibles</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{workshop.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{workshop.location}</span>
                      </div>
                      <span className="font-semibold text-lg text-green-600">
                        {workshop.price.toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                  <Link to={`/workshop/${workshop.id}`}>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={workshop.type === 'inscription' && workshop.participants! >= workshop.maxParticipants}
                    >
                      {workshop.type === 'inscription' 
                        ? (workshop.participants! >= workshop.maxParticipants ? 'Complet' : 'S\'inscrire')
                        : 'Réserver'
                      }
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredWorkshops.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun atelier trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Tous');
                  setSelectedDifficulty('Tous');
                  setSelectedType('Tous');
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

export default Workshops;
