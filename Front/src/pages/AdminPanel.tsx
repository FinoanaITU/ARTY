import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteRequestManager } from '@/components/QuoteRequestManager';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { WorkshopManager } from '@/components/WorkshopManager';
import { WorkshopCalendar } from '@/components/WorkshopCalendar';
import { ValidationManager } from '@/components/ValidationManager';
import { PaymentTracker, PaymentStatus } from '@/components/PaymentTracker';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for admin overview - Back office Artizaho
  const adminStats = {
    totalProductSales: 2450000, // Ventes totales produits
    totalWorkshopSales: 890000, // Ventes totales ateliers
    totalArtisans: 23,
    totalOrders: 89,
    pendingQuotes: 7, // Devis à faire manuellement
    activeSubscriptions: 45 // Abonnements actifs
  };

  // Mock data for upcoming workshops calendar
  const upcomingWorkshops = [
    {
      id: '1',
      title: 'Sculpture sur bois traditionnel',
      date: new Date('2024-06-15'),
      time: '14h00-17h00',
      artisan: 'Hery Rakoto',
      type: 'artizaho' as const,
      participants: 8,
      maxParticipants: 12
    },
    {
      id: '2',
      title: 'Poterie Malagasy',
      date: new Date('2024-06-18'),
      time: '10h00-13h00',
      artisan: 'Voahangy Razafy',
      type: 'uber' as const,
      participants: 5,
      maxParticipants: 10
    },
    {
      id: '3',
      title: 'Atelier Bijouterie',
      date: new Date('2024-06-20'),
      time: '15h00-18h00',
      artisan: 'Fidy Andrianaivoson',
      type: 'artizaho' as const,
      participants: 10,
      maxParticipants: 15
    }
  ];

  const recentArtisans = [
    {
      id: 1,
      name: 'Naina Rasoarivelo',
      specialty: 'Poterie',
      location: 'Toliara',
      joinDate: '2024-05-20',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Fidy Andrianaivoson',
      specialty: 'Bijouterie',
      location: 'Mahajanga',
      joinDate: '2024-05-18',
      status: 'approved'
    }
  ];

  const recentOrders = [
    {
      id: 1,
      buyer: 'Marie Dubois',
      artisan: 'Hery Rakoto',
      amount: 45000,
      date: '2024-05-25',
      status: 'completed'
    },
    {
      id: 2,
      buyer: 'Jean Martin',
      artisan: 'Voahangy Razafy',
      amount: 65000,
      date: '2024-05-24',
      status: 'processing'
    }
  ];

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
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {adminStats.totalProductSales.toLocaleString()} Ar
                </div>
                <p className="text-sm text-gray-600">Ventes Produits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {adminStats.totalWorkshopSales.toLocaleString()} Ar
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="artisans">Artisans</TabsTrigger>
              <TabsTrigger value="orders">Commandes & Ateliers</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="quotes">Devis manuels</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Les dernières actions sur la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Atelier Artizaho réservé</span>
                        <Badge variant="secondary">Il y a 1h</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm">Nouvel abonnement Premium</span>
                        <Badge variant="secondary">Il y a 2h</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm">Devis manuel demandé</span>
                        <Badge variant="secondary">Il y a 3h</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm">Inscription atelier validée</span>
                        <Badge variant="secondary">Il y a 4h</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                    <CardDescription>Raccourcis vers les tâches courantes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('quotes')}
                    >
                      Traiter les devis en attente ({adminStats.pendingQuotes})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('workshops')}
                    >
                      Gérer les ateliers Artizaho
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('orders')}
                    >
                      Suivre les commandes
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
              
              {/* Calendrier des ateliers à venir */}
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
                          <Button size="sm" variant="outline">
                            Voir profil
                          </Button>
                          <Button size="sm" variant="outline">
                            Gérer produits
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                        <div className="space-y-4">
                          {recentOrders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium text-gray-900">Commande #{order.id}</h3>
                                <p className="text-sm text-gray-600">
                                  {order.buyer} → {order.artisan}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-orange-600 mb-1">
                                  {order.amount.toLocaleString()} Ar
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {order.status === 'completed' ? 'Terminé' : 'En cours'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="workshop-bookings" className="mt-6">
                    <PaymentTracker 
                      payments={[
                        {
                          id: 'pay1',
                          type: 'workshop',
                          title: 'Sculpture sur bois traditionnel',
                          artisanName: 'Hery Rakoto',
                          artisanType: 'artizaho',
                          totalAmount: 65000,
                          paidAmount: 32500,
                          remainingAmount: 32500,
                          paymentStatus: 'partial',
                          clientName: 'Marie Dupont',
                          bookingDate: new Date('2024-06-10'),
                          workshopDate: new Date('2024-06-15'),
                          paymentHistory: [
                            {
                              date: new Date('2024-06-10'),
                              amount: 32500,
                              method: 'Mobile Money',
                              note: 'Acompte 50% à la réservation'
                            }
                          ],
                          notes: 'Reste 50% à récupérer à la fin de l\'atelier'
                        },
                        {
                          id: 'pay2',
                          type: 'workshop',
                          title: 'Poterie Malagasy',
                          artisanName: 'Voahangy Razafy',
                          artisanType: 'uber',
                          totalAmount: 45000,
                          paidAmount: 0,
                          remainingAmount: 45000,
                          paymentStatus: 'unpaid',
                          clientName: 'Jean Martin',
                          bookingDate: new Date('2024-06-12'),
                          workshopDate: new Date('2024-06-18'),
                          paymentHistory: []
                        },
                        {
                          id: 'pay3',
                          type: 'workshop',
                          title: 'Bijouterie traditionnelle',
                          artisanName: 'Fidy Andrianaivoson',
                          artisanType: 'artizaho',
                          totalAmount: 85000,
                          paidAmount: 42500,
                          remainingAmount: 42500,
                          paymentStatus: 'pending_collection',
                          clientName: 'Sophie Rakotozafy',
                          bookingDate: new Date('2024-06-08'),
                          workshopDate: new Date('2024-06-20'),
                          paymentHistory: [
                            {
                              date: new Date('2024-06-08'),
                              amount: 42500,
                              method: 'Espèces',
                              note: 'Acompte 50% - reste à la fin de l\'atelier'
                            }
                          ]
                        },
                        {
                          id: 'pay4',
                          type: 'product',
                          title: 'Commande Masques traditionnels',
                          artisanName: 'Hery Rakoto',
                          artisanType: 'artizaho',
                          totalAmount: 120000,
                          paidAmount: 120000,
                          remainingAmount: 0,
                          paymentStatus: 'paid',
                          clientName: 'Hotel Sakamanga',
                          bookingDate: new Date('2024-06-05'),
                          paymentHistory: [
                            {
                              date: new Date('2024-06-05'),
                              amount: 60000,
                              method: 'Virement bancaire',
                              note: 'Acompte 50%'
                            },
                            {
                              date: new Date('2024-06-15'),
                              amount: 60000,
                              method: 'Virement bancaire',
                              note: 'Solde à la livraison'
                            }
                          ]
                        }
                      ]}
                      onUpdatePayment={(id, updates) => {
                        console.log('Payment updated:', id, updates);
                        toast({
                          title: "Paiement mis à jour",
                          description: "Le statut de paiement a été mis à jour avec succès"
                        });
                      }}
                    />
                  </TabsContent>
                </Tabs>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Devis à traiter manuellement</h2>
                  <Badge variant="destructive">{adminStats.pendingQuotes} en attente</Badge>
                </div>
                <QuoteRequestManager 
                  quoteRequests={[]}
                  onUpdateQuoteRequest={(id, updates) => {
                    console.log('Quote request updated:', id, updates);
                    toast({
                      title: "Devis mis à jour",
                      description: "Le statut du devis a été mis à jour"
                    });
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="subscriptions">
              <SubscriptionManager 
                subscriptions={[]}
                onUpdateSubscription={(id, updates) => {
                  console.log('Subscription updated:', id, updates);
                  toast({
                    title: "Abonnement mis à jour",
                    description: "L'abonnement a été mis à jour avec succès"
                  });
                }}
                onDeleteSubscription={(id) => {
                  console.log('Subscription deleted:', id);
                  toast({
                    title: "Abonnement supprimé",
                    description: "L'abonnement a été supprimé avec succès"
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytiques de la plateforme</CardTitle>
                  <CardDescription>Vue d'ensemble des performances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Tendances des ventes</h4>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-green-800 font-medium">↗️ +15% ce mois</p>
                        <p className="text-green-700 text-sm">Les ventes d'ateliers augmentent</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 font-medium">📊 Produits populaires</p>
                        <p className="text-blue-700 text-sm">Masques traditionnels en tête</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Performance des artisans</h4>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-orange-800 font-medium">🎯 Top artisan</p>
                        <p className="text-orange-700 text-sm">Hery Rakoto - 12 ventes ce mois</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-purple-800 font-medium">⭐ Meilleure note</p>
                        <p className="text-purple-700 text-sm">Ateliers sculpture: 4.9/5</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;