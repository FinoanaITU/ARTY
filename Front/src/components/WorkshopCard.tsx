import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Calendar, Users, MapPin, Clock } from 'lucide-react';
import type { WorkshopOut } from '@/types/workshop';

interface WorkshopCardProps {
  workshop: WorkshopOut;
  isAdmin?: boolean;
  onEdit?: (workshop: WorkshopOut) => void;
  onDelete?: (workshopId: string) => void;
  onView?: (workshop: WorkshopOut) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700';
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'archived':
      return 'bg-red-100 text-red-700';
    case 'pending_approval':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publié';
    case 'draft':
      return 'Brouillon';
    case 'archived':
      return 'Archivé';
    case 'pending_approval':
      return 'En attente';
    default:
      return status;
  }
};

export const WorkshopCard: React.FC<WorkshopCardProps> = ({
  workshop,
  isAdmin = false,
  onEdit,
  onDelete,
  onView
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{workshop.title}</CardTitle>
            <CardDescription className="text-sm">
              {workshop.short_description || workshop.description?.substring(0, 100) + '...'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(workshop.status)}>
            {getStatusText(workshop.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{workshop.min_participants}-{workshop.max_participants} participants</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{Math.floor(workshop.duration_minutes / 60)}h{workshop.duration_minutes % 60 > 0 ? ` ${workshop.duration_minutes % 60}min` : ''}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{workshop.address}</span>
          </div>
          <div className="flex items-center text-orange-600 font-semibold">
            <span>{workshop.base_price?.toLocaleString()} Ar</span>
          </div>
        </div>

        {}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {workshop.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {workshop.skill_level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {workshop.workshop_type === 'inscription' ? 'Inscription' : 'Réservation'}
          </Badge>
        </div>

        {}
        {(isAdmin || workshop.status === 'published') && (
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
            <span>{workshop.total_bookings || 0} réservation(s)</span>
            <span>⭐ {workshop.rating_average || 0} ({workshop.rating_count || 0})</span>
          </div>
        )}

        {}
        <div className="flex justify-end space-x-2 pt-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(workshop)}>
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(workshop)}>
              <Edit className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(workshop.id)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};