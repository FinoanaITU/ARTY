
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar } from 'lucide-react';
import { useWorkshopRecommendations } from '@/hooks/useRecommendations';

interface WorkshopRecommendationsProps {
  currentWorkshopId?: number;
  category?: string;
}

const WorkshopRecommendations: React.FC<WorkshopRecommendationsProps> = ({
  currentWorkshopId,
  category
}) => {
  const { recommendations, loading } = useWorkshopRecommendations(currentWorkshopId, category);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ateliers recommandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Chargement des recommandations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ateliers recommandés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((workshop) => (
            <div key={workshop.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-green-100 relative">
                <img
                  src={workshop.image}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {workshop.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{workshop.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{workshop.artisan}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="h-3 w-3" />
                  <span>{workshop.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-600 text-sm">
                    {workshop.price.toLocaleString()} Ar
                  </span>
                  <Link to={`/workshop/${workshop.id}`}>
                    <Button size="sm" className="h-8 px-3 bg-green-600 hover:bg-green-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      Réserver
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkshopRecommendations;
