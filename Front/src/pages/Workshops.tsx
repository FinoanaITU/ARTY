
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import WorkshopFilters from '@/components/WorkshopFilters';
import QuoteRequestForm from '@/components/QuoteRequestForm';
import WorkshopSubscriptionForm from '@/components/WorkshopSubscriptionForm';
import SubscriptionRegistrationForm from '@/components/SubscriptionRegistrationForm';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, CreditCard, Calendar as CalendarIcon, BookOpen, Star } from 'lucide-react';

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

// Données pour les ateliers sur réservation (catalogue filtrable)
const reservationWorkshops = [
  {
    id: 1,
    title: 'Initiation à la sculpture sur bois',
    instructor: 'Hery Rakoto',
    duration: '3 heures',
    basePrice: 25000,
    pricePerPerson: 5000,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    difficulty: 'Débutant',
    description: 'Atelier personnalisé pour groupes, parfait pour EVJF, anniversaires ou teambuilding',
    category: 'Sculpture',
    savoirFaire: 'Sculpture sur bois',
    theme: ['EVJF', 'Anniversaires', 'Teambuilding'],
    minParticipants: 4,
    maxParticipants: 15,
    availableLocations: ['À domicile', 'Atelier Antananarivo', 'Lieu personnalisé']
  },
  {
    id: 2,
    title: 'Tissage traditionnel Malagasy',
    instructor: 'Voahangy Razafy',
    duration: '4 heures',
    basePrice: 30000,
    pricePerPerson: 6000,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
    difficulty: 'Intermédiaire',
    description: 'Découvrez les techniques ancestrales du tissage en groupe privé',
    category: 'Textile',
    savoirFaire: 'Tissage traditionnel',
    theme: ['Date', 'Teambuilding', 'EVJF'],
    minParticipants: 3,
    maxParticipants: 12,
    availableLocations: ['À domicile', 'Atelier Fianarantsoa', 'Lieu personnalisé']
  },
  {
    id: 5,
    title: 'Atelier bijoux créatifs',
    instructor: 'Lalaina Ratsimbazafy',
    duration: '2.5 heures',
    basePrice: 20000,
    pricePerPerson: 4000,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    difficulty: 'Débutant',
    description: 'Créez vos bijoux personnalisés, idéal pour EVJF et anniversaires',
    category: 'Bijouterie',
    savoirFaire: 'Bijouterie artisanale',
    theme: ['EVJF', 'Anniversaires', 'Date'],
    minParticipants: 2,
    maxParticipants: 8,
    availableLocations: ['À domicile', 'Atelier Toliara', 'Lieu personnalisé']
  },
  {
    id: 6,
    title: 'Vannerie moderne',
    instructor: 'Fara Rasoamampianina',
    duration: '3.5 heures',
    basePrice: 22000,
    pricePerPerson: 4500,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    difficulty: 'Intermédiaire',
    description: 'Découverte de la vannerie moderne pour tous types d\'événements',
    category: 'Vannerie',
    savoirFaire: 'Vannerie',
    theme: ['Teambuilding', 'Famille', 'Anniversaires'],
    minParticipants: 5,
    maxParticipants: 20,
    availableLocations: ['Atelier Mahajanga', 'Lieu personnalisé']
  }
];

// Données pour les ateliers sur inscription
const eventWorkshops = [
  {
    id: 3,
    title: 'Poterie et céramique',
    instructor: 'Nivo Andriamana',
    date: '2024-06-22',
    time: '14:00',
    duration: '5 heures',
    price: 35000,
    participants: 3,
    maxParticipants: 8,
    minRequired: 4,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop',
    location: 'Atelier Mahajanga',
    difficulty: 'Débutant',
    description: 'Créez vos propres pièces en céramique avec des techniques locales',
    category: 'Céramique',
    includedInSubscription: true
  },
  {
    id: 4,
    title: 'Confection de bijoux artisanaux',
    instructor: 'Lalaina Ratsimbazafy',
    date: '2024-06-28',
    time: '10:00',
    duration: '3 heures',
    price: 20000,
    participants: 7,
    maxParticipants: 15,
    minRequired: 6,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    location: 'Atelier Toliara',
    difficulty: 'Débutant',
    description: 'Apprenez à créer des bijoux avec des matériaux locaux',
    category: 'Bijouterie',
    includedInSubscription: false
  }
];

