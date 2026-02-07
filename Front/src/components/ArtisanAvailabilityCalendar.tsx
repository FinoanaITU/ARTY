
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarX, Save, Trash2, Plus, Info, Calendar as CalendarIcon } from 'lucide-react';
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

  // Vérifie si une date est dans l'intervalle de sélection (pour colorer les dates intermédiaires)
  const isDateInSelectedRange = (date: Date) => {
    if (selectionMode === 'range' && selectedDates.length === 2) {
      const [start, end] = selectedDates;
      const dateTime = date.getTime();
      const startTime = start.getTime();
      const endTime = end.getTime();
      return dateTime >= startTime && dateTime <= endTime;
    }
    return false;
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
    <div className="space-y-6 p-1">
      {/* Layout en 2 colonnes : Gestion + Calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En-tête avec informations */}
        <Card className="border-orange-200 shadow-sm h-fit">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <CalendarX className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-gray-900 mb-1">
                Gérer mes indisponibilités
              </CardTitle>
              <CardDescription className="text-gray-600">
                Indiquez les périodes pendant lesquelles vous ne pourrez pas animer d'ateliers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!isAddingPeriod ? (
            <Button 
              onClick={() => setIsAddingPeriod(true)}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une période d'indisponibilité
            </Button>
          ) : (
            <div className="space-y-5 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-sm">
              {/* Sélection du mode */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Type de période
                </label>
                <div className="flex gap-3">
                  <Button
                    variant={selectionMode === 'single' ? 'default' : 'outline'}
                    className={selectionMode === 'single' 
                      ? 'flex-1 bg-orange-600 hover:bg-orange-700' 
                      : 'flex-1 hover:bg-orange-50 hover:border-orange-300'
                    }
                    onClick={() => {
                      setSelectionMode('single');
                      setSelectedDates([]);
                    }}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Jour unique
                  </Button>
                  <Button
                    variant={selectionMode === 'range' ? 'default' : 'outline'}
                    className={selectionMode === 'range' 
                      ? 'flex-1 bg-orange-600 hover:bg-orange-700' 
                      : 'flex-1 hover:bg-orange-50 hover:border-orange-300'
                    }
                    onClick={() => {
                      setSelectionMode('range');
                      setSelectedDates([]);
                    }}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Période
                  </Button>
                </div>
              </div>

              {/* Affichage de la sélection */}
              {selectedDates.length > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {selectionMode === 'single' ? '📅 Date sélectionnée' : '📆 Période sélectionnée'}
                      </p>
                      <p className="text-base text-gray-700 font-medium">
                        {selectionMode === 'single' 
                          ? format(selectedDates[0], 'EEEE d MMMM yyyy', { locale: fr })
                          : selectedDates.length === 1
                            ? `Du ${format(selectedDates[0], 'EEEE d MMMM yyyy', { locale: fr })} - Cliquez sur la date de fin`
                            : `Du ${format(selectedDates[0], 'd MMMM', { locale: fr })} au ${format(selectedDates[1], 'd MMMM yyyy', { locale: fr })}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raison */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Raison de l'indisponibilité
                </label>
                <Textarea
                  placeholder="Ex: Vacances, formation, salon professionnel, congés..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="resize-none border-2 focus:border-orange-400"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={addUnavailabilityPeriod}
                  disabled={selectedDates.length === 0 || !reason.trim() || (selectionMode === 'range' && selectedDates.length < 2)}
                  className="flex-1 h-11 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter cette période
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingPeriod(false);
                    setSelectedDates([]);
                    setReason('');
                  }}
                  className="px-6 h-11 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendrier */}
      <Card className="shadow-sm h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-orange-600" />
            Calendrier
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={selectedDates[0]}
              onSelect={handleDateSelect}
              disabled={isPastDate}
              modifiers={{
                unavailable: isDateUnavailable,
                selected: (date) => selectedDates.some(d => d.toDateString() === date.toDateString()),
                inRange: isDateInSelectedRange
              }}
              modifiersStyles={{
                unavailable: { 
                  backgroundColor: '#fee2e2', 
                  color: '#dc2626',
                  textDecoration: 'line-through',
                  fontWeight: 'bold'
                },
                selected: {
                  backgroundColor: '#ea580c',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '2px solid #c2410c'
                },
                inRange: {
                  backgroundColor: '#fed7aa',
                  color: '#9a3412',
                  fontWeight: '500'
                }
              }}
              className="rounded-md"
              locale={fr}
            />
          </div>
          
          {/* Légende */}
          <div className="px-4 pb-4 border-t bg-gray-50">
            <div className="flex flex-wrap gap-4 text-sm pt-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-200 rounded flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold line-through">15</span>
                </div>
                <span className="font-medium text-gray-700">Indisponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-600 border-2 border-orange-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">15</span>
                </div>
                <span className="font-medium text-gray-700">Date de début/fin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-200 rounded flex items-center justify-center">
                  <span className="text-orange-900 text-xs font-semibold">15</span>
                </div>
                <span className="font-medium text-gray-700">Dans la période</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      {/* Fin du layout en 2 colonnes */}

      {/* Liste des périodes d'indisponibilité */}
      {unavailablePeriods.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="h-5 w-5 text-orange-600" />
                Mes périodes d'indisponibilité
              </div>
              <Badge variant="secondary" className="text-sm">
                {unavailablePeriods.length} période{unavailablePeriods.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {unavailablePeriods.map((period) => (
                <div 
                  key={period.id} 
                  className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-white rounded-lg border-2 border-orange-200 group-hover:border-orange-400 transition-colors">
                      <CalendarX className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={period.type === 'single' ? 'outline' : 'secondary'}
                        className="text-xs font-semibold"
                      >
                        {period.type === 'single' ? '📅 Jour unique' : '📆 Période'}
                      </Badge>
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">
                      {period.type === 'single' 
                        ? format(period.startDate, 'd MMMM yyyy', { locale: fr })
                        : `${format(period.startDate, 'd MMMM', { locale: fr })} → ${format(period.endDate!, 'd MMMM yyyy', { locale: fr })}`
                      }
                    </p>
                    <p className="text-sm text-gray-600 italic">{period.reason}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePeriod(period.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors flex-shrink-0"
                    title="Supprimer cette période"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={handleSave} 
          className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all text-base font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          Enregistrer toutes les modifications
        </Button>
      </div>
    </div>
  );
};

export default ArtisanAvailabilityCalendar;
