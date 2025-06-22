
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, Users, Plus, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CustomBookingRequest from './CustomBookingRequest';
import { CustomBookingRequest as CustomBookingRequestType, PrivatizationOption } from '@/types/booking';

interface TimeSlot {
  time: string;
  available: boolean;
  maxParticipants: number;
  currentParticipants: number;
  minParticipants: number;
}

interface UnavailabilityPeriod {
  id: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
}

interface WorkshopBookingCalendarProps {
  workshopId: number;
  duration: string;
  maxParticipants: number;
  privatizationOption?: PrivatizationOption;
  artisanUnavailability?: UnavailabilityPeriod[];
  onBooking: (date: Date, time: string) => void;
  onCustomRequest?: (request: CustomBookingRequestType) => void;
}

const WorkshopBookingCalendar: React.FC<WorkshopBookingCalendarProps> = ({
  workshopId,
  duration,
  maxParticipants,
  privatizationOption,
  artisanUnavailability = [],
  onBooking,
  onCustomRequest
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showCustomRequest, setShowCustomRequest] = useState(false);

  // Check if a date is unavailable due to artisan's schedule
  const isDateUnavailable = (date: Date) => {
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

  // Get unavailability reason for a specific date
  const getUnavailabilityReason = (date: Date) => {
    const period = artisanUnavailability.find(period => {
      if (period.type === 'single') {
        return date.toDateString() === period.startDate.toDateString();
      } else {
        const start = period.startDate;
        const end = period.endDate || period.startDate;
        return date >= start && date <= end;
      }
    });
    return period?.reason;
  };

  // Mock time slots - in real app, this would come from backend
  const getAvailableTimeSlots = (date: Date): TimeSlot[] => {
    // If artisan is unavailable, return empty array
    if (isDateUnavailable(date)) {
      return [];
    }

    return [
      { time: '09:00', available: true, maxParticipants, currentParticipants: 2, minParticipants: 4 },
      { time: '11:00', available: true, maxParticipants, currentParticipants: 6, minParticipants: 4 },
      { time: '14:00', available: true, maxParticipants, currentParticipants: 3, minParticipants: 4 },
      { time: '16:00', available: false, maxParticipants, currentParticipants: maxParticipants, minParticipants: 4 }
    ];
  };

  // Get slot status and styling
  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.available) {
      return {
        status: 'full',
        message: 'Complet',
        description: `${slot.currentParticipants}/${slot.maxParticipants} participants`,
        colorClass: 'text-gray-600 bg-gray-100',
        borderClass: 'border-gray-200',
        disabled: true
      };
    }

    if (slot.currentParticipants < slot.minParticipants) {
      const needed = slot.minParticipants - slot.currentParticipants;
      return {
        status: 'needs-participants',
        message: `${needed} participant${needed > 1 ? 's' : ''} manquant${needed > 1 ? 's' : ''}`,
        description: `${slot.currentParticipants}/${slot.minParticipants} min. requis`,
        colorClass: 'text-red-700 bg-red-50',
        borderClass: 'border-red-200 hover:border-red-300',
        disabled: false
      };
    }

    if (slot.currentParticipants >= slot.minParticipants && slot.currentParticipants < slot.maxParticipants - 2) {
      return {
        status: 'available',
        message: 'Disponible',
        description: `${slot.currentParticipants}/${slot.maxParticipants} participants`,
        colorClass: 'text-green-700 bg-green-50',
        borderClass: 'border-green-200 hover:border-green-300',
        disabled: false
      };
    }

    // Almost full (within 2 spots of max)
    const remaining = slot.maxParticipants - slot.currentParticipants;
    return {
      status: 'almost-full',
      message: `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`,
      description: `${slot.currentParticipants}/${slot.maxParticipants} participants`,
      colorClass: 'text-orange-700 bg-orange-50',
      borderClass: 'border-orange-200 hover:border-orange-300',
      disabled: false
    };
  };

  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      onBooking(selectedDate, selectedTime);
    }
  };

  const handleCustomRequest = (request: CustomBookingRequestType) => {
    if (onCustomRequest) {
      onCustomRequest(request);
    }
    setShowCustomRequest(false);
  };

  const isDateAvailable = (date: Date) => {
    // Disable past dates and check artisan availability
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const isPastDate = date < today;
    const isWeekend = day === 0 || day === 6;
    const isArtisanUnavailable = isDateUnavailable(date);
    
    return !isPastDate && !isWeekend && !isArtisanUnavailable;
  };

  if (showCustomRequest) {
    return (
      <CustomBookingRequest
        workshopId={workshopId}
        maxParticipants={maxParticipants}
        privatizationOption={privatizationOption}
        onSubmit={handleCustomRequest}
        onCancel={() => setShowCustomRequest(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Choisir une date
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomRequest(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Autre date
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => !isDateAvailable(date)}
            modifiers={{
              unavailable: isDateUnavailable
            }}
            modifiersStyles={{
              unavailable: { 
                backgroundColor: '#fee2e2', 
                color: '#dc2626',
                textDecoration: 'line-through'
              }
            }}
            className="rounded-md border"
            locale={fr}
          />
          
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
              <span>Artisan indisponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
              <span>Week-end (fermé)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && isDateUnavailable(selectedDate) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Artisan indisponible</h3>
                <p className="text-sm text-red-700">
                  L'artisan ne sera pas disponible le {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                {getUnavailabilityReason(selectedDate) && (
                  <p className="text-sm text-red-600 mt-1">
                    Raison: {getUnavailabilityReason(selectedDate)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && !isDateUnavailable(selectedDate) && (
        <>
          {/* Contextual Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">À propos des créneaux :</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Un minimum de 4 participants est requis pour maintenir l'atelier</li>
                    <li>• Vous pouvez réserver même si le minimum n'est pas atteint</li>
                    <li>• Nous vous contacterons 48h avant si l'atelier ne peut pas avoir lieu</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Créneaux disponibles - {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">Légende des statuts :</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                    <span className="text-gray-600">Participants manquants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div>
                    <span className="text-gray-600">Presque complet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                    <span className="text-gray-600">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                    <span className="text-gray-600">Complet</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {timeSlots.map((slot) => {
                  const slotInfo = getSlotStatus(slot);
                  return (
                    <button
                      key={slot.time}
                      onClick={() => !slotInfo.disabled && setSelectedTime(slot.time)}
                      disabled={slotInfo.disabled}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTime === slot.time
                          ? 'border-green-600 bg-green-50'
                          : slotInfo.disabled
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          : `${slotInfo.borderClass} ${slotInfo.colorClass}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="font-semibold text-lg">{slot.time}</div>
                          <div className="text-sm text-gray-600">
                            Durée: {duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">
                            {slotInfo.message}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>{slotInfo.description}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {timeSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">Aucun créneau disponible pour cette date</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomRequest(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Demander un autre créneau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedDate && selectedTime && !isDateUnavailable(selectedDate) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Réservation sélectionnée</h3>
                <p className="text-gray-600">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à {selectedTime}
                </p>
                <p className="text-sm text-gray-500">Durée: {duration}</p>
              </div>
              <Button onClick={handleBooking} className="w-full bg-green-600 hover:bg-green-700">
                Confirmer la réservation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkshopBookingCalendar;
