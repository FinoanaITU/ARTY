import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/formatCurrency';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteManager } from '@/components/QuoteManager';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { AdminSubscriptionManager } from '@/components/admin/AdminSubscriptionManager';
import { WorkshopManager } from '@/components/WorkshopManager';
import { WorkshopCalendar } from '@/components/WorkshopCalendar';
import { ValidationManager } from '@/components/ValidationManager';
import { PaymentTracker, PaymentStatus } from '@/components/PaymentTracker';
import { PayoutTracker } from '@/components/PayoutTracker';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { PaymentTrackingOut, RecordPaymentRequest, ArtisanPayoutOut, PaymentTrackingMethod } from '@/types/admin';

const AdminPanel = () => {
  const { user } = useUser();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<PaymentStatus[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<ArtisanPayoutOut[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState<string | null>(null);

  
  const [adminStats, setAdminStats] = useState({
    totalProductSales: 0,
    totalWorkshopSales: 0,
    totalArtisans: 0,
    totalOrders: 0,
    pendingQuotes: 0,
    activeSubscriptions: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [upcomingWorkshops, setUpcomingWorkshops] = useState<any[]>([]);
  const [workshopsLoading, setWorkshopsLoading] = useState(false);

  const [recentArtisans, setRecentArtisans] = useState<any[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(false);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const mapPaymentToStatus = (payment: PaymentTrackingOut): PaymentStatus => {
    const reference = payment.type === 'workshop'
      ? (payment.booking_number || payment.booking_id?.slice(0, 8))
      : (payment.order_number || payment.order_id?.slice(0, 8));
    const titlePrefix = payment.type === 'workshop' ? 'Reservation atelier' : 'Commande';

    return {
      id: payment.id,
      type: payment.type,
      title: reference ? `${titlePrefix} ${reference}` : titlePrefix,
      artisanName: payment.artisan_name || payment.artisan_id,
      artisanType: payment.artisan_type,
      totalAmount: payment.amount_total,
      paidAmount: payment.amount_paid,
      remainingAmount: Math.max(0, payment.amount_total - payment.amount_paid),
      paymentStatus: payment.payment_status,
      paymentMethod: payment.payment_method,
      clientName: payment.user_name || payment.user_id,
      bookingDate: new Date(payment.created_at),
      workshopDate: undefined,
      paymentHistory: [],
      notes: undefined
    };
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await apiService.getAdminPayments();
      setPayments(response.items.map(mapPaymentToStatus));
      setPaymentsError(null);
    } catch (error) {
      setPaymentsError('Impossible de charger les paiements.');
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleRecordPayment = async (paymentId: string, payload: RecordPaymentRequest) => {
    try {
      await apiService.recordAdminPayment(paymentId, payload);
      toast({
        title: 'Paiement enregistré',
        description: 'Le paiement a été enregistré avec succès.'
      });
      await loadPayments();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le paiement.',
        variant: 'destructive'
      });
    }
  };

  const loadPayouts = async () => {
    setPayoutsLoading(true);
    try {
      const response = await apiService.getAdminPendingPayouts();
      setPayouts(response.items);
      setPayoutsError(null);
    } catch (error) {
      setPayoutsError('Impossible de charger les payouts.');
      setPayouts([]);
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleMarkPayoutPaid = async (
    payoutId: string, 
    payment_method: PaymentTrackingMethod, 
    transaction_ref?: string, 
    notes?: string
  ) => {
    try {
      await apiService.markAdminPayoutPaid(payoutId, {
        payment_method,
        payment_ref: transaction_ref,
        notes
      });
      toast({
        title: 'Payout marqué comme payé',
        description: 'Le payout a été enregistré avec succès.'
      });
      await loadPayouts();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le payout comme payé.',
        variant: 'destructive'
      });
    }
  };

  
  const loadAdminStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const [overview, revenue, artisansData, quotesData, subscriptionsData] = await Promise.all([
        apiService.getAdminPlatformOverview().catch(() => ({ total_orders: 0 })),
        apiService.getAdminRevenueStats('month').catch(() => ({ total_product_revenue: 0, total_workshop_revenue: 0 })),
        apiService.getAdminArtisanStats().catch(() => ({ total_artisans: 0 })),
        apiService.getQuoteStats().catch(() => ({ pending_count: 0 })),
        apiService.getSubscriptionsOverview().catch(() => ({ total_active: 0 }))
      ]);

      setAdminStats({
        totalProductSales: revenue.total_product_revenue || 0,
        totalWorkshopSales: revenue.total_workshop_revenue || 0,
        totalArtisans: artisansData.total_artisans || 0,
        totalOrders: overview.total_orders || 0,
        pendingQuotes: quotesData.pending_count || 0,
        activeSubscriptions: subscriptionsData.total_active || 0
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setStatsError('Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  };

  
  const loadUpcomingWorkshops = async () => {
    try {
      setWorkshopsLoading(true);
      const response = await apiService.getWorkshops({
        skip: 0,
        limit: 10,
        status: 'published'
      });

      
      const now = new Date();
      const items = response.items || [];
      const workshops = items
        .filter((ws: any) => ws.start_date && new Date(ws.start_date) > now)
        .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 3)
        .map((ws: any) => {
          const startDate = new Date(ws.start_date);
          const endDate = ws.end_date ? new Date(ws.end_date) : startDate;
          
          return {
            id: ws.id,
            title: ws.title,
            date: startDate,
            time: `${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}-${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            artisan: ws.artisan_name || 'N/A',
            type: 'artizaho' as const,
            participants: ws.current_bookings || 0,
            maxParticipants: ws.max_participants || 0
          };
        });

      setUpcomingWorkshops(workshops);
    } catch (error) {
      console.error('Erreur chargement ateliers:', error);
      setUpcomingWorkshops([]);
    } finally {
      setWorkshopsLoading(false);
    }
  };

  
  const loadArtisans = async () => {
    try {
      setArtisansLoading(true);
      
      
      const artisansData = await apiService.getAdminArtisanStats();
      
      
      
      setRecentArtisans([
        {
          id: 'summary',
          name: `${artisansData.total_artisans || 0} artisans inscrits`,
          specialty: 'Utilisez l\'onglet Analytiques pour plus de détails',
          location: 'Madagascar',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'info',
          email: '',
          avatar: ''
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement artisans:', error);
      setRecentArtisans([]);
    } finally {
      setArtisansLoading(false);
    }
  };

  
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await apiService.getOrders({
        page: 1,
        limit: 10
      });

      const items = response.items || [];
      const orders = items.map((order: any) => ({
        id: order.id,
        buyer: order.user_name || 'N/A',
        artisan: 'N/A', 
        amount: order.total_amount || 0,
        date: order.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: order.status || 'pending',
        orderNumber: order.order_number
      }));

      setRecentOrders(orders);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  
  const handleViewArtisanProfile = (artisanId: string) => {
    window.location.href = `/artisans/${artisanId}`;
  };

  const handleManageArtisanProducts = (artisanId: string) => {
    
    toast({
      title: 'Fonction à venir',
      description: 'Gestion des produits artisan en cours de développement'
    });
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPayments();
      loadPayouts();
      loadAdminStats();
      loadUpcomingWorkshops();
      loadArtisans();
      loadOrders();
    }
  }, [user?.role]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 mb-4">
              Cette section est réservée aux administrateurs
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Back Office Artizaho
            </h1>
            <p className="text-gray-600">
              Gestion de la plateforme par les employés Artizaho
            </p>
          </div>

          {/* Stats Cards */}
          {statsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          ) : statsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{statsError}</p>
              <Button onClick={loadAdminStats} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(adminStats.totalProductSales, language)}
                  </div>
                  <p className="text-sm text-gray-600">Ventes Produits</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(adminStats.totalWorkshopSales, language)}
                  </div>
                  <p className="text-sm text-gray-600">Ventes Ateliers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {adminStats.totalArtisans}
                  </div>
                  <p className="text-sm text-gray-600">Artisans</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {adminStats.totalOrders}
                  </div>
                  <p className="text-sm text-gray-600">Commandes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {adminStats.pendingQuotes}
                  </div>
                  <p className="text-sm text-gray-600">Devis en attente</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {adminStats.activeSubscriptions}
                  </div>
                  <p className="text-sm text-gray-600">Abonnements</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="artisans">Artisans</TabsTrigger>
              <TabsTrigger value="orders">Commandes & Ateliers</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="quotes">Devis manuels</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {}
                {

}

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                    <CardDescription>Raccourcis vers les tâches courantes</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-3">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('quotes')}
                    >
                      Traiter les devis en attente ({adminStats.pendingQuotes})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('orders')}
                    >
                      Suivre les commandes ({adminStats.totalOrders})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('artisans')}
                    >
                      Gérer les artisans ({adminStats.totalArtisans})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('subscriptions')}
                    >
                      Gérer les abonnements ({adminStats.activeSubscriptions})
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {}
              <WorkshopCalendar upcomingWorkshops={upcomingWorkshops} />
            </TabsContent>

            <TabsContent value="artisans">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des Artisans</CardTitle>
                  <CardDescription>
                    Gestion des artisans de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {artisansLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Chargement des artisans...</p>
                    </div>
                  ) : recentArtisans.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucun artisan trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentArtisans.map((artisan) => (
                        <div key={artisan.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{artisan.name}</h3>
                            <p className="text-sm text-gray-600">
                              {artisan.specialty} - {artisan.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              Inscrit le {new Date(artisan.joinDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewArtisanProfile(artisan.id)}
                            >
                              Voir profil
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleManageArtisanProducts(artisan.id)}
                            >
                              Gérer produits
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-6">
                <Tabs defaultValue="products" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">Commandes Produits</TabsTrigger>
                    <TabsTrigger value="workshop-bookings">Réservations Ateliers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="products" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Suivi des Commandes Produits</CardTitle>
                        <CardDescription>
                          Toutes les commandes de produits artisanaux
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {ordersLoading ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">Chargement des commandes...</p>
                          </div>
                        ) : recentOrders.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Aucune commande trouvée</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentOrders.map((order) => (
                              <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    Commande #{order.orderNumber || order.id.toString().slice(0, 8)}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {order.buyer} → {order.artisan}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.date).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-orange-600 mb-1">
                                    {formatCurrency(order.amount, language)}
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : order.status === 'processing'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {order.status === 'completed' ? 'Terminé' : 
                                     order.status === 'processing' ? 'En cours' : 
                                     order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="workshop-bookings" className="mt-6">
                    {paymentsError && (
                      <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {paymentsError}
                      </div>
                    )}
                    <PaymentTracker
                      payments={payments}
                      isLoading={paymentsLoading}
                      onRecordPayment={handleRecordPayment}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="payouts">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Gestion des Payouts Artisans</h2>
                  <Badge variant="secondary">
                    {payouts.filter(p => p.status === 'pending').length} en attente
                  </Badge>
                </div>
                {payoutsError && (
                  <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {payoutsError}
                  </div>
                )}
                <PayoutTracker
                  payouts={payouts}
                  isLoading={payoutsLoading}
                  onMarkPaid={handleMarkPayoutPaid}
                />
              </div>
            </TabsContent>

            <TabsContent value="validation">
              <ValidationManager />
            </TabsContent>

            <TabsContent value="workshops">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Ateliers Artizaho (Réservation)</h2>
                  <Button>Créer un atelier</Button>
                </div>
                <WorkshopManager 
                  workshops={[]}
                  artisans={[]}
                  onCreateWorkshop={(workshop) => {
                    console.log('Workshop created:', workshop);
                    toast({
                      title: "Atelier Artizaho créé",
                      description: "L'atelier a été créé avec succès"
                    });
                  }}
                  onUpdateWorkshop={(id, workshop) => {
                    console.log('Workshop updated:', id, workshop);
                    toast({
                      title: "Atelier mis à jour",
                      description: "L'atelier a été mis à jour avec succès"
                    });
                  }}
                  onDeleteWorkshop={(id) => {
                    console.log('Workshop deleted:', id);
                    toast({
                      title: "Atelier supprimé",
                      description: "L'atelier a été supprimé avec succès"
                    });
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="quotes">
              <QuoteManager />
            </TabsContent>

            <TabsContent value="subscriptions">
              <AdminSubscriptionManager />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;