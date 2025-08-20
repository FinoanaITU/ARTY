import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { ArtisanStats } from '@/components/ArtisanStats';
import { ArtisanOrderManager } from '@/components/ArtisanOrderManager';
import ArtisanAvailabilityCalendar from '@/components/ArtisanAvailabilityCalendar';
import { ArtisanProfileEditor } from '@/components/ArtisanProfileEditor';
import { ArtisanProductManager } from '@/components/ArtisanProductManager';
import { WorkshopManager } from '@/components/WorkshopManager';
import { WorkshopCreationForm } from '@/components/WorkshopCreationForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ArtisanDashboard = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWorkshopCreation, setShowWorkshopCreation] = useState(false);

  // Mock data for artisan stats and orders
  const artisanStats = {
    totalSales: 450000,
    ordersThisMonth: 12,
    rating: 4.8,
    totalProducts: 24
  };

  const recentOrders = [
    {
      id: 1,
      customer: 'Marie L.',
      items: ['Masque traditionnel'],
      total: 45000,
      date: '2024-05-25',
      status: 'delivered' as const
    },
    {
      id: 2,
      customer: 'Jean P.',
      items: ['Statuette Zébu'],
      total: 25000,
      date: '2024-05-23',
      status: 'shipped' as const
    }
  ];

  // Mock unavailability data
  const [artisanUnavailability, setArtisanUnavailability] = useState([
    {
      id: '1',
      startDate: new Date('2024-06-20'),
      endDate: new Date('2024-06-25'),
      reason: 'Vacances familiales',
      type: 'range' as const
    },
    {
      id: '2',
      startDate: new Date('2024-07-14'),
      reason: 'Formation professionnelle',
      type: 'single' as const
    }
  ]);

  const handleAvailabilitySave = (periods: any[]) => {
    setArtisanUnavailability(periods);
    toast({
      title: "Indisponibilités mises à jour",
      description: "Vos périodes d'indisponibilité ont été enregistrées avec succès.",
    });
  };

  if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 mb-4">
              Ce tableau de bord est réservé aux artisans
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord Artisan
            </h1>
            <p className="text-gray-600">
              Gérez votre activité et développez votre business
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <ArtisanStats stats={artisanStats} />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="workshops">Ateliers</TabsTrigger>
              <TabsTrigger value="availability">Disponibilité</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Commandes récentes</CardTitle>
                    <CardDescription>Vos dernières ventes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">#{order.id} - {order.customer}</p>
                            <p className="text-xs text-gray-500">{order.items[0]}</p>
                          </div>
                          <span className="font-semibold text-orange-600 text-sm">
                            {order.total.toLocaleString()} Ar
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conseils du jour</CardTitle>
                    <CardDescription>Optimisez votre activité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-1 text-sm">💡 Conseil</h4>
                        <p className="text-green-700 text-xs">
                          Ajoutez plus de photos pour augmenter vos ventes de 40% !
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1 text-sm">📈 Tendance</h4>
                        <p className="text-blue-700 text-xs">
                          Les masques traditionnels sont très demandés.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activités à venir */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Livraisons à effectuer</CardTitle>
                    <CardDescription>Produits à livrer prochainement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg bg-orange-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-orange-800">Masque traditionnel Vezo</h4>
                            <p className="text-sm text-orange-700">5 pièces pour Marie Dubois</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">À livrer</Badge>
                        </div>
                        <p className="text-xs text-gray-600">📍 Antananarivo, Analakely</p>
                        <p className="text-xs text-gray-600">📅 Livraison prévue: 30 juillet 2025</p>
                        <p className="text-xs text-gray-600">💰 45,000 Ar</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-purple-800">Statuettes Zébu</h4>
                            <p className="text-sm text-purple-700">3 pièces pour Jean Martin</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">En production</Badge>
                        </div>
                        <p className="text-xs text-gray-600">📍 Fianarantsoa, centre-ville</p>
                        <p className="text-xs text-gray-600">📅 Livraison prévue: 5 août 2025</p>
                        <p className="text-xs text-gray-600">💰 75,000 Ar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ateliers à venir</CardTitle>
                    <CardDescription>Vos prochaines sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-blue-800">Initiation à la poterie</h4>
                            <p className="text-sm text-blue-700">10 participants</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">Confirmé</Badge>
                        </div>
                        <p className="text-xs text-gray-600">📍 Andraharo, atelier principal</p>
                        <p className="text-xs text-gray-600">📅 Samedi 28 juillet 2025 à 15h00</p>
                        <p className="text-xs text-gray-600">⏱️ Durée: 3 heures</p>
                        <p className="text-xs text-gray-600">💰 25,000 Ar par personne</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-green-800">Sculpture sur bois avancée</h4>
                            <p className="text-sm text-green-700">6 participants</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Confirmé</Badge>
                        </div>
                        <p className="text-xs text-gray-600">📍 Ambositra, atelier traditionnel</p>
                        <p className="text-xs text-gray-600">📅 Dimanche 29 juillet 2025 à 9h00</p>
                        <p className="text-xs text-gray-600">⏱️ Durée: 5 heures</p>
                        <p className="text-xs text-gray-600">💰 45,000 Ar par personne</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Gestion des commandes</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Artisan Artizaho
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      Artisan Uber
                    </Badge>
                  </div>
                </div>
                
                <Tabs defaultValue="products" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">Commandes Produits</TabsTrigger>
                    <TabsTrigger value="workshops">Commandes Ateliers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="products" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Ventes de produits détaillées</h3>
                        <Badge variant="secondary">
                          {recentOrders.length} commandes récentes
                        </Badge>
                      </div>
                      
                      {/* Mock detailed orders data */}
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Commande #1001</h4>
                                <p className="text-sm text-gray-600">Marie Dubois</p>
                                <p className="text-xs text-gray-500">📧 marie.dubois@email.com</p>
                                <p className="text-xs text-gray-500">📞 +261 34 12 345 67</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Livraison</h5>
                                <p className="text-xs text-gray-600">📍 Rue de l'Indépendance</p>
                                <p className="text-xs text-gray-600">Antananarivo, Analamanga</p>
                                <p className="text-xs text-blue-700 mt-1">
                                  ⚠️ Livraison entre 14h-17h uniquement
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">5x Masque traditionnel Vezo</p>
                                <p className="text-xs text-gray-600">Bois de palissandre, finition mate</p>
                                <p className="font-bold text-orange-600 mt-2">45,000 Ar</p>
                                <Badge className="bg-green-100 text-green-700 mt-1">Prêt à livrer</Badge>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                              <span className="font-medium text-yellow-800">Requête spéciale:</span>
                              <span className="text-yellow-700 ml-1">Emballer individuellement pour cadeaux</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Commande #1002</h4>
                                <p className="text-sm text-gray-600">Jean Martin</p>
                                <p className="text-xs text-gray-500">📧 j.martin@company.mg</p>
                                <p className="text-xs text-gray-500">📞 +261 33 98 765 43</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Livraison</h5>
                                <p className="text-xs text-gray-600">📍 Avenue de l'Indépendance 45</p>
                                <p className="text-xs text-gray-600">Fianarantsoa, Haute Matsiatra</p>
                                <p className="text-xs text-blue-700 mt-1">
                                  ⚠️ Entreprise - Réception 8h-16h
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">3x Statuette Zébu</p>
                                <p className="text-xs text-gray-600">Bois d'ébène, taille 15cm</p>
                                <p className="font-bold text-orange-600 mt-2">75,000 Ar</p>
                                <Badge className="bg-blue-100 text-blue-700 mt-1">En production</Badge>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                              <span className="font-medium text-yellow-800">Requête spéciale:</span>
                              <span className="text-yellow-700 ml-1">Gravure personnalisée "Souvenir Madagascar 2025"</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="workshops" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Réservations d'ateliers</h3>
                        <Badge variant="secondary">
                          3 ateliers programmés
                        </Badge>
                      </div>
                      <div className="grid gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">Atelier Sculpture sur bois</h4>
                                <p className="text-sm text-gray-600">15 juin 2024 - 14h00</p>
                              </div>
                              <Badge className="bg-green-100 text-green-700">Confirmé</Badge>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-gray-500">8/12 participants</span>
                              <span className="font-semibold text-orange-600">65,000 Ar</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">Initiation à la poterie</h4>
                                <p className="text-sm text-gray-600">20 juin 2024 - 10h00</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-700">En attente</Badge>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-gray-500">5/10 participants</span>
                              <span className="font-semibold text-orange-600">45,000 Ar</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <ArtisanProductManager 
                products={[]} 
                onCreateProduct={(product) => {
                  console.log('Product created:', product);
                  toast({
                    title: "Produit créé",
                    description: "Votre produit a été créé avec succès"
                  });
                }}
                onUpdateProduct={(id, product) => {
                  console.log('Product updated:', id, product);
                  toast({
                    title: "Produit mis à jour",
                    description: "Votre produit a été mis à jour avec succès"
                  });
                }}
                onDeleteProduct={(id) => {
                  console.log('Product deleted:', id);
                  toast({
                    title: "Produit supprimé",
                    description: "Votre produit a été supprimé avec succès"
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="profile">
              <ArtisanProfileEditor
                onSaveProfile={(profile) => {
                  console.log('Profile saved:', profile);
                  toast({
                    title: "Profil sauvegardé",
                    description: "Votre profil a été sauvegardé avec succès"
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="workshops">
              {showWorkshopCreation ? (
                <WorkshopCreationForm
                  onSubmit={(workshopData) => {
                    console.log('Create workshop:', workshopData);
                    setShowWorkshopCreation(false);
                    toast({
                      title: "Atelier créé",
                      description: "L'atelier a été créé avec succès.",
                    });
                  }}
                  onCancel={() => setShowWorkshopCreation(false)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mes Ateliers</h2>
                      <p className="text-gray-600">Gérez vos ateliers et créez-en de nouveaux</p>
                    </div>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => setShowWorkshopCreation(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un atelier
                    </Button>
                  </div>
                  
                  <WorkshopManager
                    workshops={[]}
                    artisans={[
                      { id: '1', name: 'Jean Rakotozafy', specialty: 'Sculpture sur bois' },
                      { id: '2', name: 'Marie Razafy', specialty: 'Tissage traditionnel' }
                    ]}
                    onCreateWorkshop={(workshop) => {
                      console.log('Workshop created:', workshop);
                      toast({
                        title: "Atelier créé",
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
              )}
            </TabsContent>

            <TabsContent value="availability">
              <ArtisanAvailabilityCalendar
                onSave={handleAvailabilitySave}
                initialUnavailablePeriods={artisanUnavailability}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;