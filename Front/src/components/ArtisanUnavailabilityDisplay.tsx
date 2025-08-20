import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarX, Clock, AlertTriangle } from 'lucide-react';
import { format, isAfter, isBefore, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UnavailabilityPeriod {
  id: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
}

interface ArtisanUnavailabilityDisplayProps {
  artisanName: string;
  unavailabilityPeriods: UnavailabilityPeriod[];
  onDateRequest?: (requestedDate: Date) => void;
}

const ArtisanUnavailabilityDisplay: React.FC<ArtisanUnavailabilityDisplayProps> = ({
  artisanName,
  unavailabilityPeriods,
  onDateRequest
}) => {
  const isDateUnavailable = (date: Date): boolean => {
    return unavailabilityPeriods.some(period => {
      if (period.type === 'single') {
        return isEqual(date, period.startDate);
      } else {
        const endDate = period.endDate || period.startDate;
        return (isEqual(date, period.startDate) || isAfter(date, period.startDate)) &&
               (isEqual(date, endDate) || isBefore(date, endDate));
      }
    });
  };

  const getUpcomingUnavailability = () => {
    const today = new Date();
    return unavailabilityPeriods
      .filter(period => isAfter(period.startDate, today) || isEqual(period.startDate, today))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5); // Afficher les 5 prochaines périodes
  };

  const upcomingPeriods = getUpcomingUnavailability();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-brown">
            <CalendarX className="h-5 w-5" />
            Disponibilités de {artisanName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Consultez les périodes d'indisponibilité pour planifier votre demande
          </p>
        </CardHeader>
      </Card>

      {/* Calendrier des indisponibilités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendrier des indisponibilités</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            className="rounded-md border pointer-events-auto"
            modifiers={{
              unavailable: (date) => isDateUnavailable(date)
            }}
            modifiersStyles={{
              unavailable: {
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                textDecoration: 'line-through'
              }
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return isBefore(date, today);
            }}
            onSelect={(date) => {
              if (date && onDateRequest && !isDateUnavailable(date)) {
                onDateRequest(date);
              }
            }}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Dates indisponibles</span>
            </div>
            <p>Cliquez sur une date disponible pour faire une demande personnalisée</p>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prochaines indisponibilités */}
      {upcomingPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Prochaines indisponibilités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-start justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">
                        {period.type === 'single' 
                          ? format(period.startDate, 'EEEE d MMMM yyyy', { locale: fr })
                          : `${format(period.startDate, 'd MMM', { locale: fr })} - ${
                              period.endDate 
                                ? format(period.endDate, 'd MMM yyyy', { locale: fr })
                                : format(period.startDate, 'd MMM yyyy', { locale: fr })
                            }`
                        }
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">{period.reason}</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {period.type === 'single' ? 'Jour' : 'Période'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message si pas d'indisponibilités */}
      {upcomingPeriods.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <CalendarX className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Aucune indisponibilité prévue
            </h3>
            <p className="text-muted-foreground">
              {artisanName} est disponible pour les prochaines semaines
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArtisanUnavailabilityDisplay;