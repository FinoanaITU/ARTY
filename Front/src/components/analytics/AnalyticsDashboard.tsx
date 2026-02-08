import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Users, ShoppingBag, Calendar, DollarSign, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type {
  PlatformOverview,
  RevenueStats,
  ArtisanStats,
  ConversionStats,
  UserBehaviorStats,
  StatsPeriod
} from '@/types/admin';
import { PlatformOverviewCard } from './PlatformOverviewCard';
import { RevenueStatsCard } from './RevenueStatsCard';
import { ArtisanStatsCard } from './ArtisanStatsCard';
import { ConversionStatsCard } from './ConversionStatsCard';
import { UserBehaviorStatsCard } from './UserBehaviorStatsCard';

export const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // States pour les données
  const [platformOverview, setPlatformOverview] = useState<PlatformOverview | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [artisanStats, setArtisanStats] = useState<ArtisanStats | null>(null);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [userBehaviorStats, setUserBehaviorStats] = useState<UserBehaviorStats | null>(null);

  // Charger les données au montage et quand la période change
  useEffect(() => {
    loadAllAnalytics();
  }, [period]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      // Charger toutes les analytics en parallèle
      const [overview, revenue, artisans, conversion, userBehavior] = await Promise.all([
        apiService.getAdminPlatformOverview(),
        apiService.getAdminRevenueStats(period),
        apiService.getAdminArtisanStats(),
        apiService.getAdminConversionStats(),
        apiService.getAdminUserBehaviorStats(),
      ]);

      setPlatformOverview(overview);
      setRevenueStats(revenue);
      setArtisanStats(artisans);
      setConversionStats(conversion);
      setUserBehaviorStats(userBehavior);
    } catch (error: any) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de charger les statistiques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de la plateforme</h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble des performances et statistiques</p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as StatsPeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
            <SelectItem value="all">Tout le temps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs rapides */}
      {platformOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformOverview.total_users}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformOverview.total_orders}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ateliers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformOverview.total_bookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenueStats ? `${(revenueStats.total_revenue / 1000).toFixed(0)}k Ar` : '-'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs pour les différentes sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="artisans">Artisans</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {platformOverview && <PlatformOverviewCard data={platformOverview} />}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {revenueStats && <RevenueStatsCard data={revenueStats} />}
        </TabsContent>

        <TabsContent value="artisans" className="space-y-4">
          {artisanStats && <ArtisanStatsCard data={artisanStats} />}
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          {conversionStats && <ConversionStatsCard data={conversionStats} />}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {userBehaviorStats && <UserBehaviorStatsCard data={userBehaviorStats} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
