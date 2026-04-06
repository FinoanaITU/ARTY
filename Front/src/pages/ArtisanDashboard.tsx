import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { ArtisanStats } from '@/components/ArtisanStats';
import { ArtisanOrderManager } from '@/components/ArtisanOrderManager';
import ArtisanAvailabilityCalendar from '@/components/ArtisanAvailabilityCalendar';
import { ArtisanProfileEditor } from '@/components/ArtisanProfileEditor';
import { ArtisanProductManager } from '@/components/ArtisanProductManager';

import WorkshopCreationForm from '@/components/WorkshopCreationFormNew';
import { ArtisanWorkshopManager } from '@/components/ArtisanWorkshopManager';
import { WorkshopViewModal } from '@/components/WorkshopViewModal';
import { WorkshopEditModal } from '@/components/WorkshopEditModal';
import { WorkshopDeleteConfirmModal } from '@/components/WorkshopDeleteConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { ProductOut } from '@/types/product';
import type { WorkshopOut } from '@/types/workshop';

const ArtisanDashboard = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWorkshopCreation, setShowWorkshopCreation] = useState(false);
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [workshops, setWorkshops] = useState<WorkshopOut[]>([]);
  const [workshopsLoading, setWorkshopsLoading] = useState(false);
  
  
  const [viewingWorkshop, setViewingWorkshop] = useState<WorkshopOut | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopOut | null>(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState<WorkshopOut | null>(null);
  const [isDeletingWorkshop, setIsDeletingWorkshop] = useState(false);

  
  const [artisanStats, setArtisanStats] = useState({
    totalSales: 0,
    ordersThisMonth: 0,
    rating: 0,
    totalProducts: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [artisanUnavailability, setArtisanUnavailability] = useState<any[]>([]);
  const [unavailabilitiesLoading, setUnavailabilitiesLoading] = useState(false);

  const handleAvailabilitySave = async (periods: any[]) => {
    if (!user) return;
    
    try {
      
      for (const period of artisanUnavailability) {
        await apiService.deleteUnavailability(period.id);
      }
      
      
      for (const period of periods) {
        await apiService.createUnavailability({
          start_date: period.startDate.toISOString().split('T')[0],
          end_date: period.endDate ? period.endDate.toISOString().split('T')[0] : undefined,
          reason: period.reason,
          type: period.type
        });
      }
      
      
      const response = await apiService.getUnavailabilities();
      setArtisanUnavailability(response);
      
      toast({
        title: "Indisponibilités mises à jour",
        description: "Vos périodes d'indisponibilité ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error saving unavailabilities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos indisponibilités",
        variant: "destructive"
      });
    }
  };

  
  useEffect(() => {
    const loadStats = async () => {
      if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
        return;
      }

      setStatsLoading(true);
      try {
        const stats = await apiService.getArtisanStats();
        setArtisanStats(stats);
      } catch (error) {
        console.error('Error loading stats:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive"
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  
  useEffect(() => {
    const loadOrders = async () => {
      if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
        return;
      }

      setOrdersLoading(true);
      try {
        const response = await apiService.getOrders({ limit: 10 });
        setRecentOrders(response.items || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les commandes",
          variant: "destructive"
        });
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  
  useEffect(() => {
    const loadUnavailabilities = async () => {
      if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
        return;
      }

      setUnavailabilitiesLoading(true);
      try {
        const response = await apiService.getUnavailabilities();
        
        const formattedData = response.map((item: any) => ({
          id: item.id,
          startDate: new Date(item.start_date),
          endDate: item.end_date ? new Date(item.end_date) : undefined,
          reason: item.reason || '',
          type: item.type
        }));
        setArtisanUnavailability(formattedData);
      } catch (error) {
        console.error('Error loading unavailabilities:', error);
        
      } finally {
        setUnavailabilitiesLoading(false);
      }
    };

    loadUnavailabilities();
  }, [user]);

  
  useEffect(() => {
    const loadProducts = async () => {
      if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
        return;
      }

      setProductsLoading(true);
      try {
        const response = await apiService.getProducts({
          artisan_id: user.id,
          limit: 100 
        });
        setProducts(response.items || []);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos produits",
          variant: "destructive"
        });
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  
  useEffect(() => {
    const loadWorkshops = async () => {
      if (!user || (user.role !== 'artisan' && user.role !== 'admin')) {
        return;
      }

      setWorkshopsLoading(true);
      try {
        const params = user.role === 'admin' 
          ? { limit: 100 } 
          : { artisan_id: user.id, limit: 100 }; 
        
        const response = await apiService.getWorkshops(params);
        setWorkshops(response.items || []);
      } catch (error) {
        console.error('Error loading workshops:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ateliers",
          variant: "destructive"
        });
      } finally {
        setWorkshopsLoading(false);
      }
    };

    loadWorkshops();
  }, [user]);

  const handleCreateProduct = async (productData: any, photos?: File[]) => {
    try {
      const createdProduct = await apiService.createProduct({
        name: productData.name,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory,
        price: productData.price,
        materials: productData.materials || [],
        available_colors: productData.availableColors || [],
        stock: productData.stock,
        customizable: productData.customizable || false,
        production_time_days: productData.productionTime,
        bulk_order_enabled: productData.bulk_order_enabled || false,
        min_bulk_quantity: productData.min_bulk_quantity,
        dimensions: productData.dimensions
      }, photos);
      
      setProducts(prev => [createdProduct, ...prev]);
      toast({
        title: "Produit créé",
        description: "Votre produit a été créé avec succès et est en attente d'approbation"
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la création du produit';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (id: string, productData: any, photos?: File[], deleteImageIds?: string[]) => {
    try {
      const updatedProduct = await apiService.updateProduct(id, {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory,
        price: productData.price,
        materials: productData.materials || [],
        available_colors: productData.availableColors || [],
        stock: productData.stock,
        customizable: productData.customizable || false,
        production_time_days: productData.productionTime,
        bulk_order_enabled: productData.bulk_order_enabled || false,
        min_bulk_quantity: productData.min_bulk_quantity,
        dimensions: productData.dimensions,
        status: productData.status
      }, photos, deleteImageIds);
      
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast({
        title: "Produit mis à jour",
        description: "Votre produit a été mis à jour avec succès"
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour du produit';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Produit supprimé",
        description: "Votre produit a été supprimé avec succès"
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression du produit';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCreateWorkshop = (workshopData: any) => {
    console.log('Workshop created:', workshopData);
    setShowWorkshopCreation(false);
    toast({
      title: "Atelier créé",
      description: "L'atelier a été créé avec succès et est en attente d'approbation.",
    });
    
    setWorkshops(prev => [workshopData, ...prev]);
  };

  const handleEditWorkshop = (workshop: WorkshopOut) => {
    setEditingWorkshop(workshop);
  };

  const handleDeleteWorkshop = (workshopId: string) => {
    const workshop = workshops.find(w => w.id === workshopId);
    if (workshop) {
      setDeletingWorkshop(workshop);
    }
  };

  const handleConfirmDeleteWorkshop = async () => {
    if (!deletingWorkshop) return;
    
    setIsDeletingWorkshop(true);
    try {
      await apiService.deleteWorkshop(deletingWorkshop.id);
      setWorkshops(prev => prev.filter(w => w.id !== deletingWorkshop.id));
      toast({
        title: "Atelier supprimé",
        description: "L'atelier a été supprimé avec succès"
      });
      setDeletingWorkshop(null);
    } catch (error: any) {
      console.error('Error deleting workshop:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression de l\'atelier';
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeletingWorkshop(false);
    }
  };

  const handleViewWorkshop = (workshop: WorkshopOut) => {
    setViewingWorkshop(workshop);
  };

  const handleSaveWorkshop = (updatedWorkshop: WorkshopOut) => {
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
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

              {}
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
                      
                      {}
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
              {productsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              ) : (
                <ArtisanProductManager 
                  products={products}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}
            </TabsContent>

            <TabsContent value="profile">
              <ArtisanProfileEditor
                onSaveProfile={async (profile) => {
                  try {
                    await apiService.updateArtisanProfile({
                      first_name: profile.name.split(' ')[0],
                      last_name: profile.name.split(' ').slice(1).join(' '),
                      bio: profile.about,
                      specialty: profile.specialties[0] || '',
                      location: `${profile.location.city}, ${profile.location.region}`,
                      description: profile.businessInfo.businessDescription,
                    });
                    
                    toast({
                      title: "Profil sauvegardé",
                      description: "Votre profil a été sauvegardé avec succès"
                    });
                  } catch (error) {
                    console.error('Error saving profile:', error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de sauvegarder le profil",
                      variant: "destructive"
                    });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="workshops">
              {showWorkshopCreation ? (
                <WorkshopCreationForm
                  onSubmit={handleCreateWorkshop}
                  onCancel={() => setShowWorkshopCreation(false)}
                />
              ) : (
                <ArtisanWorkshopManager
                  workshops={workshops}
                  loading={workshopsLoading}
                  isAdmin={user?.role === 'admin'}
                  onCreateWorkshop={() => setShowWorkshopCreation(true)}
                  onEditWorkshop={handleEditWorkshop}
                  onDeleteWorkshop={handleDeleteWorkshop}
                  onViewWorkshop={handleViewWorkshop}
                />
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

      {}
      <WorkshopViewModal
        workshop={viewingWorkshop!}
        isOpen={!!viewingWorkshop}
        onClose={() => setViewingWorkshop(null)}
      />
      
      <WorkshopEditModal
        workshop={editingWorkshop!}
        isOpen={!!editingWorkshop}
        onClose={() => setEditingWorkshop(null)}
        onSave={handleSaveWorkshop}
      />
      
      <WorkshopDeleteConfirmModal
        workshop={deletingWorkshop}
        isOpen={!!deletingWorkshop}
        onConfirm={handleConfirmDeleteWorkshop}
        onCancel={() => setDeletingWorkshop(null)}
        isLoading={isDeletingWorkshop}
      />
    </div>
  );
};

export default ArtisanDashboard;