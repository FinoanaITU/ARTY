import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ArtisanStatsProps {
  stats: {
    totalSales: number;
    ordersThisMonth: number;
    rating: number;
    totalProducts: number;
  };
}

export const ArtisanStats: React.FC<ArtisanStatsProps> = ({ stats }) => {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.totalSales.toLocaleString()} Ar
          </div>
          <p className="text-sm text-gray-600">Chiffre d'affaires</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.ordersThisMonth}
          </div>
          <p className="text-sm text-gray-600">Commandes ce mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            ⭐ {stats.rating}
          </div>
          <p className="text-sm text-gray-600">Note moyenne</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalProducts}
          </div>
          <p className="text-sm text-gray-600">Produits actifs</p>
        </CardContent>
      </Card>
    </div>
  );
};