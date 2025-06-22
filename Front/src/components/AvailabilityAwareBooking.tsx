
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react';
import WorkshopBookingCalendar from './WorkshopBookingCalendar';
import CustomBookingRequest from './CustomBookingRequest';
import { CustomBookingRequest as CustomBookingRequestType, PrivatizationOption } from '@/types/booking';

interface UnavailabilityPeriod {
  id: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
}

interface AvailabilityAwareBookingProps {
  workshopId: number;
  duration: string;
  maxParticipants: number;
  privatizationOption?: PrivatizationOption;
  artisanUnavailability: UnavailabilityPeriod[];
  onBooking: (date: Date, time: string) => void;
  onCustomRequest: (request: CustomBookingRequestType) => void;
}

const AvailabilityAwareBooking: React.FC<AvailabilityAwareBookingProps> = ({
  workshopId,
  duration,
  maxParticipants,
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
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Indisponibilités de l'artisan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              L'artisan ne sera pas disponible aux dates suivantes :
            </p>
            <div className="space-y-2">
              {upcomingUnavailability.map((period) => (
                <div key={period.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {period.type === 'single' 
                        ? period.startDate.toLocaleDateString('fr-FR')
                        : `${period.startDate.toLocaleDateString('fr-FR')} - ${period.endDate?.toLocaleDateString('fr-FR')}`
                      }
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
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
        duration={duration}
        maxParticipants={maxParticipants}
        privatizationOption={privatizationOption}
        onBooking={onBooking}
        onCustomRequest={() => setShowCustomRequest(true)}
      />

      {/* Alternative Booking Option */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-medium text-blue-900">Besoin d'un autre créneau ?</h3>
            <p className="text-sm text-blue-700">
              Si aucun créneau disponible ne vous convient, vous pouvez faire une demande personnalisée.
            </p>
            <Button
              onClick={() => setShowCustomRequest(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
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
