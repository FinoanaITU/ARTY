
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react';
import WorkshopBookingCalendar from './WorkshopBookingCalendar';
import CustomBookingRequest from './CustomBookingRequest';
import { CustomBookingRequest as CustomBookingRequestType, PrivatizationOption } from '@/types/booking';
import { UnavailabilityPeriod } from '@/types/artisan';

interface AvailabilityAwareBookingProps {
  workshopId: number;
  workshopType: 'inscription' | 'reservation';
  duration: string;
  maxParticipants: number;
  artisanName: string;
  privatizationOption?: PrivatizationOption;
  artisanUnavailability: UnavailabilityPeriod[];
  onBooking: (date: Date, time: string) => void;
  onCustomRequest: (request: CustomBookingRequestType) => void;
}

const AvailabilityAwareBooking: React.FC<AvailabilityAwareBookingProps> = ({
  workshopId,
  workshopType,
  duration,
  maxParticipants,
  artisanName,
  privatizationOption,
  artisanUnavailability,
  onBooking,
  onCustomRequest
}) => {
  const [showCustomRequest, setShowCustomRequest] = useState(false);

  const isDateInUnavailablePeriod = (date: Date) => {
    return artisanUnavailability.some(period => {
      if (period.type === 'single') {
        return date.toDateString() === period.startDate.toDateString();
      } else {
        const start = period.startDate;
        const end = period.endDate || period.startDate;
        return date >= start && date <= end;
      }
    });
  };

  const getUpcomingUnavailability = () => {
    const today = new Date();
    return artisanUnavailability
      .filter(period => period.startDate >= today)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 3);
  };

  const handleCustomRequestSubmit = (request: CustomBookingRequestType) => {
    // Check if the requested dates conflict with unavailability
    const hasConflict = isDateInUnavailablePeriod(request.preferredDate) ||
      (request.alternativeDate && isDateInUnavailablePeriod(request.alternativeDate));

    if (hasConflict) {
      // In a real app, you'd show a warning to the user
      console.log('Requested dates conflict with artisan unavailability');
    }

    onCustomRequest(request);
    setShowCustomRequest(false);
  };

  const upcomingUnavailability = getUpcomingUnavailability();

  if (showCustomRequest) {
    return (
      <CustomBookingRequest
        workshopId={workshopId}
        maxParticipants={maxParticipants}
        artisanName={artisanName}
        unavailabilityPeriods={artisanUnavailability}
        privatizationOption={privatizationOption}
        onSubmit={handleCustomRequestSubmit}
        onCancel={() => setShowCustomRequest(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Artisan Availability Notice */}
      {upcomingUnavailability.length > 0 && (
        <Card className="border-brand-orange/30 bg-brand-beige">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-brown">
              <AlertCircle className="h-5 w-5" />
              Indisponibilités de l'artisan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brand-brown/80 mb-3">
              L'artisan ne sera pas disponible aux dates suivantes :
            </p>
            <div className="space-y-2">
              {upcomingUnavailability.map((period) => (
                <div key={period.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-terracotta" />
                    <span className="text-sm font-medium text-brand-brown">
                      {period.type === 'single' 
                        ? period.startDate.toLocaleDateString('fr-FR')
                        : `${period.startDate.toLocaleDateString('fr-FR')} - ${period.endDate?.toLocaleDateString('fr-FR')}`
                      }
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs text-brand-brown border-brand-orange/30">
                    {period.reason}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standard Booking Calendar */}
      <WorkshopBookingCalendar
        workshopId={workshopId}
        workshopType={workshopType}
        duration={duration}
        maxParticipants={maxParticipants}
        privatizationOption={privatizationOption}
        artisanUnavailability={artisanUnavailability}
        onBooking={onBooking}
        onCustomRequest={() => setShowCustomRequest(true)}
      />

      {/* Alternative Booking Option */}
      <Card className="border-brand-terracotta/30 bg-brand-beige">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-medium text-brand-brown">Besoin d'un autre créneau ?</h3>
            <p className="text-sm text-brand-brown/80">
              Si aucun créneau disponible ne vous convient, vous pouvez faire une demande personnalisée.
            </p>
            <Button
              onClick={() => setShowCustomRequest(true)}
              variant="outline"
              className="border-brand-terracotta text-brand-terracotta hover:bg-brand-terracotta hover:text-white"
            >
              Faire une demande personnalisée
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityAwareBooking;
