
import { useState, useEffect } from 'react';
import { ProductRecommendation, WorkshopRecommendation } from '@/types/recommendations';

export const useProductRecommendations = (currentProductId: number, category: string) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      // Mock recommendations - in real app, fetch from backend
      const mockRecommendations: ProductRecommendation[] = [
        {
          id: 3,
          name: 'Lamba Mena traditionnel',
          artisan: 'Voahangy Razafy',
          price: 65000,
          image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=300&fit=crop',
          rating: 4.9,
          category: 'Textile et Tissage',
          relevanceScore: 0.8
        },
        {
          id: 4,
          name: 'Châle en soie sauvage',
          artisan: 'Voahangy Razafy',
          price: 35000,
          image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop',
          rating: 4.8,
          category: 'Textile et Tissage',
          relevanceScore: 0.7
        },
        {
          id: 5,
          name: 'Bol en terre cuite',
          artisan: 'Nivo Andriamana',
          price: 15000,
          image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop',
          rating: 4.6,
          category: 'Poterie et Céramique',
          relevanceScore: 0.5
        }
      ].filter(product => product.id !== currentProductId);

      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    fetchRecommendations();
  }, [currentProductId, category]);

  return { recommendations, loading };
};

export const useWorkshopRecommendations = (currentWorkshopId?: number, category?: string) => {
  const [recommendations, setRecommendations] = useState<WorkshopRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      // Mock recommendations - in real app, fetch from backend
      const mockRecommendations: WorkshopRecommendation[] = [
        {
          id: 1,
          title: 'Initiation à la sculpture sur bois',
          artisan: 'Hery Rakoto',
          price: 35000,
          image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300&h=300&fit=crop',
          rating: 4.8,
          category: 'Sculpture',
          duration: '3 heures',
          relevanceScore: 0.9
        },
        {
          id: 2,
          title: 'Tissage traditionnel malgache',
          artisan: 'Voahangy Razafy',
          price: 42000,
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop',
          rating: 4.9,
          category: 'Textile',
          duration: '4 heures',
          relevanceScore: 0.8
        },
        {
          id: 3,
          title: 'Poterie et céramique',
          artisan: 'Nivo Andriamana',
          price: 28000,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          rating: 4.7,
          category: 'Poterie',
          duration: '2.5 heures',
          relevanceScore: 0.7
        }
      ].filter(workshop => currentWorkshopId ? workshop.id !== currentWorkshopId : true);

      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    fetchRecommendations();
  }, [currentWorkshopId, category]);

  return { recommendations, loading };
};
