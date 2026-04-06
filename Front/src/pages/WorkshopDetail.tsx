import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, PackageCheck, AlertCircle, Clock, Users as UsersIcon, Globe, Calendar as CalendarIcon2 } from 'lucide-react';
import WorkshopBookingCalendar from '@/components/WorkshopBookingCalendar';
import WorkshopRegistrationForm from '@/components/WorkshopRegistrationForm';
import ArtisanUnavailabilityDisplay from '@/components/ArtisanUnavailabilityDisplay';
import { useWorkshops } from '@/hooks/useWorkshops';
import { UnavailabilityPeriod } from '@/types/artisan';
import { useUser } from '@/contexts/UserContext';
import { usePriceVariations } from '@/hooks/usePriceVariations';

interface Unavailability {
  id: string;
  artisan_id: string;
  start_date: string;
  end_date: string | null;
  reason: string;
  type: 'single_day' | 'range';
  status: 'approved' | 'pending' | 'rejected';
}

interface WorkshopData {
  id: string | number;
  title: string;
  description: string;
  artisan_id?: string;
  instructor_name?: string;
  instructor?: string;
  instructor_image?: string;
  instructorImage?: string;
  instructor_bio?: string;
  type?: 'inscription' | 'reservation';
  workshop_type?: 'inscription' | 'reservation';
  date?: string;
  duration?: string;
  duration_minutes?: number;
  price?: number;
  base_price?: number;
  participants?: number;
  maxParticipants?: number;
  max_participants?: number;
  available_spots?: number;
  total_spots?: number;
  image?: string;
  address?: string;
  location?: string;
  difficulty?: string;
  skill_level?: string;
  whatYouWillLearn?: string[];
  what_you_will_learn?: string[];
  materials?: string[];
  materials_included?: string[];
  materials_to_bring?: string[];
  prerequisites?: string;
  schedule?: Array<{ time: string; activity: string }>;
  privatizationOption?: any;
  tags?: string[];
  rating_average?: number | string;
  rating_count?: number;
  cancellation_policy?: string;
  total_bookings?: number;
}

const normalizeWorkshopData = (apiWorkshop: any, mockWorkshop: any): WorkshopData => {
  if (apiWorkshop) {
    
    return {
      ...apiWorkshop,
      
      type: apiWorkshop.workshop_type || 'reservation',
      instructor: apiWorkshop.instructor_name,
      instructorImage: apiWorkshop.instructor_image,
      location: apiWorkshop.address,
      price: apiWorkshop.base_price,
      difficulty: apiWorkshop.skill_level || 'Intermédiaire',
      duration: apiWorkshop.duration_minutes ? `${Math.floor(apiWorkshop.duration_minutes / 60)}h${apiWorkshop.duration_minutes % 60 > 0 ? ` ${apiWorkshop.duration_minutes % 60}min` : ''}` : undefined,
      maxParticipants: apiWorkshop.max_participants || 10,
      participants: apiWorkshop.total_bookings || 0,
      materials: apiWorkshop.materials_included || [],
      whatYouWillLearn: apiWorkshop.what_you_will_learn || []
    };
  } else {
    
    return mockWorkshop;
  }
};

const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop';
  
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
  return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
};

const WorkshopDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showUnavailabilityCalendar, setShowUnavailabilityCalendar] = useState(false);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loadingUnavailabilities, setLoadingUnavailabilities] = useState(false);
  
  
  const { currentWorkshop: apiWorkshop, loading: apiLoading, error: apiError, getWorkshop } = useWorkshops();
  
  
  useEffect(() => {
    if (id) {
      getWorkshop(id);
    }
  }, [id, getWorkshop]);

  
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
    
    alert(`Réservation confirmée pour le ${date.toLocaleDateString('fr-FR')} à ${time}`);
    setShowBookingCalendar(false);
  };

  const handleCustomRequest = (request: any) => {
    console.log('Custom request submitted:', request);
    
    alert(`Demande personnalisée envoyée ! Nous vous répondrons sous 24h à ${request.contactEmail}`);
    setShowBookingCalendar(false);
  };

  const handleCustomDateRequest = (requestedDate: Date) => {
    console.log('Date requested:', requestedDate);
    setShowUnavailabilityCalendar(false);
    setShowBookingCalendar(true);
  };

  
  const workshop = normalizeWorkshopData(apiWorkshop, mockWorkshop);

  
  const getUserType = () => {
    if (!user) return 'tourist';
    if (user.buyerType === 'entreprise') return 'business';
    if (user.locationType === 'local') return 'local';
    return 'tourist';
  };

  const workshopPrice = workshop.base_price || workshop.price || 0;
  const { priceVariation } = usePriceVariations(workshopPrice, getUserType());

  
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
          {}
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
          
          {}
          <Link to="/workshops" className="inline-flex items-center text-brand-brown hover:text-brand-terracotta mb-6">
            ← Retour aux ateliers
          </Link>

          {}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="aspect-video bg-brand-beige relative">
              <img
                src={normalizeImageUrl(
                  (apiWorkshop?.featured_image_url as string) || 
                  workshop.image || 
                  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop'
                )}
                alt={workshop.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop'; }}
              />
              
              {}
              <div className={`absolute top-4 left-4 px-3 py-2 rounded-full text-sm font-medium ${
                workshop.type === 'inscription' 
                  ? 'bg-brand-terracotta text-white' 
                  : 'bg-brand-brown text-white'
              }`}>
                {workshop.type === 'inscription' ? 'Inscription' : 'Réservation flexible'}
              </div>

              {}
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
                {workshop.rating_count > 0 && (
                  <span>⭐ {parseFloat(workshop.rating_average).toFixed(1)} ({workshop.rating_count} avis)</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>📍 {workshop.address || workshop.location}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-terracotta">
                    {formatCurrency(priceVariation.discountedPrice, language)}
                  </span>
                  {priceVariation.discountPercentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(priceVariation.originalPrice, language)}
                      </span>
                      <Badge className="bg-green-600 text-white">
                        -{priceVariation.discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              {workshop.tags && workshop.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {workshop.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-brand-beige text-brand-brown border-brand-brown">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {}
              {workshop.privatizationOption && (
                <div className="mb-6 p-4 bg-brand-beige rounded-lg border border-brand-brown/20">
                  <h3 className="font-semibold text-brand-brown mb-2">Option de privatisation disponible</h3>
                  <p className="text-sm text-brand-brown/80 mb-2">{workshop.privatizationOption.description}</p>
                  <div className="text-sm text-brand-brown">
                    À partir de {formatCurrency(workshop.privatizationOption.basePrice, language)} + {formatCurrency(workshop.privatizationOption.pricePerParticipant, language)}/participant
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

          {}
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

          {}
          {showUnavailabilityCalendar && workshop.type === 'inscription' && (
            <div className="mb-6">
              <ArtisanUnavailabilityDisplay
                artisanName={workshop.instructor}
                unavailabilityPeriods={artisanUnavailability}
                onDateRequest={handleCustomDateRequest}
              />
            </div>
          )}

          {}
          {showBookingCalendar && (
            <div className="mb-6">
              <WorkshopBookingCalendar
                workshopId={workshop.id}
                workshopType={workshop.type}
                duration={workshop.duration}
                maxParticipants={workshop.maxParticipants}
                workshopPrice={workshop.base_price || workshop.price}
                artisanName={workshop.instructor}
                privatizationOption={workshop.privatizationOption}
                artisanUnavailability={artisanUnavailability}
                onBooking={handleBooking}
                onCustomRequest={handleCustomRequest}
              />
            </div>
          )}

          {}
          <div className="grid md:grid-cols-3 gap-6">
            {}
            <div className="md:col-span-2 space-y-6">
              {}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown text-xl">📋 Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-base">{workshop.description}</p>
                  
                  {workshop.type === 'reservation' && (
                    <div className="mt-4 p-4 bg-brand-beige rounded-lg border border-brand-brown/20">
                      <div className="flex items-start gap-3">
                        <CalendarIcon2 className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-brand-brown mb-1">Atelier sur réservation</h4>
                          <p className="text-sm text-brand-brown/80">
                            Cet atelier propose des créneaux flexibles. Choisissez la date et l'heure qui vous conviennent.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown text-xl">🎯 Ce que vous apprendrez</CardTitle>
                </CardHeader>
                <CardContent>
                  {(workshop.what_you_will_learn || workshop.whatYouWillLearn) && (workshop.what_you_will_learn?.length > 0 || workshop.whatYouWillLearn?.length > 0) ? (
                    <ul className="space-y-3">
                      {(workshop.what_you_will_learn || workshop.whatYouWillLearn).map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-start gap-3 text-gray-600">
                      <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                      <p>Informations détaillées disponibles lors de l'inscription.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Schedule - only for inscription type */}
              {workshop.type === 'inscription' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-brand-brown text-xl">🕐 Programme de l'atelier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workshop.schedule ? (
                      <div className="space-y-3">
                        {workshop.schedule.map((item, index) => (
                          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center w-16 h-10 bg-brand-terracotta/10 rounded flex-shrink-0">
                              <span className="font-semibold text-brand-terracotta text-sm">
                                {item.time}
                              </span>
                            </div>
                            <span className="text-gray-700 text-base pt-2">{item.activity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 text-gray-600">
                        <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                        <p>Programme détaillé communiqué lors de l'inscription.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown text-xl">🎒 Matériel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Materials Included */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <PackageCheck className="h-5 w-5 text-green-600" />
                      Inclus dans l'atelier
                    </h3>
                    {(workshop.materials_included || workshop.materials) && (workshop.materials_included?.length > 0 || workshop.materials?.length > 0) ? (
                      <ul className="space-y-2 ml-7">
                        {(workshop.materials_included || workshop.materials).map((material, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{material}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm ml-7">Tout le matériel nécessaire sera fourni.</p>
                    )}
                  </div>

                  {}
                  {workshop.materials_to_bring && workshop.materials_to_bring.length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        À apporter
                      </h3>
                      <ul className="space-y-2 ml-7">
                        {workshop.materials_to_bring.map((material, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{material}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {}
            <div className="space-y-6">
              {}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown text-lg">👨‍🎨 Votre instructeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-brand-orange/20 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={workshop.instructor_image || workshop.instructorImage}
                        alt={workshop.instructor_name || workshop.instructor}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workshop.instructor_name || workshop.instructor}</h3>
                      <p className="text-sm text-gray-600">Maître artisan</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {workshop.instructor_bio || "Artisan passionné avec plus de 15 ans d'expérience dans l'artisanat traditionnel malgache."}
                  </p>
                  {(apiWorkshop?.artisan_id || workshop.id) && (
                    <Link to={`/artisan/${apiWorkshop?.artisan_id || workshop.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white">
                        Voir le profil complet
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-brown text-lg">ℹ️ Informations pratiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <UsersIcon className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Âge minimum</p>
                      <p className="text-sm text-gray-600">12 ans</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Niveau requis</p>
                      <p className="text-sm text-gray-600">{workshop.skill_level || workshop.difficulty || 'Aucun prérequis'}</p>
                    </div>
                  </div>

                  {workshop.prerequisites && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Prérequis</p>
                        <p className="text-sm text-gray-600">{workshop.prerequisites}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Langues</p>
                      <p className="text-sm text-gray-600">Français, Malgache</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarIcon2 className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Type d'atelier</p>
                      <Badge className={`mt-1 ${
                        workshop.type === 'inscription' ? 'bg-brand-orange text-white' : 'bg-brand-brown text-white'
                      }`}>
                        {workshop.type === 'inscription' ? 'Inscription fixe' : 'Réservation flexible'}
                      </Badge>
                    </div>
                  </div>

                  {workshop.privatizationOption && (
                    <div className="flex items-start gap-3">
                      <UsersIcon className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Privatisation</p>
                        <Badge className="mt-1 bg-green-600 text-white">
                          Disponible pour groupes
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-brand-brown mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Politique d'annulation</p>
                        <p className="text-sm text-gray-600">
                          {workshop.cancellation_policy || "Annulation gratuite jusqu'à 24h avant l'atelier"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {}
              {apiWorkshop && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-brand-brown text-lg">📅 Indisponibilités</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingUnavailabilities ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-brown" />
                        <span className="ml-2 text-sm text-gray-600">Chargement...</span>
                      </div>
                    ) : unavailabilities.length > 0 ? (
                      <div className="space-y-3">
                        {unavailabilities.map((unavailability) => (
                          <div key={unavailability.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-medium text-red-800 text-sm">{unavailability.reason}</h4>
                                <p className="text-xs text-red-600 mt-1">
                                  {unavailability.type === 'single_day' ? (
                                    <>Le {new Date(unavailability.start_date).toLocaleDateString('fr-FR')}</>
                                  ) : (
                                    <>Du {new Date(unavailability.start_date).toLocaleDateString('fr-FR')} au {new Date(unavailability.end_date!).toLocaleDateString('fr-FR')}</>
                                  )}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                                {unavailability.status === 'approved' ? 'Confirmé' : 'En attente'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p>Aucune indisponibilité prévue</p>
                      </div>
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
