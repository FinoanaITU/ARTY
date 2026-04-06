import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ConversionStats } from '@/types/admin';
import { TrendingUp, Eye, ShoppingCart, Users } from 'lucide-react';

interface ConversionStatsCardProps {
  data: ConversionStats;
}

export const ConversionStatsCard: React.FC<ConversionStatsCardProps> = ({ data }) => {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 0.05) return 'text-green-600';
    if (rate >= 0.02) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConversionBadge = (rate: number) => {
    if (rate >= 0.05) return 'Excellent';
    if (rate >= 0.02) return 'Bon';
    return 'À améliorer';
  };

  return (
    <div className="space-y-6">
      {}
      <Card>
        <CardHeader>
          <CardTitle>Performance de Conversion</CardTitle>
          <CardDescription>Taux de transformation des visiteurs en acheteurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Produits</p>
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <p className={`text-4xl font-bold ${getConversionColor(data.product_view_to_sale_rate)}`}>
                {formatPercentage(data.product_view_to_sale_rate)}
              </p>
              <p className="text-xs text-blue-700 mt-2">Vues → Commandes</p>
              <Badge variant="secondary" className="mt-2">
                {getConversionBadge(data.product_view_to_sale_rate)}
              </Badge>
            </div>

            {}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-900">Ateliers</p>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <p className={`text-4xl font-bold ${getConversionColor(data.workshop_to_booking_rate)}`}>
                {formatPercentage(data.workshop_to_booking_rate)}
              </p>
              <p className="text-xs text-purple-700 mt-2">Vues → Réservations</p>
              <Badge variant="secondary" className="mt-2">
                {getConversionBadge(data.workshop_to_booking_rate)}
              </Badge>
            </div>

            {}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-orange-900">Visiteurs</p>
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <p className={`text-4xl font-bold ${getConversionColor(data.visitor_to_buyer_conversion)}`}>
                {formatPercentage(data.visitor_to_buyer_conversion)}
              </p>
              <p className="text-xs text-orange-700 mt-2">Visiteurs → Acheteurs</p>
              <Badge variant="secondary" className="mt-2">
                {getConversionBadge(data.visitor_to_buyer_conversion)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produits</CardTitle>
            <CardDescription>Vues et conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-gray-900">Vues totales</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.products_with_views.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-gray-900">Commandes</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.products_with_sales.toLocaleString()}
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(data.product_view_to_sale_rate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ateliers</CardTitle>
            <CardDescription>Vues et réservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-gray-900">Ateliers avec vues</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.workshops_with_bookings.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                  <span className="font-medium text-gray-900">Avec réservations</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.workshops_with_bookings.toLocaleString()}
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(data.workshop_to_booking_rate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommandations</CardTitle>
          <CardDescription>Analyse des performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.product_view_to_sale_rate < 0.02 && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="font-medium text-red-900">⚠️ Conversion produits faible</p>
                <p className="text-sm text-red-700 mt-1">
                  Moins de 2% des visiteurs achètent. Considérez améliorer les descriptions, photos ou prix.
                </p>
              </div>
            )}
            {data.workshop_to_booking_rate < 0.02 && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="font-medium text-orange-900">⚠️ Conversion ateliers à améliorer</p>
                <p className="text-sm text-orange-700 mt-1">
                  Peu de réservations. Vérifiez les prix, horaires et disponibilités.
                </p>
              </div>
            )}
            {data.product_view_to_sale_rate >= 0.05 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-green-900">✅ Excellente conversion produits</p>
                <p className="text-sm text-green-700 mt-1">
                  Plus de 5% de taux de conversion - continuez sur cette lancée!
                </p>
              </div>
            )}
            {data.workshop_to_booking_rate >= 0.05 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-green-900">✅ Excellente conversion ateliers</p>
                <p className="text-sm text-green-700 mt-1">
                  Les ateliers convertissent très bien - envisagez d'en créer davantage!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
