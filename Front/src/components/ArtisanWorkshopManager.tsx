import React from 'react';
import { WorkshopCard } from './WorkshopCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Filter } from 'lucide-react';
import { Badge } from './ui/badge';
import type { WorkshopOut } from '@/types/workshop';

interface ArtisanWorkshopManagerProps {
  workshops: WorkshopOut[];
  loading: boolean;
  isAdmin?: boolean;
  onCreateWorkshop: () => void;
  onEditWorkshop?: (workshop: WorkshopOut) => void;
  onDeleteWorkshop?: (workshopId: string) => void;
  onViewWorkshop?: (workshop: WorkshopOut) => void;
}

export const ArtisanWorkshopManager: React.FC<ArtisanWorkshopManagerProps> = ({
  workshops,
  loading,
  isAdmin = false,
  onCreateWorkshop,
  onEditWorkshop,
  onDeleteWorkshop,
  onViewWorkshop
}) => {
  
  const stats = {
    total: workshops.length,
    published: workshops.filter(w => w.status === 'published').length,
    draft: workshops.filter(w => w.status === 'draft').length,
    pending: workshops.filter(w => w.status === 'pending_approval').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestion des Ateliers' : 'Mes Ateliers'}
          </h2>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Gérez tous les ateliers de la plateforme'
              : 'Gérez vos ateliers et créez-en de nouveaux'
            }
          </p>
        </div>
        {!isAdmin && (
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={onCreateWorkshop}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un atelier
          </Button>
        )}
      </div>

      {}
      {workshops.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Total: {stats.total}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700">
            Publiés: {stats.published}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-gray-50 text-gray-700">
            Brouillons: {stats.draft}
          </Badge>
          {stats.pending > 0 && (
            <Badge variant="outline" className="px-3 py-1 bg-orange-50 text-orange-700">
              En attente: {stats.pending}
            </Badge>
          )}
        </div>
      )}

      {}
      {workshops.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Aucun atelier trouvé' : 'Aucun atelier créé'}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Il n\'y a actuellement aucun atelier sur la plateforme'
                : 'Vous n\'avez pas encore créé d\'atelier'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {!isAdmin && (
                <>
                  <p className="text-gray-500 mb-4">
                    Commencez par créer votre premier atelier
                  </p>
                  <Button 
                    variant="outline"
                    onClick={onCreateWorkshop}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre premier atelier
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              isAdmin={isAdmin}
              onEdit={onEditWorkshop}
              onDelete={onDeleteWorkshop}
              onView={onViewWorkshop}
            />
          ))}
        </div>
      )}
    </div>
  );
};