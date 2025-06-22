
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  // Mock reviews data - in a real app, this would come from an API
  const reviews: Review[] = [
    {
      id: 1,
      userName: 'Marie Dubois',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332b302?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      date: '2024-05-15',
      comment: 'Absolument magnifique ! La qualité du travail est exceptionnelle. Je recommande vivement cet artisan.'
    },
    {
      id: 2,
      userName: 'Jean Martin',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      rating: 4,
      date: '2024-05-10',
      comment: 'Très beau produit, bien emballé. Livraison rapide. Petit bémol sur la communication mais le résultat final est là.'
    },
    {
      id: 3,
      userName: 'Sophie Lefèvre',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      date: '2024-05-08',
      comment: 'Pièce unique et authentique. On sent tout le savoir-faire traditionnel. Merci pour ce magnifique travail !'
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Avis clients</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="ml-2 font-medium">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600">({reviews.length} avis)</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{review.userName}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
