import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RevenueStats } from '@/types/admin';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueStatsCardProps {
  data: RevenueStats;
}

export const RevenueStatsCard: React.FC<RevenueStatsCardProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M Ar`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k Ar`;
    }
    return `${amount.toFixed(0)} Ar`;
  };

  const formatPeriod = (period: string) => {
    const periods: Record<string, string> = {
      day: "Aujourd'hui",
      week: 'Cette semaine',
      month: 'Ce mois',
      year: 'Cette année',
      all: 'Total'
    };
    return periods[period] || period;
  };

  return (
    <div className="space-y-6">
      {/* Résumé des revenus */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Revenus de la plateforme</CardTitle>
              <CardDescription>Période: {formatPeriod(data.period)}</CardDescription>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenus totaux */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">Revenus totaux</p>
              <p className="text-4xl font-bold text-green-700">{formatCurrency(data.total_revenue)}</p>
              {data.start_date && data.end_date && (
                <p className="text-xs text-green-600 mt-2">
                  Du {new Date(data.start_date).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(data.end_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>

            {/* Répartition produits/ateliers */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Ventes Produits</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(data.product_sales)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((data.product_sales / data.total_revenue) * 100).toFixed(1)}% du total
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Ventes Ateliers</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(data.workshop_sales)}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {((data.workshop_sales / data.total_revenue) * 100).toFixed(1)}% du total
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Artizaho */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Artizaho</CardTitle>
          <CardDescription>Revenus de la plateforme ({(data.commission_rate * 100).toFixed(0)}%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-orange-900 mb-2">Commission totale</p>
                <p className="text-3xl font-bold text-orange-700">{formatCurrency(data.commission_artizaho)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Évolution quotidienne */}
      {data.daily_breakdown && data.daily_breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution quotidienne</CardTitle>
            <CardDescription>Détail des revenus jour par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.daily_breakdown.map((day, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-3 mt-1 text-sm">
                      <span className="text-blue-600">
                        Produits: {formatCurrency(day.orders_revenue)}
                      </span>
                      <span className="text-purple-600">
                        Ateliers: {formatCurrency(day.workshops_revenue)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {formatCurrency(day.revenue)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
