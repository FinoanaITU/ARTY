import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkshops } from '@/hooks/useWorkshops';
import { WorkshopOut } from '@/types/workshop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Eye, MoreVertical, Send, Archive, Lock, Unlock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, Users, MapPin, CreditCard, Loader2 } from 'lucide-react';

const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
  return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
};

interface WorkshopManagerCardProps {
  workshop: WorkshopOut;
  onEdit?: () => void;
  onDelete?: (workshopId: string) => void;
  onPublish?: (workshopId: string) => void;
  onUnpublish?: (workshopId: string) => void;
  showActions?: boolean;
}

export const WorkshopManagerCard: React.FC<WorkshopManagerCardProps> = ({
  workshop,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  showActions = true
}) => {
  const { 
    publishWorkshop, 
    unpublishWorkshop, 
    deleteWorkshop,
    loading,
    error 
  } = useWorkshops();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handlePublish = async () => {
    const result = await publishWorkshop(workshop.id);
    if (result && onPublish) {
      onPublish(workshop.id);
    }
  };

  const handleUnpublish = async () => {
    const result = await unpublishWorkshop(workshop.id);
    if (result && onUnpublish) {
      onUnpublish(workshop.id);
    }
  };

  const handleDelete = async () => {
    const result = await deleteWorkshop(workshop.id);
    if (result && onDelete) {
      onDelete(workshop.id);
    }
    setShowDeleteDialog(false);
  };

  const isPublished = workshop.status === 'published';
  const isDraft = workshop.status === 'draft';

  return (
    <>
      <Card className={`overflow-hidden hover:shadow-lg transition-all ${!isPublished ? 'opacity-75' : ''}`}>
        <div className="aspect-video relative overflow-hidden bg-muted">
          {workshop.featured_image_url && (
            <img 
              src={normalizeImageUrl(workshop.featured_image_url)} 
              alt={workshop.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+non+disponible'; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {}
          <div className="absolute top-2 left-2">
            <Badge 
              variant={isPublished ? "default" : "secondary"}
              className={isPublished ? 'bg-green-600' : 'bg-yellow-600'}
            >
              {isPublished ? 'Publié' : workshop.status}
            </Badge>
          </div>

          {}
          {showActions && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  
                  {isDraft && (
                    <DropdownMenuItem onClick={handlePublish}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Publier
                    </DropdownMenuItem>
                  )}
                  
                  {isPublished && (
                    <DropdownMenuItem onClick={handleUnpublish}>
                      <Lock className="h-4 w-4 mr-2" />
                      Dépublier
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{workshop.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {workshop.category}
              </CardDescription>
            </div>
            <Badge variant="outline">{workshop.workshop_type}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{Math.round(workshop.duration_minutes / 60)}h</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{workshop.min_participants}-{workshop.max_participants}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{workshop.location}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              <span>{Math.round(parseFloat(String(workshop.base_price)) || 0).toLocaleString()}</span>
            </div>
          </div>

          {}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workshop.short_description || workshop.description}
          </p>

          {}
          {workshop.total_bookings > 0 && (
            <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded">
              {workshop.total_bookings} réservation(s) • {workshop.rating_count} avis
            </div>
          )}

          {}
          <div className="flex gap-2 pt-2">
            <Link to={`/workshop/${workshop.id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            </Link>
            
            {showActions && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                
                {isDraft && (
                  <Button 
                    size="sm"
                    onClick={handlePublish}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{workshop.title}</DialogTitle>
            <DialogDescription>
              {workshop.short_description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Description complète</h4>
              <p className="text-sm text-muted-foreground">{workshop.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Détails</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Durée</dt>
                    <dd>{Math.round(workshop.duration_minutes / 60)}h</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Participants</dt>
                    <dd>{workshop.min_participants}-{workshop.max_participants}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lieu</dt>
                    <dd>{workshop.location}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Niveau</dt>
                    <dd>{workshop.skill_level}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Prix</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Prix local</dt>
                    <dd className="font-semibold">{Math.round(parseFloat(String(workshop.base_price)) || 0).toLocaleString()} Ar</dd>
                  </div>
                  {workshop.foreign_price && (
                    <div>
                      <dt className="text-muted-foreground">Prix étrangers</dt>
                      <dd className="font-semibold">{Math.round(parseFloat(String(workshop.foreign_price)) || 0).toLocaleString()} Ar</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Réservations</dt>
                    <dd>{workshop.total_bookings}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {workshop.what_you_will_learn && workshop.what_you_will_learn.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Ce que vous apprendrez</h4>
                <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                  {workshop.what_you_will_learn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Supprimer l'atelier?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{workshop.title}"? Cette action est irréversible.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkshopManagerCard;
