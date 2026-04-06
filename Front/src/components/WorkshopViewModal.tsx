import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, MapPin, Clock, Users, Star, Calendar, Tag, BookOpen, Wrench, Target } from 'lucide-react';
import type { WorkshopOut } from '@/types/workshop';

interface WorkshopViewModalProps {
  workshop: WorkshopOut;
  isOpen: boolean;
  onClose: () => void;
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
      return 'En attente d\'approbation';
    default:
      return status;
  }
};

export const WorkshopViewModal: React.FC<WorkshopViewModalProps> = ({
  workshop,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{workshop.title}</h2>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(workshop.status)}>
                {getStatusText(workshop.status)}
              </Badge>
              <Badge variant="outline">{workshop.category}</Badge>
              <Badge variant="outline">{workshop.skill_level}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {}
          {(workshop.featured_image_url || workshop.gallery_images?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workshop.featured_image_url && (
                    <div className="relative">
                      <img
                        src={`http://localhost:8000/static/uploads/${workshop.featured_image_url}`}
                        alt="Photo principale"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-orange-600">
                        Principale
                      </Badge>
                    </div>
                  )}
                  {workshop.gallery_images?.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8000/static/uploads/${image}`}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Détails pratiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-3" />
                  <span>{workshop.min_participants} - {workshop.max_participants} participants</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-3" />
                  <span>
                    {Math.floor(workshop.duration_minutes / 60)}h
                    {workshop.duration_minutes % 60 > 0 ? ` ${workshop.duration_minutes % 60}min` : ''}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>{workshop.address}</span>
                </div>
                <div className="flex items-center text-orange-600 font-semibold text-lg">
                  <span>{workshop.base_price?.toLocaleString()} Ar</span>
                </div>
                {workshop.foreign_price && (
                  <div className="text-sm text-gray-500">
                    Prix étrangers: {workshop.foreign_price.toLocaleString()} Ar
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">
                    {workshop.workshop_type === 'inscription' ? 'Inscription' : 'Réservation'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Réservations:</span>
                  <span className="font-medium">{workshop.total_bookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Note moyenne:</span>
                  <span className="font-medium">
                    ⭐ {workshop.rating_average || 0} ({workshop.rating_count || 0} avis)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créé le:</span>
                  <span className="font-medium">
                    {new Date(workshop.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{workshop.description}</p>
              {workshop.short_description && workshop.short_description !== workshop.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-1">Description courte:</h4>
                  <p className="text-sm text-gray-600">{workshop.short_description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          {workshop.what_you_will_learn && workshop.what_you_will_learn.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Ce que vous apprendrez
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workshop.what_you_will_learn.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <BookOpen className="w-4 h-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {}
          <div className="grid md:grid-cols-2 gap-6">
            {workshop.materials_included && workshop.materials_included.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Wrench className="w-5 h-5 mr-2" />
                    Matériaux fournis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {workshop.materials_included.map((material, index) => (
                      <li key={index} className="text-sm text-gray-600">• {material}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {workshop.materials_to_bring && workshop.materials_to_bring.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Matériaux à apporter</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {workshop.materials_to_bring.map((material, index) => (
                      <li key={index} className="text-sm text-gray-600">• {material}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {}
          {workshop.prerequisites && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prérequis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{workshop.prerequisites}</p>
              </CardContent>
            </Card>
          )}

          {}
          {workshop.tags && workshop.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workshop.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};