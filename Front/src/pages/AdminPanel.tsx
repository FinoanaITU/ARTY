
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPanel = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalArtisans: 45,
    totalBuyers: 1248,
    monthlyRevenue: 2850000,
    totalWorkshops: 23,
    activeOrders: 67,
    totalReservations: 89
  };

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

  const workshopReservations = [
    {
      id: 1,
      participant: 'Sophie Laurent',
      workshop: 'Sculpture sur bois',
      instructor: 'Hery Rakoto',
      date: '2024-06-15',
      reservationDate: '2024-05-20',
      amount: 35000,
      status: 'confirmed'
    },
    {
      id: 2,
      participant: 'Marc Dupont',
      workshop: 'Tissage traditionnel',
      instructor: 'Voahangy Razafy',
      date: '2024-06-20',
      reservationDate: '2024-05-22',
      amount: 28000,
      status: 'pending'
    },
    {
      id: 3,
      participant: 'Julie Martin',
      workshop: 'Poterie créative',
      instructor: 'Naina Rasoarivelo',
      date: '2024-06-25',
      reservationDate: '2024-05-24',
      amount: 32000,
      status: 'confirmed'
    }
  ];

  const upcomingWorkshops = [
    {
      id: 1,
      title: 'Sculpture sur bois',
      instructor: 'Hery Rakoto',
      date: '2024-06-15',
      participants: 8,
      maxParticipants: 12
    },
    {
      id: 2,
      title: 'Tissage traditionnel',
      instructor: 'Voahangy Razafy',
      date: '2024-06-20',
      participants: 5,
      maxParticipants: 10
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panneau d'Administration
            </h1>
            <p className="text-gray-600">
              Gérez la plateforme Artizaho
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="artisans">Artisans</TabsTrigger>
              <TabsTrigger value="workshops">Ateliers</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="reservations">Réservations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-6 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.totalArtisans}
                      </div>
                      <p className="text-sm text-gray-600">Artisans</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalBuyers}
                      </div>
                      <p className="text-sm text-gray-600">Acheteurs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(stats.monthlyRevenue / 1000000).toFixed(1)}M Ar
                      </div>
                      <p className="text-sm text-gray-600">CA mensuel</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.totalWorkshops}
                      </div>
                      <p className="text-sm text-gray-600">Ateliers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.activeOrders}
                      </div>
                      <p className="text-sm text-gray-600">Commandes actives</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {stats.totalReservations}
                      </div>
                      <p className="text-sm text-gray-600">Réservations</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nouveaux Artisans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentArtisans.map((artisan) => (
                          <div key={artisan.id} className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{artisan.name}</h4>
                              <p className="text-sm text-gray-600">
                                {artisan.specialty} - {artisan.location}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              artisan.status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {artisan.status === 'approved' ? 'Approuvé' : 'En attente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Réservations Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workshopReservations.slice(0, 2).map((reservation) => (
                          <div key={reservation.id} className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{reservation.participant}</h4>
                              <p className="text-sm text-gray-600">
                                {reservation.workshop}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-orange-600">
                                {reservation.amount.toLocaleString()} Ar
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                reservation.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {reservation.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="artisans">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Artisans</CardTitle>
                  <CardDescription>
                    Approuvez et gérez les profils des artisans
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
                          {artisan.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                Rejeter
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Approuver
                              </Button>
                            </>
                          )}
                          {artisan.status === 'approved' && (
                            <Button size="sm" variant="outline">
                              Voir profil
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workshops">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Ateliers</CardTitle>
                  <CardDescription>
                    Gérez les ateliers proposés par les artisans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingWorkshops.map((workshop) => (
                      <div key={workshop.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{workshop.title}</h3>
                          <p className="text-sm text-gray-600">par {workshop.instructor}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(workshop.date).toLocaleDateString('fr-FR')} - 
                            {workshop.participants}/{workshop.maxParticipants} participants
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Modifier
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Commandes</CardTitle>
                  <CardDescription>
                    Suivez et gérez toutes les commandes
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

            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Réservations d'Ateliers</CardTitle>
                  <CardDescription>
                    Suivez et gérez toutes les réservations d'ateliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workshopReservations.map((reservation) => (
                      <div key={reservation.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Réservation #{reservation.id}</h3>
                          <p className="text-sm text-gray-600">
                            {reservation.participant} → {reservation.workshop}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            Instructeur: {reservation.instructor}
                          </p>
                          <p className="text-xs text-gray-500">
                            Atelier le {new Date(reservation.date).toLocaleDateString('fr-FR')} | 
                            Réservé le {new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-orange-600 mb-1">
                            {reservation.amount.toLocaleString()} Ar
                          </div>
                          <div className="flex gap-2 mb-2">
                            {reservation.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Annuler
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                                  Confirmer
                                </Button>
                              </>
                            )}
                            {reservation.status === 'confirmed' && (
                              <Button size="sm" variant="outline" className="text-xs">
                                Voir détails
                              </Button>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reservation.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {reservation.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports et Analytiques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-800 mb-2">📈 Croissance</h4>
                        <p className="text-orange-700 text-sm">
                          +25% de nouveaux artisans ce mois
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">💰 Revenus</h4>
                        <p className="text-green-700 text-sm">
                          +18% de chiffre d'affaires vs mois dernier
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">🎨 Ateliers</h4>
                        <p className="text-blue-700 text-sm">
                          Taux de réservation: 85%
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">⭐ Satisfaction</h4>
                        <p className="text-purple-700 text-sm">
                          Note moyenne: 4.7/5
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
