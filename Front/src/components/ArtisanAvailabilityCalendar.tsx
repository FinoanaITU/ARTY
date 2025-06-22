
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarX, Save, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UnavailabilityPeriod {
  id: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
}

interface ArtisanAvailabilityCalendarProps {
  onSave: (periods: UnavailabilityPeriod[]) => void;
  initialUnavailablePeriods?: UnavailabilityPeriod[];
}

const ArtisanAvailabilityCalendar: React.FC<ArtisanAvailabilityCalendarProps> = ({
  onSave,
  initialUnavailablePeriods = []
}) => {
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailabilityPeriod[]>(initialUnavailablePeriods);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [reason, setReason] = useState('');
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);

  const isDateUnavailable = (date: Date) => {
    return unavailablePeriods.some(period => {
      if (period.type === 'single') {
        return date.toDateString() === period.startDate.toDateString();
      } else {
        const start = period.startDate;
        const end = period.endDate || period.startDate;
        return date >= start && date <= end;
      }
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !isAddingPeriod) return;

    if (selectionMode === 'single') {
      setSelectedDates([date]);
    } else {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = date;
        if (end >= start) {
          setSelectedDates([start, end]);
        } else {
          setSelectedDates([date]);
        }
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const addUnavailabilityPeriod = () => {
    if (selectedDates.length === 0 || !reason.trim()) return;

    const newPeriod: UnavailabilityPeriod = {
      id: Date.now().toString(),
      startDate: selectedDates[0],
      endDate: selectionMode === 'range' && selectedDates.length > 1 ? selectedDates[1] : undefined,
      reason: reason.trim(),
      type: selectionMode
    };

    setUnavailablePeriods([...unavailablePeriods, newPeriod]);
    setSelectedDates([]);
    setReason('');
    setIsAddingPeriod(false);
  };

  const removePeriod = (id: string) => {
    setUnavailablePeriods(unavailablePeriods.filter(period => period.id !== id));
  };

  const handleSave = () => {
    onSave(unavailablePeriods);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Gérer mes indisponibilités
          </CardTitle>
          <p className="text-sm text-gray-600">
            Marquez les dates où vous ne serez pas disponible pour vos ateliers
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAddingPeriod ? (
            <Button 
              onClick={() => setIsAddingPeriod(true)}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une période d'indisponibilité
            </Button>
          ) : (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex gap-2">
                <Button
                  variant={selectionMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectionMode('single');
                    setSelectedDates([]);
                  }}
                >
                  Jour unique
                </Button>
                <Button
                  variant={selectionMode === 'range' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectionMode('range');
                    setSelectedDates([]);
                  }}
                >
                  Période
                </Button>
              </div>

              {selectedDates.length > 0 && (
                <div className="p-3 bg-white rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {selectionMode === 'single' ? 'Date sélectionnée:' : 'Période sélectionnée:'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectionMode === 'single' 
                      ? format(selectedDates[0], 'EEEE d MMMM yyyy', { locale: fr })
                      : selectedDates.length === 1
                        ? `Du ${format(selectedDates[0], 'EEEE d MMMM yyyy', { locale: fr })} - Sélectionnez la date de fin`
                        : `Du ${format(selectedDates[0], 'd MMM', { locale: fr })} au ${format(selectedDates[1], 'd MMM yyyy', { locale: fr })}`
                    }
                  </p>
                </div>
              )}

              <Textarea
                placeholder="Raison de l'indisponibilité (ex: vacances, formation, maladie...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />

              <div className="flex gap-2">
                <Button
                  onClick={addUnavailabilityPeriod}
                  disabled={selectedDates.length === 0 || !reason.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingPeriod(false);
                    setSelectedDates([]);
                    setReason('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDates[0]}
            onSelect={handleDateSelect}
            disabled={isPastDate}
            modifiers={{
              unavailable: isDateUnavailable,
              selected: (date) => selectedDates.some(d => d.toDateString() === date.toDateString())
            }}
            modifiersStyles={{
              unavailable: { 
                backgroundColor: '#fee2e2', 
                color: '#dc2626',
                textDecoration: 'line-through'
              },
              selected: {
                backgroundColor: '#ea580c',
                color: 'white'
              }
            }}
            className="rounded-md border"
            locale={fr}
          />
          
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span>Indisponible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-600 rounded"></div>
                <span>Sélectionné</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {unavailablePeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Périodes d'indisponibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unavailablePeriods.map((period) => (
                <div key={period.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {period.type === 'single' ? 'Jour' : 'Période'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {period.type === 'single' 
                          ? format(period.startDate, 'd MMMM yyyy', { locale: fr })
                          : `${format(period.startDate, 'd MMM', { locale: fr })} - ${format(period.endDate!, 'd MMM yyyy', { locale: fr })}`
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{period.reason}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePeriod(period.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default ArtisanAvailabilityCalendar;
