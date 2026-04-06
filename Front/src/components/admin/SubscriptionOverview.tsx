import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionOverviewResponse } from '@/types/admin';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Pause
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface SubscriptionOverviewProps {
  data: SubscriptionOverviewResponse;
}

/**
 * Vue d'ensemble des abonnements avec KPIs clés
 */
export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({ data }) => {
  const planColors: Record<string, { bg: string; text: string }> = {
    basic: { bg: 'bg-gray-100', text: 'text-gray-700' },
    plus: { bg: 'bg-blue-100', text: 'text-blue-700' },
    pro: { bg: 'bg-purple-100', text: 'text-purple-700' },
    enterprise: { bg: 'bg-orange-100', text: 'text-orange-700' }
  };

  const statusIcons: Record<string, React.ReactNode> = {
    active: <CheckCircle className="w-4 h-4 text-green-600" />,
    paused: <Pause className="w-4 h-4 text-orange-600" />,
    cancelled: <XCircle className="w-4 h-4 text-red-600" />,
    expired: <Clock className="w-4 h-4 text-gray-600" />,
    pending: <Clock className="w-4 h-4 text-blue-600" />
  };

  return (
    <div className="space-y-6">
      {}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abonnements Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {data.total_active}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR (Revenus Mensuels)</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {formatCurrency(data.monthly_recurring_revenue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de Renouvellement</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {data.renewal_rate_percent.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn ce mois</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {data.churned_this_month}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Répartition par Plan
          </CardTitle>
          <CardDescription>
            Distribution des abonnements par type de plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(data.total_by_plan).map(([plan, count]) => {
              const colors = planColors[plan] || planColors.basic;
              return (
                <div
                  key={plan}
                  className={`p-4 rounded-lg ${colors.bg}`}
                >
                  <p className={`text-sm font-medium ${colors.text} uppercase`}>
                    {plan}
                  </p>
                  <p className={`text-2xl font-bold ${colors.text} mt-1`}>
                    {count}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    abonnés
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Répartition par Statut
          </CardTitle>
          <CardDescription>
            État actuel de tous les abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.total_by_status).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {statusIcons[status]}
                  <span className="font-medium capitalize">{status}</span>
                </div>
                <Badge variant="outline" className="font-bold">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {}
      <div className="text-sm text-gray-500 text-right">
        Dernière mise à jour: {new Date(data.timestamp).toLocaleString('fr-FR')}
      </div>
    </div>
  );
};