// Données pour les formules d'abonnement
const subscriptionPlans = [
  {
    id: 'explorateur',
    name: 'Explorateur',
    duration: '1 mois',
    credits: 3,
    price: 75000,
    description: '3 savoir-faire différents à découvrir',
    features: ['3 crédits ateliers', 'Accès à tous les ateliers compatibles', 'Calendrier personnalisé'],
    recommended: false
  },
  {
    id: 'apprenti',
    name: 'Artisan Apprenti',
    duration: '2 mois',
    credits: 4,
    price: 120000,
    description: '1 savoir-faire évolutif avec parcours progressif',
    features: ['4 crédits ateliers', 'Parcours évolutif personnalisé', 'Suivi de progression', 'Support prioritaire'],
    recommended: true
  },
  {
    id: 'createur',
    name: 'Créateur Curieux',
    duration: '3 mois',
    credits: 6,
    price: 180000,
    description: 'Parcours multi-savoir-faire complet',
    features: ['6 crédits ateliers', 'Accès illimité aux événements', 'Parcours multi-savoir-faire', 'Bonus matériaux'],
    recommended: false
  }
];

// Données pour les ateliers enfants Artikidz
const artikidzWorkshops = [
  {
    id: 1,
    title: 'Poterie magique pour petites mains',
    instructor: 'Nivo Andriamana',
    location: 'Antananarivo',
    duration: '1h30',
    minAge: 6,
    maxAge: 12,
    groupSize: '4-8 enfants',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    description: 'Les enfants découvrent l\'art de la poterie en créant leurs propres petits objets décoratifs avec de l\'argile locale.',
    learningObjectives: [
      'Développer la créativité et la motricité fine',
      'Découvrir les traditions malgaches',
      'Créer un objet unique à ramener à la maison'
    ],
    materials: 'Tablier fourni, argile, outils adaptés aux enfants',
    type: 'reservation'
  },
  {
    id: 2,
    title: 'Atelier peinture sur écorce',
    instructor: 'Miora Randrianarisoa',
    location: 'Fianarantsoa',
    duration: '2h',
    minAge: 8,
    maxAge: 14,
    groupSize: '6-10 enfants',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop',
    description: 'Initiation à la peinture traditionnelle sur écorce d\'arbre, technique ancestrale malgache adaptée pour les enfants.',
    learningObjectives: [
      'Apprendre une technique artistique traditionnelle',
      'Développer l\'expression artistique',
      'Sensibilisation à l\'environnement naturel'
    ],
    materials: 'Écorces préparées, peintures naturelles, pinceaux adaptés',
    type: 'inscription'
  },
  {
    id: 3,
    title: 'Création de marionnettes malgaches',
    instructor: 'Lalaina Ratsimbazafy',
    location: 'Antananarivo',
    duration: '2h30',
    minAge: 7,
    maxAge: 15,
    groupSize: '5-8 enfants',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea7?w=500&h=300&fit=crop',
    description: 'Les enfants fabriquent leurs propres marionnettes inspirées des contes traditionnels malgaches.',
    learningObjectives: [
      'Découvrir les contes et légendes malgaches',
      'Développer la dextérité manuelle',
      'Encourager l\'imagination et le jeu'
    ],
    materials: 'Tissus colorés, fil, boutons, matériaux de décoration',
    type: 'subscription'
  },
  {
    id: 4,
    title: 'Mini-tissage familial',
    instructor: 'Voahangy Razafy',
    location: 'Ambositra',
    duration: '1h45',
    minAge: 5,
    maxAge: 10,
    groupSize: '4-6 enfants + 1 parent',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1611366607516-e3b3c19fcfb1?w=500&h=300&fit=crop',
    description: 'Atelier parent-enfant pour découvrir les bases du tissage traditionnel avec des métiers adaptés.',
    learningObjectives: [
      'Renforcer les liens familiaux',
      'Découvrir un artisanat ancestral',
      'Créer ensemble un petit objet textile'
    ],
    materials: 'Métiers à tisser miniatures, laines colorées, navettes adaptées',
    type: 'reservation'
  }
];

