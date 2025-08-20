import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Users, Mail, Phone, MessageSquare, Building, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Schema pour particuliers
const individualQuoteSchema = z.object({
  denomination: z.string().min(2, "La dénomination est requise"),
  email: z.string().email("Email invalide"),
  whatsapp: z.string().min(8, "Numéro WhatsApp requis"),
  nbPersonnes: z.number().min(1, "Au moins 1 personne").max(50, "Maximum 50 personnes"),
  lieu: z.string().min(1, "Veuillez sélectionner un lieu"),
  lieuAutres: z.string().optional(),
  dateHeure: z.date({
    required_error: "Date et heure requises",
  }),
  heurePreferee: z.string().optional(),
  contraintes: z.string().optional(),
});

// Schema pour entreprises
const businessQuoteSchema = z.object({
  denomination: z.string().min(2, "La dénomination est requise"),
  secteurActivite: z.string().min(1, "Veuillez sélectionner un secteur"),
  secteurAutres: z.string().optional(),
  nomContact: z.string().min(2, "Nom et prénom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro de téléphone requis"),
  typeEvenement: z.string().min(1, "Veuillez sélectionner un type d'événement"),
  nbPersonnes: z.number().min(1, "Au moins 1 personne").max(100, "Maximum 100 personnes"),
  lieu: z.string().min(1, "Veuillez sélectionner un lieu"),
  lieuAutres: z.string().optional(),
  dateHeure: z.date({
    required_error: "Date et heure requises",
  }),
  heurePreferee: z.string().optional(),
  besoinsLogistiques: z.array(z.string()).optional(),
  besoinsAutres: z.string().optional(),
  contraintes: z.string().optional(),
});

type IndividualQuoteFormData = z.infer<typeof individualQuoteSchema>;
type BusinessQuoteFormData = z.infer<typeof businessQuoteSchema>;

interface QuoteRequestFormProps {
  workshopTitle: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const lieuOptions = [
  'Chez vous',
  'Dans nos locaux',
  'Chez l\'artisan',
  'Autres (à préciser)'
];

const secteurActiviteOptions = [
  'Tour opérateur',
  'Agence de voyages',
  'Entreprises',
  'Autres (à préciser)'
];

const typeEvenementOptions = [
  'Expérience pour des voyageurs/touristes',
  'Teambuilding'
];

const besoinsLogistiquesOptions = [
  'Pause café/rafraîchissements',
  'Déjeuner',
  'Jeux (en partenariat avec Pilalao)',
  'Autres'
];

// Mock simulation des créneaux d'indisponibilité de l'artisan avec horaires
const mockArtisanSchedule = {
  '2024-08-15': {
    reason: 'Congés d\'été',
    unavailableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']
  },
  '2024-08-25': {
    reason: 'Salon d\'artisanat',
    unavailableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30']
  },
  '2024-09-01': {
    reason: 'Formation',
    unavailableSlots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']
  },
  '2024-08-20': {
    reason: 'Atelier privé en cours',
    unavailableSlots: ['09:00', '09:30', '10:00', '10:30']
  },
  '2024-08-22': {
    reason: 'Rendez-vous client',
    unavailableSlots: ['15:00', '15:30', '16:00']
  }
};

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  workshopTitle,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('individual');
  const [simulatedTime, setSimulatedTime] = useState<string>('');
  const { toast } = useToast();

  const individualForm = useForm<IndividualQuoteFormData>({
    resolver: zodResolver(individualQuoteSchema),
    defaultValues: {
      nbPersonnes: 1,
      heurePreferee: '09:00',
    }
  });

  const businessForm = useForm<BusinessQuoteFormData>({
    resolver: zodResolver(businessQuoteSchema),
    defaultValues: {
      nbPersonnes: 1,
      besoinsLogistiques: [],
      heurePreferee: '09:00',
    }
  });

  const isDateUnavailable = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return !!mockArtisanSchedule[dateKey as keyof typeof mockArtisanSchedule];
  };

  const getUnavailabilityInfo = (date: Date, time?: string) => {
    const dateKey = date.toISOString().split('T')[0];
    const scheduleInfo = mockArtisanSchedule[dateKey as keyof typeof mockArtisanSchedule];
    
    if (!scheduleInfo) return null;
    
    return {
      reason: scheduleInfo.reason,
      isTimeUnavailable: time ? scheduleInfo.unavailableSlots.includes(time) : false,
      unavailableSlots: scheduleInfo.unavailableSlots
    };
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 5); // Minimum 5 jours
    return date >= minDate;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const renderTimeSlotSimulation = (selectedDate: Date, selectedTime: string) => {
    if (!selectedDate || !selectedTime) return null;

    const unavailabilityInfo = getUnavailabilityInfo(selectedDate, selectedTime);
    
    return (
      <Card className={`mt-4 border-2 ${unavailabilityInfo?.isTimeUnavailable ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-sm ${unavailabilityInfo?.isTimeUnavailable ? 'text-red-800' : 'text-green-800'}`}>
            {unavailabilityInfo?.isTimeUnavailable ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Simulation : Artisan non disponible
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Simulation : Artisan disponible
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Date demandée :</span>
              <span className="text-sm">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Heure demandée :</span>
              <span className="text-sm">{selectedTime}</span>
            </div>
            
            {unavailabilityInfo?.isTimeUnavailable ? (
              <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Conflit détecté</span>
                </div>
                <p className="text-red-700 text-sm mb-2">
                  L'artisan ne sera pas disponible à cette heure : <strong>{unavailabilityInfo.reason}</strong>
                </p>
                <p className="text-red-600 text-xs">
                  Votre demande sera transmise mais l'artisan proposera un autre créneau.
                </p>
              </div>
            ) : unavailabilityInfo ? (
              <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Disponibilité partielle</span>
                </div>
                <p className="text-orange-700 text-sm mb-2">
                  L'artisan a d'autres engagements ce jour ({unavailabilityInfo.reason}) mais est libre à cette heure.
                </p>
                <div className="text-xs text-orange-600">
                  <p>Créneaux non disponibles : {unavailabilityInfo.unavailableSlots.join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Excellente disponibilité</span>
                </div>
                <p className="text-green-700 text-sm">
                  L'artisan devrait être entièrement disponible à cette date et heure.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const onIndividualSubmit = (data: IndividualQuoteFormData) => {
    toast({
      title: "Demande de devis envoyée",
      description: "Nous vous recontacterons dans les plus brefs délais.",
    });
    onSubmit({ type: 'individual', ...data });
  };

  const onBusinessSubmit = (data: BusinessQuoteFormData) => {
    toast({
      title: "Demande de devis envoyée", 
      description: "Nous vous recontacterons dans les plus brefs délais.",
    });
    onSubmit({ type: 'business', ...data });
  };

  const IndividualForm = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = individualForm;
    const watchedValues = watch();

    return (
      <form onSubmit={handleSubmit(onIndividualSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dénomination à mettre sur le devis *
            </label>
            <Input
              {...register('denomination')}
              placeholder="Nom/Prénom ou raison sociale"
            />
            {errors.denomination && (
              <p className="text-sm text-red-600">{errors.denomination.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Adresse email *
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <Input
                type="email"
                {...register('email')}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Numéro WhatsApp *
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <Input
                {...register('whatsapp')}
                placeholder="+261 XX XXX XXXXX"
              />
            </div>
            {errors.whatsapp && (
              <p className="text-sm text-red-600">{errors.whatsapp.message}</p>
            )}
          </div>

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nombre de personnes qui voudrait participer à l'atelier *
          </label>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <Input
              type="number"
              min="1"
              max="50"
              {...register('nbPersonnes', { valueAsNumber: true })}
              className="w-24"
            />
            <span className="text-sm text-gray-500">personnes</span>
          </div>
          {errors.nbPersonnes && (
            <p className="text-sm text-red-600">{errors.nbPersonnes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Lieu de l'atelier *
          </label>
          <Select onValueChange={(value) => setValue('lieu', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un lieu" />
            </SelectTrigger>
            <SelectContent>
              {lieuOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.lieu && (
            <p className="text-sm text-red-600">{errors.lieu.message}</p>
          )}
        </div>

        {watchedValues.lieu === 'Autres (à préciser)' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Veuillez préciser ici la demande autres
            </label>
            <Textarea
              {...register('lieuAutres')}
              placeholder="Précisez le lieu souhaité..."
              rows={2}
            />
          </div>
        )}

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">
            Date et heure souhaitées *
          </label>
          <p className="text-xs text-muted-foreground">
            L'artisan a besoin d'un minimum de 5 jours pour préparer votre atelier personnalisé.
          </p>
          
          {/* Calendrier interactif */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-3">Sélectionnez une date disponible</h4>
            <Calendar
              mode="single"
              selected={watchedValues.dateHeure}
              onSelect={(date) => setValue('dateHeure', date!)}
              disabled={(date) => !isDateAvailable(date)}
              modifiers={{
                unavailable: isDateUnavailable,
                partiallyUnavailable: (date) => {
                  const info = getUnavailabilityInfo(date);
                  return info && info.unavailableSlots.length > 0 && info.unavailableSlots.length < timeOptions.length;
                }
              }}
              modifiersStyles={{
                unavailable: {
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  textDecoration: 'line-through'
                },
                partiallyUnavailable: {
                  backgroundColor: '#fed7aa',
                  color: '#ea580c',
                  fontWeight: 'bold'
                }
              }}
              className="pointer-events-auto mx-auto"
              locale={fr}
            />
            
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span>Artisan complètement indisponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                <span>Artisan partiellement disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Date trop proche (min. 5 jours)</span>
              </div>
            </div>
          </div>

          {/* Sélection d'heure avec simulation en temps réel */}
          {watchedValues.dateHeure && isDateAvailable(watchedValues.dateHeure) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Heure préférée
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <select
                    {...register('heurePreferee')}
                    onChange={(e) => {
                      setValue('heurePreferee', e.target.value);
                      setSimulatedTime(e.target.value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {timeOptions.map(time => {
                      const unavailabilityInfo = getUnavailabilityInfo(watchedValues.dateHeure, time);
                      const isUnavailable = unavailabilityInfo?.isTimeUnavailable;
                      
                      return (
                        <option key={time} value={time} style={isUnavailable ? { color: '#dc2626', fontWeight: 'bold' } : {}}>
                          {time} {isUnavailable ? '(Non disponible)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                {/* Grille des créneaux horaires avec statuts visuels */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Aperçu des créneaux du jour :</h5>
                  <div className="grid grid-cols-6 gap-1">
                    {timeOptions.map(time => {
                      const unavailabilityInfo = getUnavailabilityInfo(watchedValues.dateHeure, time);
                      const isUnavailable = unavailabilityInfo?.isTimeUnavailable;
                      const isSelected = time === watchedValues.heurePreferee;
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setValue('heurePreferee', time);
                            setSimulatedTime(time);
                          }}
                          className={cn(
                            "text-xs p-1 rounded border text-center transition-all",
                            isSelected && "ring-2 ring-blue-500 ring-offset-1",
                            isUnavailable 
                              ? "bg-red-100 text-red-700 border-red-300" 
                              : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                          )}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Simulation de disponibilité en temps réel */}
              {watchedValues.heurePreferee && renderTimeSlotSimulation(watchedValues.dateHeure, watchedValues.heurePreferee)}
            </div>
          )}

          {errors.dateHeure && (
            <p className="text-sm text-red-600">{errors.dateHeure.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Avez-vous des contraintes particulières ? (exigences alimentaires, accessibilité)
          </label>
          <Textarea
            {...register('contraintes')}
            placeholder="Décrivez vos contraintes particulières..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Envoyer la demande de devis
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </form>
    );
  };

  const BusinessForm = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = businessForm;
    const watchedValues = watch();

    return (
      <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dénomination à mettre sur le devis *
            </label>
            <Input
              {...register('denomination')}
              placeholder="Raison sociale de l'entreprise"
            />
            {errors.denomination && (
              <p className="text-sm text-red-600">{errors.denomination.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Secteur d'activité *
            </label>
            <Select onValueChange={(value) => setValue('secteurActivite', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un secteur" />
              </SelectTrigger>
              <SelectContent>
                {secteurActiviteOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.secteurActivite && (
              <p className="text-sm text-red-600">{errors.secteurActivite.message}</p>
            )}
          </div>
        </div>

        {watchedValues.secteurActivite === 'Autres (à préciser)' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Préciser ici autres
            </label>
            <Input
              {...register('secteurAutres')}
              placeholder="Précisez votre secteur d'activité..."
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nom et prénom du contact *
            </label>
            <Input
              {...register('nomContact')}
              placeholder="Nom Prénom"
            />
            {errors.nomContact && (
              <p className="text-sm text-red-600">{errors.nomContact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Adresse email *
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <Input
                type="email"
                {...register('email')}
                placeholder="contact@entreprise.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Numéro de téléphone *
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <Input
                {...register('telephone')}
                placeholder="+261 XX XXX XXXXX"
              />
            </div>
            {errors.telephone && (
              <p className="text-sm text-red-600">{errors.telephone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quel type d'événement souhaitez-vous organiser ? *
            </label>
            <Select onValueChange={(value) => setValue('typeEvenement', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {typeEvenementOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeEvenement && (
              <p className="text-sm text-red-600">{errors.typeEvenement.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre de personnes qui participent à l'atelier *
            </label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Input
                type="number"
                min="1"
                max="100"
                {...register('nbPersonnes', { valueAsNumber: true })}
                className="w-24"
              />
              <span className="text-sm text-gray-500">personnes</span>
            </div>
            {errors.nbPersonnes && (
              <p className="text-sm text-red-600">{errors.nbPersonnes.message}</p>
            )}
          </div>

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Lieu de l'atelier *
          </label>
          <Select onValueChange={(value) => setValue('lieu', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un lieu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dans vos locaux">Dans vos locaux</SelectItem>
              <SelectItem value="Dans nos locaux (<6 personnes)">Dans nos locaux (&lt;6 personnes)</SelectItem>
              <SelectItem value="Autres (à préciser)">Autres (à préciser)</SelectItem>
            </SelectContent>
          </Select>
          {errors.lieu && (
            <p className="text-sm text-red-600">{errors.lieu.message}</p>
          )}
        </div>

        {watchedValues.lieu === 'Autres (à préciser)' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Veuillez préciser ici autres
            </label>
            <Textarea
              {...register('lieuAutres')}
              placeholder="Précisez le lieu souhaité..."
              rows={2}
            />
          </div>
        )}

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">
            Date et heure souhaitées *
          </label>
          <p className="text-xs text-muted-foreground">
            L'artisan a besoin d'un minimum de 5 jours pour préparer votre atelier personnalisé.
          </p>
          
          {/* Calendrier interactif */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-3">Sélectionnez une date disponible</h4>
            <Calendar
              mode="single"
              selected={watchedValues.dateHeure}
              onSelect={(date) => setValue('dateHeure', date!)}
              disabled={(date) => !isDateAvailable(date)}
              modifiers={{
                unavailable: isDateUnavailable,
                partiallyUnavailable: (date) => {
                  const info = getUnavailabilityInfo(date);
                  return info && info.unavailableSlots.length > 0 && info.unavailableSlots.length < timeOptions.length;
                }
              }}
              modifiersStyles={{
                unavailable: {
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  textDecoration: 'line-through'
                },
                partiallyUnavailable: {
                  backgroundColor: '#fed7aa',
                  color: '#ea580c',
                  fontWeight: 'bold'
                }
              }}
              className="pointer-events-auto mx-auto"
              locale={fr}
            />
            
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span>Artisan complètement indisponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                <span>Artisan partiellement disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Date trop proche (min. 5 jours)</span>
              </div>
            </div>
          </div>

          {/* Sélection d'heure avec simulation en temps réel */}
          {watchedValues.dateHeure && isDateAvailable(watchedValues.dateHeure) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Heure préférée
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <select
                    {...register('heurePreferee')}
                    onChange={(e) => {
                      setValue('heurePreferee', e.target.value);
                      setSimulatedTime(e.target.value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {timeOptions.map(time => {
                      const unavailabilityInfo = getUnavailabilityInfo(watchedValues.dateHeure, time);
                      const isUnavailable = unavailabilityInfo?.isTimeUnavailable;
                      
                      return (
                        <option key={time} value={time} style={isUnavailable ? { color: '#dc2626', fontWeight: 'bold' } : {}}>
                          {time} {isUnavailable ? '(Non disponible)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                {/* Grille des créneaux horaires avec statuts visuels */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Aperçu des créneaux du jour :</h5>
                  <div className="grid grid-cols-6 gap-1">
                    {timeOptions.map(time => {
                      const unavailabilityInfo = getUnavailabilityInfo(watchedValues.dateHeure, time);
                      const isUnavailable = unavailabilityInfo?.isTimeUnavailable;
                      const isSelected = time === watchedValues.heurePreferee;
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setValue('heurePreferee', time);
                            setSimulatedTime(time);
                          }}
                          className={cn(
                            "text-xs p-1 rounded border text-center transition-all",
                            isSelected && "ring-2 ring-blue-500 ring-offset-1",
                            isUnavailable 
                              ? "bg-red-100 text-red-700 border-red-300" 
                              : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                          )}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Simulation de disponibilité en temps réel */}
              {watchedValues.heurePreferee && renderTimeSlotSimulation(watchedValues.dateHeure, watchedValues.heurePreferee)}
            </div>
          )}

          {errors.dateHeure && (
            <p className="text-sm text-red-600">{errors.dateHeure.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Besoins spécifiques et logistiques
          </label>
          <div className="space-y-2">
            {besoinsLogistiquesOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const current = watchedValues.besoinsLogistiques || [];
                    if (e.target.checked) {
                      setValue('besoinsLogistiques', [...current, option]);
                    } else {
                      setValue('besoinsLogistiques', current.filter(item => item !== option));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {watchedValues.besoinsLogistiques?.includes('Autres') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Précisez ici autres
            </label>
            <Textarea
              {...register('besoinsAutres')}
              placeholder="Précisez vos autres besoins..."
              rows={2}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Avez-vous des contraintes particulières ? (exigences alimentaires, accessibilité)
          </label>
          <Textarea
            {...register('contraintes')}
            placeholder="Décrivez vos contraintes particulières..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Envoyer la demande de devis
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <MessageSquare className="h-5 w-5" />
          Demande de devis - {workshopTitle}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choisissez le type de demande qui correspond à votre profil
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Particulier
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Entreprise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <IndividualForm />
          </TabsContent>

          <TabsContent value="business">
            <BusinessForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuoteRequestForm;
