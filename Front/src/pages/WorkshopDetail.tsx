import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import WorkshopBookingCalendar from '@/components/WorkshopBookingCalendar';
import WorkshopRegistrationForm from '@/components/WorkshopRegistrationForm';
import ArtisanUnavailabilityDisplay from '@/components/ArtisanUnavailabilityDisplay';
import { useWorkshops } from '@/hooks/useWorkshops';
import { UnavailabilityPeriod } from '@/types/artisan';

interface Unavailability {
  id: string;
  artisan_id: string;
  start_date: string;
  end_date: string | null;
  reason: string;
  type: 'single_day' | 'range';
  status: 'approved' | 'pending' | 'rejected';
}

// Type pour les données de workshop unifiées
interface WorkshopData {
  id: string | number;
  title: string;
  description: string;
  instructor_name?: string;
  instructor?: string;
  instructor_image?: string;
  instructorImage?: string;
  instructor_bio?: string;
  type?: 'inscription' | 'reservation';
  date?: string;
  duration?: string;
  duration_minutes?: number;
  price?: number;
  base_price?: number;
  participants?: number;
  maxParticipants?: number;
  available_spots?: number;
  total_spots?: number;
  image?: string;
  address?: string;
  location?: string;
  difficulty?: string;
  whatYouWillLearn?: string[];
  materials?: string[];
  schedule?: Array<{ time: string; activity: string }>;
  privatizationOption?: any;
}

// Fonction pour normaliser les données du workshop
const normalizeWorkshopData = (apiWorkshop: any, mockWorkshop: any): WorkshopData => {
  if (apiWorkshop) {
    // Utiliser les données de l'API
    return {
      ...apiWorkshop,
      // Ajouter des propriétés pour la compatibilité avec le mock
      type: 'reservation', // Par défaut pour les ateliers API
      instructor: apiWorkshop.instructor_name,
      instructorImage: apiWorkshop.instructor_image,
      location: apiWorkshop.address,
      price: apiWorkshop.base_price,
      duration: apiWorkshop.duration_minutes ? `${Math.floor(apiWorkshop.duration_minutes / 60)}h${apiWorkshop.duration_minutes % 60 > 0 ? ` ${apiWorkshop.duration_minutes % 60}min` : ''}` : undefined,
      maxParticipants: apiWorkshop.total_spots || 10,
      participants: apiWorkshop.available_spots ? (apiWorkshop.total_spots - apiWorkshop.available_spots) : 0
    };
  } else {
    // Utiliser les données mock
    return mockWorkshop;
  }
};

const WorkshopDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showUnavailabilityCalendar, setShowUnavailabilityCalendar] = useState(false);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loadingUnavailabilities, setLoadingUnavailabilities] = useState(false);
  
  // Use the workshop hook
  const { currentWorkshop: apiWorkshop, loading: apiLoading, error: apiError, getWorkshop } = useWorkshops();
  
  // Load workshop data on mount
  useEffect(() => {
    if (id) {
      getWorkshop(id);
    }
  }, [id, getWorkshop]);

  // Load unavailabilities when API workshop is available
  useEffect(() => {
    if (apiWorkshop) {
      setLoadingUnavailabilities(true);
      fetch(`http://localhost:8000/api/v1/workshops/${apiWorkshop.id}/artisan-unavailability`)
        .then(response => response.json())
        .then(data => {
          setUnavailabilities(data);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des indisponibilités:', error);
          setUnavailabilities([]);
        })
        .finally(() => {
          setLoadingUnavailabilities(false);
        });
    }
  }, [apiWorkshop]);

  // Convert API unavailabilities to the format expected by the calendar
  const artisanUnavailability = unavailabilities.map(unavail => ({
    id: unavail.id,
    artisanId: unavail.artisan_id,
    startDate: new Date(unavail.start_date),
    endDate: unavail.end_date ? new Date(unavail.end_date) : undefined,
    reason: unavail.reason,
    type: unavail.type === 'single_day' ? 'single' as const : 'range' as const,
    status: unavail.status as 'draft' | 'pending_approval' | 'approved' | 'rejected',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  // Mock data - in real app, fetch based on id
  const workshopType: 'inscription' | 'reservation' = (id === '2' || id === '4' || id === '6') ? 'reservation' : 'inscription';
  
  const mockWorkshop = {
    id: parseInt(id || '1'),
    title: workshopType === 'reservation' ? 'Tissage traditionnel Malagasy' : 'Initiation à la sculpture sur bois',
    instructor: workshopType === 'reservation' ? 'Voahangy Razafy' : 'Hery Rakoto',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    type: workshopType,
    date: workshopType === 'reservation' ? undefined : '2024-06-15',
    duration: workshopType === 'reservation' ? '4 heures' : '3 heures',
    price: workshopType === 'reservation' ? 30000 : 25000,
    participants: workshopType === 'reservation' ? undefined : 8,
    maxParticipants: workshopType === 'reservation' ? 10 : 12,
    image: workshopType === 'reservation'
      ? 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'
      : 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    location: workshopType === 'reservation' ? 'Fianarantsoa' : 'Atelier Rakoto, Antananarivo',
    difficulty: workshopType === 'reservation' ? 'Intermédiaire' : 'Débutant',
    description: workshopType === 'reservation'
      ? 'Découvrez les techniques ancestrales du tissage malgache dans cet atelier flexible. Réservez votre créneau selon vos disponibilités et apprenez à créer de magnifiques textiles traditionnels.'
      : 'Découvrez l\'art ancestral de la sculpture sur bois malgache dans cet atelier d\'initiation. Vous apprendrez les techniques de base, les outils traditionnels et créerez votre première œuvre sous la guidance experte de Hery Rakoto.',
    whatYouWillLearn: [
      'Les bases de la sculpture sur bois',
      'Utilisation des outils traditionnels',
      'Techniques de taille et de finition',
      'Histoire et symbolisme de l\'art malgache',
      'Création d\'une petite figurine'
    ],
    materials: [
      'Bloc de bois de jacaranda',
      'Set d\'outils de sculpture',
      'Papier de verre',
      'Produits de finition',
      'Tablier et protection'
    ],
    schedule: [
      { time: '09:00', activity: 'Accueil et présentation' },
      { time: '09:30', activity: 'Introduction aux outils et techniques' },
      { time: '10:30', activity: 'Pause' },
      { time: '10:45', activity: 'Début de la sculpture guidée' },
      { time: '11:45', activity: 'Finition et polissage' },
      { time: '12:00', activity: 'Présentation des œuvres et clôture' }
    ],
    privatizationOption: {
      minParticipants: 5,
      maxParticipants: 15,
      basePrice: 50000,
      pricePerParticipant: 35000,
      description: 'Privatisez cet atelier pour votre groupe (entreprise, famille, amis)'
    }
  };

  const handleBooking = (date: Date, time: string) => {
    console.log('Booking confirmed for:', date, time);
    // Here you would typically send the booking to your backend
    alert(`Réservation confirmée pour le ${date.toLocaleDateString('fr-FR')} à ${time}`);
    setShowBookingCalendar(false);
  };

  const handleCustomRequest = (request: any) => {
    console.log('Custom request submitted:', request);
    // Here you would typically send the custom request to your backend
    alert(`Demande personnalisée envoyée ! Nous vous répondrons sous 24h à ${request.contactEmail}`);
    setShowBookingCalendar(false);
  };



  const handleCustomDateRequest = (requestedDate: Date) => {
    console.log('Date requested:', requestedDate);
    setShowUnavailabilityCalendar(false);
    setShowBookingCalendar(true);
  };

  // Use API workshop if available, otherwise use mock
  const workshop = normalizeWorkshopData(apiWorkshop, mockWorkshop);

  // Récupération des indisponibilités si on utilise les données API
  useEffect(() => {
    if (apiWorkshop && apiWorkshop.id) {
      setLoadingUnavailabilities(true);
      fetch(`http://localhost:8000/api/v1/workshops/${apiWorkshop.id}/artisan-unavailability`)
        .then(response => response.json())
        .then(data => {
          setUnavailabilities(data);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des indisponibilités:', error);
          setUnavailabilities([]);
        })
        .finally(() => {
          setLoadingUnavailabilities(false);
        });
    }
  }, [apiWorkshop]);

  const isWorkshopFull = workshop.type === 'inscription' && workshop.participants! >= workshop.maxParticipants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige to-orange-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {apiLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Chargement de l'atelier...</span>
            </div>
          )}
          
          {/* Error State */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">
              <p>Erreur lors du chargement: {apiError}</p>
              <p className="text-xs text-red-600 mt-2">Affichage de l'atelier en attente...</p>
            </div>
          )}
          
          {/* Back Button */}
          <Link to="/workshops" className="inline-flex items-center text-brand-brown hover:text-brand-terracotta mb-6">
            ← Retour aux ateliers
          </Link>

          {/* Workshop Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="aspect-video bg-brand-beige relative">
              <img
                src={workshop.image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop'}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
              
              {/* Workshop Type Badge */}
              <div className={`absolute top-4 left-4 px-3 py-2 rounded-full text-sm font-medium ${
                workshop.type === 'inscription' 
                  ? 'bg-brand-terracotta text-white' 
                  : 'bg-brand-brown text-white'
              }`}>
                {workshop.type === 'inscription' ? 'Inscription' : 'Réservation flexible'}
              </div>

              {/* Participants/Availability Info */}
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-full">
                <span className="text-sm font-medium">
                  {workshop.type === 'inscription' 
                    ? `${workshop.participants}/${workshop.maxParticipants} places`
                    : `Max ${workshop.maxParticipants} places par session`
                  }
                </span>
              </div>

              <div className="absolute bottom-4 left-4 bg-brand-brown text-white px-3 py-2 rounded-full">
                <span className="text-sm font-medium">{workshop.difficulty}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{workshop.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>👨‍🎨 {workshop.instructor_name || workshop.instructor}</span>
                {workshop.type === 'inscription' && workshop.date && (
                  <span>📅 {new Date(workshop.date).toLocaleDateString('fr-FR')}</span>
                )}
                <span>⏱️ {workshop.duration_minutes ? `${Math.floor(workshop.duration_minutes / 60)}h${workshop.duration_minutes % 60 > 0 ? ` ${workshop.duration_minutes % 60}min` : ''}` : workshop.duration}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <span>📍 {workshop.address || workshop.location}</span>
                <span className="text-2xl font-bold text-brand-terracotta">
                  {(workshop.base_price || workshop.price).toLocaleString()} Ar
                </span>
              </div>
              
              {/* Privatization Info */}
              {workshop.privatizationOption && (
                <div className="mb-6 p-4 bg-brand-beige rounded-lg border border-brand-brown/20">
                  <h3 className="font-semibold text-brand-brown mb-2">Option de privatisation disponible</h3>
                  <p className="text-sm text-brand-brown/80 mb-2">{workshop.privatizationOption.description}</p>
                  <div className="text-sm text-brand-brown">
                    À partir de {workshop.privatizationOption.basePrice.toLocaleString()} Ar + {workshop.privatizationOption.pricePerParticipant.toLocaleString()} Ar/participant
                  </div>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                {workshop.type === 'inscription' ? (
                  <>
                    <Button 
                      className="flex-1 bg-brand-brown hover:bg-brand-brown/90 py-3"
                      disabled={isWorkshopFull}
                      onClick={() => {
                        setShowRegistrationForm(true);
                        setShowBookingCalendar(false);
                        setShowUnavailabilityCalendar(false);
                      }}
                    >
                      {isWorkshopFull ? 'Complet' : 'S\'inscrire maintenant'}
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-brand-terracotta text-brand-terracotta hover:bg-brand-terracotta hover:text-white py-3"
                      onClick={() => {
                        setShowUnavailabilityCalendar(!showUnavailabilityCalendar);
                        setShowBookingCalendar(false);
                        setShowRegistrationForm(false);
                      }}
                    >
                      {showUnavailabilityCalendar ? 'Masquer le calendrier' : 'Voir les disponibilités'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="flex-1 bg-brand-brown hover:bg-brand-brown/90 py-3"
                    onClick={() => setShowBookingCalendar(!showBookingCalendar)}
                  >
                    {showBookingCalendar ? 'Masquer le calendrier' : 'Réserver un créneau'}
                  </Button>
                )}
                <Button variant="outline" className="border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white">
                  Ajouter aux favoris
                </Button>
              </div>
            </div>
          </div>

          {/* Registration Form for inscription workshops */}
          {showRegistrationForm && workshop.type === 'inscription' && (
            <div className="mb-6">
              <WorkshopRegistrationForm
                workshop={{
                  id: typeof workshop.id === 'string' ? parseInt(workshop.id, 10) : workshop.id,
                  title: workshop.title,
                  instructor: workshop.instructor_name || workshop.instructor || '',
                  date: workshop.date,
                  duration: workshop.duration || '',
                  price: workshop.base_price || workshop.price || 0,
                  location: workshop.address || workshop.location || '',
                  maxParticipants: workshop.maxParticipants || workshop.total_spots || 10,
                  participants: workshop.participants,
                  image: workshop.image || ''
                }}
                onCancel={() => setShowRegistrationForm(false)}
              />
            </div>
          )}

          {/* Artisan Unavailability Calendar */}
          {showUnavailabilityCalendar && workshop.type === 'inscription' && (
            <div className="mb-6">
              <ArtisanUnavailabilityDisplay
                artisanName={workshop.instructor}
                unavailabilityPeriods={artisanUnavailability}
                onDateRequest={handleCustomDateRequest}
              />
            </div>
          )}

          {/* Booking Calendar for reservation type or custom requests */}
          {showBookingCalendar && (
            <div className="mb-6">
              <WorkshopBookingCalendar
                workshopId={typeof workshop.id === 'string' ? parseInt(workshop.id, 10) : workshop.id}
                workshopType={workshop.type}
                duration={workshop.duration}
                maxParticipants={workshop.maxParticipants}
                artisanName={workshop.instructor}
                privatizationOption={workshop.privatizationOption}
                artisanUnavailability={artisanUnavailability}
                onBooking={handleBooking}
                onCustomRequest={handleCustomRequest}
              />
            </div>
          )}

          {/* Content Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{workshop.description}</p>
                  
                  {workshop.type === 'reservation' && (
                    <div className="mt-4 p-4 bg-brand-beige rounded-lg">
                      <h4 className="font-medium text-brand-brown mb-2">Atelier sur réservation</h4>
                      <p className="text-sm text-brand-brown/80">
                        Cet atelier propose des créneaux flexibles. Vous pouvez choisir la date et l'heure qui vous conviennent le mieux parmi les disponibilités proposées.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown">Ce que vous apprendrez</CardTitle>
                </CardHeader>
                <CardContent>
                  {workshop.whatYouWillLearn ? (
                    <ul className="space-y-2">
                      {workshop.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-brand-terracotta rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Informations détaillées disponibles lors de l'inscription.</p>
                  )}
                </CardContent>
              </Card>

              {/* Schedule - only for inscription type */}
              {workshop.type === 'inscription' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-brand-brown">Programme de l'atelier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workshop.schedule ? (
                      <div className="space-y-3">
                        {workshop.schedule.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <span className="font-medium text-brand-terracotta w-16 flex-shrink-0">
                              {item.time}
                            </span>
                            <span className="text-gray-600">{item.activity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Programme détaillé communiqué lors de l'inscription.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Instructor Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown">Votre instructeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-brand-orange/20 rounded-full overflow-hidden">
                      <img
                        src={workshop.instructor_image || workshop.instructorImage}
                        alt={workshop.instructor_name || workshop.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{workshop.instructor_name || workshop.instructor}</h3>
                      <p className="text-sm text-gray-600">Maître artisan</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {workshop.instructor_bio || "Artisan passionné avec plus de 15 ans d'expérience dans l'artisanat traditionnel malgache."}
                  </p>
                  <Link to={`/artisan/1`}>
                    <Button variant="outline" size="sm" className="w-full border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white">
                      Voir le profil
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Materials Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown">Matériel inclus</CardTitle>
                </CardHeader>
                <CardContent>
                  {workshop.materials ? (
                    <ul className="space-y-2">
                      {workshop.materials.map((material, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-brand-orange rounded-full"></span>
                          <span className="text-gray-600">{material}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Liste du matériel fourni communiquée lors de l'inscription.</p>
                  )}
                </CardContent>
              </Card>

              {/* Important Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown">Informations importantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div>
                    <strong>Âge minimum :</strong> 12 ans
                  </div>
                  <div>
                    <strong>Niveau requis :</strong> Aucun
                  </div>
                  <div>
                    <strong>Langues :</strong> Français, Malgache
                  </div>
                  <div>
                    <strong>Type :</strong> 
                    <Badge className={`ml-2 ${
                      workshop.type === 'inscription' ? 'bg-brand-orange text-white' : 'bg-brand-brown text-white'
                    }`}>
                      {workshop.type === 'inscription' ? 'Inscription fixe' : 'Réservation flexible'}
                    </Badge>
                  </div>
                  {workshop.privatizationOption && (
                    <div>
                      <strong>Privatisation :</strong> 
                      <Badge className="ml-2 bg-brand-brown text-white">
                        Disponible
                      </Badge>
                    </div>
                  )}
                  <div>
                    <strong>Politique d'annulation :</strong> 
                    Annulation gratuite jusqu'à 24h avant l'atelier
                  </div>
                </CardContent>
              </Card>

              {/* Indisponibilités de l'artisan */}
              {apiWorkshop && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-brand-brown">Indisponibilités de l'artisan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingUnavailabilities ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Chargement...</span>
                      </div>
                    ) : unavailabilities.length > 0 ? (
                      <div className="space-y-3">
                        {unavailabilities.map((unavailability) => (
                          <div key={unavailability.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-red-800">{unavailability.reason}</h4>
                                <p className="text-sm text-red-600 mt-1">
                                  {unavailability.type === 'single_day' ? (
                                    <>Indisponible le {new Date(unavailability.start_date).toLocaleDateString('fr-FR')}</>
                                  ) : (
                                    <>Du {new Date(unavailability.start_date).toLocaleDateString('fr-FR')} au {new Date(unavailability.end_date!).toLocaleDateString('fr-FR')}</>
                                  )}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                {unavailability.status === 'approved' ? 'Confirmé' : 'En attente'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">Aucune indisponibilité prévue.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