const Workshops = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('reservation');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showSubscriptionRegistrationForm, setShowSubscriptionRegistrationForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { subscription, hasActiveSubscription, createSubscription, getAvailablePlans } = useSubscription();
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedEventType, setSelectedEventType] = useState('Tous');
  const [selectedDuration, setSelectedDuration] = useState('Tous');
  const [selectedGroupSize, setSelectedGroupSize] = useState('Tous');

  // Fonction pour filtrer les ateliers
  const filterWorkshops = (workshops: any[]) => {
    return workshops.filter(workshop => {
      const matchesSearch = searchTerm === '' || 
        workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Tous' || workshop.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'Tous' || workshop.difficulty === selectedDifficulty;
      
      const matchesEventType = selectedEventType === 'Tous' || 
        (workshop.theme && workshop.theme.includes(selectedEventType));
      
      const matchesDuration = selectedDuration === 'Tous' || 
        (selectedDuration === '2-3h' && parseFloat(workshop.duration) <= 3) ||
        (selectedDuration === '4-5h' && parseFloat(workshop.duration) >= 4 && parseFloat(workshop.duration) <= 5) ||
        (selectedDuration === '6h+' && parseFloat(workshop.duration) > 5);
      
      const matchesGroupSize = selectedGroupSize === 'Tous' ||
        (selectedGroupSize === '1-5 pers.' && workshop.maxParticipants <= 5) ||
        (selectedGroupSize === '6-10 pers.' && workshop.maxParticipants >= 6 && workshop.maxParticipants <= 10) ||
        (selectedGroupSize === '11-15 pers.' && workshop.maxParticipants >= 11 && workshop.maxParticipants <= 15) ||
        (selectedGroupSize === '16+ pers.' && workshop.maxParticipants > 15);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesEventType && matchesDuration && matchesGroupSize;
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Tous');
    setSelectedDifficulty('Tous');
    setSelectedType('Tous');
    setSelectedEventType('Tous');
    setSelectedDuration('Tous');
    setSelectedGroupSize('Tous');
  };

  const handleQuoteRequest = (workshopId: number, workshopTitle: string) => {
    const workshop = reservationWorkshops.find(w => w.id === workshopId);
    setSelectedWorkshop({ ...workshop, title: workshopTitle });
    setShowQuoteForm(true);
  };

  const handleQuoteSubmit = (data: any) => {
    console.log('Quote request submitted:', data);
    setShowQuoteForm(false);
    setSelectedWorkshop(null);
  };

  const handleSubscriptionPurchase = (plan: any) => {
    setSelectedPlan(plan);
    setShowSubscriptionRegistrationForm(true);
  };

  const handleWorkshopRegistrationWithSubscription = (workshop: any) => {
    setSelectedWorkshop(workshop);
    setShowSubscriptionForm(true);
  };

  const filteredReservationWorkshops = filterWorkshops(reservationWorkshops);

  const ReservationWorkshopsComponent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Catalogue d'Ateliers sur Réservation</h2>
        <p className="text-muted-foreground">Catalogue filtrable d'ateliers personnalisables selon vos besoins</p>
      </div>
      
      <WorkshopFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedEventType={selectedEventType}
        setSelectedEventType={setSelectedEventType}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        selectedGroupSize={selectedGroupSize}
        setSelectedGroupSize={setSelectedGroupSize}
        onResetFilters={resetFilters}
        resultsCount={filteredReservationWorkshops.length}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        {filteredReservationWorkshops.map((workshop) => (
          <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
              <Badge className="absolute top-2 right-2 bg-purple-600 text-white">Sur Réservation</Badge>
              <Badge className="absolute bottom-2 left-2 bg-primary">{workshop.difficulty}</Badge>
              <Badge className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground">{workshop.category}</Badge>
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {workshop.theme.slice(0, 2).map((theme: string) => (
                  <Badge key={theme} className="bg-orange-500 text-white text-xs">{theme}</Badge>
                ))}
              </div>
            </div>
            
            <CardHeader>
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
                    <div className="text-xs text-muted-foreground">
                      {artisans[workshop.instructor as keyof typeof artisans]?.description}
                    </div>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{workshop.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{workshop.duration}</span>
                  <Users className="h-4 w-4 ml-4" />
                  <span>{workshop.minParticipants}-{workshop.maxParticipants} personnes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{workshop.availableLocations.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">{workshop.savoirFaire}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold text-primary">
                    Prix à partir de {workshop.basePrice.toLocaleString()} Ar
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700">
                    <strong>ℹ️ Tarif estimatif :</strong> Le tarif affiché est une estimation. Un devis final sera envoyé selon votre lieu, la taille du groupe, le matériel et les contraintes logistiques.
                  </p>
                </div>
              </div>
              
              <Dialog open={showQuoteForm && selectedWorkshop?.id === workshop.id} onOpenChange={(open) => {
                if (!open) {
                  setShowQuoteForm(false);
                  setSelectedWorkshop(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    onClick={() => handleQuoteRequest(workshop.id, workshop.title)}
                  >
                    Demander un devis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  {selectedWorkshop && (
                    <QuoteRequestForm
                      workshopTitle={selectedWorkshop.title}
                      onSubmit={handleQuoteSubmit}
                      onCancel={() => {
                        setShowQuoteForm(false);
                        setSelectedWorkshop(null);
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredReservationWorkshops.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun atelier ne correspond à vos critères de recherche.</p>
          <Button variant="outline" onClick={resetFilters} className="mt-4">
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );

  const EventWorkshopsComponent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Ateliers sur Inscription</h2>
        <p className="text-muted-foreground">Événements programmés avec dates fixes</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {eventWorkshops.map((workshop) => (
          <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
              <Badge className="absolute top-2 right-2 bg-orange-600 text-white">Sur Inscription</Badge>
              {workshop.includedInSubscription && (
                <Badge className="absolute top-2 left-2 bg-green-600 text-white">Inclus abonnement</Badge>
              )}
              <Badge className="absolute bottom-2 left-2 bg-primary">{workshop.difficulty}</Badge>
              <Badge className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground">{workshop.category}</Badge>
            </div>
            
            <CardHeader>
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
                    <div className="text-xs text-muted-foreground">
                      {artisans[workshop.instructor as keyof typeof artisans]?.description}
                    </div>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{workshop.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(workshop.date).toLocaleDateString('fr-FR')} à {workshop.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{workshop.duration}</span>
                  <MapPin className="h-4 w-4 ml-4" />
                  <span>{workshop.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{workshop.participants}/{workshop.maxParticipants} places</span>
                  </div>
                  <span className="font-semibold text-lg text-primary">
                    {workshop.price.toLocaleString()} Ar
                  </span>
                </div>
                {workshop.participants < workshop.minRequired && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    Minimum {workshop.minRequired} participants requis pour maintenir l'atelier
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Link to={`/workshop/${workshop.id}`}>
                  <Button 
                    className="w-full"
                    disabled={workshop.participants >= workshop.maxParticipants}
                  >
                    {workshop.participants >= workshop.maxParticipants ? 'Complet' : 'S\'inscrire'}
                  </Button>
                </Link>
                
                {/* Bouton d'inscription avec abonnement si l'atelier est inclus */}
                {workshop.includedInSubscription && hasActiveSubscription && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleWorkshopRegistrationWithSubscription(workshop)}
                    disabled={workshop.participants >= workshop.maxParticipants}
                  >
                    Utiliser mes crédits d'abonnement
                  </Button>
                )}
              </div>
              
              {workshop.includedInSubscription && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  <Link to="#subscription" className="text-primary hover:underline">
                    Inclus dans certaines formules d'abonnement
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const SubscriptionComponent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Ateliers par Abonnement</h2>
        <p className="text-muted-foreground">Formules d'apprentissage progressif avec parcours personnalisés</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${plan.recommended ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {plan.recommended && <Badge className="bg-primary">Recommandé</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-3xl font-bold text-primary">{plan.price.toLocaleString()} Ar</div>
              <div className="text-sm text-muted-foreground">{plan.duration}</div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full"
                onClick={() => handleSubscriptionPurchase(plan)}
              >
                Choisir cette formule
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
              <h4 className="font-medium mb-1">Choisissez votre formule</h4>
              <p className="text-muted-foreground">Sélectionnez l'abonnement qui correspond à vos objectifs</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
              <h4 className="font-medium mb-1">Recevez vos crédits</h4>
              <p className="text-muted-foreground">Vos crédits sont automatiquement ajoutés à votre compte</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
              <h4 className="font-medium mb-1">Réservez vos ateliers</h4>
              <p className="text-muted-foreground">Utilisez vos crédits pour participer aux ateliers de votre choix</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ArtikidzComponent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Ateliers Artikidz</h2>
        <p className="text-muted-foreground">Ateliers créatifs spécialement conçus pour les enfants</p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            👨‍👩‍👧‍👦 <strong>Ateliers adaptés aux enfants :</strong> Matériel sécurisé, techniques simplifiées et encadrement bienveillant
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {artikidzWorkshops.map((workshop) => (
          <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-yellow-200">
            <div className="aspect-video relative">
              <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
              <Badge className="absolute top-2 right-2 bg-yellow-600 text-white">Artikidz</Badge>
              <Badge className="absolute top-2 left-2 bg-purple-600 text-white">
                {workshop.minAge}-{workshop.maxAge} ans
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{workshop.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <img 
                      src={artisans[workshop.instructor as keyof typeof artisans]?.photo || ''} 
                      alt={workshop.instructor}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{workshop.instructor}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {workshop.description}
              </CardDescription>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Durée: {workshop.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Groupe: {workshop.groupSize}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{workshop.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold text-primary">
                    {workshop.price.toLocaleString()} Ar par enfant
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">🎯 Objectifs pédagogiques :</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  {workshop.learningObjectives.map((objective, index) => (
                    <li key={index}>• {objective}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  <strong>🎨 Matériel :</strong> {workshop.materials}
                </p>
              </div>
              
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                {workshop.type === 'reservation' ? 'Réserver cet atelier' : 
                 workshop.type === 'inscription' ? 'S\'inscrire' : 
                 'Inclus dans l\'abonnement'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-800 mb-4">
          📋 Informations pratiques pour les parents
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-700">
          <div>
            <h4 className="font-semibold mb-2">Avant l'atelier :</h4>
            <ul className="space-y-1">
              <li>• Prévoir des vêtements qui peuvent se salir</li>
              <li>• Apporter une bouteille d'eau</li>
              <li>• Arriver 10 minutes avant le début</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Pendant l'atelier :</h4>
            <ul className="space-y-1">
              <li>• Encadrement par des professionnels expérimentés</li>
              <li>• Matériel sécurisé et adapté à l'âge</li>
              <li>• Possibilité pour les parents d'observer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Nos Ateliers
            </h1>
            <p className="text-muted-foreground text-lg">
              Découvrez nos différentes formules d'apprentissage artisanal
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="reservation" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Sur Réservation
              </TabsTrigger>
              <TabsTrigger value="inscription" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Sur Inscription
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Par Abonnement
              </TabsTrigger>
              <TabsTrigger value="artikidz" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Artikidz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservation">
              <ReservationWorkshopsComponent />
            </TabsContent>

            <TabsContent value="inscription">
              <EventWorkshopsComponent />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionComponent />
            </TabsContent>

            <TabsContent value="artikidz">
              <ArtikidzComponent />
            </TabsContent>
          </Tabs>

          {/* Modal d'inscription avec abonnement */}
          <Dialog open={showSubscriptionForm} onOpenChange={setShowSubscriptionForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedWorkshop && (
                <WorkshopSubscriptionForm
                  workshop={selectedWorkshop}
                  onCancel={() => {
                    setShowSubscriptionForm(false);
                    setSelectedWorkshop(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Modal d'inscription pour l'achat d'abonnement */}
          <Dialog open={showSubscriptionRegistrationForm} onOpenChange={setShowSubscriptionRegistrationForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedPlan && (
                <SubscriptionRegistrationForm
                  plan={selectedPlan}
                  onCancel={() => {
                    setShowSubscriptionRegistrationForm(false);
                    setSelectedPlan(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Workshops;
