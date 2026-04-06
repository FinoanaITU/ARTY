import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type {
  SubscriptionOut,
  SubscriptionOverviewResponse,
  SubscriptionStatsResponse
} from '@/types/admin';
import { SubscriptionOverview } from './SubscriptionOverview';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionDetail } from './SubscriptionDetail';
import { Package, TrendingUp, Activity } from 'lucide-react';

/**
 * Composant principal pour la gestion des abonnements (Admin)
 * Phase 5 - Subscription Admin
 */
export const AdminSubscriptionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<SubscriptionOverviewResponse | null>(null);
  const [stats, setStats] = useState<SubscriptionStatsResponse | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, statsData] = await Promise.all([
        apiService.getSubscriptionsOverview(),
        apiService.getSubscriptionStats()
      ]);
      setOverview(overviewData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Erreur chargement subscriptions:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscription = (subscription: SubscriptionOut) => {
    setSelectedSubscription(subscription);
    setActiveTab('detail');
  };

  const handleBackToList = () => {
    setSelectedSubscription(null);
    setActiveTab('list');
  };

  const handleSubscriptionUpdated = () => {
    loadData(); 
    setSelectedSubscription(null);
    setActiveTab('list');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Chargement des abonnements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4" variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-7 h-7 text-blue-600" />
          Gestion des Abonnements
        </h2>
        <p className="text-gray-600 mt-1">
          Gérez les abonnements des artisans sur la plateforme Artizaho
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="list">
            <Package className="w-4 h-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Activity className="w-4 h-4 mr-2" />
            Statistiques
          </TabsTrigger>
          {selectedSubscription && (
            <TabsTrigger value="detail">
              Détails
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          {overview && <SubscriptionOverview data={overview} />}
        </TabsContent>

        <TabsContent value="list">
          <SubscriptionList 
            onViewSubscription={handleViewSubscription}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="stats">
          {stats && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Détaillées</CardTitle>
                  <CardDescription>
                    Analyse complète des abonnements sur la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Abonnements</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.total_subscriptions}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.total_revenue.toFixed(2)} Ar
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Valeur Moyenne</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.average_subscription_value.toFixed(2)} Ar
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Durée Moy. (jours)</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(stats.average_lifetime_days)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Stats */}
              {stats.overview && <SubscriptionOverview data={stats.overview} />}
            </div>
          )}
        </TabsContent>

        {selectedSubscription && (
          <TabsContent value="detail">
            <SubscriptionDetail
              subscription={selectedSubscription}
              onBack={handleBackToList}
              onUpdate={handleSubscriptionUpdated}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
