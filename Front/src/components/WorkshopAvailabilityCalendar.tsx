import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { format, addDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UnavailabilityPeriod {
  id?: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: 'single' | 'range';
  status?: 'pending' | 'approved';
}

interface WorkshopAvailabilityCalendarProps {
  workshopId: string;
  unavailableDates?: UnavailabilityPeriod[];
  onUnavailabilityChange?: (periods: UnavailabilityPeriod[]) => void;
  readOnly?: boolean;
}

export const WorkshopAvailabilityCalendar: React.FC<WorkshopAvailabilityCalendarProps> = ({
  workshopId,
  unavailableDates = [],
  onUnavailabilityChange,
  readOnly = false
}) => {
  const [month, setMonth] = useState<Date>(new Date());
  const [unavailabilities, setUnavailabilities] = useState<UnavailabilityPeriod[]>(unavailableDates);
  const [showDialog, setShowDialog] = useState(false);
  const [newUnavailability, setNewUnavailability] = useState<Partial<UnavailabilityPeriod>>({
    type: 'single',
    reason: '',
    status: 'pending'
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const reasonOptions = [
    'Congés',
    'Maladie',
    'Formation',
    'Maintenance atelier',
    'Événement personnel',
    'Salon/exposition',
    'Autre'
  ];

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date): UnavailabilityPeriod | null => {
    for (const period of unavailabilities) {
      if (period.type === 'single') {
        if (isSameDay(date, period.startDate)) {
          return period;
        }
      } else if (period.type === 'range') {
        if (isAfter(date, addDays(period.startDate, -1)) && 
            isBefore(date, addDays(period.endDate || period.startDate, 1))) {
          return period;
        }
      }
    }
    return null;
  };

  const handleAddUnavailability = () => {
    if (!selectedDate || !newUnavailability.reason) {
      return;
    }

    const period: UnavailabilityPeriod = {
      id: `${Date.now()}`,
      startDate: selectedDate,
      endDate: newUnavailability.type === 'range' ? newUnavailability.endDate : selectedDate,
      reason: newUnavailability.reason,
      type: newUnavailability.type as 'single' | 'range',
      status: 'pending'
    };

    const updated = [...unavailabilities, period];
    setUnavailabilities(updated);
    onUnavailabilityChange?.(updated);

    // Reset form
    setNewUnavailability({ type: 'single', reason: '', status: 'pending' });
    setSelectedDate(undefined);
    setShowDialog(false);
  };

  const handleRemoveUnavailability = (id: string | undefined) => {
    if (!id) return;
    const updated = unavailabilities.filter(u => u.id !== id);
    setUnavailabilities(updated);
    onUnavailabilityChange?.(updated);
  };

  const getDatesInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => 
      new Date(year, month, i + 1)
    );
  };

  const datesInMonth = getDatesInMonth(month);
  const unavailableInMonth = datesInMonth.filter(date => isDateUnavailable(date));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendrier de disponibilité</CardTitle>
            <CardDescription>
              Gérez les périodes non disponibles pour cet atelier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonth(addDays(month, -32))}
                >
                  ←
                </Button>
                <h3 className="font-semibold text-center min-w-[200px]">
                  {format(month, 'MMMM yyyy', { locale: fr })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonth(addDays(month, 32))}
                >
                  →
                </Button>
              </div>

              {/* Calendar Grid */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={month}
                onMonthChange={setMonth}
                className="rounded-md border"
                disabled={(date) => isBefore(date, new Date())}
              />

              {/* Selected Period Info */}
              {selectedDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm">
                    <strong>Date sélectionnée:</strong> {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                  {isDateUnavailable(selectedDate) && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Cette date est déjà marquée comme indisponible
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Jours indisponibles ce mois</p>
              <p className="text-2xl font-bold">{unavailableInMonth.length}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total périodes</p>
              <p className="text-2xl font-bold">{unavailabilities.length}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">En attente d'approbation</p>
              <p className="text-2xl font-bold text-yellow-600">
                {unavailabilities.filter(u => u.status === 'pending').length}
              </p>
            </div>

            {!readOnly && (
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => setSelectedDate(selectedDate || new Date())}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter indisponibilité
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une période indisponible</DialogTitle>
                    <DialogDescription>
                      Marquez les périodes où vous n'êtes pas disponible
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newUnavailability.type}
                        onValueChange={(value) =>
                          setNewUnavailability({ ...newUnavailability, type: value as 'single' | 'range' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Jour unique</SelectItem>
                          <SelectItem value="range">Période</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="date"
                        value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>

                    {newUnavailability.type === 'range' && (
                      <div>
                        <Label>Date de fin</Label>
                        <Input
                          type="date"
                          value={newUnavailability.endDate ? format(newUnavailability.endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) =>
                            setNewUnavailability({
                              ...newUnavailability,
                              endDate: e.target.value ? new Date(e.target.value) : undefined
                            })
                          }
                        />
                      </div>
                    )}

                    <div>
                      <Label>Raison</Label>
                      <Select
                        value={newUnavailability.reason}
                        onValueChange={(value) =>
                          setNewUnavailability({ ...newUnavailability, reason: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une raison" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasonOptions.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Textarea
                      placeholder="Notes supplémentaires (optionnel)"
                      value={newUnavailability.reason}
                      onChange={(e) =>
                        setNewUnavailability({ ...newUnavailability, reason: e.target.value })
                      }
                      rows={2}
                    />

                    <Button onClick={handleAddUnavailability} className="w-full">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unavailability List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Périodes indisponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {unavailabilities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune période indisponible pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {unavailabilities.map((period) => (
                <div
                  key={period.id}
                  className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{period.reason}</p>
                      <Badge 
                        variant={period.status === 'approved' ? 'default' : 'secondary'}
                        className={period.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}
                      >
                        {period.status === 'approved' ? 'Approuvée' : 'En attente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {period.type === 'single'
                        ? format(period.startDate, 'dd MMMM yyyy', { locale: fr })
                        : `${format(period.startDate, 'dd MMMM', { locale: fr })} - ${format(
                            period.endDate || period.startDate,
                            'dd MMMM yyyy',
                            { locale: fr }
                          )}`}
                    </p>
                  </div>

                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveUnavailability(period.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopAvailabilityCalendar;
