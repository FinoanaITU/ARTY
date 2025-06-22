import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Users, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CustomBookingRequest as CustomBookingRequestType } from '@/types/booking';

const customBookingSchema = z.object({
  preferredDate: z.date({
    required_error: "Une date préférée est requise.",
  }),
  alternativeDate: z.date().optional(),
  participants: z.number().min(1, "Au moins 1 participant est requis").max(50, "Maximum 50 participants"),
  isPrivate: z.boolean(),
  specialRequirements: z.string().optional(),
  contactEmail: z.string().email("Email invalide"),
  contactPhone: z.string().optional(),
  message: z.string().optional(),
});

type CustomBookingFormData = z.infer<typeof customBookingSchema>;

interface CustomBookingRequestProps {
  workshopId: number;
  maxParticipants: number;
  privatizationOption?: {
    minParticipants: number;
    maxParticipants: number;
    basePrice: number;
    pricePerParticipant: number;
  };
  onSubmit: (request: CustomBookingRequestType) => void;
  onCancel: () => void;
}

const CustomBookingRequest: React.FC<CustomBookingRequestProps> = ({
  workshopId,
  maxParticipants,
  privatizationOption,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CustomBookingFormData>({
    resolver: zodResolver(customBookingSchema),
    defaultValues: {
      participants: 1,
      isPrivate: false,
    }
  });

  const watchedValues = watch();
  const isPrivate = watch('isPrivate');
  const participants = watch('participants');

  const calculatePrivatePrice = () => {
    if (!privatizationOption || !isPrivate) return 0;
    return privatizationOption.basePrice + (participants * privatizationOption.pricePerParticipant);
  };

  const onFormSubmit = (data: CustomBookingFormData) => {
    // Since the schema validates that preferredDate is required, we can safely assert it exists
    const request: CustomBookingRequestType = {
      workshopId,
      preferredDate: data.preferredDate,
      alternativeDate: data.alternativeDate,
      participants: data.participants,
      isPrivate: data.isPrivate,
      specialRequirements: data.specialRequirements,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      message: data.message,
    };
    onSubmit(request);
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CalendarIcon className="h-5 w-5" />
          Demande de réservation personnalisée
        </CardTitle>
        <p className="text-sm text-blue-700">
          Vous ne trouvez pas de créneau qui vous convient ? Faites-nous une demande personnalisée !
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date préférée *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValues.preferredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.preferredDate 
                      ? format(watchedValues.preferredDate, 'EEEE d MMMM yyyy', { locale: fr })
                      : "Sélectionner une date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedValues.preferredDate}
                    onSelect={(date) => setValue('preferredDate', date!)}
                    disabled={(date) => !isDateAvailable(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              {errors.preferredDate && (
                <p className="text-sm text-red-600">{errors.preferredDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date alternative (optionnelle)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValues.alternativeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.alternativeDate 
                      ? format(watchedValues.alternativeDate, 'EEEE d MMMM yyyy', { locale: fr })
                      : "Sélectionner une date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedValues.alternativeDate}
                    onSelect={(date) => setValue('alternativeDate', date)}
                    disabled={(date) => !isDateAvailable(date)}
                    initialFocus
                    className="pointer-events-auto"
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre de participants *
            </label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Input
                type="number"
                min="1"
                max={isPrivate ? (privatizationOption?.maxParticipants || 50) : maxParticipants}
                {...register('participants', { valueAsNumber: true })}
                className="w-24"
              />
              <span className="text-sm text-gray-500">
                (max: {isPrivate ? (privatizationOption?.maxParticipants || maxParticipants) : maxParticipants})
              </span>
            </div>
            {errors.participants && (
              <p className="text-sm text-red-600">{errors.participants.message}</p>
            )}
          </div>

          {/* Privatization Option */}
          {privatizationOption && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrivate"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setValue('isPrivate', checked as boolean)}
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-purple-900">
                  Privatiser cet atelier
                </label>
              </div>
              {isPrivate && (
                <div className="space-y-2">
                  <p className="text-sm text-purple-700">
                    Atelier privé pour votre groupe ({privatizationOption.minParticipants}-{privatizationOption.maxParticipants} participants)
                  </p>
                  <div className="text-lg font-semibold text-purple-900">
                    Prix total: {calculatePrivatePrice().toLocaleString()} Ar
                  </div>
                  <p className="text-xs text-purple-600">
                    Prix de base: {privatizationOption.basePrice.toLocaleString()} Ar + {privatizationOption.pricePerParticipant.toLocaleString()} Ar/participant
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email de contact *
              </label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  {...register('contactEmail')}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.contactEmail && (
                <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Téléphone (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <Input
                  type="tel"
                  {...register('contactPhone')}
                  placeholder="+261 XX XXX XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Exigences particulières (optionnel)
            </label>
            <Textarea
              {...register('specialRequirements')}
              placeholder="Allergies, besoins d'accessibilité, etc."
              rows={2}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Message (optionnel)
            </label>
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-2" />
              <Textarea
                {...register('message')}
                placeholder="Toute information supplémentaire que vous souhaitez partager..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Envoyer la demande
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomBookingRequest;
