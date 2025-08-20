import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays } from 'lucide-react';

interface WorkshopEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  artisan: string;
  type: 'artizaho' | 'uber';
  participants: number;
  maxParticipants: number;
}

interface WorkshopCalendarProps {
  upcomingWorkshops: WorkshopEvent[];
}

export const WorkshopCalendar: React.FC<WorkshopCalendarProps> = ({ upcomingWorkshops }) => {
  // Grouper les ateliers par date
  const groupedWorkshops = upcomingWorkshops.reduce((acc, workshop) => {
    const dateKey = workshop.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(workshop);
    return acc;
  }, {} as Record<string, WorkshopEvent[]>);

  const getTypeVariant = (type: 'artizaho' | 'uber') => {
    return type === 'artizaho' ? 'default' : 'secondary';
  };

  const getTypeLabel = (type: 'artizaho' | 'uber') => {
    return type === 'artizaho' ? 'Artizaho' : 'Uber';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendrier des ateliers à venir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedWorkshops)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([dateKey, workshops]) => (
              <div key={dateKey} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 text-blue-600">
                  {new Date(dateKey).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="space-y-2">
                  {workshops.map((workshop) => (
                    <div key={workshop.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{workshop.title}</h4>
                          <Badge variant={getTypeVariant(workshop.type)} className="text-xs">
                            {getTypeLabel(workshop.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {workshop.time} • par {workshop.artisan}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-green-600">
                          {workshop.participants}/{workshop.maxParticipants}
                        </div>
                        <div className="text-xs text-gray-500">participants</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {Object.keys(groupedWorkshops).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun atelier programmé pour le moment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};