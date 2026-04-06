import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserBehaviorStats } from '@/types/admin';
import { ShoppingCart, CreditCard, Users, Repeat } from 'lucide-react';

interface UserBehaviorStatsCardProps {
  data: UserBehaviorStats;
}

export const UserBehaviorStatsCard: React.FC<UserBehaviorStatsCardProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M Ar`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k Ar`;
    }
    return `${amount.toFixed(0)} Ar`;
  };

  return (
    <div className="space-y-6">
      {}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Panier moyen</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(data.avg_order_value)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Par commande</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taille moyenne du panier</p>
                <p className="text-3xl font-bold text-purple-700">
                  {data.avg_cart_size.toFixed(1)} articles
                </p>
                <p className="text-xs text-gray-500 mt-1">Par commande</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Fidélité client</CardTitle>
          <CardDescription>Taux de clients récurrents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-green-900 mb-2">Taux de récurrence</p>
                  <p className="text-4xl font-bold text-green-700">
                    {(data.repeat_customers_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <Repeat className="h-12 w-12 text-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total clients</p>
                  <p className="text-xl font-bold text-gray-900">{data.total_customers}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Clients récurrents</p>
                  <p className="text-xl font-bold text-green-700">{data.repeat_customers}</p>
                </div>
              </div>
            </div>

            {}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fidélisation</span>
                <span className="text-sm text-gray-600">
                  {data.repeat_customers} / {data.total_customers} clients
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${data.repeat_customers_rate * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement</CardTitle>
          <CardDescription>Préférences des clients</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(data.payment_method_stats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.payment_method_stats).map(([method, count], index) => {
                const total = Object.values(data.payment_method_stats).reduce((sum, c) => sum + c, 0);
                const percentage = (count / total) * 100;
                const colors = [
                  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-900' },
                  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-900' },
                  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-900' },
                  { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-900' },
                  { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-900' },
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={method} className={`p-4 ${color.light} rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${color.text}`} />
                        <span className={`font-medium ${color.text}`}>{method}</span>
                      </div>
                      <Badge variant="secondary">
                        {count} ({percentage.toFixed(1)}%)
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune donnée de paiement disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Insights comportementaux</CardTitle>
          <CardDescription>Analyse du comportement client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.avg_order_value < 50000 && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="font-medium text-orange-900">💡 Panier moyen faible</p>
                <p className="text-sm text-orange-700 mt-1">
                  Envisagez des offres groupées ou la livraison gratuite au-delà d'un montant pour augmenter le panier moyen.
                </p>
              </div>
            )}
            {data.avg_cart_size < 2 && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-medium text-blue-900">💡 Articles par commande bas</p>
                <p className="text-sm text-blue-700 mt-1">
                  Suggérez des produits complémentaires pour augmenter le nombre d'articles par panier.
                </p>
              </div>
            )}
            {data.repeat_customers_rate < 0.2 && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="font-medium text-red-900">⚠️ Faible fidélisation</p>
                <p className="text-sm text-red-700 mt-1">
                  Moins de 20% de clients récurrents. Mettez en place un programme de fidélité ou des offres de retour.
                </p>
              </div>
            )}
            {data.repeat_customers_rate >= 0.3 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-green-900">✅ Bonne fidélisation</p>
                <p className="text-sm text-green-700 mt-1">
                  Plus de 30% de clients récurrents - vos clients sont satisfaits et reviennent!
                </p>
              </div>
            )}
            {data.avg_order_value >= 100000 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-green-900">✅ Panier moyen élevé</p>
                <p className="text-sm text-green-700 mt-1">
                  Excellent panier moyen! Vos clients valorisent les produits artisanaux de qualité.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
